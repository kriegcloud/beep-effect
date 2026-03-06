import type Parser from 'tree-sitter';
import type { GraphNode, GraphEdge, EventNode } from '@nomik/core';
import type { ImportInfo } from './imports.js';
import { findEnclosingFunctionName, extractFirstStringArg } from './ast-utils.js';
import { createNodeId } from '../utils.js';

// ────────────────────────────────────────────────────────────────────────
// WebSocket Tracking — import-aware
//
// Detects:
//   - ws: new WebSocketServer(), wss.on('connection'), ws.on('message')
//   - @nestjs/websockets: @WebSocketGateway(), @SubscribeMessage()
//   - uWebSockets.js: app.ws('/path', { message: handler })
//   - socket.io already handled in events.ts
//
// Creates: EventNode (eventKind='listen'/'emit') with namespace='websocket'
// ────────────────────────────────────────────────────────────────────────

export interface WebSocketEventInfo {
    eventName: string;
    kind: 'listen' | 'emit' | 'connection';
    callerName: string;
    path?: string;
    line: number;
}

const WS_PACKAGES = new Set([
    'ws', 'websocket', '@nestjs/websockets', '@nestjs/platform-ws',
    'uWebSockets.js', 'uws', 'isomorphic-ws',
]);

// ────────────────────────────────────────────────────────────────────────

export function buildWSClientIdentifiers(imports: ImportInfo[]): Set<string> {
    const ids = new Set<string>();
    for (const imp of imports) {
        const source = imp.source.trim();
        if (!WS_PACKAGES.has(source)) continue;
        for (const spec of imp.specifiers) ids.add(spec);
    }

    // Also resolve new WebSocketServer() / new WebSocket.Server() patterns
    return ids;
}

export function extractWSEvents(
    tree: Parser.Tree,
    _filePath: string,
    clientIds: Set<string>,
): WebSocketEventInfo[] {
    if (clientIds.size === 0) return [];

    const resolvedIds = new Set(clientIds);
    const results: WebSocketEventInfo[] = [];

    // Resolve variable assignments: const wss = new WebSocketServer()
    resolveWSInstances(tree.rootNode, clientIds, resolvedIds);

    function visit(node: Parser.SyntaxNode): void {
        if (node.type === 'call_expression') {
            const info = parseWSCall(node, resolvedIds);
            if (info) results.push(info);
        }
        // Decorator-based: @SubscribeMessage('event'), @WebSocketGateway()
        if (node.type === 'decorator') {
            const info = parseWSDecorator(node, clientIds);
            if (info) results.push(info);
        }
        for (const child of node.children) visit(child);
    }

    visit(tree.rootNode);
    return results;
}

function resolveWSInstances(
    root: Parser.SyntaxNode,
    importedIds: Set<string>,
    resolvedIds: Set<string>,
): void {
    function visit(node: Parser.SyntaxNode): void {
        if (node.type === 'variable_declarator') {
            const nameNode = node.childForFieldName('name');
            const valueNode = node.childForFieldName('value');
            if (nameNode && valueNode) {
                if (valueNode.type === 'new_expression') {
                    const ctor = valueNode.childForFieldName('constructor');
                    if (ctor) {
                        const ctorText = ctor.text;
                        if (importedIds.has(ctorText) || ctorText.includes('WebSocket') || ctorText.includes('Server')) {
                            if (importedIds.has(ctorText) || resolvedIds.has(ctorText)) {
                                resolvedIds.add(nameNode.text);
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

function parseWSCall(
    callNode: Parser.SyntaxNode,
    clientIds: Set<string>,
): WebSocketEventInfo | null {
    const fn = callNode.childForFieldName('function');
    if (!fn || fn.type !== 'member_expression') return null;

    const obj = fn.childForFieldName('object');
    const prop = fn.childForFieldName('property');
    if (!obj || !prop) return null;
    if (!clientIds.has(obj.text)) return null;

    const callerName = findEnclosingFunctionName(callNode) ?? '__file__';
    const line = callNode.startPosition.row + 1;
    const method = prop.text;

    // wss.on('connection', handler), ws.on('message', handler)
    if (method === 'on' || method === 'once' || method === 'addEventListener') {
        const eventName = extractFirstStringArg(callNode);
        if (eventName) {
            const kind = eventName === 'connection' ? 'connection' as const : 'listen' as const;
            return { eventName, kind, callerName, line };
        }
    }

    // ws.send(data)
    if (method === 'send') {
        return { eventName: 'message', kind: 'emit', callerName, line };
    }

    // uWebSockets.js: app.ws('/path', { ... })
    if (method === 'ws') {
        const path = extractFirstStringArg(callNode);
        return { eventName: 'ws:connection', kind: 'listen', callerName, path: path ?? undefined, line };
    }

    return null;
}

function parseWSDecorator(
    decoratorNode: Parser.SyntaxNode,
    _clientIds: Set<string>,
): WebSocketEventInfo | null {
    const expr = decoratorNode.namedChildren[0];
    if (!expr) return null;

    let decoratorName: string;
    let argExpr: Parser.SyntaxNode | null = null;

    if (expr.type === 'call_expression') {
        const fn = expr.childForFieldName('function');
        decoratorName = fn?.text ?? '';
        argExpr = expr;
    } else if (expr.type === 'identifier') {
        decoratorName = expr.text;
    } else {
        return null;
    }

    const line = decoratorNode.startPosition.row + 1;
    const sibling = decoratorNode.nextNamedSibling;
    const methodName = sibling?.childForFieldName('name')?.text ?? 'anonymous';

    // @SubscribeMessage('eventName')
    if (decoratorName === 'SubscribeMessage' && argExpr) {
        const eventName = extractFirstStringArg(argExpr);
        return { eventName: eventName ?? methodName, kind: 'listen', callerName: methodName, line };
    }

    // @WebSocketGateway(port, { namespace: '/chat' })
    if (decoratorName === 'WebSocketGateway') {
        return { eventName: 'ws:gateway', kind: 'connection', callerName: methodName, line };
    }

    return null;
}

export function buildWSNodesAndEdges(
    events: WebSocketEventInfo[],
    funcMap: Map<string, string>,
    fileId: string,
    filePath: string,
): { nodes: GraphNode[]; edges: GraphEdge[] } {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const seenNodes = new Set<string>();

    for (const ev of events) {
        const nodeId = createNodeId('event', filePath, `ws:${ev.eventName}`);

        if (!seenNodes.has(nodeId)) {
            seenNodes.add(nodeId);
            const eventNode: EventNode = {
                id: nodeId,
                type: 'event',
                name: ev.eventName,
                eventKind: ev.kind === 'emit' ? 'emit' : 'listen',
                filePath,
                namespace: 'websocket',
            };
            nodes.push(eventNode);
        }

        const sourceId = funcMap.get(ev.callerName) ?? fileId;

        if (ev.kind === 'emit') {
            edges.push({
                id: `${sourceId}->emits->${nodeId}`,
                type: 'EMITS' as const,
                sourceId,
                targetId: nodeId,
                confidence: 0.85,
            });
        } else {
            edges.push({
                id: `${sourceId}->listens_to->${nodeId}`,
                type: 'LISTENS_TO' as const,
                sourceId,
                targetId: nodeId,
                confidence: 0.85,
                handler: ev.callerName,
            });
        }
    }

    return { nodes, edges };
}
