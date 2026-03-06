import Parser from 'tree-sitter';
import type { MetricNode, UsesMetricEdge, GraphNode, GraphEdge } from '@nomik/core';
import type { ImportInfo } from './imports.js';
import { createNodeId } from '../utils.js';
import { findEnclosingFunctionName } from './ast-utils.js';

// ────────────────────────────────────────────────────────────────────────
// Prometheus / prom-client Metrics Detection — import-aware
//
// Detects:
//   Definition: new Counter({ name: 'http_requests_total', help: '...' })
//               new Gauge({ name: '...' }), new Histogram({ name: '...' })
//               new Summary({ name: '...' })
//   Usage:      counter.inc(), gauge.set(42), histogram.observe(0.5)
//               gauge.inc(), gauge.dec(), summary.observe()
//               histogram.startTimer()
//
// Creates: MetricNode + USES_METRIC edges
// ────────────────────────────────────────────────────────────────────────

export interface MetricInfo {
    metricName: string;
    metricType: 'counter' | 'gauge' | 'histogram' | 'summary' | 'unknown';
    help?: string;
    variableName: string;
    line: number;
}

export interface MetricUsageInfo {
    variableName: string;
    operation: 'inc' | 'dec' | 'set' | 'observe' | 'startTimer' | 'define';
    callerName: string;
    line: number;
}

const METRICS_PACKAGES = new Set(['prom-client', '@opentelemetry/api', '@opentelemetry/sdk-metrics']);

const METRIC_CLASSES: Record<string, MetricInfo['metricType']> = {
    Counter: 'counter',
    Gauge: 'gauge',
    Histogram: 'histogram',
    Summary: 'summary',
};

const METRIC_OPS = new Set(['inc', 'dec', 'set', 'observe', 'startTimer', 'labels', 'zero', 'reset', 'remove']);
const TRACKED_OPS = new Set<MetricUsageInfo['operation']>(['inc', 'dec', 'set', 'observe', 'startTimer']);

// ────────────────────────────────────────────────────────────────────────

export function buildMetricsClientIdentifiers(imports: ImportInfo[]): Set<string> {
    const ids = new Set<string>();
    for (const imp of imports) {
        const source = imp.source.trim();
        if (!METRICS_PACKAGES.has(source)) continue;
        for (const spec of imp.specifiers) ids.add(spec);
        const lastSegment = source.split('/').pop()!;
        ids.add(lastSegment);
    }
    return ids;
}

export function extractMetrics(
    tree: Parser.Tree,
    _filePath: string,
    metricsClientIds: Set<string>,
): { definitions: MetricInfo[]; usages: MetricUsageInfo[] } {
    if (metricsClientIds.size === 0) return { definitions: [], usages: [] };

    const definitions: MetricInfo[] = [];
    const usages: MetricUsageInfo[] = [];

    // First pass: find metric variable definitions
    // const httpRequests = new Counter({ name: 'http_requests_total', help: '...' })
    const metricVarNames = new Set<string>();
    collectMetricDefinitions(tree.rootNode, metricsClientIds, definitions, metricVarNames);

    // Second pass: find metric usages
    collectMetricUsages(tree.rootNode, metricVarNames, usages);

    return { definitions, usages };
}

function collectMetricDefinitions(
    root: Parser.SyntaxNode,
    metricsClientIds: Set<string>,
    results: MetricInfo[],
    metricVarNames: Set<string>,
): void {
    function visit(node: Parser.SyntaxNode): void {
        if (node.type === 'variable_declarator') {
            const nameNode = node.childForFieldName('name');
            const valueNode = node.childForFieldName('value');

            if (nameNode && valueNode?.type === 'new_expression') {
                const ctorNode = valueNode.childForFieldName('constructor');
                if (!ctorNode) { visitChildren(node); return; }

                // Direct: new Counter({...})
                let ctorName = ctorNode.text;
                // Namespaced: new client.Counter({...}) or new promClient.Counter({...})
                if (ctorNode.type === 'member_expression') {
                    const obj = ctorNode.childForFieldName('object');
                    const prop = ctorNode.childForFieldName('property');
                    if (obj && prop && metricsClientIds.has(obj.text)) {
                        ctorName = prop.text;
                    }
                }

                const metricType = METRIC_CLASSES[ctorName];
                if (metricType || (metricsClientIds.has(ctorName) && METRIC_CLASSES[ctorName])) {
                    const config = extractObjectConfig(valueNode);
                    if (config.name) {
                        metricVarNames.add(nameNode.text);
                        results.push({
                            metricName: config.name,
                            metricType: metricType ?? 'unknown',
                            help: config.help,
                            variableName: nameNode.text,
                            line: node.startPosition.row + 1,
                        });
                    }
                }
            }
        }
        visitChildren(node);
    }

    function visitChildren(node: Parser.SyntaxNode): void {
        for (const child of node.children) visit(child);
    }

    visit(root);
}

