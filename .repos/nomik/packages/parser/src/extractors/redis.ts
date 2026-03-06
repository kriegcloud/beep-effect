import Parser from 'tree-sitter';
import type { GraphNode, GraphEdge, DBTableNode, ReadsFromEdge, WritesToEdge } from '@nomik/core';
import type { ImportInfo } from './imports.js';
import { createNodeId } from '../utils.js';
import { findEnclosingFunctionName, extractFirstStringArg } from './ast-utils.js';

// ────────────────────────────────────────────────────────────────────────
// Redis Operation Detection — import-aware
//
// Detects:
//   - redis/ioredis: get, set, hget, hset, del, lpush, rpush, sadd, etc.
//   - Redis pub/sub: publish, subscribe (handled via events.ts already)
//
// Creates: DBTableNode (name = key pattern) + READS_FROM / WRITES_TO edges
// ────────────────────────────────────────────────────────────────────────

export interface RedisOpInfo {
    callerName: string;
    command: string;
    keyPattern: string | null;
    operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
    line: number;
}

const REDIS_PACKAGES = new Set(['redis', 'ioredis', '@redis/client', '@upstash/redis']);

const REDIS_READ_COMMANDS = new Set([
    'get', 'mget', 'hget', 'hgetall', 'hmget', 'lrange', 'lindex', 'llen',
    'sismember', 'smembers', 'scard', 'zrange', 'zrangebyscore', 'zscore',
    'zcard', 'exists', 'type', 'ttl', 'pttl', 'keys', 'scan', 'hscan',
    'sscan', 'zscan', 'strlen', 'getrange', 'bitcount',
]);

const REDIS_WRITE_COMMANDS = new Set([
    'set', 'mset', 'setnx', 'setex', 'psetex', 'hset', 'hmset', 'hsetnx',
    'lpush', 'rpush', 'lset', 'linsert', 'sadd', 'zadd', 'zincrby',
    'incr', 'incrby', 'incrbyfloat', 'decr', 'decrby', 'append',
    'setrange', 'bitop', 'pfadd', 'pfmerge', 'xadd', 'expire', 'pexpire',
    'persist', 'rename',
]);

const REDIS_DELETE_COMMANDS = new Set([
    'del', 'unlink', 'hdel', 'lrem', 'lpop', 'rpop', 'srem', 'spop',
    'zrem', 'zremrangebyscore', 'zremrangebyrank', 'ltrim', 'flushdb',
    'flushall', 'xdel', 'xtrim',
]);

// ────────────────────────────────────────────────────────────────────────

export function buildRedisClientIdentifiers(imports: ImportInfo[]): Set<string> {
    const ids = new Set<string>();
    for (const imp of imports) {
        const source = imp.source.trim();
        if (!REDIS_PACKAGES.has(source)) continue;
        for (const spec of imp.specifiers) ids.add(spec);
        const lastSegment = source.split('/').pop()!;
        ids.add(lastSegment);
    }
    return ids;
}

export function extractRedisOperations(
    tree: Parser.Tree,
    _filePath: string,
    redisClientIds: Set<string>,
): RedisOpInfo[] {
    if (redisClientIds.size === 0) return [];

    // Resolve variable assignments: const redis = new Redis() → add 'redis' to client IDs
    const resolvedIds = new Set(redisClientIds);
    resolveRedisInstances(tree.rootNode, redisClientIds, resolvedIds);

    const ops: RedisOpInfo[] = [];

    function visit(node: Parser.SyntaxNode): void {
        if (node.type === 'call_expression') {
            const info = parseRedisCall(node, resolvedIds);
            if (info) ops.push(info);
        }
        for (const child of node.children) visit(child);
    }

    visit(tree.rootNode);
    return ops;
}

