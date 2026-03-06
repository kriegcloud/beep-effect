import { describe, it, expect } from 'vitest';
import { diffFileSymbols, classifyImpacts, getRiskLevel } from '../commands/pr-impact.js';
import type { FileSymbol } from '@nomik/graph';
import type { GraphNode, FunctionNode, ClassNode, VariableNode, RouteNode } from '@nomik/core';

// ── Helpers ──

function makeFn(name: string, startLine: number, endLine: number, id?: string): FunctionNode {
    return {
        id: id ?? `fn-${name}`,
        type: 'function',
        name,
        filePath: '/test/file.ts',
        startLine,
        endLine,
        params: [],
        isAsync: false,
        isExported: false,
        isGenerator: false,
        decorators: [],
        confidence: 1,
    };
}

function makeCls(name: string, startLine: number, endLine: number, id?: string): ClassNode {
    return {
        id: id ?? `cls-${name}`,
        type: 'class',
        name,
        filePath: '/test/file.ts',
        startLine,
        endLine,
        isExported: false,
        isAbstract: false,
        interfaces: [],
        decorators: [],
        methods: [],
        properties: [],
    };
}

function makeVar(name: string, line: number, id?: string): VariableNode {
    return {
        id: id ?? `var-${name}`,
        type: 'variable',
        name,
        filePath: '/test/file.ts',
        line,
        kind: 'const',
        isExported: true,
    };
}

function makeRoute(method: RouteNode['method'], routePath: string, handlerName: string, id?: string): RouteNode {
    return {
        id: id ?? `route-${method}-${routePath}`,
        type: 'route',
        method,
        path: routePath,
        handlerName,
        filePath: '/test/file.ts',
        middleware: [],
    };
}

function makeOldSymbol(name: string, type: 'Function' | 'Class' | 'Variable' | 'Route' = 'Function', id?: string): FileSymbol {
    return {
        name,
        type,
        id: id ?? `old-${name}`,
        isExported: false,
        startLine: 1,
        endLine: 10,
    };
}

// ── diffFileSymbols ──

