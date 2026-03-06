import { Command } from 'commander';
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { loadConfigFromEnv, validateConfig } from '@nomik/core';
import { createGraphService } from '@nomik/graph';
import { readProjectConfig } from '../utils/project-config.js';

interface AuditVulnerability {
    name: string;
    severity: string;
    title: string;
    url: string;
    range: string;
    fixAvailable: boolean | { name: string; version: string };
}

interface AuditResult {
    vulnerabilities: AuditVulnerability[];
    summary: { total: number; critical: number; high: number; moderate: number; low: number };
    blastRadius: Array<{ package: string; severity: string; importedBy: Array<{ filePath: string; importName: string }> }>;
}

function detectPackageManager(cwd: string): 'pnpm' | 'npm' | 'yarn' {
    if (existsSync(path.join(cwd, 'pnpm-lock.yaml'))) return 'pnpm';
    if (existsSync(path.join(cwd, 'yarn.lock'))) return 'yarn';
    return 'npm';
}

function runAudit(cwd: string): AuditVulnerability[] {
    const pm = detectPackageManager(cwd);
    const vulnerabilities: AuditVulnerability[] = [];

    try {
        let output: string;
        if (pm === 'pnpm') {
            output = execSync('pnpm audit --json 2>&1', { cwd, encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 });
        } else if (pm === 'yarn') {
            output = execSync('yarn audit --json 2>&1', { cwd, encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 });
        } else {
            output = execSync('npm audit --json 2>&1', { cwd, encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 });
        }

        // Parse the JSON output
        try {
            const parsed = JSON.parse(output);

            if (pm === 'pnpm') {
                // pnpm audit --json returns { advisories: { id: { ... } } }
                const advisories = parsed.advisories ?? parsed.vulnerabilities ?? {};
                for (const [name, info] of Object.entries<any>(advisories)) {
                    vulnerabilities.push({
                        name: info.module_name ?? info.name ?? name,
                        severity: info.severity ?? 'unknown',
                        title: info.title ?? info.overview ?? '',
                        url: info.url ?? '',
                        range: info.vulnerable_versions ?? info.range ?? '',
                        fixAvailable: info.fixAvailable ?? false,
                    });
                }
            } else {
                // npm audit --json returns { vulnerabilities: { pkg: { ... } } }
                const vulns = parsed.vulnerabilities ?? {};
                for (const [name, info] of Object.entries<any>(vulns)) {
                    vulnerabilities.push({
                        name,
                        severity: info.severity ?? 'unknown',
                        title: info.title ?? (info.via?.[0]?.title) ?? '',
                        url: info.url ?? (info.via?.[0]?.url) ?? '',
                        range: info.range ?? '',
                        fixAvailable: info.fixAvailable ?? false,
                    });
                }
            }
        } catch {
            // If JSON parsing fails, try line-by-line (yarn audit --json outputs NDJSON)
            for (const line of output.split('\n').filter(Boolean)) {
                try {
                    const entry = JSON.parse(line);
                    if (entry.type === 'auditAdvisory' && entry.data?.advisory) {
                        const adv = entry.data.advisory;
                        vulnerabilities.push({
                            name: adv.module_name ?? '',
                            severity: adv.severity ?? 'unknown',
                            title: adv.title ?? '',
                            url: adv.url ?? '',
                            range: adv.vulnerable_versions ?? '',
                            fixAvailable: false,
                        });
                    }
                } catch { /* skip non-JSON lines */ }
            }
        }
    } catch (err: any) {
        // npm/pnpm audit exits with non-zero when vulnerabilities are found
        // Try to parse stdout anyway
        const output = err.stdout ?? err.output?.[1] ?? '';
        if (typeof output === 'string' && output.trim().startsWith('{')) {
            try {
                const parsed = JSON.parse(output);
                const vulns = parsed.vulnerabilities ?? parsed.advisories ?? {};
                for (const [name, info] of Object.entries<any>(vulns)) {
                    vulnerabilities.push({
                        name: info.module_name ?? info.name ?? name,
                        severity: info.severity ?? 'unknown',
                        title: info.title ?? (info.via?.[0]?.title) ?? '',
                        url: info.url ?? (info.via?.[0]?.url) ?? '',
                        range: info.range ?? info.vulnerable_versions ?? '',
                        fixAvailable: info.fixAvailable ?? false,
                    });
                }
            } catch { /* ignore */ }
        }
    }

    return vulnerabilities;
}

