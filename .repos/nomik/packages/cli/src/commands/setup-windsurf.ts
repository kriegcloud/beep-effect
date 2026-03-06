import { Command } from 'commander';
import { createLogger, setLogger } from '@nomik/core';
import { readProjectConfig } from '../utils/project-config.js';
import { setupMcpClientConfig } from '../utils/mcp-config.js';

/** setup-windsurf command: auto-configure Windsurf mcp_config.json */
export const setupWindsurfCommand = new Command('setup-windsurf')
    .description('Auto-configure Windsurf IDE to use NOMIK MCP server')
    .option('--global', 'Kept for compatibility (Windsurf uses user-level mcp_config.json)')
    .option('--graph-uri <uri>', 'Neo4j URI', 'bolt://localhost:7687')
    .option('--graph-user <user>', 'Neo4j username', 'neo4j')
    .option('--graph-pass <pass>', 'Neo4j password', 'nomik_local')
    .option('--config-path <path>', 'Override target MCP config file path')
    .action(async (opts: { global?: boolean; graphUri: string; graphUser: string; graphPass: string; configPath?: string }) => {
        const logger = createLogger({ level: 'info', pretty: true });
        setLogger(logger);

        const local = readProjectConfig();
        const { configPath, mcpPath } = setupMcpClientConfig({
            client: 'windsurf',
            global: !!opts.global,
            graphUri: opts.graphUri,
            graphUser: opts.graphUser,
            graphPass: opts.graphPass,
            projectId: local?.projectId,
            configPath: opts.configPath,
        });

        console.log('');
        console.log('  \x1b[36m\x1b[1mNOMIK MCP configured for Windsurf!\x1b[0m');
        console.log('');
        console.log(`  Config written to: \x1b[33m${configPath}\x1b[0m`);
        console.log(`  MCP server:        \x1b[33m${mcpPath}\x1b[0m`);
        console.log(`  Neo4j:             \x1b[33m${opts.graphUri}\x1b[0m`);
        console.log('');
        console.log('  \x1b[2mRestart Windsurf to activate. The AI can now use:\x1b[0m');
        console.log('  \x1b[2m  - nm_search, nm_impact, nm_context\x1b[0m');
        console.log('  \x1b[2m  - nm_health, nm_path, nm_changes\x1b[0m');
        console.log('');
    });

