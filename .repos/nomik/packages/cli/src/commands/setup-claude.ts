import { Command } from 'commander';
import { createLogger } from '@nomik/core';
import { setupMcpClientConfig } from '../utils/mcp-config.js';

export const setupClaudeCommand = new Command('setup-claude')
    .description('Auto-configure Claude Desktop to use the NOMIK MCP server')
    .option('--graph-uri <uri>', 'Neo4j URI', 'bolt://localhost:7687')
    .option('--graph-user <user>', 'Neo4j user', 'neo4j')
    .option('--graph-pass <pass>', 'Neo4j password', 'nomikpass')
    .option('--project <id>', 'Default project ID for MCP queries')
    .option('--config-path <path>', 'Override target config file path')
    .action((opts: { graphUri: string; graphUser: string; graphPass: string; project?: string; configPath?: string }) => {
        const logger = createLogger({ level: 'info', pretty: true });

        try {
            const result = setupMcpClientConfig({
                client: 'claude',
                graphUri: opts.graphUri,
                graphUser: opts.graphUser,
                graphPass: opts.graphPass,
                projectId: opts.project,
                configPath: opts.configPath,
            });

            logger.info({ configPath: result.configPath, mcpServer: result.mcpPath }, 'Claude Desktop MCP configured');
            console.log(`\n✅ NOMIK MCP server added to Claude Desktop`);
            console.log(`   Config: ${result.configPath}`);
            console.log(`   Server: ${result.mcpPath}`);
            console.log(`\n   Restart Claude Desktop to activate the MCP server.`);
            console.log(`   All 14 NOMIK tools + 7 resources will be available.\n`);
        } catch (err) {
            logger.error({ err }, 'Failed to configure Claude Desktop MCP');
            process.exit(1);
        }
    });
