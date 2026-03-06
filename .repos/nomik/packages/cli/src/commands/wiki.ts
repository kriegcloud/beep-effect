import { Command } from 'commander';
import { loadConfigFromEnv, validateConfig } from '@nomik/core';
import { createGraphService, type GraphService } from '@nomik/graph';
import { readProjectConfig } from '../utils/project-config.js';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

// ────────────────────────────────────────────────────────────────────
// Types for wiki data
// ────────────────────────────────────────────────────────────────────
interface FileFunction {
    name: string; isExported: boolean; startLine: number; endLine: number;
    callerCount: number; calleeCount: number; callerNames: string; calleeNames: string;
}
interface FileDB { tableName: string; operation: string; functionName: string; }
interface FileAPI { endpoint: string; method: string; functionName: string; }
interface FileRoute { method: string; path: string; handlerName: string; }
interface FileEnvVar { varName: string; functionName: string; }

function shortPath(p: string, n = 3): string {
    return p.split(/[/\\]/).slice(-n).join('/');
}

function extractModule(filePath: string): string {
    const parts = filePath.replace(/\\/g, '/').split('/').filter(Boolean);
    parts.pop(); // Remove filename
    if (!parts.length) return 'root';
    if (parts[0] === 'packages' && parts.length >= 2) {
        const pkg = parts[1]!;
        const rest = parts.slice(2).filter(p => p !== 'src' && p !== 'source');
        return rest.length > 0 ? `${pkg}/${rest[0]!}` : pkg;
    }
    if (parts[0] === 'src' || parts[0] === 'source') parts.shift();
    return parts.slice(0, 2).join('/') || 'root';
}

