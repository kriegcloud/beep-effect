import { Command } from 'commander';
import { loadConfigFromEnv, validateConfig } from '@nomik/core';
import { createGraphService } from '@nomik/graph';
import { readProjectConfig } from '../utils/project-config.js';

export const statusCommand = new Command('status')
    .description('Show NOMIK graph health and statistics')
    .action(async () => {
        const envConfig = loadConfigFromEnv();
        const config = validateConfig({
            ...envConfig,
            target: { root: '.' },
        });

        const local = readProjectConfig();
        const projectId = local?.projectId;
        const graph = createGraphService(config.graph);

        try {
            await graph.connect();
            const healthy = await graph.healthCheck();

            if (!healthy) {
                console.log('  \x1b[31m\u2717\x1b[0m Neo4j is not reachable\n');
                return;
            }

            const stats = await graph.getStats(projectId);

            console.log('');
            console.log('  \x1b[36m\x1b[1mNOMIK Status\x1b[0m');
            console.log('');
            console.log(`  Project:   \x1b[1m${local?.projectName ?? '(none)'}\x1b[0m ${projectId ? `(${projectId})` : '\x1b[33m— run "nomik init"\x1b[0m'}`);
            console.log(`  Neo4j:     \x1b[32m\u2713\x1b[0m Connected`);
            console.log(`  Nodes:     ${stats.nodeCount}`);
            console.log(`  Edges:     ${stats.edgeCount}`);
            console.log('');
            console.log('  \x1b[90m── Code ──\x1b[0m');
            console.log(`  Files:       ${stats.fileCount}`);
            console.log(`  Functions:   ${stats.functionCount}`);
            console.log(`  Classes:     ${stats.classCount}`);
            console.log(`  Variables:   ${stats.variableCount}`);
            console.log(`  Modules:     ${stats.moduleCount}`);
            console.log('');
            console.log('  \x1b[90m── API & Routes ──\x1b[0m');
            console.log(`  Routes:      ${stats.routeCount}`);
            console.log(`  Ext. APIs:   ${stats.externalApiCount}`);
            console.log('');
            console.log('  \x1b[90m── Data ──\x1b[0m');
            console.log(`  DB Tables:   ${stats.dbTableCount}`);
            console.log(`  DB Columns:  ${stats.dbColumnCount}`);
            console.log(`  Env Vars:    ${stats.envVarCount}`);
            console.log('');
            console.log('  \x1b[90m── Infrastructure ──\x1b[0m');
            console.log(`  Queue Jobs:  ${stats.queueJobCount}`);
            console.log(`  Metrics:     ${stats.metricCount}`);
            console.log(`  Spans:       ${stats.spanCount}`);
            console.log(`  Topics:      ${stats.topicCount}`);
            console.log(`  Cron Jobs:   ${stats.cronJobCount}`);
            console.log(`  Events:      ${stats.eventCount}`);
            console.log('');
            console.log('  \x1b[90m── Security ──\x1b[0m');
            console.log(`  Issues:      ${stats.securityIssueCount}`);
            console.log('');
        } catch (err) {
            console.error(`  \x1b[31m\u2717\x1b[0m Cannot connect to Neo4j: ${err instanceof Error ? err.message : String(err)}\n`);
        } finally {
            await graph.disconnect();
        }
    });