function extractObjectConfig(newExpr: Parser.SyntaxNode): { name?: string; help?: string } {
    const args = newExpr.childForFieldName('arguments');
    if (!args || args.namedChildren.length === 0) return {};

    const firstArg = args.namedChildren[0];
    if (!firstArg || firstArg.type !== 'object') return {};

    let name: string | undefined;
    let help: string | undefined;

    for (const prop of firstArg.namedChildren) {
        if (prop.type !== 'pair') continue;
        const key = prop.childForFieldName('key');
        const value = prop.childForFieldName('value');
        if (!key || !value) continue;

        const keyText = key.text.replace(/^['"`]|['"`]$/g, '');
        const valueText = value.text.replace(/^['"`]|['"`]$/g, '');

        if (keyText === 'name') name = valueText;
        if (keyText === 'help') help = valueText;
    }

    return { name, help };
}

function collectMetricUsages(
    root: Parser.SyntaxNode,
    metricVarNames: Set<string>,
    results: MetricUsageInfo[],
): void {
    function visit(node: Parser.SyntaxNode): void {
        if (node.type === 'call_expression') {
            const funcNode = node.childForFieldName('function');
            if (funcNode?.type === 'member_expression') {
                const obj = funcNode.childForFieldName('object');
                const prop = funcNode.childForFieldName('property');

                if (obj && prop) {
                    // Direct: counter.inc()
                    if (obj.type === 'identifier' && metricVarNames.has(obj.text) && METRIC_OPS.has(prop.text)) {
                        const op = TRACKED_OPS.has(prop.text as any) ? prop.text as MetricUsageInfo['operation'] : null;
                        if (op) {
                            results.push({
                                variableName: obj.text,
                                operation: op,
                                callerName: findEnclosingFunctionName(node) ?? '__file__',
                                line: node.startPosition.row + 1,
                            });
                        }
                    }
                    // Chained: counter.labels({...}).inc()
                    if (obj.type === 'call_expression' && METRIC_OPS.has(prop.text)) {
                        const innerFunc = obj.childForFieldName('function');
                        if (innerFunc?.type === 'member_expression') {
                            const innerObj = innerFunc.childForFieldName('object');
                            const innerProp = innerFunc.childForFieldName('property');
                            if (innerObj?.type === 'identifier' && metricVarNames.has(innerObj.text) && innerProp?.text === 'labels') {
                                const op = TRACKED_OPS.has(prop.text as any) ? prop.text as MetricUsageInfo['operation'] : null;
                                if (op) {
                                    results.push({
                                        variableName: innerObj.text,
                                        operation: op,
                                        callerName: findEnclosingFunctionName(node) ?? '__file__',
                                        line: node.startPosition.row + 1,
                                    });
                                }
                            }
                        }
                    }
                }
            }
        }
        for (const child of node.children) visit(child);
    }

    visit(root);
}

export function buildMetricNodesAndEdges(
    definitions: MetricInfo[],
    usages: MetricUsageInfo[],
    funcMap: Map<string, string>,
    fileId: string,
    filePath: string,
): { nodes: GraphNode[]; edges: GraphEdge[] } {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const seenNodes = new Set<string>();
    const seenEdges = new Set<string>();

    // Map variable name -> metric node id
    const varToNodeId = new Map<string, string>();

    for (const def of definitions) {
        const nodeId = createNodeId('metric', filePath, def.metricName);
        varToNodeId.set(def.variableName, nodeId);

        if (!seenNodes.has(nodeId)) {
            seenNodes.add(nodeId);
            const metricNode: MetricNode = {
                id: nodeId,
                type: 'metric',
                name: def.metricName,
                metricType: def.metricType,
                help: def.help,
                filePath,
            };
            nodes.push(metricNode);
        }

        // USES_METRIC edge for the definition itself
        const sourceId = funcMap.get(def.variableName) ?? fileId;
        const edgeKey = `${fileId}->uses_metric->${nodeId}:define`;
        if (!seenEdges.has(edgeKey)) {
            seenEdges.add(edgeKey);
            const edge: UsesMetricEdge = {
                id: `${sourceId}->uses_metric->${nodeId}`,
                type: 'USES_METRIC',
                sourceId,
                targetId: nodeId,
                confidence: 1.0,
                operation: 'define',
            };
            edges.push(edge);
        }
    }

    for (const usage of usages) {
        const metricNodeId = varToNodeId.get(usage.variableName);
        if (!metricNodeId) continue;

        const sourceId = usage.callerName === '__file__'
            ? fileId
            : funcMap.get(usage.callerName) ?? fileId;

        const edgeKey = `${sourceId}->uses_metric->${metricNodeId}:${usage.operation}`;
        if (!seenEdges.has(edgeKey)) {
            seenEdges.add(edgeKey);
            const edge: UsesMetricEdge = {
                id: `${sourceId}->uses_metric->${metricNodeId}`,
                type: 'USES_METRIC',
                sourceId,
                targetId: metricNodeId,
                confidence: 0.95,
                operation: usage.operation,
            };
            edges.push(edge);
        }
    }

    return { nodes, edges };
}
