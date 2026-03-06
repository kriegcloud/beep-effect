import { z } from 'zod';

export const graphDriverSchema = z.enum(['neo4j', 'falkordb']);

export const graphConfigSchema = z.object({
    driver: graphDriverSchema.default('neo4j'),
    uri: z.string().default('bolt://localhost:7687'),
    auth: z.object({
        username: z.string().default('neo4j'),
        password: z.string().default('nomik_local'),
    }).default({}),
    maxConnectionPoolSize: z.number().int().positive().default(50),
    connectionTimeoutMs: z.number().int().positive().default(5000),
});

export const targetConfigSchema = z.object({
    root: z.string(),
    include: z.array(z.string()).default(['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx', '**/*.sql', '**/*.cs']),
    exclude: z.array(z.string()).default(['**/node_modules/**', '**/dist/**', '**/*.test.*', '**/*.spec.*']),
});

export const parserConfigSchema = z.object({
    languages: z.array(z.string()).default(['typescript']),
    extractors: z.object({
        routes: z.boolean().default(true),
        externalCalls: z.boolean().default(true),
        dbOperations: z.boolean().default(true),
        envVars: z.boolean().default(true),
    }).default({}),
    maxFileSizeBytes: z.number().int().positive().default(1_000_000),
    concurrency: z.number().int().positive().default(4),
});

export const watcherConfigSchema = z.object({
    enabled: z.boolean().default(true),
    debounceMs: z.number().int().positive().default(500),
    strategy: z.enum(['full', 'incremental']).default('incremental'),
    maxQueueSize: z.number().int().positive().default(1000),
});

export const mcpConfigSchema = z.object({
    transport: z.enum(['stdio', 'sse', 'http']).default('stdio'),
    port: z.number().int().positive().default(3334),
});

export const vizConfigSchema = z.object({
    port: z.number().int().positive().default(3333),
    theme: z.enum(['dark', 'light']).default('dark'),
});

export const logConfigSchema = z.object({
    level: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
    pretty: z.boolean().default(true),
    file: z.string().optional(),
});

export const nomikConfigSchema = z.object({
    target: targetConfigSchema,
    graph: graphConfigSchema.default({}),
    parser: parserConfigSchema.default({}),
    watcher: watcherConfigSchema.default({}),
    mcp: mcpConfigSchema.default({}),
    viz: vizConfigSchema.default({}),
    log: logConfigSchema.default({}),
});

export type GraphDriver = z.infer<typeof graphDriverSchema>;
export type GraphConfig = z.infer<typeof graphConfigSchema>;
export type TargetConfig = z.infer<typeof targetConfigSchema>;
export type ParserConfig = z.infer<typeof parserConfigSchema>;
export type WatcherConfig = z.infer<typeof watcherConfigSchema>;
export type McpConfig = z.infer<typeof mcpConfigSchema>;
export type VizConfig = z.infer<typeof vizConfigSchema>;
export type LogConfig = z.infer<typeof logConfigSchema>;
export type NomikConfig = z.infer<typeof nomikConfigSchema>;
export type NomikConfigInput = z.input<typeof nomikConfigSchema>;
