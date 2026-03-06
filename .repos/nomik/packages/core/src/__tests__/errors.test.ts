import { describe, it, expect } from 'vitest';
import {
    NomikError,
    ParseError,
    GraphConnectionError,
    GraphQueryError,
    ConfigError,
    FileSystemError,
    WatcherError,
    McpError,
} from '../errors/index.js';

describe('NomikError', () => {
    it('porte les proprietes code, severity, recoverable', () => {
        const err = new NomikError('test', 'TEST_CODE', 'high', true, { key: 'val' });

        expect(err).toBeInstanceOf(Error);
        expect(err.message).toBe('test');
        expect(err.code).toBe('TEST_CODE');
        expect(err.severity).toBe('high');
        expect(err.recoverable).toBe(true);
        expect(err.context).toEqual({ key: 'val' });
        expect(err.name).toBe('NomikError');
    });
});

describe('ParseError', () => {
    it('a le code PARSE_ERROR et severity medium', () => {
        const err = new ParseError('bad syntax', '/src/foo.ts', 42);

        expect(err.code).toBe('PARSE_ERROR');
        expect(err.severity).toBe('medium');
        expect(err.recoverable).toBe(true);
        expect(err.context).toEqual({ filePath: '/src/foo.ts', line: 42 });
        expect(err.name).toBe('ParseError');
    });
});

describe('GraphConnectionError', () => {
    it('est critical et recoverable', () => {
        const err = new GraphConnectionError('cannot connect', 'bolt://localhost:7687');

        expect(err.code).toBe('GRAPH_CONNECTION_ERROR');
        expect(err.severity).toBe('critical');
        expect(err.recoverable).toBe(true);
        expect(err.context?.uri).toBe('bolt://localhost:7687');
    });
});

describe('GraphQueryError', () => {
    it('est high severity et non recoverable', () => {
        const err = new GraphQueryError('bad query', 'MATCH (n) RETRUN n');

        expect(err.code).toBe('GRAPH_QUERY_ERROR');
        expect(err.severity).toBe('high');
        expect(err.recoverable).toBe(false);
        expect(err.context?.query).toBe('MATCH (n) RETRUN n');
    });
});

describe('ConfigError', () => {
    it('est critical et non recoverable', () => {
        const err = new ConfigError('missing target', 'target.root');

        expect(err.code).toBe('CONFIG_ERROR');
        expect(err.severity).toBe('critical');
        expect(err.recoverable).toBe(false);
    });
});

describe('Sous-classes', () => {
    it('sont toutes instanceof NomikError', () => {
        expect(new FileSystemError('err', '/tmp')).toBeInstanceOf(NomikError);
        expect(new WatcherError('err', '/src')).toBeInstanceOf(NomikError);
        expect(new McpError('err', 'kb_search')).toBeInstanceOf(NomikError);
    });

    it('FileSystemError a le bon code', () => {
        const err = new FileSystemError('not found', '/missing/file');
        expect(err.code).toBe('FS_ERROR');
        expect(err.name).toBe('FileSystemError');
    });

    it('WatcherError a le bon code', () => {
        const err = new WatcherError('crash', '/src');
        expect(err.code).toBe('WATCHER_ERROR');
        expect(err.name).toBe('WatcherError');
    });

    it('McpError a le bon code', () => {
        const err = new McpError('tool failed', 'kb_impact');
        expect(err.code).toBe('MCP_ERROR');
        expect(err.name).toBe('McpError');
        expect(err.context?.tool).toBe('kb_impact');
    });
});
