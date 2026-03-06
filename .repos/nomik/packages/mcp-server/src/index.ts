import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListResourcesRequestSchema, ListToolsRequestSchema, ReadResourceRequestSchema, ListPromptsRequestSchema, GetPromptRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { createGraphService } from '@nomik/graph';
import { loadConfigFromEnv, createLogger, setLogger, type LogConfig } from '@nomik/core';
import { handleListResources, handleReadResource } from './resources';
import { handleCallTool, handleListTools } from './tools';
import { handleListPrompts, handleGetPrompt } from './prompts';
import { filterToolsByRole, filterPromptsByRole, filterResourcesByRole, getRole } from './roles';
import { initSampling, isSamplingEnabled } from './sampling';

const logLevel = (process.env.NOMIK_LOG_LEVEL as LogConfig['level']) || 'info';
const logger = createLogger({ level: logLevel, pretty: false }, process.stderr);
setLogger(logger);

async function main() {
    logger.info('Starting NOMIK MCP Server...');

    const config = loadConfigFromEnv();
    if (!config.graph) {
        logger.error('Missing graph configuration');
        process.exit(1);
    }
    const graph = createGraphService(config.graph);

    // Reconnection loop at startup — wait for Neo4j to be ready
    const MAX_CONNECT_RETRIES = 10;
    const CONNECT_RETRY_DELAY_MS = 3000;
    let connected = false;
    for (let attempt = 1; attempt <= MAX_CONNECT_RETRIES; attempt++) {
        try {
            await graph.connect();
            logger.info('Connected to Neo4j');
            connected = true;
            break;
        } catch (err) {
            logger.warn(
                { attempt, maxRetries: MAX_CONNECT_RETRIES, err },
                `Neo4j not ready, retrying in ${CONNECT_RETRY_DELAY_MS / 1000}s...`,
            );
            if (attempt === MAX_CONNECT_RETRIES) {
                logger.error({ err }, `Failed to connect to Neo4j after ${MAX_CONNECT_RETRIES} attempts`);
                process.exit(1);
            }
            await new Promise((r) => setTimeout(r, CONNECT_RETRY_DELAY_MS));
        }
    }
    if (!connected) process.exit(1);

    const server = new Server(
        {
            name: '@nomik/mcp-server',
            version: '1.0.0',
        },
        {
            capabilities: {
                resources: {},
                tools: {},
                prompts: {},
            },
        }
    );

    initSampling(server);
    const role = getRole();
    const samplingEnabled = isSamplingEnabled();
    logger.info({ role, sampling: samplingEnabled }, 'MCP role scope');

    // Resources
    server.setRequestHandler(ListResourcesRequestSchema, async () => ({
        resources: filterResourcesByRole(await handleListResources(graph), role),
    }));

    server.setRequestHandler(ReadResourceRequestSchema, async (request) => ({
        contents: await handleReadResource(graph, request.params.uri),
    }));

    // Tools
    server.setRequestHandler(ListToolsRequestSchema, async () => ({
        tools: filterToolsByRole(await handleListTools(), role),
    }));

    server.setRequestHandler(CallToolRequestSchema, async (request) => ({
        content: await handleCallTool(graph, request.params.name, request.params.arguments),
    }));

    // Prompts
    server.setRequestHandler(ListPromptsRequestSchema, async () => ({
        prompts: filterPromptsByRole(handleListPrompts(), role),
    }));

    server.setRequestHandler(GetPromptRequestSchema, async (request) => {
        const result = await handleGetPrompt(graph, request.params.name, request.params.arguments as Record<string, unknown> | undefined);
        return result;
    });

    const transport = new StdioServerTransport();
    await server.connect(transport);

    logger.info('MCP Server listening on stdio');
}

main().catch((err) => {
    logger.error({ err }, 'Fatal error in MCP server');
    process.exit(1);
});
