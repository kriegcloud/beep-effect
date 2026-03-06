import Parser from 'tree-sitter';
import type { GraphNode, RouteNode } from '@nomik/core';
import type { ImportInfo } from './imports.js';
import { findEnclosingFunctionName, extractFirstStringArg } from './ast-utils.js';

// ────────────────────────────────────────────────────────────────────────
// Swagger / OpenAPI Setup Detection — import-aware
//
// Detects:
//   - @nestjs/swagger: SwaggerModule.setup(), SwaggerModule.createDocument()
//   - swagger-ui-express: app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(doc))
//   - fastify-swagger / @fastify/swagger: fastify.register(swagger, { ... })
//   - express-openapi-validator: OpenApiValidator.middleware({ apiSpec: '...' })
//
// Enriches: Existing RouteNode with swagger metadata or creates metadata edges
// ────────────────────────────────────────────────────────────────────────

export interface SwaggerSetupInfo {
    kind: 'setup' | 'spec_file' | 'validator';
    path?: string;
    specFile?: string;
    callerName: string;
    line: number;
}

const SWAGGER_PACKAGES = new Set([
    '@nestjs/swagger',
    'swagger-ui-express',
    'swagger-jsdoc',
    '@fastify/swagger',
    '@fastify/swagger-ui',
    'fastify-swagger',
    'express-openapi-validator',
    'swagger-autogen',
]);

// ────────────────────────────────────────────────────────────────────────
// Step 1: Build Swagger client identifiers from imports
// ────────────────────────────────────────────────────────────────────────

export function buildSwaggerClientIdentifiers(imports: ImportInfo[]): Set<string> {
    const ids = new Set<string>();
    for (const imp of imports) {
        const source = imp.source.trim();
        if (!SWAGGER_PACKAGES.has(source)) continue;
        for (const spec of imp.specifiers) ids.add(spec);
        const lastSegment = source.split('/').pop()!;
        ids.add(lastSegment);
    }
    return ids;
}

// ────────────────────────────────────────────────────────────────────────
// Step 2: Extract Swagger setup patterns from AST
// ────────────────────────────────────────────────────────────────────────

export function extractSwaggerSetups(
    tree: Parser.Tree,
    _filePath: string,
    swaggerClientIds: Set<string>,
): SwaggerSetupInfo[] {
    if (swaggerClientIds.size === 0) return [];
    const results: SwaggerSetupInfo[] = [];

    function visit(node: Parser.SyntaxNode): void {
        if (node.type === 'call_expression') {
            const info = parseSwaggerCall(node, swaggerClientIds);
            if (info) results.push(info);
        }
        for (const child of node.children) visit(child);
    }

    visit(tree.rootNode);
    return results;
}

function parseSwaggerCall(
    callNode: Parser.SyntaxNode,
    clientIds: Set<string>,
): SwaggerSetupInfo | null {
    const fn = callNode.childForFieldName('function');
    if (!fn) return null;

    const callerName = findEnclosingFunctionName(callNode) ?? '__file__';
    const line = callNode.startPosition.row + 1;

    // SwaggerModule.setup('/api-docs', app, document)
    if (fn.type === 'member_expression') {
        const obj = fn.childForFieldName('object');
        const prop = fn.childForFieldName('property');
        if (obj && prop && clientIds.has(obj.text)) {
            if (prop.text === 'setup') {
                const path = extractFirstStringArg(callNode);
                return { kind: 'setup', path: path ?? '/api-docs', callerName, line };
            }
            if (prop.text === 'createDocument') {
                return { kind: 'setup', callerName, line };
            }
            // swaggerUi.serve, swaggerUi.setup(spec)
            if (prop.text === 'setup' || prop.text === 'serve') {
                return { kind: 'setup', callerName, line };
            }
        }

        // OpenApiValidator.middleware({ apiSpec: 'path/to/spec.yaml' })
        if (obj && prop && clientIds.has(obj.text) && prop.text === 'middleware') {
            const specFile = extractObjectPropertyFromArgs(callNode, 'apiSpec');
            return { kind: 'validator', specFile: specFile ?? undefined, callerName, line };
        }
    }

    // app.register(swagger, { ... }) — Fastify
    if (fn.type === 'member_expression') {
        const prop = fn.childForFieldName('property');
        if (prop?.text === 'register') {
            const args = callNode.childForFieldName('arguments');
            const firstArg = args?.namedChildren[0];
            if (firstArg?.type === 'identifier' && clientIds.has(firstArg.text)) {
                return { kind: 'setup', callerName, line };
            }
        }
    }

    // swagger-jsdoc(options) — direct call
    if (fn.type === 'identifier' && clientIds.has(fn.text)) {
        return { kind: 'spec_file', callerName, line };
    }

    return null;
}

/** Extract a string property from first object arg */
function extractObjectPropertyFromArgs(callNode: Parser.SyntaxNode, propName: string): string | null {
    const args = callNode.childForFieldName('arguments');
    const firstArg = args?.namedChildren[0];
    if (firstArg?.type === 'object') {
        for (const child of firstArg.namedChildren) {
            if (child.type === 'pair') {
                const key = child.childForFieldName('key');
                const value = child.childForFieldName('value');
                if (key?.text === propName && value && (value.type === 'string' || value.type === 'template_string')) {
                    return value.text.replace(/^['"`]|['"`]$/g, '');
                }
            }
        }
    }
    return null;
}

// ────────────────────────────────────────────────────────────────────────
// Step 3: Enrich routes with swagger setup info
// Swagger setups don't produce new nodes — they enrich RouteNodes that
// already exist in the file. We track the setup path so the viz/MCP
// can surface "this project has Swagger docs at /api-docs".
// ────────────────────────────────────────────────────────────────────────

export function enrichRoutesWithSwagger(
    routes: GraphNode[],
    setups: SwaggerSetupInfo[],
): void {
    if (setups.length === 0) return;

    // Find the first setup path (e.g., '/api-docs')
    const setupPath = setups.find(s => s.path)?.path;
    if (!setupPath) return;

    // Mark all routes in this file as having swagger docs
    for (const node of routes) {
        if (node.type === 'route') {
            const route = node as RouteNode;
            if (!route.apiTags) {
                route.apiTags = ['swagger-documented'];
            }
        }
    }
}
