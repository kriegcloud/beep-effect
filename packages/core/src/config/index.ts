import { type NomikConfig, type NomikConfigInput, nomikConfigSchema } from '../types/config.js';
import { ConfigError } from '../errors/index.js';

const CONFIG_FILENAMES = [
    'nomik.config.ts',
    'nomik.config.js',
    'nomik.config.json',
];

export function defineConfig(config: NomikConfigInput): NomikConfig {
    const result = nomikConfigSchema.safeParse(config);
    if (!result.success) {
        const issues = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ');
        throw new ConfigError(`Invalid configuration: ${issues}`);
    }
    return result.data;
}

export function validateConfig(raw: unknown): NomikConfig {
    const result = nomikConfigSchema.safeParse(raw);
    if (!result.success) {
        const issues = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ');
        throw new ConfigError(`Invalid configuration: ${issues}`);
    }
    return result.data;
}

export function loadConfigFromEnv(): Partial<NomikConfig> {
    // Read directly from process.env (no aliasing — keeps env var extractor detection working)
    const graphDriver = process.env['NOMIK_GRAPH_DRIVER'] as 'neo4j' | 'falkordb' | undefined;
    const graphUri = process.env['NOMIK_GRAPH_URI'];
    const graphUser = process.env['NOMIK_GRAPH_USER'];
    const graphPass = process.env['NOMIK_GRAPH_PASS'];
    const logLevel = process.env['NOMIK_LOG_LEVEL'] as NomikConfig['log']['level'] | undefined;
    const mcpPort = process.env['NOMIK_MCP_PORT'];
    const vizPort = process.env['NOMIK_VIZ_PORT'];

    // Only include defined values — Zod schema defaults handle the rest
    return {
        graph: {
            ...(graphDriver ? { driver: graphDriver } : {}),
            ...(graphUri ? { uri: graphUri } : {}),
            auth: {
                ...(graphUser ? { username: graphUser } : {}),
                ...(graphPass ? { password: graphPass } : {}),
            },
        } as NomikConfig['graph'],
        log: {
            ...(logLevel ? { level: logLevel } : {}),
            pretty: true,
        } as NomikConfig['log'],
        mcp: {
            transport: 'stdio' as const,
            ...(mcpPort ? { port: parseInt(mcpPort, 10) } : {}),
        } as NomikConfig['mcp'],
        viz: {
            theme: 'dark' as const,
            ...(vizPort ? { port: parseInt(vizPort, 10) } : {}),
        } as NomikConfig['viz'],
    };
}

export { CONFIG_FILENAMES };
