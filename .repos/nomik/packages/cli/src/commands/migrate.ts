import { Command } from 'commander';
import { loadConfigFromEnv, validateConfig } from '@nomik/core';
import { createGraphService } from '@nomik/graph';
import { readProjectConfig } from '../utils/project-config.js';

export const migrateCommand = new Command('migrate')
    .description('Generate a guided migration plan for moving a symbol between modules')
    .argument('<symbol>', 'Symbol name to migrate (function, class, variable)')
    .option('--to <module>', 'Target module/file path')
    .option('--depth <n>', 'Max dependency traversal depth', '5')
    .option('--project <name>', 'Project name')
    .option('--json', 'Output raw JSON')
    .action(async (symbol: string, opts) => {
        const envConfig = loadConfigFromEnv();
        const config = validateConfig({ ...envConfig, target: { root: '.' } });
        const local = readProjectConfig();
        const projectId = opts.project ?? local?.projectId;
        const graph = createGraphService(config.graph);

        try {
            await graph.connect();

            // Step 1: Get full context of the symbol
            const explain = await graph.getExplain(symbol, projectId);

            if (!explain.symbol) {
                console.error(`\n  \x1b[31m✗\x1b[0m Symbol "${symbol}" not found in the knowledge graph.\n`);
                process.exit(1);
            }

            // Step 2: Get downstream impact
            const impact = await graph.getImpact(symbol, Number(opts.depth), projectId);

            // Step 3: Get test impact
            const testImpact = await graph.getTestImpact(symbol, Number(opts.depth), projectId);

            // Step 4: Collect all affected files with their roles
            const affectedFiles = new Map<string, { role: string; symbols: string[]; depth: number }>();

            // Source file
            if (explain.symbol.filePath) {
                affectedFiles.set(explain.symbol.filePath, {
                    role: 'source (contains the symbol)',
                    symbols: [symbol],
                    depth: 0,
                });
            }

            // Callers (incoming edges)
            for (const edge of explain.incomingEdges) {
                const fp = edge.filePath;
                if (fp && !affectedFiles.has(fp)) {
                    affectedFiles.set(fp, {
                        role: 'caller (directly uses the symbol)',
                        symbols: [edge.sourceName ?? 'unknown'],
                        depth: 1,
                    });
                }
            }

            // Downstream impact
            for (const node of impact) {
                if (node.filePath && !affectedFiles.has(node.filePath)) {
                    affectedFiles.set(node.filePath, {
                        role: `${node.relationship} (depth ${node.depth})`,
                        symbols: [node.name],
                        depth: node.depth,
                    });
                } else if (node.filePath && affectedFiles.has(node.filePath)) {
                    affectedFiles.get(node.filePath)!.symbols.push(node.name);
                }
            }

            // Build migration plan
            const plan = {
                symbol: {
                    name: explain.symbol.name,
                    type: explain.symbol.type,
                    filePath: explain.symbol.filePath,
                    isExported: explain.symbol.isExported,
                    startLine: explain.symbol.startLine,
                    endLine: explain.symbol.endLine,
                },
                targetModule: opts.to ?? null,
                callerCount: explain.incomingEdges.length,
                impactDepth: impact.length > 0 ? Math.max(...impact.map(i => i.depth)) : 0,
                affectedFiles: Array.from(affectedFiles.entries()).map(([fp, info]) => ({
                    filePath: fp,
                    ...info,
                })).sort((a, b) => a.depth - b.depth),
                testFiles: testImpact.affectedTests,
                steps: [] as string[],
                riskLevel: 'LOW' as string,
            };

            // Determine risk level
            const totalAffected = plan.affectedFiles.length;
            if (totalAffected > 20 || plan.callerCount > 15) plan.riskLevel = 'HIGH';
            else if (totalAffected > 5 || plan.callerCount > 5) plan.riskLevel = 'MEDIUM';

            // Generate migration steps
            plan.steps.push(`1. Create the target location${opts.to ? ` (${opts.to})` : ''} if it doesn't exist`);
            plan.steps.push(`2. Copy ${symbol} (${explain.symbol.type}) from ${explain.symbol.filePath}:${explain.symbol.startLine}-${explain.symbol.endLine}`);
            plan.steps.push(`3. Add a re-export from the original location: export { ${symbol} } from '${opts.to ?? '<new-path>'}'`);

            if (plan.affectedFiles.length > 1) {
                const callerFiles = plan.affectedFiles.filter(f => f.depth === 1);
                plan.steps.push(`4. Update ${callerFiles.length} direct caller file(s) to import from the new location:`);
                for (const f of callerFiles.slice(0, 10)) {
                    plan.steps.push(`   - ${f.filePath}`);
                }
                if (callerFiles.length > 10) {
                    plan.steps.push(`   - ... and ${callerFiles.length - 10} more`);
                }
            }

            plan.steps.push(`${plan.affectedFiles.length > 1 ? '5' : '4'}. Remove the re-export shim from the original location`);

            if (testImpact.affectedTests.length > 0) {
                plan.steps.push(`${plan.affectedFiles.length > 1 ? '6' : '5'}. Run ${testImpact.affectedTests.length} affected test file(s):`);
                for (const t of testImpact.affectedTests.slice(0, 5)) {
                    plan.steps.push(`   - ${t.testFile}`);
                }
                if (testImpact.affectedTests.length > 5) {
                    plan.steps.push(`   - ... and ${testImpact.affectedTests.length - 5} more`);
                }
            }

            if (opts.json) {
                console.log(JSON.stringify(plan, null, 2));
            } else {
                console.log('');
                console.log(`  \x1b[36m\x1b[1mNOMIK Migration Plan\x1b[0m`);
                console.log('');
                console.log(`  Symbol:     \x1b[1m${plan.symbol.name}\x1b[0m (${plan.symbol.type})`);
                console.log(`  Location:   ${plan.symbol.filePath}:${plan.symbol.startLine}-${plan.symbol.endLine}`);
                console.log(`  Exported:   ${plan.symbol.isExported ? 'yes' : 'no'}`);
                if (opts.to) console.log(`  Target:     ${opts.to}`);
                console.log('');

                // Risk badge
                const riskColor = plan.riskLevel === 'HIGH' ? '\x1b[31m' : plan.riskLevel === 'MEDIUM' ? '\x1b[33m' : '\x1b[32m';
                console.log(`  Risk:       ${riskColor}\x1b[1m${plan.riskLevel}\x1b[0m`);
                console.log(`  Callers:    ${plan.callerCount}`);
                console.log(`  Affected:   ${plan.affectedFiles.length} file(s)`);
                console.log(`  Tests:      ${plan.testFiles.length} test file(s)`);
                console.log('');

                // Affected files
                console.log(`  \x1b[90m── Affected Files ──\x1b[0m`);
                for (const f of plan.affectedFiles.slice(0, 15)) {
                    const icon = f.depth === 0 ? '\x1b[36m●\x1b[0m' : f.depth === 1 ? '\x1b[33m●\x1b[0m' : '\x1b[90m●\x1b[0m';
                    console.log(`  ${icon} ${f.filePath}`);
                    console.log(`    \x1b[90m${f.role}\x1b[0m`);
                }
                if (plan.affectedFiles.length > 15) {
                    console.log(`  \x1b[90m... and ${plan.affectedFiles.length - 15} more\x1b[0m`);
                }
                console.log('');

                // Migration steps
                console.log(`  \x1b[90m── Migration Steps ──\x1b[0m`);
                for (const step of plan.steps) {
                    console.log(`  ${step}`);
                }
                console.log('');
            }
        } catch (err) {
            console.error(`  \x1b[31m✗\x1b[0m ${err instanceof Error ? err.message : String(err)}\n`);
            process.exit(1);
        } finally {
            await graph.disconnect();
        }
    });
