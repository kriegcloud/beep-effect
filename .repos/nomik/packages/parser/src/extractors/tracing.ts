import Parser from 'tree-sitter';
import type { GraphNode, GraphEdge, SpanNode, StartsSpanEdge } from '@nomik/core';
import type { ImportInfo } from './imports.js';
import { createNodeId } from '../utils.js';
import { findEnclosingFunctionName, extractFirstStringArg, extractObjectProperty } from './ast-utils.js';

// ────────────────────────────────────────────────────────────────────────
// OpenTelemetry / Tracing Detection — import-aware
//
// Detects:
//   - @opentelemetry/api: trace.getTracer(), tracer.startSpan(), tracer.startActiveSpan()
//   - dd-trace: tracer.trace(), tracer.startSpan()
//   - @sentry/node: Sentry.startTransaction(), Sentry.startSpan()
//
// Creates: SpanNode + STARTS_SPAN edges
// ────────────────────────────────────────────────────────────────────────

export interface SpanInfo {
    callerName: string;
    spanName: string;
    spanKind?: string;
    line: number;
}

const TRACING_PACKAGES = new Set([
    '@opentelemetry/api',
    '@opentelemetry/sdk-trace-base',
    '@opentelemetry/sdk-trace-node',
    '@opentelemetry/sdk-trace-web',
    'dd-trace',
    '@sentry/node',
    '@sentry/browser',
    '@sentry/core',
]);

const START_SPAN_METHODS = new Set([
    'startSpan', 'startActiveSpan', 'trace', 'startTransaction',
]);

const TRACER_FACTORY_METHODS = new Set([
    'getTracer', 'trace', 'init',
]);

// ────────────────────────────────────────────────────────────────────────

export function buildTracingClientIdentifiers(imports: ImportInfo[]): Set<string> {
    const ids = new Set<string>();
    for (const imp of imports) {
        const source = imp.source.trim();
        if (!TRACING_PACKAGES.has(source)) continue;
        for (const spec of imp.specifiers) ids.add(spec);
        const lastSegment = source.split('/').pop()!;
        ids.add(lastSegment);
    }
    return ids;
}

export function extractSpans(
    tree: Parser.Tree,
    _filePath: string,
    tracingClientIds: Set<string>,
): SpanInfo[] {
    if (tracingClientIds.size === 0) return [];

    // Resolve tracer variables: const tracer = trace.getTracer('name')
    const resolvedIds = new Set(tracingClientIds);
    resolveTracerInstances(tree.rootNode, tracingClientIds, resolvedIds);

    const spans: SpanInfo[] = [];

    function visit(node: Parser.SyntaxNode): void {
        if (node.type === 'call_expression') {
            const info = parseSpanCall(node, resolvedIds);
            if (info) spans.push(info);
        }
        for (const child of node.children) visit(child);
    }

    visit(tree.rootNode);
    return spans;
}

/** Resolve tracer factory calls: const tracer = trace.getTracer('service') */
function resolveTracerInstances(
    root: Parser.SyntaxNode,
    importedIds: Set<string>,
    resolvedIds: Set<string>,
): void {
    function visit(node: Parser.SyntaxNode): void {
        if (node.type === 'variable_declarator') {
            const nameNode = node.childForFieldName('name');
            const valueNode = node.childForFieldName('value');
            if (nameNode && valueNode?.type === 'call_expression') {
                const fn = valueNode.childForFieldName('function');
                if (fn?.type === 'member_expression') {
                    const obj = fn.childForFieldName('object');
                    const prop = fn.childForFieldName('property');
                    if (obj && prop && importedIds.has(obj.text) && TRACER_FACTORY_METHODS.has(prop.text)) {
                        resolvedIds.add(nameNode.text);
                    }
                }
            }
        }
        for (const child of node.children) visit(child);
    }
    visit(root);
}

function parseSpanCall(
    callNode: Parser.SyntaxNode,
    clientIds: Set<string>,
): SpanInfo | null {
    const fn = callNode.childForFieldName('function');
    if (!fn || fn.type !== 'member_expression') return null;

    const obj = fn.childForFieldName('object');
    const prop = fn.childForFieldName('property');
    if (!obj || !prop) return null;

    // Direct: tracer.startSpan('name'), tracer.startActiveSpan('name')
    if (clientIds.has(obj.text) && START_SPAN_METHODS.has(prop.text)) {
        const spanName = extractFirstStringArg(callNode);
        if (!spanName) return null;

        const callerName = findEnclosingFunctionName(callNode) ?? '__file__';
        return { callerName, spanName, line: callNode.startPosition.row + 1 };
    }

    // Chained: Sentry.startSpan({name: '...'})
    if (clientIds.has(obj.text) && (prop.text === 'startSpan' || prop.text === 'startTransaction')) {
        const args = callNode.childForFieldName('arguments');
        const firstArg = args?.namedChildren[0];
        if (firstArg?.type === 'object') {
            const nameValue = extractObjectProperty(firstArg, 'name') ?? extractObjectProperty(firstArg, 'op');
            if (nameValue) {
                const callerName = findEnclosingFunctionName(callNode) ?? '__file__';
                return { callerName, spanName: nameValue, line: callNode.startPosition.row + 1 };
            }
        }
        // Simple string arg fallback
        const spanName = extractFirstStringArg(callNode);
        if (spanName) {
            const callerName = findEnclosingFunctionName(callNode) ?? '__file__';
            return { callerName, spanName, line: callNode.startPosition.row + 1 };
        }
    }

    return null;
}

export function buildSpanNodesAndEdges(
    spans: SpanInfo[],
    funcMap: Map<string, string>,
    fileId: string,
    filePath: string,
): { nodes: GraphNode[]; edges: GraphEdge[] } {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const seenNodes = new Set<string>();
    const seenEdges = new Set<string>();

    for (const sp of spans) {
        const spanNodeId = createNodeId('span', filePath, sp.spanName);

        if (!seenNodes.has(spanNodeId)) {
            seenNodes.add(spanNodeId);
            const spanNode: SpanNode = {
                id: spanNodeId,
                type: 'span',
                name: sp.spanName,
                spanKind: sp.spanKind as SpanNode['spanKind'],
                filePath,
            };
            nodes.push(spanNode);
        }

        const sourceId = sp.callerName === '__file__'
            ? fileId
            : funcMap.get(sp.callerName) ?? fileId;

        const edgeKey = `${sourceId}->starts_span->${spanNodeId}`;
        if (!seenEdges.has(edgeKey)) {
            seenEdges.add(edgeKey);
            const edge: StartsSpanEdge = {
                id: edgeKey,
                type: 'STARTS_SPAN',
                sourceId,
                targetId: spanNodeId,
                confidence: 0.9,
                spanName: sp.spanName,
            };
            edges.push(edge);
        }
    }

    return { nodes, edges };
}