function sanitizeFilename(name: string): string {
    return name.replace(/[/\\:*?"<>|]/g, '_');
}

// ────────────────────────────────────────────────────────────────────
// Per-file detail query
// ────────────────────────────────────────────────────────────────────
async function getFileDetail(graph: GraphService, filePath: string, projectId?: string) {
    const pf2 = projectId ? ' AND f.projectId = $projectId' : '';

    const functions = await graph.executeQuery<FileFunction>(
        `MATCH (f:File {path: $filePath})-[:CONTAINS]->(fn:Function)
         WHERE true ${pf2}
         OPTIONAL MATCH (caller)-[:CALLS]->(fn) WHERE caller.name <> fn.name
         WITH fn, collect(DISTINCT caller.name) as callerList, count(DISTINCT caller) as callerCount
         OPTIONAL MATCH (fn)-[:CALLS]->(callee)
         RETURN fn.name as name, COALESCE(fn.isExported, false) as isExported,
                COALESCE(fn.startLine, 0) as startLine, COALESCE(fn.endLine, 0) as endLine,
                callerCount, count(DISTINCT callee) as calleeCount,
                REDUCE(s = '', x IN callerList[0..5] | s + CASE WHEN s = '' THEN '' ELSE ', ' END + COALESCE(x, '')) as callerNames,
                REDUCE(s = '', x IN collect(DISTINCT callee.name)[0..5] | s + CASE WHEN s = '' THEN '' ELSE ', ' END + COALESCE(x, '')) as calleeNames
         ORDER BY callerCount DESC`,
        { filePath, projectId },
    );

    const dbOps = await graph.executeQuery<FileDB>(
        `MATCH (f:File {path: $filePath})-[:CONTAINS]->(fn:Function)
         WHERE true ${pf2}
         MATCH (fn)-[r:READS_FROM|WRITES_TO]->(t:DBTable)
         RETURN t.name as tableName, type(r) as operation, fn.name as functionName
         ORDER BY t.name`,
        { filePath, projectId },
    );

    const apiCalls = await graph.executeQuery<FileAPI>(
        `MATCH (f:File {path: $filePath})-[:CONTAINS]->(fn:Function)
         WHERE true ${pf2}
         MATCH (fn)-[r:CALLS_EXTERNAL]->(api:ExternalAPI)
         RETURN COALESCE(api.endpoint, api.name) as endpoint, COALESCE(r.method, 'GET') as method, fn.name as functionName
         ORDER BY api.endpoint`,
        { filePath, projectId },
    );

    const routes = await graph.executeQuery<FileRoute>(
        `MATCH (r:Route)-[:HANDLES]->(fn:Function)
         MATCH (f:File {path: $filePath})-[:CONTAINS]->(fn)
         WHERE true ${pf2}
         RETURN r.method as method, r.path as path, fn.name as handlerName
         ORDER BY r.path`,
        { filePath, projectId },
    );

    const envVars = await graph.executeQuery<FileEnvVar>(
        `MATCH (f:File {path: $filePath})-[:CONTAINS]->(fn:Function)
         WHERE true ${pf2}
         MATCH (fn)-[:USES_ENV]->(ev:EnvVar)
         RETURN ev.name as varName, fn.name as functionName
         ORDER BY ev.name`,
        { filePath, projectId },
    );

    return { functions, dbOps, apiCalls, routes, envVars };
}

export const wikiCommand = new Command('wiki')
    .description('Generate markdown documentation from the knowledge graph')
    .option('--out <dir>', 'Output directory', './wiki')
    .option('--json', 'Output as JSON instead of markdown files')
    .option('--no-modules', 'Skip per-module detail pages')
    .action(async (opts: { out: string; json?: boolean; modules?: boolean }) => {
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

            // Gather data
            const stats = await graph.getStats(projectId);
            const deadCode = await graph.getDeadCode(projectId);
            const godFiles = await graph.getGodFiles(10, projectId);
            const duplicates = await graph.getDuplicates(projectId);
            const serviceLinks = await graph.getServiceLinks(projectId);

            // Get file-level data
            const files = await graph.executeQuery<{
                path: string; language: string; functionCount: number; lineCount: number;
            }>(
                `MATCH (f:File)${projectId ? ' WHERE f.projectId = $projectId' : ''}
                 OPTIONAL MATCH (f)-[:CONTAINS]->(fn:Function)
                 WITH f, count(fn) as functionCount
                 RETURN f.path as path, COALESCE(f.language, 'unknown') as language,
                        functionCount, COALESCE(f.lineCount, 0) as lineCount
                 ORDER BY f.path`,
                { projectId },
            );

            // Get top-level functions with caller counts
            const functions = await graph.executeQuery<{
                name: string; filePath: string; isExported: boolean; callerCount: number; calleeCount: number;
            }>(
                `MATCH (fn:Function)${projectId ? ' WHERE fn.projectId = $projectId' : ''}
                 OPTIONAL MATCH (caller)-[:CALLS]->(fn)
                 WITH fn, count(DISTINCT caller) as callerCount
                 OPTIONAL MATCH (fn)-[:CALLS]->(callee)
                 RETURN fn.name as name, fn.filePath as filePath,
                        COALESCE(fn.isExported, false) as isExported,
                        callerCount, count(DISTINCT callee) as calleeCount
                 ORDER BY callerCount DESC
                 LIMIT 100`,
                { projectId },
            );

            if (opts.json) {
                console.log(JSON.stringify({ project: projectName, stats, files, functions, deadCode, godFiles, duplicates, serviceLinks }, null, 2));
                return;
            }

            // ── Group files by module (directory cluster) ──
            const moduleMap = new Map<string, typeof files>();
            for (const f of files) {
                const mod = extractModule(f.path);
                if (!moduleMap.has(mod)) moduleMap.set(mod, []);
                moduleMap.get(mod)!.push(f);
            }
            const sortedModules = Array.from(moduleMap.entries()).sort((a, b) => b[1].length - a[1].length);

            mkdirSync(opts.out, { recursive: true });
            const now = new Date().toISOString().split('T')[0]!;

            // ═══════════════════════════════════════════════
            // 1. Index page — overview + module links
            // ═══════════════════════════════════════════════
            let index = `# ${projectName} — Architecture Wiki\n\n`;
            index += `> Auto-generated by [NOMIK](https://github.com/nomik-ai/nomik) on ${now}\n\n`;
            index += `## Overview\n\n`;
            index += `| Metric | Count |\n|---|---|\n`;
            index += `| Files | ${stats.fileCount} |\n`;
            index += `| Functions | ${stats.functionCount} |\n`;
            index += `| Classes | ${stats.classCount} |\n`;
            index += `| Routes | ${stats.routeCount} |\n`;
            index += `| Dead code | ${deadCode.length} |\n`;
            index += `| God files | ${godFiles.length} |\n`;
            index += `| Duplicates | ${duplicates.length} |\n\n`;

            index += `## Pages\n\n`;
            index += `- [Functions](functions.md) — Top 100 functions by caller count\n`;
            index += `- [Health Report](health.md) — Dead code, god files, duplicates\n`;
            if (serviceLinks.length > 0) index += `- [Cross-Service Links](service-links.md)\n`;
            index += `\n`;

            if (sortedModules.length > 0 && opts.modules !== false) {
                index += `## Modules\n\n`;
                index += `| Module | Files | Functions | Lines |\n|---|---|---|---|\n`;
                for (const [mod, modFiles] of sortedModules) {
                    const totalFuncs = modFiles.reduce((s, f) => s + f.functionCount, 0);
                    const totalLines = modFiles.reduce((s, f) => s + f.lineCount, 0);
                    const filename = sanitizeFilename(mod);
                    index += `| [${mod}](modules/${filename}.md) | ${modFiles.length} | ${totalFuncs} | ${totalLines} |\n`;
                }
                index += `\n`;
            }

            index += `## All Files\n\n`;
            index += `| File | Language | Functions | Lines |\n|---|---|---|---|\n`;
            for (const f of files) {
                index += `| ${shortPath(f.path)} | ${f.language} | ${f.functionCount} | ${f.lineCount} |\n`;
            }
            index += `\n`;

            writeFileSync(join(opts.out, 'index.md'), index);
            console.log(`  📄 ${join(opts.out, 'index.md')}`);

            // ═══════════════════════════════════════════════
            // 2. Functions page
            // ═══════════════════════════════════════════════
            let funcsPage = `# Functions\n\n`;
            funcsPage += `> Top 100 functions by caller count\n\n`;
            funcsPage += `| Function | File | Exported | Callers | Callees |\n|---|---|---|---|---|\n`;
            for (const fn of functions) {
                funcsPage += `| \`${fn.name}\` | ${shortPath(fn.filePath, 2)} | ${fn.isExported ? '✅' : '—'} | ${fn.callerCount} | ${fn.calleeCount} |\n`;
            }
            funcsPage += `\n`;

            writeFileSync(join(opts.out, 'functions.md'), funcsPage);
            console.log(`  📄 ${join(opts.out, 'functions.md')}`);

            // ═══════════════════════════════════════════════
            // 3. Health page
            // ═══════════════════════════════════════════════
            let healthPage = `# Health Report\n\n`;

            if (deadCode.length > 0) {
                healthPage += `## Dead Code (${deadCode.length})\n\n`;
                healthPage += `| Function | File |\n|---|---|\n`;
                for (const d of deadCode) {
                    healthPage += `| \`${d.name}\` | ${shortPath(d.filePath, 2)} |\n`;
                }
                healthPage += `\n`;
            } else {
                healthPage += `## Dead Code\n\n✅ No dead code detected.\n\n`;
            }

            if (godFiles.length > 0) {
                healthPage += `## God Files (${godFiles.length})\n\n`;
                healthPage += `| File | Functions | Lines |\n|---|---|---|\n`;
                for (const g of godFiles) {
                    healthPage += `| ${shortPath(g.filePath, 2)} | ${g.functionCount} | ${g.totalLines} |\n`;
                }
                healthPage += `\n`;
            } else {
                healthPage += `## God Files\n\n✅ No god files detected.\n\n`;
            }

            if (duplicates.length > 0) {
                healthPage += `## Duplicate Functions (${duplicates.length})\n\n`;
                for (const d of duplicates) {
                    healthPage += `### Hash: \`${d.bodyHash.substring(0, 12)}\` (${d.count} copies)\n\n`;
                    for (const f of d.functions) {
                        healthPage += `- \`${f.name}\` in ${shortPath(f.filePath, 2)}\n`;
                    }
                    healthPage += `\n`;
                }
            } else {
                healthPage += `## Duplicate Functions\n\n✅ No duplicates detected.\n\n`;
            }

            writeFileSync(join(opts.out, 'health.md'), healthPage);
            console.log(`  📄 ${join(opts.out, 'health.md')}`);

            // ═══════════════════════════════════════════════
            // 4. Service links page
            // ═══════════════════════════════════════════════
            if (serviceLinks.length > 0) {
                let svcPage = `# Cross-Service Links\n\n`;
                for (const link of serviceLinks) {
                    svcPage += `## ${link.topicName} (${link.broker})\n\n`;
                    svcPage += `**Producers:**\n`;
                    for (const p of link.producers) svcPage += `- \`${p.name}\` (${shortPath(p.filePath, 2)})\n`;
                    svcPage += `\n**Consumers:**\n`;
                    for (const c of link.consumers) svcPage += `- \`${c.name}\` (${shortPath(c.filePath, 2)})\n`;
                    svcPage += `\n`;
                }
                writeFileSync(join(opts.out, 'service-links.md'), svcPage);
                console.log(`  📄 ${join(opts.out, 'service-links.md')}`);
            }

            // ═══════════════════════════════════════════════
            // 5. Per-module detail pages
            // ═══════════════════════════════════════════════
            if (opts.modules !== false && sortedModules.length > 0) {
                mkdirSync(join(opts.out, 'modules'), { recursive: true });
                let moduleCount = 0;

                for (const [mod, modFiles] of sortedModules) {
                    const filename = sanitizeFilename(mod);
                    let page = `# Module: ${mod}\n\n`;
                    page += `> ${modFiles.length} files | [← Back to Index](../index.md)\n\n`;

                    for (const f of modFiles) {
                        const fname = f.path.split(/[/\\]/).pop() || f.path;
                        page += `## ${fname}\n\n`;
                        page += `- **Path**: \`${shortPath(f.path)}\`\n`;
                        page += `- **Language**: ${f.language}\n`;
                        page += `- **Lines**: ${f.lineCount}\n\n`;

                        // Per-file detail
                        const detail = await getFileDetail(graph, f.path, projectId);

                        // Functions table
                        if (detail.functions.length > 0) {
                            page += `### Functions (${detail.functions.length})\n\n`;
                            page += `| Function | Lines | Exported | Callers | Callees |\n|---|---|---|---|---|\n`;
                            for (const fn of detail.functions) {
                                const lines = fn.startLine && fn.endLine ? `${fn.startLine}-${fn.endLine}` : '—';
                                page += `| \`${fn.name}\` | ${lines} | ${fn.isExported ? '✅' : '—'} | ${fn.callerCount} | ${fn.calleeCount} |\n`;
                            }
                            page += `\n`;

                            // Show callers/callees for high-traffic functions
                            const hotFunctions = detail.functions.filter(fn => fn.callerCount >= 3 || fn.calleeCount >= 3);
                            if (hotFunctions.length > 0) {
                                page += `<details><summary>Call graph details (${hotFunctions.length} functions)</summary>\n\n`;
                                for (const fn of hotFunctions) {
                                    page += `#### \`${fn.name}\`\n`;
                                    if (fn.callerNames) page += `- **Called by**: ${fn.callerNames}\n`;
                                    if (fn.calleeNames) page += `- **Calls**: ${fn.calleeNames}\n`;
                                    page += `\n`;
                                }
                                page += `</details>\n\n`;
                            }
                        }

                        // Routes
                        if (detail.routes.length > 0) {
                            page += `### Routes\n\n`;
                            page += `| Method | Path | Handler |\n|---|---|---|\n`;
                            for (const r of detail.routes) {
                                page += `| \`${r.method}\` | \`${r.path}\` | \`${r.handlerName}\` |\n`;
                            }
                            page += `\n`;
                        }

                        // DB operations
                        if (detail.dbOps.length > 0) {
                            page += `### Database Operations\n\n`;
                            page += `| Table | Operation | Function |\n|---|---|---|\n`;
                            for (const db of detail.dbOps) {
                                const op = db.operation === 'READS_FROM' ? '📖 READ' : '✏️ WRITE';
                                page += `| \`${db.tableName}\` | ${op} | \`${db.functionName}\` |\n`;
                            }
                            page += `\n`;
                        }

                        // External API calls
                        if (detail.apiCalls.length > 0) {
                            page += `### External API Calls\n\n`;
                            page += `| Endpoint | Method | Function |\n|---|---|---|\n`;
                            for (const api of detail.apiCalls) {
                                page += `| \`${api.endpoint}\` | \`${api.method}\` | \`${api.functionName}\` |\n`;
                            }
                            page += `\n`;
                        }

                        // Env vars
                        if (detail.envVars.length > 0) {
                            page += `### Environment Variables\n\n`;
                            const uniqueVars = [...new Set(detail.envVars.map(e => e.varName))];
                            page += uniqueVars.map(v => `- \`${v}\``).join('\n') + '\n\n';
                        }

                        page += `---\n\n`;
                    }

                    writeFileSync(join(opts.out, 'modules', `${filename}.md`), page);
                    moduleCount++;
                }
                console.log(`  📁 ${join(opts.out, 'modules/')} (${moduleCount} modules)`);
            }

            console.log(`\n  ✅ Wiki generated in ${opts.out}/\n`);
        } catch (err) {
            console.error(`  ❌ Error: ${err instanceof Error ? err.message : String(err)}\n`);
        } finally {
            await graph.disconnect();
        }
    });
