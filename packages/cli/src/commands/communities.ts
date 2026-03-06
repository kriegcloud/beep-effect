import { Command } from 'commander';
import { loadConfigFromEnv, validateConfig } from '@nomik/core';
import { createGraphService } from '@nomik/graph';
import { readProjectConfig } from '../utils/project-config.js';

export const communitiesCommand = new Command('communities')
    .description('Detect functional communities — groups of code that frequently call each other')
    .option('--min-size <n>', 'Minimum community size', '3')
    .option('--json', 'Output as JSON')
    .action(async (opts: { minSize: string; json?: boolean }) => {
        const envConfig = loadConfigFromEnv();
        const config = validateConfig({
            ...envConfig,
            target: { root: '.' },
        });

        const graph = createGraphService(config.graph);

        try {
            await graph.connect();

            const projectId = readProjectConfig()?.projectId;
            const minSize = parseInt(opts.minSize, 10);
            const result = await graph.getCommunities(projectId, minSize);

            if (opts.json) {
                console.log(JSON.stringify(result, null, 2));
                return;
            }

            console.log(`\n🏘️  Community Detection\n`);
            console.log(`  ${result.totalFunctions} functions, ${result.communities.length} communities, ${result.unclustered} unclustered\n`);

            for (const c of result.communities) {
                const bar = '█'.repeat(Math.min(Math.round(c.cohesion * 20), 20));
                console.log(`  📦 ${c.name}`);
                console.log(`     ${c.memberCount} functions, ${c.internalEdges} internal / ${c.externalEdges} external calls`);
                console.log(`     Cohesion: ${bar} ${(c.cohesion * 100).toFixed(0)}%`);

                const topMembers = c.members.slice(0, 5);
                for (const m of topMembers) {
                    const shortPath = m.filePath.split(/[/\\]/).slice(-2).join('/');
                    console.log(`       • ${m.name} (${shortPath})`);
                }
                if (c.members.length > 5) console.log(`       ... and ${c.members.length - 5} more`);
                console.log('');
            }
        } catch (err) {
            console.error(`  ❌ Error: ${err instanceof Error ? err.message : String(err)}\n`);
        } finally {
            await graph.disconnect();
        }
    });
