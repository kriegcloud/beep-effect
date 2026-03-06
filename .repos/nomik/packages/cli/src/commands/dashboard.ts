import { Command } from 'commander';
import http from 'node:http';
import { loadConfigFromEnv, validateConfig } from '@nomik/core';
import { createGraphService } from '@nomik/graph';
import type { GraphService } from '@nomik/graph';
import { readProjectConfig } from '../utils/project-config.js';

function json(res: http.ServerResponse, data: unknown, status = 200) {
    res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify(data, null, 2));
}

function cors(res: http.ServerResponse) {
    res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
}

async function buildRoutes(graph: GraphService, projectId?: string) {
    return async (req: http.IncomingMessage, res: http.ServerResponse) => {
        const url = new URL(req.url ?? '/', `http://${req.headers.host}`);
        const path = url.pathname;

        if (req.method === 'OPTIONS') return cors(res);

        try {
            switch (path) {
                case '/':
                case '/api': {
                    return json(res, {
                        name: 'NOMIK Dashboard API',
                        version: '0.1.0',
                        endpoints: [
                            'GET /api/stats',
                            'GET /api/health',
                            'GET /api/onboard',
                            'GET /api/rules',
                            'GET /api/dead-code',
                            'GET /api/god-files',
                            'GET /api/duplicates',
                            'GET /api/communities',
                            'GET /api/flows',
                            'GET /api/projects',
                            'GET /api/impact?symbol=<name>',
                            'GET /api/explain?symbol=<name>',
                            'GET /api/test-impact?symbol=<name>',
                            'GET /api/service-links',
                            'GET /api/search?q=<query>',
                        ],
                    });
                }

                case '/api/stats': {
                    const stats = await graph.getStats(projectId);
                    return json(res, stats);
                }

                case '/api/health': {
                    const stats = await graph.getStats(projectId);
                    const deadCode = await graph.getDeadCode(projectId);
                    const godFiles = await graph.getGodFiles(10, projectId);
                    const duplicates = await graph.getDuplicates(projectId);
                    return json(res, {
                        stats,
                        deadCode: { count: deadCode.length, items: deadCode.slice(0, 20) },
                        godFiles: { count: godFiles.length, items: godFiles.slice(0, 10) },
                        duplicates: { count: duplicates.length, items: duplicates.slice(0, 10) },
                    });
                }

                case '/api/onboard': {
                    const summary = await graph.getOnboard(projectId);
                    return json(res, summary);
                }

                case '/api/rules': {
                    const result = await graph.evaluateRules(undefined, projectId);
                    return json(res, result);
                }

                case '/api/dead-code': {
                    const deadCode = await graph.getDeadCode(projectId);
                    return json(res, { count: deadCode.length, items: deadCode });
                }

                case '/api/god-files': {
                    const threshold = Number(url.searchParams.get('threshold')) || 10;
                    const godFiles = await graph.getGodFiles(threshold, projectId);
                    return json(res, { count: godFiles.length, threshold, items: godFiles });
                }

                case '/api/duplicates': {
                    const duplicates = await graph.getDuplicates(projectId);
                    return json(res, { count: duplicates.length, items: duplicates });
                }

                case '/api/communities': {
                    const minSize = Number(url.searchParams.get('minSize')) || 3;
                    const communities = await graph.getCommunities(projectId, minSize);
                    return json(res, communities);
                }

                case '/api/flows': {
                    const maxDepth = Number(url.searchParams.get('maxDepth')) || 8;
                    const limit = Number(url.searchParams.get('limit')) || 20;
                    const flows = await graph.getFlows(projectId, maxDepth, limit);
                    return json(res, flows);
                }

                case '/api/projects': {
                    const projects = await graph.listProjects();
                    return json(res, projects);
                }

                case '/api/impact': {
                    const sym = url.searchParams.get('symbol');
                    if (!sym) return json(res, { error: 'Missing ?symbol= parameter' }, 400);
                    const depth = Number(url.searchParams.get('depth')) || 5;
                    const impact = await graph.getImpact(sym, depth, projectId);
                    return json(res, { symbol: sym, depth, count: impact.length, impact });
                }

                case '/api/explain': {
                    const sym = url.searchParams.get('symbol');
                    if (!sym) return json(res, { error: 'Missing ?symbol= parameter' }, 400);
                    const explain = await graph.getExplain(sym, projectId);
                    return json(res, explain);
                }

                case '/api/test-impact': {
                    const sym = url.searchParams.get('symbol');
                    if (!sym) return json(res, { error: 'Missing ?symbol= parameter' }, 400);
                    const depth = Number(url.searchParams.get('depth')) || 4;
                    const result = await graph.getTestImpact(sym, depth, projectId);
                    return json(res, result);
                }

                case '/api/service-links': {
                    const links = await graph.getServiceLinks(projectId);
                    return json(res, links);
                }

                case '/api/search': {
                    const q = url.searchParams.get('q');
                    if (!q) return json(res, { error: 'Missing ?q= parameter' }, 400);
                    const limit = Number(url.searchParams.get('limit')) || 20;
                    const results = await graph.executeQuery<{ name: string; type: string; filePath: string }>(
                        `MATCH (n) WHERE n.name CONTAINS $q ${projectId ? 'AND n.projectId = $projectId' : ''}
                         AND NOT n:Project AND NOT n:ScanMeta
                         RETURN n.name as name, labels(n)[0] as type, COALESCE(n.filePath, n.path) as filePath
                         LIMIT $limit`,
                        { q, projectId, limit },
                    );
                    return json(res, { query: q, count: results.length, results });
                }

                default:
                    return json(res, { error: 'Not found', path }, 404);
            }
        } catch (err) {
            return json(res, { error: err instanceof Error ? err.message : String(err) }, 500);
        }
    };
}

export const dashboardCommand = new Command('dashboard')
    .description('Start a REST API dashboard for Grafana/external tools')
    .option('--port <port>', 'Port to listen on', '4242')
    .option('--project <name>', 'Project name')
    .action(async (opts) => {
        const envConfig = loadConfigFromEnv();
        const config = validateConfig({ ...envConfig, target: { root: '.' } });
        const local = readProjectConfig();
        const projectId = opts.project ?? local?.projectId;
        const graph = createGraphService(config.graph);
        const port = Number(opts.port);

        try {
            await graph.connect();
            console.log(`\n  \x1b[36m\x1b[1mNOMIK Dashboard API\x1b[0m`);
            console.log(`  Project: ${projectId ?? '(all)'}`);

            const handler = await buildRoutes(graph, projectId);
            const server = http.createServer(handler);

            server.listen(port, () => {
                console.log(`  Listening: \x1b[1mhttp://localhost:${port}\x1b[0m`);
                console.log(`  Endpoints: http://localhost:${port}/api`);
                console.log(`\n  Press Ctrl+C to stop.\n`);
            });

            process.on('SIGINT', async () => {
                console.log('\n  Shutting down...');
                server.close();
                await graph.disconnect();
                process.exit(0);
            });
        } catch (err) {
            console.error(`  \x1b[31m✗\x1b[0m ${err instanceof Error ? err.message : String(err)}\n`);
            await graph.disconnect();
            process.exit(1);
        }
    });
