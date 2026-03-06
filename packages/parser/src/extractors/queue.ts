import Parser from 'tree-sitter';
import type { QueueJobNode, ProducesJobEdge, ConsumesJobEdge, GraphNode, GraphEdge } from '@nomik/core';
import type { ImportInfo } from './imports.js';
import { createNodeId } from '../utils.js';
import { findEnclosingFunctionName, extractFirstStringArg } from './ast-utils.js';

// ────────────────────────────────────────────────────────────────────────
// Bull / BullMQ / Bee-Queue Job Queue Detection — import-aware
//
// Detects:
//   Producer: queue.add('jobName', data), queue.addBulk(...)
//   Consumer: queue.process('jobName', handler), new Worker('queueName', handler)
//   Queue creation: new Queue('queueName'), new Bull('queueName')
//
// Creates: QueueJobNode + PRODUCES_JOB / CONSUMES_JOB edges
// ────────────────────────────────────────────────────────────────────────

export interface QueueOpInfo {
    callerName: string;
    queueName: string;
    jobName: string | null;
    kind: 'producer' | 'consumer';
    line: number;
}

const QUEUE_PACKAGES = new Set([
    'bull', 'bullmq', 'bee-queue', 'agenda', 'pg-boss',
]);

const QUEUE_CLASSES = new Set(['Queue', 'Worker', 'Bull', 'FlowProducer']);
const PRODUCER_METHODS = new Set(['add', 'addBulk', 'addFlow', 'schedule', 'every', 'now']);
const CONSUMER_METHODS = new Set(['process', 'define']);


export function buildQueueClientIdentifiers(imports: ImportInfo[]): Set<string> {
    const ids = new Set<string>();
    for (const imp of imports) {
        const source = imp.source.trim();
        if (!QUEUE_PACKAGES.has(source)) continue;
        for (const spec of imp.specifiers) ids.add(spec);
        const lastSegment = source.split('/').pop()!;
        ids.add(lastSegment);
    }
    return ids;
}

export function extractQueueOperations(
    tree: Parser.Tree,
    _filePath: string,
    queueClientIds: Set<string>,
): QueueOpInfo[] {
    if (queueClientIds.size === 0) return [];
    const ops: QueueOpInfo[] = [];

    // First pass: collect queue variable names -> queue names
    // e.g. const emailQueue = new Queue('email')
    const queueVarMap = new Map<string, string>();
    collectQueueVariables(tree.rootNode, queueClientIds, queueVarMap);

    // Second pass: find add/process calls
    function visit(node: Parser.SyntaxNode): void {
        if (node.type === 'call_expression') {
            const info = parseQueueCall(node, queueVarMap);
            if (info) ops.push(info);
        }
        // new Worker('queueName', handler) — BullMQ consumer pattern
        if (node.type === 'new_expression') {
            const info = parseWorkerConstruction(node, queueClientIds);
            if (info) ops.push(info);
        }
        for (const child of node.children) visit(child);
    }

    visit(tree.rootNode);
    return ops;
}

