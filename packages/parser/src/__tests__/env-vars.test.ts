import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import { extractPythonEnvVars } from '../extractors/env-vars';
import { createParserEngine } from '../parser';

function writeFile(p: string, content: string): void {
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, content, 'utf-8');
}

describe('env-vars extractor', () => {
    // ── TypeScript / JavaScript (tree-sitter) ──

    it('detects process.env.VAR_NAME in TS', async () => {
        const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nomik-env-'));
        try {
            const filePath = path.join(tmpDir, 'config.ts');
            writeFile(filePath, `
export function getConfig() {
  const dbUrl = process.env.DATABASE_URL;
  const port = process.env.PORT;
  return { dbUrl, port };
}
`);
            const engine = createParserEngine();
            const [result] = await engine.parseFiles([filePath]);

            const envNodes = result.nodes.filter(n => n.type === 'env_var');
            expect(envNodes).toHaveLength(2);
            expect(envNodes.map(n => n.name).sort()).toEqual(['DATABASE_URL', 'PORT']);

            const usesEnvEdges = result.edges.filter(e => e.type === 'USES_ENV');
            expect(usesEnvEdges).toHaveLength(2);

            // Edges should come from the getConfig function
            const getConfigFn = result.nodes.find(n => n.type === 'function' && n.name === 'getConfig');
            expect(getConfigFn).toBeDefined();
            for (const edge of usesEnvEdges) {
                expect(edge.sourceId).toBe(getConfigFn!.id);
            }
        } finally {
            fs.rmSync(tmpDir, { recursive: true, force: true });
        }
    });

    it('detects process.env["VAR"] bracket access', async () => {
        const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nomik-env-'));
        try {
            const filePath = path.join(tmpDir, 'config.ts');
            writeFile(filePath, `
const secret = process.env['API_SECRET'];
`);
            const engine = createParserEngine();
            const [result] = await engine.parseFiles([filePath]);

            const envNodes = result.nodes.filter(n => n.type === 'env_var');
            expect(envNodes).toHaveLength(1);
            expect(envNodes[0]!.name).toBe('API_SECRET');
        } finally {
            fs.rmSync(tmpDir, { recursive: true, force: true });
        }
    });

    it('detects default values with ?? and ||', async () => {
        const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nomik-env-'));
        try {
            const filePath = path.join(tmpDir, 'config.ts');
            writeFile(filePath, `
const port = process.env.PORT ?? '3000';
const host = process.env.HOST || 'localhost';
`);
            const engine = createParserEngine();
            const [result] = await engine.parseFiles([filePath]);

            const envNodes = result.nodes.filter(n => n.type === 'env_var');
            expect(envNodes).toHaveLength(2);

            const portNode = envNodes.find(n => n.name === 'PORT') as any;
            expect(portNode).toBeDefined();
            expect(portNode.defaultValue).toBe('3000');
            expect(portNode.required).toBe(false);

            const hostNode = envNodes.find(n => n.name === 'HOST') as any;
            expect(hostNode).toBeDefined();
            expect(hostNode.defaultValue).toBe('localhost');
        } finally {
            fs.rmSync(tmpDir, { recursive: true, force: true });
        }
    });

    it('detects non-null assertion as required', async () => {
        const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nomik-env-'));
        try {
            const filePath = path.join(tmpDir, 'config.ts');
            writeFile(filePath, `
const secret = process.env.JWT_SECRET!;
`);
            const engine = createParserEngine();
            const [result] = await engine.parseFiles([filePath]);

            const envNodes = result.nodes.filter(n => n.type === 'env_var');
            expect(envNodes).toHaveLength(1);
            expect((envNodes[0] as any).required).toBe(true);
        } finally {
            fs.rmSync(tmpDir, { recursive: true, force: true });
        }
    });

    it('attributes env access to __file__ when outside a function', async () => {
        const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nomik-env-'));
        try {
            const filePath = path.join(tmpDir, 'config.ts');
            writeFile(filePath, `
const NODE_ENV = process.env.NODE_ENV;
`);
            const engine = createParserEngine();
            const [result] = await engine.parseFiles([filePath]);

            const usesEnvEdges = result.edges.filter(e => e.type === 'USES_ENV');
            expect(usesEnvEdges).toHaveLength(1);
            // Source should be the file node (not a function)
            expect(usesEnvEdges[0]!.sourceId).toBe(result.file.id);
        } finally {
            fs.rmSync(tmpDir, { recursive: true, force: true });
        }
    });

    // ── Python (regex) ──

    it('detects os.environ bracket access in Python', () => {
        const content = `
import os
DB_URL = os.environ['DATABASE_URL']
SECRET = os.environ["API_SECRET"]
`;
        const envVars = extractPythonEnvVars(content);
        expect(envVars).toHaveLength(2);
        expect(envVars.map(e => e.varName).sort()).toEqual(['API_SECRET', 'DATABASE_URL']);
        expect(envVars[0]!.required).toBe(true);
    });

    it('detects os.environ.get with optional default in Python', () => {
        const content = `
import os
port = os.environ.get('PORT', '8080')
debug = os.environ.get('DEBUG')
`;
        const envVars = extractPythonEnvVars(content);
        expect(envVars).toHaveLength(2);

        const portVar = envVars.find(e => e.varName === 'PORT');
        expect(portVar).toBeDefined();
        expect(portVar!.required).toBe(false);
        expect(portVar!.defaultValue).toBe('8080');

        const debugVar = envVars.find(e => e.varName === 'DEBUG');
        expect(debugVar).toBeDefined();
        expect(debugVar!.required).toBe(true);
        expect(debugVar!.defaultValue).toBeUndefined();
    });

    it('detects os.getenv in Python', () => {
        const content = `
import os
secret = os.getenv('JWT_SECRET')
host = os.getenv('HOST', 'localhost')
`;
        const envVars = extractPythonEnvVars(content);
        expect(envVars).toHaveLength(2);

        const secretVar = envVars.find(e => e.varName === 'JWT_SECRET');
        expect(secretVar!.required).toBe(true);

        const hostVar = envVars.find(e => e.varName === 'HOST');
        expect(hostVar!.required).toBe(false);
        expect(hostVar!.defaultValue).toBe('localhost');
    });

    it('deduplicates env var nodes for same variable accessed multiple times', async () => {
        const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nomik-env-'));
        try {
            const filePath = path.join(tmpDir, 'config.ts');
            writeFile(filePath, `
export function a() { return process.env.NODE_ENV; }
export function b() { return process.env.NODE_ENV; }
`);
            const engine = createParserEngine();
            const [result] = await engine.parseFiles([filePath]);

            const envNodes = result.nodes.filter(n => n.type === 'env_var');
            expect(envNodes).toHaveLength(1);
            expect(envNodes[0]!.name).toBe('NODE_ENV');

            // But should have 2 USES_ENV edges (one from each function)
            const usesEnvEdges = result.edges.filter(e => e.type === 'USES_ENV');
            expect(usesEnvEdges).toHaveLength(2);
        } finally {
            fs.rmSync(tmpDir, { recursive: true, force: true });
        }
    });
});
