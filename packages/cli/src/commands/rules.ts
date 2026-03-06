import { Command } from 'commander';
import { loadConfigFromEnv, validateConfig } from '@nomik/core';
import { createGraphService } from '@nomik/graph';
import type { RulesConfig } from '@nomik/graph';
import { readProjectConfig } from '../utils/project-config.js';
import { loadRulesConfig, createDefaultRulesConfig } from '../utils/rules-config.js';

export const rulesCommand = new Command('rules')
    .description('Evaluate architecture rules against the knowledge graph')
    .option('--max-dead-code <n>', 'Max allowed dead code functions', '5')
    .option('--max-god-files <n>', 'Max allowed god files', '3')
    .option('--max-duplicates <n>', 'Max allowed duplicate groups', '2')
    .option('--max-function-callers <n>', 'Max callers per function', '50')
    .option('--max-db-writes-per-route <n>', 'Max DB write functions per route', '3')
    .option('--max-function-lines <n>', 'Max lines per function', '200')
    .option('--max-file-lines <n>', 'Max lines per file', '1000')
    .option('--max-security-issues <n>', 'Max security issues', '0')
    .option('--no-circular-imports', 'Disallow circular file imports')
    .option('--project <name>', 'Project name')
    .option('--json', 'Output raw JSON')
    .option('--ci', 'Exit 1 on any error-severity rule failure')
    .option('--init', 'Create a default .nomik/rules.yaml config file')
    .action(async (opts) => {
        if (opts.init) {
            const filePath = createDefaultRulesConfig();
            console.log(`\n  \x1b[32m\u2713\x1b[0m Created ${filePath}\n`);
            return;
        }

        const envConfig = loadConfigFromEnv();
        const config = validateConfig({ ...envConfig, target: { root: '.' } });
        const local = readProjectConfig();
        const projectId = opts.project ?? local?.projectId;
        const graph = createGraphService(config.graph);

        try {
            await graph.connect();

            // Load from .nomik/rules.yaml first, then override with CLI flags
            const yamlConfig = loadRulesConfig() ?? {};
            const rulesConfig: RulesConfig = {
                maxDeadCode: Number(opts.maxDeadCode) || yamlConfig.maxDeadCode,
                maxGodFiles: Number(opts.maxGodFiles) || yamlConfig.maxGodFiles,
                maxDuplicates: Number(opts.maxDuplicates) || yamlConfig.maxDuplicates,
                maxFunctionCallers: Number(opts.maxFunctionCallers) || yamlConfig.maxFunctionCallers,
                maxDbWritesPerRoute: Number(opts.maxDbWritesPerRoute) || yamlConfig.maxDbWritesPerRoute,
                maxFunctionLines: Number(opts.maxFunctionLines) || yamlConfig.maxFunctionLines,
                maxFileLines: Number(opts.maxFileLines) || yamlConfig.maxFileLines,
                maxSecurityIssues: Number(opts.maxSecurityIssues) ?? yamlConfig.maxSecurityIssues,
                noCircularImports: yamlConfig.noCircularImports ?? (opts.circularImports !== false),
            };

            const result = await graph.evaluateRules(rulesConfig, projectId);

            if (opts.json) {
                console.log(JSON.stringify(result, null, 2));
            } else {
                console.log('');
                console.log(`  \x1b[36m\x1b[1mNOMIK Architecture Rules\x1b[0m`);
                console.log('');

                for (const r of result.results) {
                    const icon = r.passed ? '\x1b[32m\u2713\x1b[0m' : (r.severity === 'error' ? '\x1b[31m\u2717\x1b[0m' : '\x1b[33m\u26A0\x1b[0m');
                    console.log(`  ${icon} ${r.rule}: ${r.description}`);
                    if (!r.passed) {
                        for (const v of r.violations.slice(0, 5)) {
                            console.log(`      \x1b[90m\u2502\x1b[0m ${v.message}${v.filePath ? ` \x1b[90m(${v.filePath})\x1b[0m` : ''}`);
                        }
                        if (r.violations.length > 5) {
                            console.log(`      \x1b[90m\u2502 ... and ${r.violations.length - 5} more\x1b[0m`);
                        }
                    }
                }

                console.log('');
                console.log(`  ${result.passed ? '\x1b[32m\u2713 ALL RULES PASSED\x1b[0m' : `\x1b[31m\u2717 FAILED\x1b[0m — ${result.summary.errors} error(s), ${result.summary.warnings} warning(s)`}`);
                console.log('');
            }

            if (opts.ci && !result.passed && result.summary.errors > 0) {
                process.exit(1);
            }
        } catch (err) {
            console.error(`  \x1b[31m\u2717\x1b[0m ${err instanceof Error ? err.message : String(err)}\n`);
            process.exit(1);
        } finally {
            await graph.disconnect();
        }
    });
