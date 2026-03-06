import { Command } from 'commander';
import { loadConfigFromEnv, validateConfig } from '@nomik/core';
import { createGraphService } from '@nomik/graph';
import { readProjectConfig } from '../utils/project-config.js';

export const testImpactCommand = new Command('test-impact')
    .description('Find which test files to re-run after changing a symbol or file')
    .argument('[symbol]', 'Symbol name to analyze (function, class, variable)')
    .option('--files <paths...>', 'Changed file paths (alternative to symbol)')
    .option('--depth <n>', 'Max traversal depth for symbol mode', '4')
    .option('--project <name>', 'Project name')
    .option('--json', 'Output raw JSON')
    .action(async (symbol: string | undefined, opts) => {
        const envConfig = loadConfigFromEnv();
        const config = validateConfig({ ...envConfig, target: { root: '.' } });
        const local = readProjectConfig();
        const projectId = opts.project ?? local?.projectId;
        const graph = createGraphService(config.graph);

        try {
            await graph.connect();

            if (opts.files && opts.files.length > 0) {
                // File-based mode
                const results = await graph.getTestImpactForFiles(opts.files, projectId);

                if (opts.json) {
                    console.log(JSON.stringify(results, null, 2));
                } else {
                    console.log('');
                    console.log(`  \x1b[36m\x1b[1mTest Impact Analysis (file mode)\x1b[0m`);
                    console.log(`  Changed files: ${opts.files.length}`);
                    console.log(`  Affected tests: ${results.length}`);
                    console.log('');

                    if (results.length === 0) {
                        console.log('  \x1b[32mNo test files affected.\x1b[0m\n');
                    } else {
                        for (const r of results) {
                            console.log(`  \x1b[33m\u25CF\x1b[0m ${r.testFile}`);
                            console.log(`    \x1b[90m${r.reason} \u2190 ${r.changedFile}\x1b[0m`);
                        }
                        console.log('');
                    }
                }
            } else if (symbol) {
                // Symbol-based mode
                const result = await graph.getTestImpact(symbol, Number(opts.depth), projectId);

                if (opts.json) {
                    console.log(JSON.stringify(result, null, 2));
                } else {
                    console.log('');
                    console.log(`  \x1b[36m\x1b[1mTest Impact Analysis\x1b[0m`);
                    console.log(`  Symbol: \x1b[1m${result.changedSymbol}\x1b[0m`);
                    console.log(`  Affected tests: ${result.totalTestFiles}`);
                    console.log('');

                    if (result.affectedTests.length === 0) {
                        console.log('  \x1b[32mNo test files affected.\x1b[0m\n');
                    } else {
                        for (const t of result.affectedTests) {
                            console.log(`  \x1b[33m\u25CF\x1b[0m ${t.testFile}`);
                            console.log(`    \x1b[90m${t.reason}\x1b[0m`);
                        }
                        console.log('');
                    }
                }
            } else {
                console.error('  \x1b[31m\u2717\x1b[0m Provide a symbol name or --files <paths...>\n');
                process.exit(1);
            }
        } catch (err) {
            console.error(`  \x1b[31m\u2717\x1b[0m ${err instanceof Error ? err.message : String(err)}\n`);
            process.exit(1);
        } finally {
            await graph.disconnect();
        }
    });
