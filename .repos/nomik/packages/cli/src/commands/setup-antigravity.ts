import { Command } from 'commander';
import { createLogger, setLogger } from '@nomik/core';
import { readProjectConfig } from '../utils/project-config.js';
import { setupMcpClientConfig } from '../utils/mcp-config.js';

/** Command setup-antigravity: auto-configure Antigravity Editor mcp_config.json */
export const setupAntigravityCommand = new Command('setup-antigravity')
    .description('Auto-configure Antigravity Editor to use NOMIK MCP server')
    .option('--graph-uri <uri>', 'Neo4j URI', 'bolt://localhost:7687')
    .option('--graph-user <user>', 'Neo4j username', 'neo4j')
    .option('--graph-pass <pass>', 'Neo4j password', 'nomik_local')
    .option('--config-path <path>', 'Override target MCP config file path')
    .action(async (opts: { graphUri: string; graphUser: string; graphPass: string; configPath?: string }) => {
        const logger = createLogger({ level: 'info', pretty: true });
        setLogger(logger);

        const local = readProjectConfig();
        const { configPath, mcpPath } = setupMcpClientConfig({
            client: 'antigravity',
            graphUri: opts.graphUri,
            graphUser: opts.graphUser,
            graphPass: opts.graphPass,
            projectId: local?.projectId,
            configPath: opts.configPath,
        });

        console.log('');
        console.log('  \x1b[36m\x1b[1mNOMIK MCP configured for Antigravity!\x1b[0m');
        console.log('');
        console.log(`  Config written to: \x1b[33m${configPath}\x1b[0m`);
        console.log(`  MCP server:        \x1b[33m${mcpPath}\x1b[0m`);
        console.log(`  Neo4j:             \x1b[33m${opts.graphUri}\x1b[0m`);
        console.log('');
        console.log('  \x1b[2mTo activate in Antigravity:\x1b[0m');
        console.log('  \x1b[2m  1. Open the MCP Store ("..." dropdown → agent panel)\x1b[0m');
        console.log('  \x1b[2m  2. Click "Manage MCP Servers" → "View raw config"\x1b[0m');
        console.log('  \x1b[2m  3. The config is already written. Restart the editor.\x1b[0m');
        console.log('');
        console.log('  \x1b[2mThe AI can now use:\x1b[0m');
        console.log('  \x1b[2m  - nm_search, nm_impact, nm_context, nm_explain\x1b[0m');
        console.log('  \x1b[2m  - nm_health, nm_path, nm_changes, nm_wiki\x1b[0m');
        console.log('  \x1b[2m  - nm_onboard, nm_communities, nm_flows\x1b[0m');
        console.log('');
    });
