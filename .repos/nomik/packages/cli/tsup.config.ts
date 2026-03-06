import { defineConfig } from 'tsup';

/** Bundle CLI + MCP server as standalone files for npm distribution */
export default defineConfig([
    {
        entry: { index: 'src/index.ts' },
        format: ['esm'],
        clean: true,
        dts: false,
        banner: { js: '#!/usr/bin/env node' },
        noExternal: ['@nomik/core', '@nomik/parser', '@nomik/graph', '@nomik/watcher'],
        external: ['neo4j-driver', 'tree-sitter', 'tree-sitter-typescript', 'tree-sitter-javascript', 'tree-sitter-python', 'tree-sitter-rust', 'pino', 'pino-pretty', 'chokidar', 'glob', 'zod'],
    },
    {
        entry: { 'mcp-server': '../mcp-server/src/index.ts' },
        format: ['esm'],
        outDir: 'dist',
        dts: false,
        banner: { js: '#!/usr/bin/env node' },
        noExternal: ['@nomik/core', '@nomik/graph', '@modelcontextprotocol/sdk'],
        external: ['neo4j-driver', 'pino', 'pino-pretty', 'zod'],
    },
]);