function collectQueueVariables(
    root: Parser.SyntaxNode,
    queueClientIds: Set<string>,
    result: Map<string, string>,
): void {
    function visit(node: Parser.SyntaxNode): void {
        // const emailQueue = new Queue('email')
        if (node.type === 'variable_declarator') {
            const nameNode = node.childForFieldName('name');
            const valueNode = node.childForFieldName('value');
            if (nameNode && valueNode?.type === 'new_expression') {
                const ctorNode = valueNode.childForFieldName('constructor');
                if (ctorNode && (QUEUE_CLASSES.has(ctorNode.text) || queueClientIds.has(ctorNode.text))) {
                    const args = valueNode.childForFieldName('arguments');
                    if (args && args.namedChildren.length > 0) {
                        const firstArg = args.namedChildren[0];
                        if (firstArg && (firstArg.type === 'string' || firstArg.type === 'template_string')) {
                            const queueName = firstArg.text.replace(/^['"`]|['"`]$/g, '');
                            if (queueName) result.set(nameNode.text, queueName);
                        }
                    }
                }
            }
        }
        for (const child of node.children) visit(child);
    }
    visit(root);
}

function parseQueueCall(
    callNode: Parser.SyntaxNode,
    queueVarMap: Map<string, string>,
): QueueOpInfo | null {
    const funcNode = callNode.childForFieldName('function');
    if (!funcNode || funcNode.type !== 'member_expression') return null;

    const obj = funcNode.childForFieldName('object');
    const prop = funcNode.childForFieldName('property');
    if (!obj || !prop || obj.type !== 'identifier') return null;

    const receiverName = obj.text;
    const methodName = prop.text;
    const queueName = queueVarMap.get(receiverName);
    if (!queueName) return null;

    const isProducer = PRODUCER_METHODS.has(methodName);
    const isConsumer = CONSUMER_METHODS.has(methodName);
    if (!isProducer && !isConsumer) return null;

    const jobName = extractFirstStringArg(callNode);

    return {
        callerName: findEnclosingFunctionName(callNode) ?? '__file__',
        queueName,
        jobName,
        kind: isProducer ? 'producer' : 'consumer',
        line: callNode.startPosition.row + 1,
    };
}

function parseWorkerConstruction(
    node: Parser.SyntaxNode,
    queueClientIds: Set<string>,
): QueueOpInfo | null {
    const ctorNode = node.childForFieldName('constructor');
    if (!ctorNode) return null;
    if (ctorNode.text !== 'Worker' && !queueClientIds.has(ctorNode.text)) return null;
    if (ctorNode.text !== 'Worker') return null;

    const args = node.childForFieldName('arguments');
    if (!args || args.namedChildren.length < 2) return null;

    const firstArg = args.namedChildren[0];
    if (!firstArg || (firstArg.type !== 'string' && firstArg.type !== 'template_string')) return null;
    const queueName = firstArg.text.replace(/^['"`]|['"`]$/g, '');
    if (!queueName) return null;

    return {
        callerName: findEnclosingFunctionName(node) ?? '__file__',
        queueName,
        jobName: null,
        kind: 'consumer',
        line: node.startPosition.row + 1,
    };
}

export function buildQueueNodesAndEdges(
    ops: QueueOpInfo[],
    funcMap: Map<string, string>,
    fileId: string,
    filePath: string,
): { nodes: GraphNode[]; edges: GraphEdge[] } {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const seenNodes = new Set<string>();
    const seenEdges = new Set<string>();

    for (const op of ops) {
        const displayName = op.jobName
            ? `${op.queueName}:${op.jobName}`
            : op.queueName;
        const nodeId = createNodeId('queue_job', filePath, displayName);

        if (!seenNodes.has(nodeId)) {
            seenNodes.add(nodeId);
            const jobNode: QueueJobNode = {
                id: nodeId,
                type: 'queue_job',
                name: displayName,
                queueName: op.queueName,
                filePath,
                jobKind: op.kind,
            };
            nodes.push(jobNode);
        }

        const sourceId = op.callerName === '__file__'
            ? fileId
            : funcMap.get(op.callerName) ?? fileId;

        if (op.kind === 'producer') {
            const edgeKey = `${sourceId}->produces_job->${nodeId}`;
            if (!seenEdges.has(edgeKey)) {
                seenEdges.add(edgeKey);
                const edge: ProducesJobEdge = {
                    id: edgeKey,
                    type: 'PRODUCES_JOB',
                    sourceId,
                    targetId: nodeId,
                    confidence: 0.9,
                    jobName: op.jobName ?? undefined,
                };
                edges.push(edge);
            }
        } else {
            const edgeKey = `${sourceId}->consumes_job->${nodeId}`;
            if (!seenEdges.has(edgeKey)) {
                seenEdges.add(edgeKey);
                const edge: ConsumesJobEdge = {
                    id: edgeKey,
                    type: 'CONSUMES_JOB',
                    sourceId,
                    targetId: nodeId,
                    confidence: 0.9,
                    jobName: op.jobName ?? undefined,
                };
                edges.push(edge);
            }
        }
    }

    return { nodes, edges };
}
