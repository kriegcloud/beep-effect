import { Command } from 'commander';
import { loadConfigFromEnv, validateConfig } from '@nomik/core';
import { createGraphService } from '@nomik/graph';
import { readProjectConfig } from '../utils/project-config.js';
import fs from 'node:fs';

export const changelogCommand = new Command('changelog')
    .description('Auto-generate a changelog from knowledge graph changes')
    .option('--since <date>', 'ISO date or relative (e.g. "24h", "7d", "2026-02-19")')
    .option('--project <name>', 'Project name')
    .option('--json', 'Output raw JSON')
    .option('--out <file>', 'Write changelog to a file')
    .option('--format <fmt>', 'Output format: markdown or json', 'markdown')
    .action(async (opts) => {
        const envConfig = loadConfigFromEnv();
        const config = validateConfig({ ...envConfig, target: { root: '.' } });
        const local = readProjectConfig();
        const projectId = opts.project ?? local?.projectId;
        const graph = createGraphService(config.graph);

        try {
            await graph.connect();

            // Parse --since into ISO date
            const sinceDate = parseSince(opts.since ?? '24h');

            // Get recent changes from the graph
            const changes = await graph.getRecentChanges(sinceDate, 500, projectId);

            if (changes.length === 0) {
                console.log(`\n  \x1b[90mNo changes found since ${sinceDate}\x1b[0m\n`);
                return;
            }

            // Categorize changes
            const added: typeof changes = [];
            const modified: typeof changes = [];

            for (const c of changes) {
                if (c.createdAt && c.createdAt >= sinceDate) {
                    added.push(c);
                } else {
                    modified.push(c);
                }
            }

            // Group by type
            const groupByType = (items: typeof changes) => {
                const groups: Record<string, typeof changes> = {};
                for (const item of items) {
                    (groups[item.type] ??= []).push(item);
                }
                return groups;
            };

            const addedByType = groupByType(added);
            const modifiedByType = groupByType(modified);

            // Get stats for context
            const stats = await graph.getStats(projectId);

            const changelog = {
                generatedAt: new Date().toISOString(),
                since: sinceDate,
                project: projectId ?? '(all)',
                summary: {
                    totalChanges: changes.length,
                    added: added.length,
                    modified: modified.length,
                },
                stats: {
                    totalNodes: stats.nodeCount,
                    totalEdges: stats.edgeCount,
                    totalFiles: stats.fileCount,
                },
                added: addedByType,
                modified: modifiedByType,
            };

            if (opts.json || opts.format === 'json') {
                const output = JSON.stringify(changelog, null, 2);
                if (opts.out) {
                    fs.writeFileSync(opts.out, output, 'utf-8');
                    console.log(`\n  \x1b[32m\u2713\x1b[0m Changelog written to ${opts.out}\n`);
                } else {
                    console.log(output);
                }
            } else {
                const md = generateMarkdown(changelog);
                if (opts.out) {
                    fs.writeFileSync(opts.out, md, 'utf-8');
                    console.log(`\n  \x1b[32m\u2713\x1b[0m Changelog written to ${opts.out}\n`);
                } else {
                    console.log('');
                    console.log(`  \x1b[36m\x1b[1mNOMIK Changelog\x1b[0m`);
                    console.log(`  Since: ${sinceDate}`);
                    console.log(`  Project: ${projectId ?? '(all)'}`);
                    console.log('');
                    console.log(`  \x1b[32m+ ${added.length} added\x1b[0m  \x1b[33m~ ${modified.length} modified\x1b[0m  \x1b[90m(${changes.length} total)\x1b[0m`);
                    console.log('');

                    if (added.length > 0) {
                        console.log(`  \x1b[90m── Added ──\x1b[0m`);
                        for (const [type, items] of Object.entries(addedByType)) {
                            console.log(`  \x1b[32m+\x1b[0m ${type} (${items.length})`);
                            for (const item of items.slice(0, 5)) {
                                console.log(`    \x1b[90m\u2502\x1b[0m ${item.name} \x1b[90m(${shortenPath(item.filePath)})\x1b[0m`);
                            }
                            if (items.length > 5) {
                                console.log(`    \x1b[90m\u2502 ... and ${items.length - 5} more\x1b[0m`);
                            }
                        }
                        console.log('');
                    }

                    if (modified.length > 0) {
                        console.log(`  \x1b[90m── Modified ──\x1b[0m`);
                        for (const [type, items] of Object.entries(modifiedByType)) {
                            console.log(`  \x1b[33m~\x1b[0m ${type} (${items.length})`);
                            for (const item of items.slice(0, 5)) {
                                console.log(`    \x1b[90m\u2502\x1b[0m ${item.name} \x1b[90m(${shortenPath(item.filePath)})\x1b[0m`);
                            }
                            if (items.length > 5) {
                                console.log(`    \x1b[90m\u2502 ... and ${items.length - 5} more\x1b[0m`);
                            }
                        }
                        console.log('');
                    }
                }
            }
        } catch (err) {
            console.error(`  \x1b[31m\u2717\x1b[0m ${err instanceof Error ? err.message : String(err)}\n`);
            process.exit(1);
        } finally {
            await graph.disconnect();
        }
    });

