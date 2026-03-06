import Parser from 'tree-sitter';
import type { ExternalAPINode, CallsExternalEdge, GraphNode, GraphEdge } from '@nomik/core';
import type { ImportInfo } from './imports.js';
import { createNodeId } from '../utils.js';
import { extractFirstStringArg, findEnclosingFunctionName } from './ast-utils.js';

// ────────────────────────────────────────────────────────────────────────
// External API Call Detection — FULLY DYNAMIC, import-aware
//
// Strategy (works on ANY project, zero hardcoded variable names):
//   1. Import detection: scan file imports for known HTTP npm packages
//      (axios, ky, got, node-fetch, ofetch, undici, superagent, etc.)
//      → the imported identifier becomes a tracked HTTP client
//   2. Built-in globals: fetch() and $fetch() are always HTTP calls
//   3. URL heuristic: any receiver.get/post/put/delete(arg) where arg
//      starts with '/', 'http://', 'https://' → treat as API call
//      regardless of the receiver name
//
// Creates: ExternalAPINode + CALLS_EXTERNAL edges
// ────────────────────────────────────────────────────────────────────────

export interface APICallInfo {
    callerName: string;
    receiverName: string | null;
    method: string;              // HTTP method: GET, POST, PUT, DELETE, PATCH or UNKNOWN
    endpoint: string | null;     // URL string if extractable
    line: number;
}

// ── Known npm packages that are HTTP clients (universal, not project-specific) ──
const HTTP_PACKAGES = new Set([
    'axios', 'ky', 'got', 'node-fetch', 'cross-fetch', 'isomorphic-fetch',
    'ofetch', 'undici', 'superagent', 'needle', 'phin', 'bent',
    'make-fetch-happen', 'miniget', '@nuxt/http', 'ohmyfetch',
]);

// ── Built-in global functions that are always HTTP calls ──
const BARE_HTTP_GLOBALS = new Set(['fetch', '$fetch']);

// ── Method names that map to HTTP verbs ──
const METHOD_TO_HTTP: Record<string, string> = {
    get: 'GET', post: 'POST', put: 'PUT', patch: 'PATCH',
    delete: 'DELETE', head: 'HEAD', options: 'OPTIONS',
};

// ── Helpers to detect URL-like strings ──
function looksLikeUrl(s: string): boolean {
    return s.startsWith('/') || s.startsWith('http://') || s.startsWith('https://');
}


export function buildHttpClientIdentifiers(imports: ImportInfo[]): Set<string> {
    const identifiers = new Set<string>();
    for (const imp of imports) {
        const source = imp.source.trim();
        if (!HTTP_PACKAGES.has(source)) continue;
        // Default import: import axios from 'axios' → specifiers = ['axios']
        // Named imports: import { get, post } from 'ky' → specifiers = ['get', 'post']
        // Namespace import: import * as got from 'got' → specifiers = ['got']
        for (const spec of imp.specifiers) {
            identifiers.add(spec);
        }
        // Fallback: use the package name itself as identifier
        // (covers cases where specifiers might be empty)
        const lastSegment = source.split('/').pop()!;
        identifiers.add(lastSegment);
    }
    return identifiers;
}


export function extractAPICalls(
    tree: Parser.Tree,
    _filePath: string,
    httpClientIds: Set<string>,
): APICallInfo[] {
    const calls: APICallInfo[] = [];

    function visit(node: Parser.SyntaxNode): void {
        if (node.type === 'call_expression') {
            const funcNode = node.childForFieldName('function');
            if (funcNode) {
                const info = parseAPICall(funcNode, node, httpClientIds);
                if (info) calls.push(info);
            }
        }
        for (const child of node.children) {
            visit(child);
        }
    }

    visit(tree.rootNode);
    return calls;
}

