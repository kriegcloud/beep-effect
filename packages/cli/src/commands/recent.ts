import { Command } from 'commander';
import { loadConfigFromEnv, createLogger, setLogger } from '@nomik/core';
import { createGraphService } from '@nomik/graph';
import { readProjectConfig } from '../utils/project-config.js';

/** CLI command to view recent changes in the graph */
export const recentCommand = new Command('recent')
    .description('Show recently changed nodes in the knowledge graph')
    .option('-s, --since <date>', 'ISO date string (default: 24h ago)')
    .option('-l, --limit <n>', 'Max results', '30')
    .option('-j, --json', 'Output raw JSON')
    .action(async (opts: { since?: string; limit: string; json?: boolean }) => {
        const logger = createLogger({ level: 'info', pretty: true });
        setLogger(logger);
        const envConfig = loadConfigFromEnv();
        if (!envConfig.graph) {
            logger.error('Graph config missing. Set NOMIK_GRAPH_URI, NOMIK_GRAPH_USER, NOMIK_GRAPH_PASS env vars.');
            process.exit(1);
        }
        const graph = createGraphService(envConfig.graph);

        const since = opts.since ?? new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const limit = Number(opts.limit);

        try {
            await graph.connect();
            const projectId = readProjectConfig()?.projectId;
            const results = await graph.getRecentChanges(since, limit, projectId);

            if (opts.json) {
                console.log(JSON.stringify(results, null, 2));
                return;
            }

            if (results.length === 0) {
                console.log(`No changes since ${since}`);
                return;
            }

            console.log(`\nChanges since ${since}:\n`);
            console.log(
                'Type'.padEnd(12) + 'Name'.padEnd(35) + 'Updated'.padEnd(22) + 'File'
            );
            console.log('-'.repeat(90));

            for (const r of results) {
                const updated = r.updatedAt ? r.updatedAt.substring(0, 19) : '?';
                const name = (r.name ?? '').substring(0, 33);
                const file = (r.filePath ?? '').split(/[/\\]/).pop() ?? '';
                console.log(
                    r.type.padEnd(12) + name.padEnd(35) + updated.padEnd(22) + file
                );
            }
            console.log(`\n${results.length} result(s)`);
        } catch (err) {
            logger.error({ error: err instanceof Error ? err.message : String(err) }, 'recent query failed');
            process.exit(1);
        } finally {
            await graph.disconnect();
        }
    });
