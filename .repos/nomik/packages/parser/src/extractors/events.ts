import Parser from 'tree-sitter';
import type { EventNode, EmitsEdge, ListensToEdge, GraphNode, GraphEdge } from '@nomik/core';
import { createNodeId } from '../utils.js';

// ────────────────────────────────────────────────────────────────────────
// Event / Message Bus Detection — tree-sitter based (TS/JS)
//
// Patterns detected:
//   Emit:
//     - emitter.emit('eventName', payload)
//     - socket.emit('eventName', payload)
//     - this.emit('eventName', payload)
//     - eventBus.emit('eventName')
//     - eventBus.dispatch('eventName')
//   Listen:
//     - emitter.on('eventName', handler)
//     - emitter.once('eventName', handler)
//     - emitter.addListener('eventName', handler)
//     - socket.on('eventName', handler)
//     - addEventListener('eventName', handler)
//     - eventBus.subscribe('eventName', handler)
//
// Creates: EventNode + EMITS / LISTENS_TO edges
// ────────────────────────────────────────────────────────────────────────

export interface EventInfo {
    eventName: string;
    kind: 'emit' | 'listen';
    callerName: string;
    handlerName?: string;
    namespace?: string;
    room?: string;
    line: number;
}

const EMIT_METHODS = new Set(['emit', 'dispatch', 'publish', 'send', 'fire']);
const LISTEN_METHODS = new Set(['on', 'once', 'addListener', 'addEventListener', 'subscribe', 'handle']);
const ROOM_METHODS = new Set(['to', 'in']);
const NAMESPACE_METHOD = 'of';
const JOIN_METHODS = new Set(['join', 'leave']);


export function extractEvents(tree: Parser.Tree, _filePath: string): EventInfo[] {
    const results: EventInfo[] = [];
    const cursor = tree.walk();
    let currentFunction = '__file__';
    const functionStack: string[] = [];

    function visit(): void {
        const node = cursor.currentNode;

        // Track function scope
        if (
            node.type === 'function_declaration' ||
            node.type === 'method_definition' ||
            node.type === 'arrow_function' ||
            node.type === 'function_expression' ||
            node.type === 'generator_function_declaration'
        ) {
            const name = node.childForFieldName('name')?.text;
            if (name) {
                functionStack.push(currentFunction);
                currentFunction = name;
            } else if (node.parent?.type === 'variable_declarator') {
                const varName = node.parent.childForFieldName('name')?.text;
                if (varName) {
                    functionStack.push(currentFunction);
                    currentFunction = varName;
                }
            }
        }

        // Pattern: receiver.method('eventName', ...) — call_expression with member_expression
        if (node.type === 'call_expression') {
            const eventInfo = tryEventCallExpression(node, currentFunction);
            if (eventInfo) {
                results.push(eventInfo);
            }
            // Socket.io: socket.join('room') / socket.leave('room')
            const joinInfo = trySocketJoinLeave(node, currentFunction);
            if (joinInfo) {
                results.push(joinInfo);
            }
        }

        if (cursor.gotoFirstChild()) {
            do { visit(); } while (cursor.gotoNextSibling());
            cursor.gotoParent();
        }

        // Pop function scope
        if (
            (node.type === 'function_declaration' ||
                node.type === 'method_definition' ||
                node.type === 'arrow_function' ||
                node.type === 'function_expression' ||
                node.type === 'generator_function_declaration') &&
            functionStack.length > 0
        ) {
            const name = node.childForFieldName('name')?.text
                ?? (node.parent?.type === 'variable_declarator'
                    ? node.parent.childForFieldName('name')?.text
                    : undefined);
            if (name) {
                currentFunction = functionStack.pop()!;
            }
        }
    }

    visit();
    return results;
}

