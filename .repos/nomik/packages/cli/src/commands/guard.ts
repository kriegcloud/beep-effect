import { Command } from 'commander';
import { loadConfigFromEnv, validateConfig } from '@nomik/core';
import { createGraphService } from '@nomik/graph';
import { readProjectConfig } from '../utils/project-config.js';
import fs from 'node:fs';
import path from 'node:path';

export const guardCommand = new Command('guard')
    .description('CI/pre-commit quality gate — fails if thresholds are exceeded')
    .option('--dead-code <n>', 'Max allowed dead code count', '5')
    .option('--god-files <n>', 'Max allowed god files', '3')
    .option('--duplicates <n>', 'Max allowed duplicate groups', '2')
    .option('--god-file-threshold <n>', 'Function count to flag a god file', '15')
    .option('--install-hook', 'Install as git pre-commit hook')
    .option('--uninstall-hook', 'Remove the NOMIK pre-commit hook')
    .option('--json', 'Output results as JSON')
    .option('--ci', 'CI mode — exit code 1 on failure, no interactive output')
    .action(async (opts: {
        deadCode: string; godFiles: string; duplicates: string;
        godFileThreshold: string; installHook?: boolean; uninstallHook?: boolean; json?: boolean; ci?: boolean;
    }) => {
        // Install git hook mode
        if (opts.installHook) {
            return installPreCommitHook();
        }

        // Uninstall git hook mode
        if (opts.uninstallHook) {
            return uninstallPreCommitHook();
        }

        const envConfig = loadConfigFromEnv();
        const config = validateConfig({
            ...envConfig,
            target: { root: '.' },
        });

        const graph = createGraphService(config.graph);
        const maxDeadCode = parseInt(opts.deadCode, 10);
        const maxGodFiles = parseInt(opts.godFiles, 10);
        const maxDuplicates = parseInt(opts.duplicates, 10);
        const godFileThreshold = parseInt(opts.godFileThreshold, 10);

        try {
            await graph.connect();
            const projectId = readProjectConfig()?.projectId;

            const deadCode = await graph.getDeadCode(projectId);
            const godFiles = await graph.getGodFiles(godFileThreshold, projectId);
            const duplicates = await graph.getDuplicates(projectId);
            const stats = await graph.getStats(projectId);

            const checks = [
                {
                    name: 'dead_code',
                    current: deadCode.length,
                    max: maxDeadCode,
                    passed: deadCode.length <= maxDeadCode,
                    details: deadCode.slice(0, 5).map(d => `${d.name} (${d.filePath})`),
                },
                {
                    name: 'god_files',
                    current: godFiles.length,
                    max: maxGodFiles,
                    passed: godFiles.length <= maxGodFiles,
                    details: godFiles.slice(0, 5).map(g => `${g.filePath} (${g.functionCount} fns)`),
                },
                {
                    name: 'duplicates',
                    current: duplicates.length,
                    max: maxDuplicates,
                    passed: duplicates.length <= maxDuplicates,
                    details: duplicates.slice(0, 5).map(d => `${d.functions.map(f => f.name).join(', ')} (${d.count}x)`),
                },
            ];

            const allPassed = checks.every(c => c.passed);

            if (opts.json) {
                console.log(JSON.stringify({ passed: allPassed, stats, checks }, null, 2));
                process.exit(allPassed ? 0 : 1);
                return;
            }

            if (opts.ci) {
                for (const c of checks) {
                    const status = c.passed ? 'PASS' : 'FAIL';
                    console.log(`${status} ${c.name}: ${c.current}/${c.max}`);
                }
                process.exit(allPassed ? 0 : 1);
                return;
            }

            console.log(`\n🛡️  NOMIK Guard — Quality Gate\n`);
            console.log(`  Project: ${stats.fileCount} files, ${stats.functionCount} functions\n`);

            for (const c of checks) {
                const icon = c.passed ? '✅' : '❌';
                const bar = c.passed
                    ? `${c.current}/${c.max}`
                    : `\x1b[31m${c.current}/${c.max}\x1b[0m`;
                console.log(`  ${icon} ${c.name}: ${bar}`);
                if (!c.passed && c.details.length > 0) {
                    for (const d of c.details) {
                        console.log(`     → ${d}`);
                    }
                }
            }

            console.log('');
            if (allPassed) {
                console.log('  \x1b[32m✓ All checks passed\x1b[0m\n');
            } else {
                console.log('  \x1b[31m✗ Quality gate FAILED\x1b[0m');
                console.log('  Fix the issues above or adjust thresholds with --dead-code, --god-files, --duplicates\n');
                process.exit(1);
            }
        } catch (err) {
            console.error(`  ❌ Error: ${err instanceof Error ? err.message : String(err)}\n`);
            process.exit(1);
        } finally {
            await graph.disconnect();
        }
    });

function installPreCommitHook(): void {
    const gitDir = path.resolve('.git');
    if (!fs.existsSync(gitDir)) {
        console.error('  ❌ Not a git repository (no .git directory found)\n');
        process.exit(1);
    }

    const hooksDir = path.join(gitDir, 'hooks');
    if (!fs.existsSync(hooksDir)) {
        fs.mkdirSync(hooksDir, { recursive: true });
    }

    const hookPath = path.join(hooksDir, 'pre-commit');
    const hookContent = `#!/bin/sh
# NOMIK quality gate — installed by 'nomik guard --install-hook'
# Remove with: nomik guard --uninstall-hook
echo "🛡️  Running NOMIK guard..."
npx @nomik-ai/cli guard --ci
if [ $? -ne 0 ]; then
    echo "❌ NOMIK guard failed. Fix issues before committing."
    exit 1
fi
`;

    // Check if hook already exists
    if (fs.existsSync(hookPath)) {
        const existing = fs.readFileSync(hookPath, 'utf-8');
        if (existing.includes('nomik guard')) {
            console.log('  ℹ️  NOMIK guard hook already installed\n');
            return;
        }
        // Append to existing hook
        fs.appendFileSync(hookPath, '\n' + hookContent.split('\n').slice(1).join('\n'));
        console.log('  ✅ NOMIK guard appended to existing pre-commit hook\n');
    } else {
        fs.writeFileSync(hookPath, hookContent, { mode: 0o755 });
        console.log('  ✅ NOMIK guard pre-commit hook installed\n');
    }

    console.log(`  Hook path: ${hookPath}`);
    console.log('  The hook will run `nomik guard --ci` before each commit.\n');
}

function uninstallPreCommitHook(): void {
    const hookPath = path.resolve('.git', 'hooks', 'pre-commit');
    if (!fs.existsSync(hookPath)) {
        console.log('  ℹ️  No pre-commit hook found — nothing to remove\n');
        return;
    }

    const content = fs.readFileSync(hookPath, 'utf-8');
    if (!content.includes('nomik guard')) {
        console.log('  ℹ️  Pre-commit hook exists but is not a NOMIK hook — skipping\n');
        return;
    }

    fs.unlinkSync(hookPath);
    console.log('  ✅ NOMIK pre-commit hook removed\n');
}
