import { Command } from 'commander';
import { loadConfigFromEnv, validateConfig } from '@nomik/core';
import { createGraphService } from '@nomik/graph';
import { readProjectConfig } from '../utils/project-config.js';

export const badgeCommand = new Command('badge')
    .description('Generate health badges for README (shields.io markdown)')
    .option('--json', 'Output badge data as JSON')
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
            const projectName = readProjectConfig()?.projectName ?? 'unknown';
            const stats = await graph.getStats(projectId);
            const deadCode = await graph.getDeadCode(projectId);
            const godFiles = await graph.getGodFiles(10, projectId);
            const duplicates = await graph.getDuplicates(projectId);

            const badges = [
                {
                    label: 'dead_code',
                    value: deadCode.length,
                    color: deadCode.length === 0 ? 'brightgreen' : deadCode.length <= 5 ? 'yellow' : 'red',
                },
                {
                    label: 'god_files',
                    value: godFiles.length,
                    color: godFiles.length === 0 ? 'brightgreen' : godFiles.length <= 3 ? 'yellow' : 'orange',
                },
                {
                    label: 'duplicates',
                    value: duplicates.length,
                    color: duplicates.length === 0 ? 'brightgreen' : duplicates.length <= 2 ? 'yellow' : 'orange',
                },
                {
                    label: 'functions',
                    value: stats.functionCount,
                    color: 'blue',
                },
                {
                    label: 'files',
                    value: stats.fileCount,
                    color: 'blue',
                },
            ];

            if (opts.json) {
                console.log(JSON.stringify({ project: projectName, badges }, null, 2));
                return;
            }

            console.log(`\n🏷️  Health Badges for ${projectName}\n`);
            console.log(`  Paste these into your README.md:\n`);
            console.log('```markdown');
            for (const b of badges) {
                const url = `https://img.shields.io/badge/${encodeURIComponent(b.label)}-${b.value}-${b.color}`;
                console.log(`![NOMIK ${b.label}](${url})`);
            }
            console.log('```\n');

            console.log(`  Preview:\n`);
            for (const b of badges) {
                const icon = b.color === 'brightgreen' ? '✅' : b.color === 'blue' ? '🔵' : b.color === 'yellow' ? '⚠️' : '🔴';
                console.log(`  ${icon} ${b.label}: ${b.value}`);
            }
            console.log('');
        } catch (err) {
            console.error(`  ❌ Error: ${err instanceof Error ? err.message : String(err)}\n`);
        } finally {
            await graph.disconnect();
        }
    });