export const auditCommand = new Command('audit')
    .description('Check dependency vulnerabilities and show blast radius in the knowledge graph')
    .option('--project <name>', 'Project name')
    .option('--json', 'Output raw JSON')
    .option('--ci', 'Exit 1 if critical or high vulnerabilities found')
    .action(async (opts) => {
        const cwd = process.cwd();
        const envConfig = loadConfigFromEnv();
        const config = validateConfig({ ...envConfig, target: { root: '.' } });
        const local = readProjectConfig();
        const projectId = opts.project ?? local?.projectId;

        console.log('');
        console.log(`  \x1b[36m\x1b[1mNOMIK Dependency Audit\x1b[0m`);
        console.log(`  Package manager: ${detectPackageManager(cwd)}`);
        console.log('  Running audit...');

        const vulnerabilities = runAudit(cwd);

        const summary = {
            total: vulnerabilities.length,
            critical: vulnerabilities.filter(v => v.severity === 'critical').length,
            high: vulnerabilities.filter(v => v.severity === 'high').length,
            moderate: vulnerabilities.filter(v => v.severity === 'moderate').length,
            low: vulnerabilities.filter(v => v.severity === 'low').length,
        };

        // Cross-reference with knowledge graph for blast radius
        const blastRadius: AuditResult['blastRadius'] = [];
        const graph = createGraphService(config.graph);

        try {
            await graph.connect();

            for (const vuln of vulnerabilities) {
                // Search for files that import this package
                const importers = await graph.executeQuery<{ filePath: string; importName: string }>(
                    `MATCH (f:File)-[d:DEPENDS_ON]->(target)
                     WHERE d.source CONTAINS $pkgName ${projectId ? 'AND f.projectId = $projectId' : ''}
                     RETURN DISTINCT f.path as filePath, d.source as importName
                     LIMIT 20`,
                    { pkgName: vuln.name, projectId },
                );

                // Also check import nodes directly
                const directImports = await graph.executeQuery<{ filePath: string; importName: string }>(
                    `MATCH (f:File ${projectId ? '{projectId: $projectId}' : ''})-[:CONTAINS]->(fn:Function)
                     WHERE fn.name IS NOT NULL
                     WITH f
                     MATCH (f)-[d:DEPENDS_ON]->(m)
                     WHERE m.name CONTAINS $pkgName OR m.path CONTAINS $pkgName
                     RETURN DISTINCT f.path as filePath, COALESCE(m.name, m.path) as importName
                     LIMIT 20`,
                    { pkgName: vuln.name, projectId },
                );

                const allImporters = [...importers, ...directImports];
                const unique = new Map<string, { filePath: string; importName: string }>();
                for (const imp of allImporters) {
                    if (!unique.has(imp.filePath)) unique.set(imp.filePath, imp);
                }

                if (unique.size > 0) {
                    blastRadius.push({
                        package: vuln.name,
                        severity: vuln.severity,
                        importedBy: Array.from(unique.values()),
                    });
                }
            }
        } catch {
            // If Neo4j is not available, just skip blast radius
        } finally {
            try { await graph.disconnect(); } catch { /* ignore */ }
        }

        const result: AuditResult = { vulnerabilities, summary, blastRadius };

        if (opts.json) {
            console.log(JSON.stringify(result, null, 2));
        } else {
            console.log('');
            if (vulnerabilities.length === 0) {
                console.log('  \x1b[32m\u2713 No vulnerabilities found\x1b[0m\n');
            } else {
                console.log(`  \x1b[33mFound ${summary.total} vulnerabilities:\x1b[0m`);
                if (summary.critical > 0) console.log(`    \x1b[31m\u25CF Critical: ${summary.critical}\x1b[0m`);
                if (summary.high > 0) console.log(`    \x1b[31m\u25CF High:     ${summary.high}\x1b[0m`);
                if (summary.moderate > 0) console.log(`    \x1b[33m\u25CF Moderate: ${summary.moderate}\x1b[0m`);
                if (summary.low > 0) console.log(`    \x1b[90m\u25CF Low:      ${summary.low}\x1b[0m`);
                console.log('');

                // Show top vulnerabilities
                const sorted = [...vulnerabilities].sort((a, b) => {
                    const order: Record<string, number> = { critical: 0, high: 1, moderate: 2, low: 3 };
                    return (order[a.severity] ?? 4) - (order[b.severity] ?? 4);
                });

                for (const v of sorted.slice(0, 15)) {
                    const color = v.severity === 'critical' || v.severity === 'high' ? '\x1b[31m' : v.severity === 'moderate' ? '\x1b[33m' : '\x1b[90m';
                    console.log(`  ${color}\u25CF ${v.severity.toUpperCase()}\x1b[0m  ${v.name}: ${v.title || '(no title)'}`);
                    if (v.url) console.log(`    \x1b[90m${v.url}\x1b[0m`);
                }
                if (sorted.length > 15) console.log(`  \x1b[90m... and ${sorted.length - 15} more\x1b[0m`);
                console.log('');

                // Show blast radius
                if (blastRadius.length > 0) {
                    console.log(`  \x1b[36m\x1b[1mBlast Radius (graph-traced)\x1b[0m`);
                    console.log('');
                    for (const b of blastRadius.slice(0, 10)) {
                        const color = b.severity === 'critical' || b.severity === 'high' ? '\x1b[31m' : '\x1b[33m';
                        console.log(`  ${color}\u25CF ${b.package}\x1b[0m \u2014 imported by ${b.importedBy.length} file(s)`);
                        for (const imp of b.importedBy.slice(0, 5)) {
                            console.log(`    \x1b[90m\u2502\x1b[0m ${imp.filePath}`);
                        }
                        if (b.importedBy.length > 5) {
                            console.log(`    \x1b[90m\u2502 ... and ${b.importedBy.length - 5} more\x1b[0m`);
                        }
                    }
                    console.log('');
                }
            }
        }

        if (opts.ci && (summary.critical > 0 || summary.high > 0)) {
            process.exit(1);
        }
    });
