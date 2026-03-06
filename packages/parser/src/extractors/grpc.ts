import type Parser from 'tree-sitter';
import type { GraphNode, GraphEdge, RouteNode } from '@nomik/core';
import type { ImportInfo } from './imports.js';
import { findEnclosingFunctionName, extractFirstStringArg } from './ast-utils.js';
import { createNodeId } from '../utils.js';

// ────────────────────────────────────────────────────────────────────────
// gRPC / tRPC / GraphQL Procedure Detection — import-aware
//
// Detects:
//   - tRPC: router.query(), router.mutation(), router.subscription()
//   - @grpc/grpc-js: server.addService(), new grpc.Server()
//   - @nestjs/microservices: @GrpcMethod(), @GrpcStreamMethod()
//   - GraphQL: Query/Mutation resolvers via type-graphql decorators
//
// Creates: RouteNode (method='RPC') + edges
// ────────────────────────────────────────────────────────────────────────

export interface RPCProcedureInfo {
    name: string;
    kind: 'query' | 'mutation' | 'subscription' | 'unary' | 'stream' | 'resolver';
    framework: 'trpc' | 'grpc' | 'graphql';
    callerName: string;
    line: number;
}

const TRPC_PACKAGES = new Set([
    '@trpc/server', '@trpc/client', '@trpc/react-query', '@trpc/next',
]);
const GRPC_PACKAGES = new Set([
    '@grpc/grpc-js', '@grpc/proto-loader', 'grpc', '@nestjs/microservices',
]);
const GRAPHQL_PACKAGES = new Set([
    'type-graphql', '@nestjs/graphql', 'graphql', 'apollo-server', 'apollo-server-express',
    '@apollo/server', 'graphql-yoga', 'mercurius',
]);

// ────────────────────────────────────────────────────────────────────────

export function buildRPCClientIdentifiers(imports: ImportInfo[]): {
    ids: Set<string>;
    frameworkMap: Map<string, RPCProcedureInfo['framework']>;
} {
    const ids = new Set<string>();
    const frameworkMap = new Map<string, RPCProcedureInfo['framework']>();

    for (const imp of imports) {
        const source = imp.source.trim();
        let framework: RPCProcedureInfo['framework'] | null = null;
        if (TRPC_PACKAGES.has(source)) framework = 'trpc';
        else if (GRPC_PACKAGES.has(source)) framework = 'grpc';
        else if (GRAPHQL_PACKAGES.has(source)) framework = 'graphql';
        if (!framework) continue;

        for (const spec of imp.specifiers) {
            ids.add(spec);
            frameworkMap.set(spec, framework);
        }
    }
    return { ids, frameworkMap };
}

export function extractRPCProcedures(
    tree: Parser.Tree,
    _filePath: string,
    clientIds: Set<string>,
    frameworkMap: Map<string, RPCProcedureInfo['framework']>,
): RPCProcedureInfo[] {
    if (clientIds.size === 0) return [];

    const results: RPCProcedureInfo[] = [];

    function visit(node: Parser.SyntaxNode): void {
        // tRPC: t.router({ getUser: t.procedure.query(...) })
        // Detect .query(), .mutation(), .subscription() chains
        if (node.type === 'call_expression') {
            const info = parseTRPCCall(node, clientIds, frameworkMap);
            if (info) results.push(info);
        }

        // Decorator-based: @GrpcMethod(), @Query(), @Mutation()
        if (node.type === 'decorator') {
            const info = parseRPCDecorator(node, clientIds, frameworkMap);
            if (info) results.push(info);
        }

        for (const child of node.children) visit(child);
    }

    visit(tree.rootNode);
    return results;
}

function parseTRPCCall(
    callNode: Parser.SyntaxNode,
    clientIds: Set<string>,
    _frameworkMap: Map<string, RPCProcedureInfo['framework']>,
): RPCProcedureInfo | null {
    const fn = callNode.childForFieldName('function');
    if (!fn) return null;

    const callerName = findEnclosingFunctionName(callNode) ?? '__file__';
    const line = callNode.startPosition.row + 1;

    // tRPC chain: something.query(...), something.mutation(...)
    if (fn.type === 'member_expression') {
        const prop = fn.childForFieldName('property');
        if (!prop) return null;
        const method = prop.text;

        if (method === 'query' || method === 'mutation' || method === 'subscription') {
            // Check if this is a tRPC procedure chain
            const chain = fn.text;
            // Look for .procedure.query() or publicProcedure.query()
            if (chain.includes('procedure') || chain.includes('Procedure')) {
                // Try to extract the procedure name from the parent property assignment
                const procName = findPropertyKeyParent(callNode);
                return {
                    name: procName ?? method,
                    kind: method as RPCProcedureInfo['kind'],
                    framework: 'trpc',
                    callerName,
                    line,
                };
            }
        }

        // grpc: server.addService(ServiceDefinition, implementation)
        if (method === 'addService') {
            const obj = fn.childForFieldName('object');
            if (obj && (clientIds.has(obj.text) || obj.text.includes('Server') || obj.text.includes('server'))) {
                const serviceName = extractFirstStringArg(callNode) ?? 'unknown';
                return { name: serviceName, kind: 'unary', framework: 'grpc', callerName, line };
            }
        }
    }

    return null;
}

