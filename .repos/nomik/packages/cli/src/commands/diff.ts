import { Command } from 'commander';
import { loadConfigFromEnv, validateConfig } from '@nomik/core';
import { createGraphService } from '@nomik/graph';
import { readProjectConfig } from '../utils/project-config.js';

export const diffCommand = new Command('diff')
    .description('Compare two scan snapshots by git SHA — detect architecture drift')
    .argument('<from-sha>', 'Git SHA of the earlier scan')
    .argument('<to-sha>', 'Git SHA of the later scan')
    .option('--json', 'Output as JSON')
    .action(async (fromSha: string, toSha: string, opts: { json?: boolean }) => {
        const envConfig = loadConfigFromEnv();
        const config = validateConfig({
            ...envConfig,
            target: { root: '.' },
        });

        const graph = createGraphService(config.graph);

        try {
            await graph.connect();

            const projectId = readProjectConfig()?.projectId;
            const result = await graph.getDiff(fromSha, toSha, projectId);

            if (opts.json) {
                console.log(JSON.stringify(result, null, 2));
                return;
            }

            console.log(`\n📊 Architecture Diff: ${fromSha.substring(0, 7)} → ${toSha.substring(0, 7)}\n`);

            // Files
            if (result.newFiles.length > 0) {
                console.log(`  ➕ New files (${result.newFiles.length})`);
                for (const f of result.newFiles.slice(0, 10)) {
                    console.log(`     ${f.split(/[/\\]/).slice(-3).join('/')}`);
                }
                if (result.newFiles.length > 10) console.log(`     ... and ${result.newFiles.length - 10} more`);
                console.log('');
            }

            if (result.removedFiles.length > 0) {
                console.log(`  ➖ Removed files (${result.removedFiles.length})`);
                for (const f of result.removedFiles.slice(0, 10)) {
                    console.log(`     ${f.split(/[/\\]/).slice(-3).join('/')}`);
                }
                console.log('');
            }

            if (result.modifiedFiles.length > 0) {
                console.log(`  ✏️  Modified files (${result.modifiedFiles.length})`);
                for (const f of result.modifiedFiles.slice(0, 10)) {
                    console.log(`     ${f.split(/[/\\]/).slice(-3).join('/')}`);
                }
                if (result.modifiedFiles.length > 10) console.log(`     ... and ${result.modifiedFiles.length - 10} more`);
                console.log('');
            }

            // Functions
            if (result.newFunctions.length > 0) {
                console.log(`  🆕 New functions (${result.newFunctions.length})`);
                for (const fn of result.newFunctions.slice(0, 10)) {
                    const shortPath = fn.filePath.split(/[/\\]/).slice(-2).join('/');
                    console.log(`     ${fn.name} (${shortPath})`);
                }
                if (result.newFunctions.length > 10) console.log(`     ... and ${result.newFunctions.length - 10} more`);
                console.log('');
            }

            // New edges
            if (result.newEdges.length > 0) {
                console.log(`  🔗 New call edges (${result.newEdges.length})`);
                for (const e of result.newEdges.slice(0, 10)) {
                    console.log(`     ${e.source} → ${e.target} (${e.type})`);
                }
                if (result.newEdges.length > 10) console.log(`     ... and ${result.newEdges.length - 10} more`);
                console.log('');
            }

            // Summary
            const s = result.summary;
            console.log(`  📋 Summary`);
            console.log(`     Files:     +${s.newFileCount} / -${s.removedFileCount} / ~${s.modifiedFileCount}`);
            console.log(`     Functions: +${s.newFunctionCount} / -${s.removedFunctionCount}`);
            console.log(`     Edges:     +${s.newEdgeCount} / -${s.removedEdgeCount}`);
            console.log('');
        } catch (err) {
            console.error(`  ❌ Error: ${err instanceof Error ? err.message : String(err)}\n`);
        } finally {
            await graph.disconnect();
        }
    });
