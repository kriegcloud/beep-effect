import { Command } from 'commander';
import { loadConfigFromEnv, validateConfig } from '@nomik/core';
import { createGraphService } from '@nomik/graph';
import { readProjectConfig } from '../utils/project-config.js';

export const flowsCommand = new Command('flows')
    .description('Trace execution flows from entry points (routes, event listeners, queue consumers) through the call graph')
    .option('--depth <n>', 'Maximum traversal depth', '8')
    .option('--limit <n>', 'Maximum number of flows', '20')
    .option('--json', 'Output as JSON')
    .action(async (opts: { depth: string; limit: string; json?: boolean }) => {
        const envConfig = loadConfigFromEnv();
        const config = validateConfig({
            ...envConfig,
            target: { root: '.' },
        });

        const graph = createGraphService(config.graph);

        try {
            await graph.connect();

            const projectId = readProjectConfig()?.projectId;
            const maxDepth = parseInt(opts.depth, 10);
            const limit = parseInt(opts.limit, 10);
            const result = await graph.getFlows(projectId, maxDepth, limit);

            if (opts.json) {
                console.log(JSON.stringify(result, null, 2));
                return;
            }

            console.log(`\n🔄 Execution Flows (${result.flows.length} from ${result.entryPointCount} entry points)\n`);

            if (result.flows.length === 0) {
                console.log('  No execution flows detected.');
                console.log('  Hint: flows require routes (HANDLES), event listeners (LISTENS_TO),');
                console.log('        or queue consumers (CONSUMES_JOB) as entry points.\n');
                return;
            }

            for (const flow of result.flows) {
                const shortPath = flow.entryPoint.filePath.split(/[/\\]/).slice(-2).join('/');
                console.log(`  🚀 ${flow.entryPoint.name} — ${flow.entryPoint.reason}`);
                console.log(`     ${shortPath}, depth: ${flow.depth}`);

                if (flow.steps.length > 0) {
                    console.log(`     Call chain:`);
                    for (const step of flow.steps.slice(0, 8)) {
                        const indent = '  '.repeat(step.depth);
                        const stepPath = step.filePath.split(/[/\\]/).slice(-2).join('/');
                        console.log(`     ${indent}→ ${step.name} (${stepPath})`);
                    }
                    if (flow.steps.length > 8) console.log(`     ... and ${flow.steps.length - 8} more steps`);
                }

                if (flow.terminators.length > 0) {
                    console.log(`     Terminators:`);
                    for (const t of flow.terminators) {
                        const icon = t.type === 'DBTable' ? '🗄️' : t.type === 'ExternalAPI' ? '🌐' : '📨';
                        console.log(`     ${icon} ${t.name} (${t.operation})`);
                    }
                }
                console.log('');
            }
        } catch (err) {
            console.error(`  ❌ Error: ${err instanceof Error ? err.message : String(err)}\n`);
        } finally {
            await graph.disconnect();
        }
    });