/** Finds `const redis = new Redis()` or `const client = createClient()` and adds variable names to client IDs */
function resolveRedisInstances(
    root: Parser.SyntaxNode,
    importedIds: Set<string>,
    resolvedIds: Set<string>,
): void {
    function visit(node: Parser.SyntaxNode): void {
        if (node.type === 'variable_declarator') {
            const nameNode = node.childForFieldName('name');
            const valueNode = node.childForFieldName('value');
            if (nameNode && valueNode) {
                // const redis = new Redis() / new Redis({})
                if (valueNode.type === 'new_expression') {
                    const ctor = valueNode.childForFieldName('constructor');
                    if (ctor && importedIds.has(ctor.text)) {
                        resolvedIds.add(nameNode.text);
                    }
                }
                // const redis = createClient() / Redis.createClient()
                if (valueNode.type === 'call_expression') {
                    const fn = valueNode.childForFieldName('function');
                    if (fn) {
                        if (fn.type === 'identifier' && fn.text === 'createClient') {
                            resolvedIds.add(nameNode.text);
                        }
                        if (fn.type === 'member_expression') {
                            const obj = fn.childForFieldName('object');
                            const prop = fn.childForFieldName('property');
                            if (obj && prop && importedIds.has(obj.text) && prop.text === 'createClient') {
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

function classifyRedisCommand(cmd: string): 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | null {
    const lower = cmd.toLowerCase();
    if (REDIS_READ_COMMANDS.has(lower)) return 'SELECT';
    if (REDIS_WRITE_COMMANDS.has(lower)) return 'INSERT';
    if (REDIS_DELETE_COMMANDS.has(lower)) return 'DELETE';
    return null;
}

function parseRedisCall(
    callNode: Parser.SyntaxNode,
    redisClientIds: Set<string>,
): RedisOpInfo | null {
    const funcNode = callNode.childForFieldName('function');
    if (!funcNode || funcNode.type !== 'member_expression') return null;

    const obj = funcNode.childForFieldName('object');
    const prop = funcNode.childForFieldName('property');
    if (!obj || !prop) return null;

    const receiverName = obj.type === 'identifier' ? obj.text : null;
    if (!receiverName || !redisClientIds.has(receiverName)) return null;

    const command = prop.text;
    const operation = classifyRedisCommand(command);
    if (!operation) return null;

    const keyPattern = extractFirstStringArg(callNode);

    return {
        callerName: findEnclosingFunctionName(callNode) ?? '__file__',
        command,
        keyPattern,
        operation,
        line: callNode.startPosition.row + 1,
    };
}

export function buildRedisNodesAndEdges(
    ops: RedisOpInfo[],
    funcMap: Map<string, string>,
    fileId: string,
    filePath: string,
): { nodes: GraphNode[]; edges: GraphEdge[] } {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const seenNodes = new Set<string>();
    const seenEdges = new Set<string>();

    for (const op of ops) {
        const tableName = op.keyPattern
            ? `redis:${op.keyPattern.replace(/:[^:]+$/, ':*')}`
            : 'redis:unknown';
        const nodeId = createNodeId('db_table', filePath, tableName);

        if (!seenNodes.has(nodeId)) {
            seenNodes.add(nodeId);
            const tableNode: DBTableNode = {
                id: nodeId,
                type: 'db_table',
                name: tableName,
                schema: 'redis',
                operations: [],
            };
            nodes.push(tableNode);
        }

        const existing = nodes.find(n => n.id === nodeId) as DBTableNode | undefined;
        if (existing && !existing.operations.includes(op.operation)) {
            existing.operations.push(op.operation);
        }

        const sourceId = op.callerName === '__file__'
            ? fileId
            : funcMap.get(op.callerName) ?? fileId;

        if (op.operation === 'SELECT') {
            const edgeKey = `${sourceId}->reads_from->${nodeId}`;
            if (!seenEdges.has(edgeKey)) {
                seenEdges.add(edgeKey);
                const edge: ReadsFromEdge = {
                    id: edgeKey,
                    type: 'READS_FROM',
                    sourceId,
                    targetId: nodeId,
                    confidence: 0.85,
                    query: op.command,
                };
                edges.push(edge);
            }
        } else {
            const edgeKey = `${sourceId}->writes_to->${nodeId}`;
            if (!seenEdges.has(edgeKey)) {
                seenEdges.add(edgeKey);
                const edge: WritesToEdge = {
                    id: edgeKey,
                    type: 'WRITES_TO',
                    sourceId,
                    targetId: nodeId,
                    confidence: 0.85,
                    operation: op.operation === 'INSERT' ? 'INSERT' : 'DELETE',
                };
                edges.push(edge);
            }
        }
    }

    return { nodes, edges };
}
