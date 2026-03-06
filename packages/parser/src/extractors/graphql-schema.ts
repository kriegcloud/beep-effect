import type { GraphNode, GraphEdge, RouteNode } from '@nomik/core';
import { createNodeId } from '../utils.js';

// ────────────────────────────────────────────────────────────────────────
// GraphQL Schema File Parsing
//
// Detects:
//   - .graphql / .gql schema files
//   - type definitions (type, input, interface, enum, union, scalar)
//   - Query/Mutation/Subscription root type fields → Route nodes
//
// Creates: RouteNode for each Query/Mutation/Subscription field
//          ClassNode-like entries for type/input/interface definitions
// ────────────────────────────────────────────────────────────────────────

export interface GraphQLTypeInfo {
    name: string;
    kind: 'type' | 'input' | 'interface' | 'enum' | 'union' | 'scalar';
    fields: string[];
    implements?: string[];
}

export interface GraphQLOperationInfo {
    name: string;
    kind: 'query' | 'mutation' | 'subscription';
    returnType?: string;
    args?: string[];
}


export function extractGraphQLSchema(content: string, _filePath: string): {
    types: GraphQLTypeInfo[];
    operations: GraphQLOperationInfo[];
} {
    const types: GraphQLTypeInfo[] = [];
    const operations: GraphQLOperationInfo[] = [];

    const cleaned = content.replace(/#.*$/gm, '').replace(/"""[\s\S]*?"""/g, '').replace(/"[^"]*"/g, '""');

    // type/input/interface blocks
    const typePattern = /\b(type|input|interface)\s+(\w+)(?:\s+implements\s+([^\{]+))?\s*\{([^}]*)\}/g;
    let match: RegExpExecArray | null;

    while ((match = typePattern.exec(cleaned)) !== null) {
        const kind = match[1] as GraphQLTypeInfo['kind'];
        const name = match[2] ?? '';
        const implementsStr = match[3];
        const body = match[4] ?? '';

        const fields = body
            .split('\n')
            .map(l => l.trim())
            .filter(l => l && l.includes(':'))
            .map(l => l.split(':')[0]?.replace(/[(\[!]/g, '').trim() ?? '')
            .filter(Boolean);

        const implementsList = implementsStr
            ? implementsStr.split('&').map(s => s.trim()).filter(Boolean)
            : undefined;

        if (name === 'Query' || name === 'Mutation' || name === 'Subscription') {
            const opKind = name.toLowerCase() as GraphQLOperationInfo['kind'];
            for (const field of fields) {
                const fieldLine = body.split('\n').find(l => l.trim().startsWith(field));
                const returnMatch = fieldLine?.match(/:\s*([^\s(!]+)/);
                operations.push({
                    name: field,
                    kind: opKind,
                    returnType: returnMatch?.[1]?.replace(/[\[\]!]/g, ''),
                });
            }
        } else {
            types.push({ name, kind, fields, implements: implementsList });
        }
    }

    const enumPattern = /\benum\s+(\w+)\s*\{([^}]*)\}/g;
    while ((match = enumPattern.exec(cleaned)) !== null) {
        const name = match[1] ?? '';
        const body = match[2] ?? '';
        const values = body.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));
        types.push({ name, kind: 'enum', fields: values });
    }

    const unionPattern = /\bunion\s+(\w+)\s*=\s*([^}\n]+)/g;
    while ((match = unionPattern.exec(cleaned)) !== null) {
        const name = match[1] ?? '';
        const members = (match[2] ?? '').split('|').map(s => s.trim()).filter(Boolean);
        types.push({ name, kind: 'union', fields: members });
    }

    const scalarPattern = /\bscalar\s+(\w+)/g;
    while ((match = scalarPattern.exec(cleaned)) !== null) {
        types.push({ name: match[1] ?? '', kind: 'scalar', fields: [] });
    }

    return { types, operations };
}


export function buildGraphQLNodes(
    types: GraphQLTypeInfo[],
    operations: GraphQLOperationInfo[],
    filePath: string,
): { nodes: GraphNode[]; edges: GraphEdge[] } {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];

    // Operations → Route nodes
    for (const op of operations) {
        const method = op.kind === 'query' ? 'GET'
            : op.kind === 'mutation' ? 'POST'
                : 'WS';
        const nodeId = createNodeId('route', filePath, `graphql:${op.kind}:${op.name}`);
        const routeNode: RouteNode = {
            id: nodeId,
            type: 'route',
            method: method as RouteNode['method'],
            path: `/graphql/${op.kind}/${op.name}`,
            handlerName: op.name,
            filePath,
            middleware: [],
            apiTags: ['graphql', op.kind],
            apiSummary: op.returnType ? `Returns ${op.returnType}` : undefined,
        };
        nodes.push(routeNode);
    }

    // Types → Class nodes (for schema visibility in the graph)
    for (const t of types) {
        const nodeId = createNodeId('class', filePath, `gql:${t.name}`);
        nodes.push({
            id: nodeId,
            type: 'class',
            name: t.name,
            filePath,
            methods: t.fields,
            properties: [],
            superClass: undefined,
            interfaces: t.implements ?? [],
            decorators: [t.kind],
            isAbstract: t.kind === 'interface',
            isExported: true,
            startLine: 0,
            endLine: 0,
        });
    }

    return { nodes, edges };
}