function parseAPICall(
    funcNode: Parser.SyntaxNode,
    callNode: Parser.SyntaxNode,
    httpClientIds: Set<string>,
): APICallInfo | null {
    // ── Pattern 1: Bare function calls ──
    // fetch('url'), $fetch('url'), or imported-as-function: get('url')
    if (funcNode.type === 'identifier') {
        const name = funcNode.text;
        if (BARE_HTTP_GLOBALS.has(name) || httpClientIds.has(name)) {
            const endpoint = extractFirstStringArg(callNode);
            return {
                callerName: findEnclosingFunctionName(callNode) ?? '__file__',
                receiverName: name,
                method: 'UNKNOWN',
                endpoint,
                line: callNode.startPosition.row + 1,
            };
        }
    }

    // ── Pattern 2: receiver.method() calls ──
    if (funcNode.type === 'member_expression') {
        const obj = funcNode.childForFieldName('object');
        const prop = funcNode.childForFieldName('property');
        if (!obj || !prop) return null;

        const receiverName = obj.type === 'identifier' ? obj.text : null;
        const methodName = prop.text;
        const httpMethod = METHOD_TO_HTTP[methodName];
        if (!httpMethod) return null;

        // 2a: Known HTTP client from imports → always match
        if (receiverName && httpClientIds.has(receiverName)) {
            const endpoint = extractFirstStringArg(callNode);
            return {
                callerName: findEnclosingFunctionName(callNode) ?? '__file__',
                receiverName,
                method: httpMethod,
                endpoint,
                line: callNode.startPosition.row + 1,
            };
        }

        // 2b: URL heuristic — any x.get/post/put/delete('/api/...' or 'https://...')
        // This catches ANY custom HTTP wrapper without needing to know its name
        const endpoint = extractFirstStringArg(callNode);
        if (endpoint && looksLikeUrl(endpoint)) {
            return {
                callerName: findEnclosingFunctionName(callNode) ?? '__file__',
                receiverName: receiverName ?? obj.text,
                method: httpMethod,
                endpoint,
                line: callNode.startPosition.row + 1,
            };
        }
    }

    return null;
}


export function buildAPINodesAndEdges(
    apiCalls: APICallInfo[],
    funcMap: Map<string, string>,
    fileId: string,
    filePath: string,
): { nodes: GraphNode[]; edges: GraphEdge[] } {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const seenNodes = new Set<string>();
    const seenEdges = new Set<string>();

    for (const call of apiCalls) {
        const apiName = call.receiverName ?? 'fetch';
        const apiNodeId = createNodeId('external_api', filePath, apiName);

        if (!seenNodes.has(apiNodeId)) {
            seenNodes.add(apiNodeId);
            const apiNode: ExternalAPINode = {
                id: apiNodeId,
                type: 'external_api',
                name: apiName,
                baseUrl: call.endpoint && isAbsoluteUrl(call.endpoint) ? extractBaseUrl(call.endpoint) : undefined,
                methods: [],
            };
            nodes.push(apiNode);
        }

        const existingNode = nodes.find(n => n.id === apiNodeId) as ExternalAPINode | undefined;
        if (existingNode && call.method !== 'UNKNOWN' && !existingNode.methods.includes(call.method)) {
            existingNode.methods.push(call.method);
        }

        const sourceId = call.callerName === '__file__'
            ? fileId
            : funcMap.get(call.callerName) ?? fileId;

        const edgeKey = `${sourceId}->${apiNodeId}:${call.method}:${call.endpoint ?? ''}`;
        if (!seenEdges.has(edgeKey)) {
            seenEdges.add(edgeKey);
            const edge: CallsExternalEdge = {
                id: `${sourceId}->calls_external->${apiNodeId}`,
                type: 'CALLS_EXTERNAL',
                sourceId,
                targetId: apiNodeId,
                confidence: call.endpoint ? 0.9 : 0.75,
                method: call.method,
                endpoint: call.endpoint ?? undefined,
            };
            edges.push(edge);
        }
    }

    return { nodes, edges };
}

function isAbsoluteUrl(url: string): boolean {
    return /^https?:\/\//.test(url);
}

function extractBaseUrl(url: string): string {
    try {
        const parsed = new URL(url);
        return `${parsed.protocol}//${parsed.host}`;
    } catch {
        return url;
    }
}
