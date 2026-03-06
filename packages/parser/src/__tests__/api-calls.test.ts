import { describe, it, expect } from 'vitest';
import Parser from 'tree-sitter';
import { extractAPICalls, buildHttpClientIdentifiers, buildAPINodesAndEdges } from '../extractors/api-calls';
import type { ImportInfo } from '../extractors/imports';

let parser: Parser;

async function getParser(): Promise<Parser> {
    if (parser) return parser;
    parser = new Parser();
    const mod = await import('tree-sitter-typescript');
    const lang = (mod as any).default?.typescript ?? (mod as any).typescript;
    parser.setLanguage(lang as Parser.Language);
    return parser;
}

function parse(code: string) {
    return getParser().then(p => p.parse(code));
}

// ── buildHttpClientIdentifiers ──────────────────────────────────────

describe('buildHttpClientIdentifiers', () => {
    it('detects axios default import', () => {
        const imports: ImportInfo[] = [
            { source: 'axios', specifiers: ['axios'], isDefault: true, isDynamic: false, isTypeOnly: false, line: 1 },
        ];
        const ids = buildHttpClientIdentifiers(imports);
        expect(ids.has('axios')).toBe(true);
    });

    it('detects ky named imports', () => {
        const imports: ImportInfo[] = [
            { source: 'ky', specifiers: ['get', 'post'], isDefault: false, isDynamic: false, isTypeOnly: false, line: 1 },
        ];
        const ids = buildHttpClientIdentifiers(imports);
        expect(ids.has('get')).toBe(true);
        expect(ids.has('post')).toBe(true);
        expect(ids.has('ky')).toBe(true); // fallback
    });

    it('ignores non-HTTP packages', () => {
        const imports: ImportInfo[] = [
            { source: 'lodash', specifiers: ['get'], isDefault: false, isDynamic: false, isTypeOnly: false, line: 1 },
        ];
        const ids = buildHttpClientIdentifiers(imports);
        expect(ids.size).toBe(0);
    });

    it('detects scoped package @nuxt/http', () => {
        const imports: ImportInfo[] = [
            { source: '@nuxt/http', specifiers: ['$http'], isDefault: false, isDynamic: false, isTypeOnly: false, line: 1 },
        ];
        const ids = buildHttpClientIdentifiers(imports);
        expect(ids.has('$http')).toBe(true);
        expect(ids.has('http')).toBe(true); // fallback last segment
    });

    it('returns empty set for no imports', () => {
        const ids = buildHttpClientIdentifiers([]);
        expect(ids.size).toBe(0);
    });
});

// ── extractAPICalls ─────────────────────────────────────────────────

