import { describe, it, expect, vi, beforeEach } from 'vitest';
import { upsertNodes, createEdges, clearFileData, upsertProject, deleteProjectData, listProjects, getProject } from '../queries/write.js';
import type { GraphDriver } from '../drivers/driver.interface.js';
import type { GraphNode, GraphEdge, ProjectNode } from '@nomik/core';

const TEST_PROJECT_ID = 'test-project';

function createMockDriver(): GraphDriver {
    return {
        connect: vi.fn(),
        disconnect: vi.fn(),
        getSession: vi.fn(),
        isConnected: vi.fn(() => true),
        runQuery: vi.fn().mockResolvedValue([]),
        runWrite: vi.fn().mockResolvedValue(undefined),
        healthCheck: vi.fn().mockResolvedValue(true),
    };
}

describe('upsertNodes', () => {
    let driver: GraphDriver;

    beforeEach(() => {
        driver = createMockDriver();
    });

    it('groupe par type et fait un appel par label avec projectId', async () => {
        const nodes: GraphNode[] = [
            { id: 'f1', type: 'file', path: '/a.ts', language: 'typescript', hash: 'h1', size: 100, lastParsed: '' } as any,
            { id: 'fn1', type: 'function', name: 'foo', filePath: '/a.ts', startLine: 1, endLine: 10, params: [], isAsync: false, isExported: true, isGenerator: false, decorators: [], confidence: 1 } as any,
            { id: 'fn2', type: 'function', name: 'bar', filePath: '/a.ts', startLine: 11, endLine: 20, params: [], isAsync: false, isExported: false, isGenerator: false, decorators: [], confidence: 1 } as any,
        ];

        await upsertNodes(driver, nodes, TEST_PROJECT_ID);

        expect(driver.runWrite).toHaveBeenCalledTimes(2);

        const calls = (driver.runWrite as any).mock.calls;
        const cyphers = calls.map((c: any) => c[0]);
        expect(cyphers.some((c: string) => c.includes(':File'))).toBe(true);
        expect(cyphers.some((c: string) => c.includes(':Function'))).toBe(true);
        // Verifie que projectId est passe dans chaque appel
        for (const call of calls) {
            expect(call[1].projectId).toBe(TEST_PROJECT_ID);
        }
    });

    it('ne fait aucun appel pour un tableau vide', async () => {
        await upsertNodes(driver, [], TEST_PROJECT_ID);
        expect(driver.runWrite).not.toHaveBeenCalled();
    });
});

describe('createEdges', () => {
    let driver: GraphDriver;

    beforeEach(() => {
        driver = createMockDriver();
    });

    it('groupe les edges par type avec projectId', async () => {
        const edges: GraphEdge[] = [
            { id: 'e1', type: 'CONTAINS', sourceId: 'f1', targetId: 'fn1', confidence: 1 },
            { id: 'e2', type: 'CONTAINS', sourceId: 'f1', targetId: 'fn2', confidence: 1 },
            { id: 'e3', type: 'CALLS', sourceId: 'fn1', targetId: 'fn2', confidence: 1, line: 5, column: 10 },
        ];

        await createEdges(driver, edges, TEST_PROJECT_ID);

        expect(driver.runWrite).toHaveBeenCalledTimes(2);
        for (const call of (driver.runWrite as any).mock.calls) {
            expect(call[1].projectId).toBe(TEST_PROJECT_ID);
        }
    });
});

describe('clearFileData', () => {
    let driver: GraphDriver;

    beforeEach(() => {
        driver = createMockDriver();
    });

    it('deletes children then the file with projectId', async () => {
        await clearFileData(driver, '/src/index.ts', TEST_PROJECT_ID);

        expect(driver.runWrite).toHaveBeenCalledTimes(2);

        const calls = (driver.runWrite as any).mock.calls;
        expect(calls[0][0]).toContain('CONTAINS');
        expect(calls[0][0]).toContain('DETACH DELETE');
        expect(calls[0][1].path).toBe('/src/index.ts');
        expect(calls[0][1].projectId).toBe(TEST_PROJECT_ID);

        expect(calls[1][0]).toContain('DETACH DELETE f');
        expect(calls[1][1].path).toBe('/src/index.ts');
        expect(calls[1][1].projectId).toBe(TEST_PROJECT_ID);
    });
});

describe('upsertProject', () => {
    let driver: GraphDriver;

    beforeEach(() => {
        driver = createMockDriver();
    });

    it('cree un noeud Project avec MERGE', async () => {
        const project: ProjectNode = {
            id: 'my-api',
            type: 'project',
            name: 'My API',
            rootPath: '/home/dev/my-api',
            createdAt: '2026-02-12T00:00:00Z',
        };

        await upsertProject(driver, project);

        expect(driver.runWrite).toHaveBeenCalledTimes(1);
        const [cypher, params] = (driver.runWrite as any).mock.calls[0];
        expect(cypher).toContain('MERGE (p:Project {id: $id})');
        expect(params.id).toBe('my-api');
        expect(params.name).toBe('My API');
    });
});

describe('deleteProjectData', () => {
    let driver: GraphDriver;

    beforeEach(() => {
        driver = createMockDriver();
    });

    it('deletes nodes+relations then the Project in 2 steps', async () => {
        await deleteProjectData(driver, 'my-api');

        expect(driver.runWrite).toHaveBeenCalledTimes(2);
        const calls = (driver.runWrite as any).mock.calls;
        // DETACH DELETE removes nodes + attached relationships
        expect(calls[0][0]).toContain('DETACH DELETE');
        expect(calls[0][1].projectId).toBe('my-api');
        // The Project meta-node itself
        expect(calls[1][0]).toContain(':Project');
    });
});

describe('listProjects', () => {
    let driver: GraphDriver;

    beforeEach(() => {
        driver = createMockDriver();
    });

    it('retourne les projets depuis Neo4j', async () => {
        const mockProjects = [
            { id: 'api', type: 'project', name: 'API', rootPath: '/api', createdAt: '2026-01-01', lastScanAt: null },
        ];
        (driver.runQuery as any).mockResolvedValue(mockProjects);

        const result = await listProjects(driver);
        expect(result).toEqual(mockProjects);
        expect(driver.runQuery).toHaveBeenCalledTimes(1);
    });
});

describe('getProject', () => {
    let driver: GraphDriver;

    beforeEach(() => {
        driver = createMockDriver();
    });

    it('retourne le projet si existe', async () => {
        const mock = { id: 'api', type: 'project', name: 'API', rootPath: '/api', createdAt: '2026-01-01', lastScanAt: null };
        (driver.runQuery as any).mockResolvedValue([mock]);

        const result = await getProject(driver, 'api');
        expect(result).toEqual(mock);
    });

    it('retourne null si introuvable', async () => {
        (driver.runQuery as any).mockResolvedValue([]);
        const result = await getProject(driver, 'unknown');
        expect(result).toBeNull();
    });
});
