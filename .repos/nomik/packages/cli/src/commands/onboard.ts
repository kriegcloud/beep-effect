import { Command } from 'commander';
import { loadConfigFromEnv, validateConfig } from '@nomik/core';
import { createGraphService } from '@nomik/graph';
import { readProjectConfig } from '../utils/project-config.js';

export const onboardCommand = new Command('onboard')
    .description('Generate a codebase briefing — overview of architecture, APIs, DB tables, risk areas')
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

            const projectConfig = readProjectConfig();
            const projectId = projectConfig?.projectId;
            const projectName = projectConfig?.projectName ?? 'unknown';
            const summary = await graph.getOnboard(projectId);

            if (opts.json) {
                console.log(JSON.stringify({ project: projectName, ...summary }, null, 2));
                return;
            }

            const now = new Date().toISOString().split('T')[0];
            console.log(`\n${'═'.repeat(60)}`);
            console.log(`  📋 Codebase Briefing — ${projectName} (scanned ${now})`);
            console.log(`${'═'.repeat(60)}\n`);

            // Core stats
            console.log(`  📊 Overview`);
            console.log(`     ${summary.stats.functionCount} functions across ${summary.stats.fileCount} files`);
            console.log(`     ${summary.stats.classCount} classes, ${summary.stats.routeCount} routes`);

            // Languages
            if (summary.languages.length > 0) {
                const langStr = summary.languages.map(l => `${l.language} (${l.fileCount})`).join(', ');
                console.log(`     Languages: ${langStr}`);
            }

            // Routes
            if (summary.routes.length > 0) {
                console.log(`\n  🌐 Routes (${summary.routes.length})`);
                const methodCounts: Record<string, number> = {};
                for (const r of summary.routes) {
                    methodCounts[r.method] = (methodCounts[r.method] ?? 0) + 1;
                }
                const methodStr = Object.entries(methodCounts).map(([m, c]) => `${c} ${m}`).join(', ');
                console.log(`     ${methodStr}`);
                for (const r of summary.routes.slice(0, 10)) {
                    console.log(`     ${r.method.padEnd(7)} ${r.path}`);
                }
                if (summary.routes.length > 10) console.log(`     ... and ${summary.routes.length - 10} more`);
            }

            // DB tables
            if (summary.dbTables.length > 0) {
                console.log(`\n  🗄️  DB Tables (${summary.dbTables.length})`);
                for (const t of summary.dbTables.slice(0, 10)) {
                    console.log(`     ${t.name} (${t.schema}) — ${t.readerCount} readers, ${t.writerCount} writers`);
                }
                if (summary.dbTables.length > 10) console.log(`     ... and ${summary.dbTables.length - 10} more`);
            }

            // External APIs
            if (summary.externalAPIs.length > 0) {
                const uniqueAPIs = [...new Set(summary.externalAPIs.map(a => a.url))];
                console.log(`\n  🔗 External APIs (${uniqueAPIs.length} unique)`);
                for (const url of uniqueAPIs.slice(0, 10)) {
                    const callers = summary.externalAPIs.filter(a => a.url === url).map(a => a.callerName);
                    console.log(`     ${url} — called by ${callers.join(', ')}`);
                }
                if (uniqueAPIs.length > 10) console.log(`     ... and ${uniqueAPIs.length - 10} more`);
            }

            // Env vars
            if (summary.envVars.length > 0) {
                console.log(`\n  🔑 Environment Variables (${summary.envVars.length})`);
                const varNames = summary.envVars.map(e => e.name).slice(0, 15).join(', ');
                console.log(`     ${varNames}`);
                if (summary.envVars.length > 15) console.log(`     ... and ${summary.envVars.length - 15} more`);
            }

            // High-risk functions
            if (summary.highRiskFunctions.length > 0) {
                console.log(`\n  ⚠️  High-Risk Functions (most callers)`);
                for (const f of summary.highRiskFunctions.slice(0, 5)) {
                    const shortPath = f.filePath.split(/[/\\]/).slice(-2).join('/');
                    console.log(`     ${f.name} — ${f.callerCount} callers (${shortPath})`);
                }
            }

            // Health summary
            console.log(`\n  🏥 Health`);
            const deadIcon = summary.deadCodeCount === 0 ? '✅' : '⚠️';
            const godIcon = summary.godFileCount === 0 ? '✅' : '⚠️';
            const dupIcon = summary.duplicateCount === 0 ? '✅' : '⚠️';
            const secIcon = summary.securityIssueCount === 0 ? '✅' : '🔴';
            console.log(`     ${deadIcon} Dead code: ${summary.deadCodeCount}`);
            console.log(`     ${godIcon} God files (>10 fns): ${summary.godFileCount}`);
            console.log(`     ${dupIcon} Duplicate functions: ${summary.duplicateCount}`);
            console.log(`     ${secIcon} Security issues: ${summary.securityIssueCount}`);

            console.log(`\n${'═'.repeat(60)}\n`);
        } catch (err) {
            console.error(`  ❌ Error: ${err instanceof Error ? err.message : String(err)}\n`);
        } finally {
            await graph.disconnect();
        }
    });