describe('extractAPICalls', () => {
    it('detects fetch() global call', async () => {
        const tree = await parse(`
            async function loadData() {
                const res = await fetch('/api/users');
            }
        `);
        const calls = extractAPICalls(tree, '/test.ts', new Set());
        expect(calls.length).toBe(1);
        expect(calls[0].receiverName).toBe('fetch');
        expect(calls[0].endpoint).toBe('/api/users');
        expect(calls[0].callerName).toBe('loadData');
    });

    it('detects $fetch() global call', async () => {
        const tree = await parse(`
            const getData = async () => {
                return $fetch('/api/items');
            };
        `);
        const calls = extractAPICalls(tree, '/test.ts', new Set());
        expect(calls.length).toBe(1);
        expect(calls[0].receiverName).toBe('$fetch');
        expect(calls[0].callerName).toBe('getData');
    });

    it('detects axios.get() with known import', async () => {
        const tree = await parse(`
            async function fetchUsers() {
                const res = await axios.get('/api/users');
            }
        `);
        const calls = extractAPICalls(tree, '/test.ts', new Set(['axios']));
        expect(calls.length).toBe(1);
        expect(calls[0].method).toBe('GET');
        expect(calls[0].receiverName).toBe('axios');
        expect(calls[0].endpoint).toBe('/api/users');
    });

    it('detects axios.post() with known import', async () => {
        const tree = await parse(`
            async function createUser() {
                await axios.post('/api/users', { name: 'test' });
            }
        `);
        const calls = extractAPICalls(tree, '/test.ts', new Set(['axios']));
        expect(calls.length).toBe(1);
        expect(calls[0].method).toBe('POST');
    });

    it('detects URL heuristic — unknown receiver with URL arg', async () => {
        const tree = await parse(`
            async function callApi() {
                await customClient.get('/api/data');
            }
        `);
        const calls = extractAPICalls(tree, '/test.ts', new Set());
        expect(calls.length).toBe(1);
        expect(calls[0].receiverName).toBe('customClient');
        expect(calls[0].method).toBe('GET');
        expect(calls[0].endpoint).toBe('/api/data');
    });

    it('detects URL heuristic with https:// URL', async () => {
        const tree = await parse(`
            function sendData() {
                api.post('https://example.com/webhook', payload);
            }
        `);
        const calls = extractAPICalls(tree, '/test.ts', new Set());
        expect(calls.length).toBe(1);
        expect(calls[0].endpoint).toBe('https://example.com/webhook');
        expect(calls[0].method).toBe('POST');
    });

    it('ignores non-HTTP method calls without URL', async () => {
        const tree = await parse(`
            function doStuff() {
                arr.get(0);
                map.delete('key');
                obj.post();
            }
        `);
        const calls = extractAPICalls(tree, '/test.ts', new Set());
        // arr.get(0) — '0' is not a URL, so ignored
        // map.delete('key') — 'key' is not a URL
        // obj.post() — no argument at all
        expect(calls.length).toBe(0);
    });

    it('attributes calls inside arrow functions correctly', async () => {
        const tree = await parse(`
            const handler = async () => {
                await fetch('/api/health');
            };
        `);
        const calls = extractAPICalls(tree, '/test.ts', new Set());
        expect(calls.length).toBe(1);
        expect(calls[0].callerName).toBe('handler');
    });

    it('uses __file__ for top-level calls', async () => {
        const tree = await parse(`
            fetch('/api/init');
        `);
        const calls = extractAPICalls(tree, '/test.ts', new Set());
        expect(calls.length).toBe(1);
        expect(calls[0].callerName).toBe('__file__');
    });
});

// ── buildAPINodesAndEdges ───────────────────────────────────────────

describe('buildAPINodesAndEdges', () => {
    it('creates ExternalAPI node and CALLS_EXTERNAL edge', () => {
        const apiCalls = [{
            callerName: 'fetchUsers',
            receiverName: 'axios',
            method: 'GET',
            endpoint: '/api/users',
            line: 5,
        }];
        const funcMap = new Map([['fetchUsers', 'func-id-1']]);
        const { nodes, edges } = buildAPINodesAndEdges(apiCalls, funcMap, 'file-id', '/test.ts');

        expect(nodes.length).toBe(1);
        expect(nodes[0].type).toBe('external_api');
        expect((nodes[0] as any).name).toBe('axios');

        expect(edges.length).toBe(1);
        expect(edges[0].type).toBe('CALLS_EXTERNAL');
        expect(edges[0].sourceId).toBe('func-id-1');
    });

    it('deduplicates API nodes for same receiver', () => {
        const apiCalls = [
            { callerName: 'a', receiverName: 'axios', method: 'GET', endpoint: '/users', line: 1 },
            { callerName: 'b', receiverName: 'axios', method: 'POST', endpoint: '/users', line: 2 },
        ];
        const funcMap = new Map([['a', 'id-a'], ['b', 'id-b']]);
        const { nodes, edges } = buildAPINodesAndEdges(apiCalls, funcMap, 'file-id', '/test.ts');

        expect(nodes.length).toBe(1);
        expect((nodes[0] as any).methods).toContain('GET');
        expect((nodes[0] as any).methods).toContain('POST');
        expect(edges.length).toBe(2);
    });

    it('falls back to fileId when caller not in funcMap', () => {
        const apiCalls = [{
            callerName: '__file__',
            receiverName: 'fetch',
            method: 'UNKNOWN',
            endpoint: '/api/init',
            line: 1,
        }];
        const { edges } = buildAPINodesAndEdges(apiCalls, new Map(), 'file-id', '/test.ts');
        expect(edges[0].sourceId).toBe('file-id');
    });
});