describe('diffFileSymbols', () => {
    const filePath = '/test/file.ts';

    it('detects disappeared symbol (rename)', () => {
        const oldSymbols: FileSymbol[] = [
            makeOldSymbol('isFunctionLike'),
        ];
        const newNodes: GraphNode[] = [
            makeFn('isFunctionLikes', 27, 65),
        ];
        const changedLines = new Set([27]);

        const result = diffFileSymbols(oldSymbols, newNodes, changedLines, filePath);

        const disappeared = result.filter(s => s.changeKind === 'disappeared');
        const added = result.filter(s => s.changeKind === 'added');

        expect(disappeared).toHaveLength(1);
        expect(disappeared[0]!.name).toBe('isFunctionLike');
        expect(disappeared[0]!.id).toBe('old-isFunctionLike');

        expect(added).toHaveLength(1);
        expect(added[0]!.name).toBe('isFunctionLikes');
    });

    it('detects modified symbol (body changed, name same)', () => {
        const oldSymbols: FileSymbol[] = [
            makeOldSymbol('parseFile'),
        ];
        const newNodes: GraphNode[] = [
            makeFn('parseFile', 10, 50),
        ];
        const changedLines = new Set([25]);

        const result = diffFileSymbols(oldSymbols, newNodes, changedLines, filePath);

        expect(result).toHaveLength(1);
        expect(result[0]!.changeKind).toBe('modified');
        expect(result[0]!.name).toBe('parseFile');
        expect(result[0]!.id).toBe('old-parseFile');
    });

    it('ignores symbol in both old and new if no changed lines overlap', () => {
        const oldSymbols: FileSymbol[] = [
            makeOldSymbol('helperFunc'),
        ];
        const newNodes: GraphNode[] = [
            makeFn('helperFunc', 100, 120),
        ];
        const changedLines = new Set([5, 6, 7]);

        const result = diffFileSymbols(oldSymbols, newNodes, changedLines, filePath);
        expect(result).toHaveLength(0);
    });

    it('detects added symbol (new function in changed lines)', () => {
        const oldSymbols: FileSymbol[] = [];
        const newNodes: GraphNode[] = [
            makeFn('brandNewFunc', 1, 10),
        ];
        const changedLines = new Set([5]);

        const result = diffFileSymbols(oldSymbols, newNodes, changedLines, filePath);

        expect(result).toHaveLength(1);
        expect(result[0]!.changeKind).toBe('added');
        expect(result[0]!.name).toBe('brandNewFunc');
    });

    it('handles deleted symbol (old function entirely removed)', () => {
        const oldSymbols: FileSymbol[] = [
            makeOldSymbol('removedFunc'),
        ];
        const newNodes: GraphNode[] = [];
        const changedLines = new Set<number>();

        const result = diffFileSymbols(oldSymbols, newNodes, changedLines, filePath);

        expect(result).toHaveLength(1);
        expect(result[0]!.changeKind).toBe('disappeared');
        expect(result[0]!.name).toBe('removedFunc');
    });

    it('handles class rename', () => {
        const oldSymbols: FileSymbol[] = [
            makeOldSymbol('OldService', 'Class'),
        ];
        const newNodes: GraphNode[] = [
            makeCls('NewService', 1, 50),
        ];
        const changedLines = new Set([1]);

        const result = diffFileSymbols(oldSymbols, newNodes, changedLines, filePath);

        const disappeared = result.filter(s => s.changeKind === 'disappeared');
        const added = result.filter(s => s.changeKind === 'added');

        expect(disappeared).toHaveLength(1);
        expect(disappeared[0]!.name).toBe('OldService');
        expect(disappeared[0]!.type).toBe('class');

        expect(added).toHaveLength(1);
        expect(added[0]!.name).toBe('NewService');
        expect(added[0]!.type).toBe('class');
    });

    it('handles mixed scenario: one renamed, one modified, one added', () => {
        const oldSymbols: FileSymbol[] = [
            makeOldSymbol('funcA'),
            makeOldSymbol('funcB'),
        ];
        const newNodes: GraphNode[] = [
            makeFn('funcA', 1, 20),
            makeFn('funcC', 25, 40),
        ];
        const changedLines = new Set([10, 30]);

        const result = diffFileSymbols(oldSymbols, newNodes, changedLines, filePath);

        const disappeared = result.filter(s => s.changeKind === 'disappeared');
        const modified = result.filter(s => s.changeKind === 'modified');
        const added = result.filter(s => s.changeKind === 'added');

        expect(disappeared).toHaveLength(1);
        expect(disappeared[0]!.name).toBe('funcB');

        expect(modified).toHaveLength(1);
        expect(modified[0]!.name).toBe('funcA');

        expect(added).toHaveLength(1);
        expect(added[0]!.name).toBe('funcC');
    });

    it('uses old symbol ID for modified symbols (graph lookup precision)', () => {
        const oldSymbols: FileSymbol[] = [
            makeOldSymbol('myFunc', 'Function', 'graph-id-123'),
        ];
        const newNodes: GraphNode[] = [
            makeFn('myFunc', 1, 10, 'parse-id-456'),
        ];
        const changedLines = new Set([5]);

        const result = diffFileSymbols(oldSymbols, newNodes, changedLines, filePath);

        expect(result).toHaveLength(1);
        expect(result[0]!.id).toBe('graph-id-123');
    });

    it('tracks variables alongside functions', () => {
        const oldSymbols: FileSymbol[] = [];
        const newNodes: GraphNode[] = [
            makeVar('MY_CONST', 1),
            makeFn('realFunc', 5, 10),
        ];
        const changedLines = new Set([1, 5]);

        const result = diffFileSymbols(oldSymbols, newNodes, changedLines, filePath);

        expect(result).toHaveLength(2);
        const names = result.map(r => r.name);
        expect(names).toContain('MY_CONST');
        expect(names).toContain('realFunc');
    });

    it('detects variable rename (old const removed, new const added)', () => {
        const oldSymbols: FileSymbol[] = [
            makeOldSymbol('API_URL', 'Variable'),
        ];
        const newNodes: GraphNode[] = [
            makeVar('BASE_URL', 3),
        ];
        const changedLines = new Set([3]);

        const result = diffFileSymbols(oldSymbols, newNodes, changedLines, filePath);

        const disappeared = result.filter(s => s.changeKind === 'disappeared');
        const added = result.filter(s => s.changeKind === 'added');

        expect(disappeared).toHaveLength(1);
        expect(disappeared[0]!.name).toBe('API_URL');
        expect(disappeared[0]!.type).toBe('variable');

        expect(added).toHaveLength(1);
        expect(added[0]!.name).toBe('BASE_URL');
        expect(added[0]!.type).toBe('variable');
    });

    it('detects variable deletion', () => {
        const oldSymbols: FileSymbol[] = [
            makeOldSymbol('DEPRECATED_FLAG', 'Variable'),
        ];
        const newNodes: GraphNode[] = [];
        const changedLines = new Set<number>();

        const result = diffFileSymbols(oldSymbols, newNodes, changedLines, filePath);

        expect(result).toHaveLength(1);
        expect(result[0]!.changeKind).toBe('disappeared');
        expect(result[0]!.name).toBe('DEPRECATED_FLAG');
        expect(result[0]!.type).toBe('variable');
    });

    it('detects modified variable (same name, changed line)', () => {
        const oldSymbols: FileSymbol[] = [
            makeOldSymbol('CONFIG', 'Variable'),
        ];
        const newNodes: GraphNode[] = [
            makeVar('CONFIG', 5),
        ];
        const changedLines = new Set([5]);

        const result = diffFileSymbols(oldSymbols, newNodes, changedLines, filePath);

        expect(result).toHaveLength(1);
        expect(result[0]!.changeKind).toBe('modified');
        expect(result[0]!.name).toBe('CONFIG');
        expect(result[0]!.type).toBe('variable');
    });

    it('detects route path change (old route disappeared, new route added)', () => {
        const oldSymbols: FileSymbol[] = [
            makeOldSymbol('GET /users', 'Route'),
        ];
        const newNodes: GraphNode[] = [
            makeRoute('GET', '/api/users', 'getUsers'),
        ];
        // Routes have no line info, so changed lines won't match — only disappeared detection works
        const changedLines = new Set([1]);

        const result = diffFileSymbols(oldSymbols, newNodes, changedLines, filePath);

        const disappeared = result.filter(s => s.changeKind === 'disappeared');
        expect(disappeared).toHaveLength(1);
        expect(disappeared[0]!.name).toBe('GET /users');
        expect(disappeared[0]!.type).toBe('route');
    });

    it('detects route deletion', () => {
        const oldSymbols: FileSymbol[] = [
            makeOldSymbol('DELETE /users/:id', 'Route'),
        ];
        const newNodes: GraphNode[] = [];
        const changedLines = new Set<number>();

        const result = diffFileSymbols(oldSymbols, newNodes, changedLines, filePath);

        expect(result).toHaveLength(1);
        expect(result[0]!.changeKind).toBe('disappeared');
        expect(result[0]!.name).toBe('DELETE /users/:id');
        expect(result[0]!.type).toBe('route');
    });

    it('handles mixed scenario: function + variable + route changes', () => {
        const oldSymbols: FileSymbol[] = [
            makeOldSymbol('helperFunc'),
            makeOldSymbol('OLD_CONFIG', 'Variable'),
            makeOldSymbol('POST /submit', 'Route'),
        ];
        const newNodes: GraphNode[] = [
            makeFn('helperFunc', 1, 20),
            makeVar('NEW_CONFIG', 25),
            makeRoute('POST', '/api/submit', 'handleSubmit'),
        ];
        const changedLines = new Set([10, 25]);

        const result = diffFileSymbols(oldSymbols, newNodes, changedLines, filePath);

        const disappeared = result.filter(s => s.changeKind === 'disappeared');
        const modified = result.filter(s => s.changeKind === 'modified');
        const added = result.filter(s => s.changeKind === 'added');

        // OLD_CONFIG disappeared, POST /submit disappeared
        expect(disappeared).toHaveLength(2);
        expect(disappeared.map(d => d.name).sort()).toEqual(['OLD_CONFIG', 'POST /submit']);

        // helperFunc modified (lines 1-20 overlap changed line 10)
        expect(modified).toHaveLength(1);
        expect(modified[0]!.name).toBe('helperFunc');

        // NEW_CONFIG added (line 25 overlaps), POST /api/submit NOT added (routes have no line info = sl 0)
        expect(added).toHaveLength(1);
        expect(added[0]!.name).toBe('NEW_CONFIG');
    });

    it('filters out non-tracked node types (file, module, db_table, etc.)', () => {
        const oldSymbols: FileSymbol[] = [];
        const newNodes: GraphNode[] = [
            {
                id: 'file-1',
                type: 'file',
                path: '/test/file.ts',
                language: 'typescript',
                hash: 'abc',
                size: 100,
                lastParsed: '2026-01-01',
            },
            {
                id: 'mod-1',
                type: 'module',
                name: 'lodash',
                path: 'lodash',
                moduleType: 'external',
            },
            makeFn('trackedFunc', 5, 10),
        ];
        const changedLines = new Set([1, 5]);

        const result = diffFileSymbols(oldSymbols, newNodes, changedLines, filePath);

        expect(result).toHaveLength(1);
        expect(result[0]!.name).toBe('trackedFunc');
    });
});

