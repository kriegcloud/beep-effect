import { describe, it, expect } from 'vitest';
import { defineConfig, validateConfig, loadConfigFromEnv } from '../config/index.js';

describe('defineConfig', () => {
    it('returns a valid config with default values', () => {
        const config = defineConfig({ target: { root: '/tmp/project' } });

        expect(config.target.root).toBe('/tmp/project');
        expect(config.graph.driver).toBe('neo4j');
        expect(config.graph.uri).toBe('bolt://localhost:7687');
        expect(config.graph.auth.username).toBe('neo4j');
        expect(config.log.level).toBe('info');
        expect(config.mcp.transport).toBe('stdio');
    });

    it('accepts a partial override', () => {
        const config = defineConfig({
            target: { root: '/tmp/project' },
            graph: { uri: 'bolt://custom:7687' },
        });

        expect(config.graph.uri).toBe('bolt://custom:7687');
        expect(config.graph.driver).toBe('neo4j');
    });

    it('throws ConfigError if target is missing', () => {
        expect(() => validateConfig({})).toThrow('Invalid configuration');
        expect(() => validateConfig({})).toThrow('target');
    });

    it('does not throw if root is empty string', () => {
        expect(() => defineConfig({ target: { root: '' } })).not.toThrow();
    });
});

describe('validateConfig', () => {
    it('validates and returns a complete config', () => {
        const config = validateConfig({
            target: { root: './src' },
        });

        expect(config.target.root).toBe('./src');
        expect(config.target.include).toContain('**/*.ts');
        expect(config.target.exclude).toContain('**/node_modules/**');
    });

    it('rejects an invalid driver', () => {
        expect(() =>
            validateConfig({
                target: { root: '.' },
                graph: { driver: 'invalid_db' },
            }),
        ).toThrow('Invalid configuration');
    });

    it('rejects a negative port', () => {
        expect(() =>
            validateConfig({
                target: { root: '.' },
                mcp: { port: -1 },
            }),
        ).toThrow('Invalid configuration');
    });
});

describe('loadConfigFromEnv', () => {
    it('returns partial config without env vars set', () => {
        // Save and clear any existing env vars
        const saved: Record<string, string | undefined> = {};
        for (const k of ['NOMIK_GRAPH_DRIVER', 'NOMIK_GRAPH_URI', 'NOMIK_GRAPH_USER', 'NOMIK_GRAPH_PASS', 'NOMIK_LOG_LEVEL']) {
            saved[k] = process.env[k];
            delete process.env[k];
        }

        const config = loadConfigFromEnv();
        expect(config.graph).toBeDefined();
        // No hardcoded defaults — Zod schema provides defaults when validateConfig() is called
        expect(config.log!.pretty).toBe(true);
        expect(config.mcp!.transport).toBe('stdio');
        expect(config.viz!.theme).toBe('dark');

        // Restore
        for (const [k, v] of Object.entries(saved)) {
            if (v !== undefined) process.env[k] = v;
        }
    });

    it('reads NOMIK_GRAPH_URI from env', () => {
        const original = process.env['NOMIK_GRAPH_URI'];
        process.env['NOMIK_GRAPH_URI'] = 'bolt://custom:9999';

        const config = loadConfigFromEnv();
        expect(config.graph!.uri).toBe('bolt://custom:9999');

        if (original) process.env['NOMIK_GRAPH_URI'] = original;
        else delete process.env['NOMIK_GRAPH_URI'];
    });
});
