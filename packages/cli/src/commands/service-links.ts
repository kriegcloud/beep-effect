import { Command } from 'commander';
import { loadConfigFromEnv, validateConfig } from '@nomik/core';
import { createGraphService } from '@nomik/graph';
import { readProjectConfig } from '../utils/project-config.js';

export const serviceLinksCommand = new Command('service-links')
    .description('Show cross-service connections via shared topics, queues, and message brokers')
    .option('--json', 'Output as JSON')
    .action(async (opts: { json?: boolean }) => {
        const envConfig = loadConfigFromEnv();
        const config = validateConfig({
            ...envConfig,
            target: { root: '.' },
        });

        const graph = createGraphService(config.graph);

        try {
            await graph.connect();

            const projectId = readProjectConfig()?.projectId;
            const links = await graph.getServiceLinks(projectId);

            if (opts.json) {
                console.log(JSON.stringify(links, null, 2));
                return;
            }

            console.log(`\n🔗 Cross-Service Links\n`);

            if (links.length === 0) {
                console.log('  No cross-service topic/queue connections found.\n');
                console.log('  This means no topic or queue has both producers AND consumers in the graph.');
                console.log('  Hint: Ensure your codebase has message broker or queue usage detected by nomik scan.\n');
                return;
            }

            for (const link of links) {
                console.log(`  📨 ${link.topicName} (${link.broker})`);
                console.log(`    Producers:`);
                for (const p of link.producers) {
                    console.log(`      → ${p.name} (${p.filePath})`);
                }
                console.log(`    Consumers:`);
                for (const c of link.consumers) {
                    console.log(`      ← ${c.name} (${c.filePath})`);
                }
                console.log('');
            }

            console.log(`  📊 Total: ${links.length} shared topic(s)/queue(s)\n`);
        } catch (err) {
            console.error(`  ❌ Error: ${err instanceof Error ? err.message : String(err)}\n`);
        } finally {
            await graph.disconnect();
        }
    });