// ── classifyImpacts ──

describe('classifyImpacts', () => {
    it('classifies CALLS as direct at any depth', () => {
        const impacts = [
            { name: 'caller', type: 'Function', filePath: '/a.ts', depth: 3, relationship: 'CALLS' },
        ];
        const { direct, transitive } = classifyImpacts(impacts);
        expect(direct).toHaveLength(1);
        expect(transitive).toHaveLength(0);
    });

    it('classifies DEPENDS_ON depth 1 as direct, depth 2+ as transitive', () => {
        const impacts = [
            { name: 'importer', type: 'File', filePath: '/a.ts', depth: 1, relationship: 'DEPENDS_ON' },
            { name: 'transitiveImporter', type: 'File', filePath: '/b.ts', depth: 2, relationship: 'DEPENDS_ON' },
        ];
        const { direct, transitive } = classifyImpacts(impacts);
        expect(direct).toHaveLength(1);
        expect(direct[0]!.name).toBe('importer');
        expect(transitive).toHaveLength(1);
        expect(transitive[0]!.name).toBe('transitiveImporter');
    });

    it('classifies HANDLES/TRIGGERS/LISTENS_TO/EMITS as direct', () => {
        const impacts = [
            { name: 'a', type: 'Function', filePath: '/a.ts', depth: 5, relationship: 'HANDLES' },
            { name: 'b', type: 'Function', filePath: '/b.ts', depth: 3, relationship: 'TRIGGERS' },
            { name: 'c', type: 'Function', filePath: '/c.ts', depth: 2, relationship: 'LISTENS_TO' },
            { name: 'd', type: 'Function', filePath: '/d.ts', depth: 4, relationship: 'EMITS' },
        ];
        const { direct } = classifyImpacts(impacts);
        expect(direct).toHaveLength(4);
    });
});

// ── getRiskLevel ──

describe('getRiskLevel', () => {
    it('returns LOW when no callers', () => {
        expect(getRiskLevel(0, 3)).toBe('LOW');
    });

    it('returns MEDIUM when moderate callers', () => {
        expect(getRiskLevel(8, 3)).toBe('MEDIUM');
    });

    it('returns HIGH when many callers', () => {
        expect(getRiskLevel(20, 2)).toBe('HIGH');
    });

    it('returns HIGH immediately when disappearedWithCallers > 0', () => {
        expect(getRiskLevel(1, 1, 1)).toBe('HIGH');
    });

    it('returns HIGH for disappeared even with minimal total callers', () => {
        expect(getRiskLevel(1, 10, 1)).toBe('HIGH');
    });
});
