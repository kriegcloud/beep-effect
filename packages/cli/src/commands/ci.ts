import { Command } from 'commander';
import { loadConfigFromEnv, validateConfig } from '@nomik/core';
import { createGraphService } from '@nomik/graph';
import { readProjectConfig } from '../utils/project-config.js';
import { loadRulesConfig } from '../utils/rules-config.js';
import { execSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';

export const ciCommand = new Command('ci')
    .description('Unified CI pipeline: scan → rules → guard → audit (exits 1 on failure)')
    .argument('[path]', 'Root path to scan', '.')
    .option('--project <name>', 'Project name')
    .option('--skip-scan', 'Skip the scan step (use existing graph data)')
    .option('--skip-audit', 'Skip the npm audit step')
    .option('--json', 'Output all results as JSON')
    .action(async (targetPath: string, opts) => {
        const startTime = Date.now();
        const envConfig = loadConfigFromEnv();
        const config = validateConfig({ ...envConfig, target: { root: targetPath } });
        const local = readProjectConfig();
        const projectId = opts.project ?? local?.projectId;
        const graph = createGraphService(config.graph);
        const failures: string[] = [];
        const jsonResults: Record<string, unknown> = {};

        const log = (icon: string, msg: string) => {
            if (!opts.json) console.log(`  ${icon} ${msg}`);
        };

        if (!opts.json) {
            console.log('');
            console.log(`  \x1b[36m\x1b[1mNOMIK CI Pipeline\x1b[0m`);
            console.log(`  Project: ${projectId ?? '(auto-detect)'}`);
            console.log('');
        }

        try {
            await graph.connect();

            // Step 1: Scan
            if (!opts.skipScan) {
                log('\x1b[36m→\x1b[0m', 'Scanning codebase...');
                try {
                    const absPath = path.resolve(targetPath);
                    const scanArgs = projectId ? `--project ${projectId}` : '';
                    execSync(`node ${path.join(__dirname, '..', 'index.js')} scan ${absPath} ${scanArgs}`, {
                        encoding: 'utf-8',
                        stdio: 'pipe',
                        cwd: process.cwd(),
                    });
                    log('\x1b[32m✓\x1b[0m', 'Scan complete');
                    jsonResults.scan = { passed: true };
                } catch (err: any) {
                    log('\x1b[31m✗\x1b[0m', `Scan failed: ${err.message?.split('\n')[0] ?? 'unknown error'}`);
                    failures.push('scan');
                    jsonResults.scan = { passed: false, error: err.message?.split('\n')[0] };
                }
            } else {
                log('\x1b[90m⊘\x1b[0m', 'Scan skipped');
                jsonResults.scan = { skipped: true };
            }

            // Step 2: Rules
            log('\x1b[36m→\x1b[0m', 'Evaluating architecture rules...');
            const rulesConfig = loadRulesConfig() ?? {};
            const rulesResult = await graph.evaluateRules(rulesConfig, projectId);
            jsonResults.rules = rulesResult;

            if (rulesResult.passed) {
                log('\x1b[32m✓\x1b[0m', `Rules: ALL PASSED (${rulesResult.results.length} rules)`);
            } else {
                const failedRules = rulesResult.results.filter(r => !r.passed);
                log('\x1b[31m✗\x1b[0m', `Rules: ${rulesResult.summary.errors} error(s), ${rulesResult.summary.warnings} warning(s)`);
                for (const r of failedRules) {
                    log('  ', `${r.severity === 'error' ? '\x1b[31m✗\x1b[0m' : '\x1b[33m⚠\x1b[0m'} ${r.rule}: ${r.violations.length} violation(s)`);
                }
                if (rulesResult.summary.errors > 0) failures.push('rules');
            }

            // Step 3: Guard (dead code + god files + duplicates thresholds)
            log('\x1b[36m→\x1b[0m', 'Running quality gate...');
            const deadCode = await graph.getDeadCode(projectId);
            const godFiles = await graph.getGodFiles(10, projectId);
            const duplicates = await graph.getDuplicates(projectId);

            const guardResult = {
                deadCode: { count: deadCode.length, threshold: 5, passed: deadCode.length <= 5 },
                godFiles: { count: godFiles.length, threshold: 3, passed: godFiles.length <= 3 },
                duplicates: { count: duplicates.length, threshold: 2, passed: duplicates.length <= 2 },
            };
            const guardPassed = guardResult.deadCode.passed && guardResult.godFiles.passed && guardResult.duplicates.passed;
            jsonResults.guard = { passed: guardPassed, ...guardResult };

            if (guardPassed) {
                log('\x1b[32m✓\x1b[0m', `Guard: PASSED (dead=${deadCode.length} god=${godFiles.length} dupes=${duplicates.length})`);
            } else {
                log('\x1b[31m✗\x1b[0m', `Guard: FAILED`);
                if (!guardResult.deadCode.passed) log('  ', `\x1b[31m✗\x1b[0m dead code: ${deadCode.length} (max ${guardResult.deadCode.threshold})`);
                if (!guardResult.godFiles.passed) log('  ', `\x1b[31m✗\x1b[0m god files: ${godFiles.length} (max ${guardResult.godFiles.threshold})`);
                if (!guardResult.duplicates.passed) log('  ', `\x1b[31m✗\x1b[0m duplicates: ${duplicates.length} (max ${guardResult.duplicates.threshold})`);
                failures.push('guard');
            }

            // Step 4: Audit
            if (!opts.skipAudit) {
                log('\x1b[36m→\x1b[0m', 'Checking dependency vulnerabilities...');
                try {
                    const pm = fs.existsSync('pnpm-lock.yaml') ? 'pnpm' : fs.existsSync('yarn.lock') ? 'yarn' : 'npm';
                    let auditOutput = '';
                    try {
                        auditOutput = execSync(`${pm} audit --json 2>&1`, { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 });
                    } catch (e: any) {
                        auditOutput = e.stdout ?? e.output?.[1] ?? '';
                    }

                    let criticalHigh = 0;
                    try {
                        const parsed = JSON.parse(auditOutput);
                        const vulns = parsed.vulnerabilities ?? parsed.advisories ?? {};
                        for (const info of Object.values<any>(vulns)) {
                            const sev = info.severity ?? '';
                            if (sev === 'critical' || sev === 'high') criticalHigh++;
                        }
                    } catch { /* ignore parse errors */ }

                    jsonResults.audit = { criticalHigh, passed: criticalHigh === 0 };

                    if (criticalHigh === 0) {
                        log('\x1b[32m✓\x1b[0m', 'Audit: No critical/high vulnerabilities');
                    } else {
                        log('\x1b[31m✗\x1b[0m', `Audit: ${criticalHigh} critical/high vulnerabilities`);
                        failures.push('audit');
                    }
                } catch {
                    log('\x1b[33m⚠\x1b[0m', 'Audit: Could not run package audit');
                    jsonResults.audit = { skipped: true, reason: 'audit command failed' };
                }
            } else {
                log('\x1b[90m⊘\x1b[0m', 'Audit skipped');
                jsonResults.audit = { skipped: true };
            }

            // Summary
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
            const stats = await graph.getStats(projectId);
            jsonResults.summary = {
                passed: failures.length === 0,
                failures,
                elapsed: `${elapsed}s`,
                graph: { nodes: stats.nodeCount, edges: stats.edgeCount, files: stats.fileCount },
            };

            if (opts.json) {
                console.log(JSON.stringify(jsonResults, null, 2));
            } else {
                console.log('');
                console.log(`  \x1b[90m── Summary ──\x1b[0m`);
                console.log(`  Graph: ${stats.nodeCount} nodes, ${stats.edgeCount} edges, ${stats.fileCount} files`);
                console.log(`  Time:  ${elapsed}s`);
                console.log('');
                if (failures.length === 0) {
                    console.log(`  \x1b[32m\x1b[1m✓ CI PASSED\x1b[0m\n`);
                } else {
                    console.log(`  \x1b[31m\x1b[1m✗ CI FAILED\x1b[0m — ${failures.join(', ')}\n`);
                }
            }

            if (failures.length > 0) process.exit(1);
        } catch (err) {
            console.error(`  \x1b[31m✗\x1b[0m ${err instanceof Error ? err.message : String(err)}\n`);
            process.exit(1);
        } finally {
            await graph.disconnect();
        }
    });