function tryEventCallExpression(node: Parser.SyntaxNode, callerName: string): EventInfo | null {
    const fn = node.childForFieldName('function');
    if (!fn || fn.type !== 'member_expression') return null;

    const methodNode = fn.childForFieldName('property');
    if (!methodNode) return null;
    const method = methodNode.text;

    const isEmit = EMIT_METHODS.has(method);
    const isListen = LISTEN_METHODS.has(method);
    if (!isEmit && !isListen) return null;

    // Get the first argument (event name)
    const args = node.childForFieldName('arguments');
    if (!args || args.namedChildren.length === 0) return null;

    const firstArg = args.namedChildren[0];
    if (!firstArg) return null;

    // Event name must be a string literal
    if (firstArg.type !== 'string' && firstArg.type !== 'template_string') return null;
    const eventName = firstArg.text.replace(/^['"`]|['"`]$/g, '');
    if (!eventName) return null;

    // For listeners, try to extract handler name
    let handlerName: string | undefined;
    if (isListen && args.namedChildren.length >= 2) {
        const secondArg = args.namedChildren[1];
        if (secondArg?.type === 'identifier') {
            handlerName = secondArg.text;
        }
    }

    // Detect Socket.io room/namespace from chained calls:
    //   socket.to('room').emit('event')  → room = 'room'
    //   io.of('/ns').emit('event')       → namespace = '/ns'
    const { namespace, room } = detectSocketChainContext(fn);

    return {
        eventName,
        kind: isEmit ? 'emit' : 'listen',
        callerName,
        handlerName,
        namespace,
        room,
        line: node.startPosition.row + 1,
    };
}

/** Detect room/namespace from chained Socket.io calls like socket.to('room').emit() */
function detectSocketChainContext(memberExpr: Parser.SyntaxNode): { namespace?: string; room?: string } {
    let namespace: string | undefined;
    let room: string | undefined;

    const obj = memberExpr.childForFieldName('object');
    if (!obj || obj.type !== 'call_expression') return { namespace, room };

    const innerFn = obj.childForFieldName('function');
    if (!innerFn || innerFn.type !== 'member_expression') return { namespace, room };

    const innerMethod = innerFn.childForFieldName('property')?.text;
    if (!innerMethod) return { namespace, room };

    const innerArgs = obj.childForFieldName('arguments');
    const firstInnerArg = innerArgs?.namedChildren[0];
    const argText = (firstInnerArg?.type === 'string' || firstInnerArg?.type === 'template_string')
        ? firstInnerArg.text.replace(/^['"`]|['"`]$/g, '')
        : undefined;

    if (ROOM_METHODS.has(innerMethod) && argText) {
        room = argText;
    }
    if (innerMethod === NAMESPACE_METHOD && argText) {
        namespace = argText;
    }

    return { namespace, room };
}

/** Detect socket.join('room') / socket.leave('room') */
function trySocketJoinLeave(node: Parser.SyntaxNode, callerName: string): EventInfo | null {
    const fn = node.childForFieldName('function');
    if (!fn || fn.type !== 'member_expression') return null;

    const methodNode = fn.childForFieldName('property');
    if (!methodNode || !JOIN_METHODS.has(methodNode.text)) return null;

    const args = node.childForFieldName('arguments');
    if (!args || args.namedChildren.length === 0) return null;

    const firstArg = args.namedChildren[0];
    if (!firstArg || (firstArg.type !== 'string' && firstArg.type !== 'template_string')) return null;

    const roomName = firstArg.text.replace(/^['"`]|['"`]$/g, '');
    if (!roomName) return null;

    return {
        eventName: `room:${methodNode.text}:${roomName}`,
        kind: methodNode.text === 'join' ? 'listen' : 'emit',
        callerName,
        room: roomName,
        line: node.startPosition.row + 1,
    };
}


export function extractPythonEvents(content: string): EventInfo[] {
    const results: EventInfo[] = [];
    let m: RegExpExecArray | null;

    // socketio.emit('event', ...) or emit('event', ...)
    const emitPattern = /\.emit\(\s*['"]([^'"]+)['"]/g;
    while ((m = emitPattern.exec(content)) !== null) {
        const line = content.substring(0, m.index).split('\n').length;
        results.push({ eventName: m[1]!, kind: 'emit', callerName: '__file__', line });
    }

    // @socketio.on('event') or .on('event', ...)
    const onPattern = /\.on\(\s*['"]([^'"]+)['"]/g;
    while ((m = onPattern.exec(content)) !== null) {
        const line = content.substring(0, m.index).split('\n').length;
        results.push({ eventName: m[1]!, kind: 'listen', callerName: '__file__', line });
    }

    // signal.connect(handler) — Django signals
    const signalPattern = /(\w+)\.connect\(\s*(\w+)/g;
    while ((m = signalPattern.exec(content)) !== null) {
        const line = content.substring(0, m.index).split('\n').length;
        results.push({
            eventName: m[1]!,
            kind: 'listen',
            callerName: '__file__',
            handlerName: m[2],
            line,
        });
    }

    return results;
}


export function buildEventNodesAndEdges(
    events: EventInfo[],
    funcMap: Map<string, string>,
    fileId: string,
    filePath: string,
): { nodes: GraphNode[]; edges: GraphEdge[] } {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const seenNodes = new Set<string>();
    const seenEdges = new Set<string>();

    for (const ev of events) {
        const eventNodeId = createNodeId('event', filePath, ev.eventName);

        if (!seenNodes.has(eventNodeId)) {
            seenNodes.add(eventNodeId);
            const eventNode: EventNode = {
                id: eventNodeId,
                type: 'event',
                name: ev.eventName,
                eventKind: ev.kind,
                filePath,
                namespace: ev.namespace,
                room: ev.room,
            };
            nodes.push(eventNode);
        }

        const sourceId = ev.callerName === '__file__'
            ? fileId
            : funcMap.get(ev.callerName) ?? fileId;

        if (ev.kind === 'emit') {
            const edgeKey = `${sourceId}->emits->${eventNodeId}`;
            if (!seenEdges.has(edgeKey)) {
                seenEdges.add(edgeKey);
                const edge: EmitsEdge = {
                    id: edgeKey,
                    type: 'EMITS',
                    sourceId,
                    targetId: eventNodeId,
                    confidence: 0.9,
                    payload: undefined,
                };
                edges.push(edge);
            }
        } else {
            const edgeKey = `${sourceId}->listens_to->${eventNodeId}`;
            if (!seenEdges.has(edgeKey)) {
                seenEdges.add(edgeKey);
                const edge: ListensToEdge = {
                    id: edgeKey,
                    type: 'LISTENS_TO',
                    sourceId,
                    targetId: eventNodeId,
                    confidence: 0.9,
                    handler: ev.handlerName ?? ev.callerName,
                };
                edges.push(edge);
            }
        }
    }

    return { nodes, edges };
}