function parseSince(since: string): string {
    // Relative formats: 24h, 7d, 30d, 1w
    const relMatch = since.match(/^(\d+)(h|d|w|m)$/);
    if (relMatch) {
        const num = Number(relMatch[1]);
        const unit = relMatch[2];
        const now = Date.now();
        const ms = unit === 'h' ? num * 3600_000
            : unit === 'd' ? num * 86400_000
            : unit === 'w' ? num * 604800_000
            : num * 2592000_000; // m = ~30 days
        return new Date(now - ms).toISOString();
    }
    // Try parsing as ISO date
    const d = new Date(since);
    if (!isNaN(d.getTime())) return d.toISOString();
    // Default: 24h ago
    return new Date(Date.now() - 86400_000).toISOString();
}

function shortenPath(filePath: string | null | undefined): string {
    if (!filePath) return '(unknown)';
    const parts = filePath.replace(/\\/g, '/').split('/');
    if (parts.length <= 3) return filePath;
    return `.../${parts.slice(-3).join('/')}`;
}

function generateMarkdown(changelog: any): string {
    const lines: string[] = [];
    lines.push(`# NOMIK Changelog`);
    lines.push('');
    lines.push(`**Generated**: ${changelog.generatedAt}`);
    lines.push(`**Since**: ${changelog.since}`);
    lines.push(`**Project**: ${changelog.project}`);
    lines.push('');
    lines.push(`## Summary`);
    lines.push('');
    lines.push(`- **Total changes**: ${changelog.summary.totalChanges}`);
    lines.push(`- **Added**: ${changelog.summary.added}`);
    lines.push(`- **Modified**: ${changelog.summary.modified}`);
    lines.push(`- **Graph size**: ${changelog.stats.totalNodes} nodes, ${changelog.stats.totalEdges} edges, ${changelog.stats.totalFiles} files`);
    lines.push('');

    if (Object.keys(changelog.added).length > 0) {
        lines.push(`## Added`);
        lines.push('');
        for (const [type, items] of Object.entries<any[]>(changelog.added)) {
            lines.push(`### ${type} (${items.length})`);
            lines.push('');
            for (const item of items.slice(0, 20)) {
                lines.push(`- \`${item.name}\` — ${shortenPath(item.filePath)}`);
            }
            if (items.length > 20) {
                lines.push(`- ... and ${items.length - 20} more`);
            }
            lines.push('');
        }
    }

    if (Object.keys(changelog.modified).length > 0) {
        lines.push(`## Modified`);
        lines.push('');
        for (const [type, items] of Object.entries<any[]>(changelog.modified)) {
            lines.push(`### ${type} (${items.length})`);
            lines.push('');
            for (const item of items.slice(0, 20)) {
                lines.push(`- \`${item.name}\` — ${shortenPath(item.filePath)}`);
            }
            if (items.length > 20) {
                lines.push(`- ... and ${items.length - 20} more`);
            }
            lines.push('');
        }
    }

    return lines.join('\n');
}