function parseRPCDecorator(
    decoratorNode: Parser.SyntaxNode,
    _clientIds: Set<string>,
    _frameworkMap: Map<string, RPCProcedureInfo['framework']>,
): RPCProcedureInfo | null {
    const expr = decoratorNode.namedChildren[0];
    if (!expr) return null;

    let decoratorName: string;
    if (expr.type === 'call_expression') {
        const fn = expr.childForFieldName('function');
        decoratorName = fn?.text ?? '';
    } else if (expr.type === 'identifier') {
        decoratorName = expr.text;
    } else {
        return null;
    }

    const lower = decoratorName.toLowerCase();
    const line = decoratorNode.startPosition.row + 1;

    // Find the decorated method name
    const sibling = decoratorNode.nextNamedSibling;
    const methodName = sibling?.childForFieldName('name')?.text ?? 'anonymous';

    // @GrpcMethod('ServiceName', 'MethodName')
    if (lower === 'grpcmethod' || lower === 'grpcstreammethod') {
        const kind = lower.includes('stream') ? 'stream' as const : 'unary' as const;
        let name = methodName;
        if (expr.type === 'call_expression') {
            const argName = extractFirstStringArg(expr);
            if (argName) name = argName;
        }
        return { name, kind, framework: 'grpc', callerName: methodName, line };
    }

    // @Query(), @Mutation(), @Subscription() — GraphQL decorators
    if (lower === 'query') {
        return { name: methodName, kind: 'query', framework: 'graphql', callerName: methodName, line };
    }
    if (lower === 'mutation') {
        return { name: methodName, kind: 'mutation', framework: 'graphql', callerName: methodName, line };
    }
    if (lower === 'subscription') {
        return { name: methodName, kind: 'subscription', framework: 'graphql', callerName: methodName, line };
    }

    // @Resolver() — GraphQL resolver class
    if (lower === 'resolver' || lower === 'resolverof') {
        return { name: methodName, kind: 'resolver', framework: 'graphql', callerName: methodName, line };
    }

    return null;
}

/** Walk up from a call node to find the property key it's assigned to: { getUser: t.procedure.query(...) } */
function findPropertyKeyParent(node: Parser.SyntaxNode): string | null {
    let current: Parser.SyntaxNode | null = node;
    while (current) {
        if (current.parent?.type === 'pair') {
            const key = current.parent.childForFieldName('key');
            if (key) return key.text;
        }
        current = current.parent;
    }
    return null;
}

export function buildRPCNodesAndEdges(
    procedures: RPCProcedureInfo[],
    funcMap: Map<string, string>,
    fileId: string,
    filePath: string,
): { nodes: GraphNode[]; edges: GraphEdge[] } {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const seenNodes = new Set<string>();

    for (const proc of procedures) {
        const method = proc.kind === 'query' ? 'GET'
            : proc.kind === 'mutation' ? 'POST'
                : proc.kind === 'subscription' ? 'WS'
                    : 'RPC';
        const nodeId = createNodeId('route', filePath, `${method}:${proc.framework}:${proc.name}`);

        if (!seenNodes.has(nodeId)) {
            seenNodes.add(nodeId);
            const routeNode: RouteNode = {
                id: nodeId,
                type: 'route',
                method: method as RouteNode['method'],
                path: `/${proc.framework}/${proc.name}`,
                handlerName: proc.callerName,
                filePath,
                middleware: [],
                apiTags: [proc.framework],
            };
            nodes.push(routeNode);
        }

        // Edge: Function → Route (HANDLES)
        const sourceId = funcMap.get(proc.callerName) ?? fileId;
        edges.push({
            id: `${sourceId}->handles->${nodeId}`,
            type: 'HANDLES' as const,
            sourceId: nodeId,
            targetId: sourceId,
            confidence: 0.85,
            middleware: [],
        });
    }

    return { nodes, edges };
}
