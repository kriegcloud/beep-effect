import { Command } from 'commander';
import { loadConfigFromEnv, validateConfig } from '@nomik/core';
import { createGraphService } from '@nomik/graph';
import { readProjectConfig } from '../utils/project-config.js';

export const impactCommand = new Command('impact')
    .description('Analyze the impact of changing a function or symbol')
    .argument('<symbol>', 'Name of the function/class to analyze')
    .option('--depth <n>', 'Maximum traversal depth', '5')
    .action(async (symbol: string, opts: { depth: string }) => {
        const envConfig = loadConfigFromEnv();
        const config = validateConfig({
            ...envConfig,
            target: { root: '.' },
        });

        const graph = createGraphService(config.graph);

        try {
            await graph.connect();

            const depth = parseInt(opts.depth, 10);
            const projectId = readProjectConfig()?.projectId;
            const results = await graph.getImpact(symbol, depth, projectId);

            console.log(`\n🧬 Impact Analysis: ${symbol}\n`);

            if (results.length === 0) {
                console.log('  No dependents found (symbol may not exist in graph)\n');
                return;
            }

            console.log(`  ${results.length} impacted nodes:\n`);
            for (const r of results) {
                console.log(`    ${r.type.padEnd(10)} ${r.name}`);
                if (r.filePath) console.log(`${''.padEnd(15)}→ ${r.filePath}`);
            }
            console.log('');
        } catch (err) {
            console.error(`  ❌ Error: ${err instanceof Error ? err.message : String(err)}\n`);
        } finally {
            await graph.disconnect();
        }
    });
