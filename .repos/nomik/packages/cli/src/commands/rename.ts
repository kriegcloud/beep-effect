import { Command } from 'commander';
import { loadConfigFromEnv, validateConfig } from '@nomik/core';
import { createGraphService } from '@nomik/graph';
import { readProjectConfig } from '../utils/project-config.js';
import fs from 'node:fs';

export const renameCommand = new Command('rename')
    .description('Graph-aware rename — find all references to a symbol and generate rename instructions')
    .argument('<old-name>', 'Current symbol name')
    .argument('<new-name>', 'New symbol name')
    .option('--apply', 'Apply the rename to source files (default: dry-run)')
    .option('--json', 'Output as JSON')
    .action(async (oldName: string, newName: string, opts: { apply?: boolean; json?: boolean }) => {
        const envConfig = loadConfigFromEnv();
        const config = validateConfig({
            ...envConfig,
            target: { root: '.' },
        });

        const graph = createGraphService(config.graph);

        try {
            await graph.connect();
            const projectId = readProjectConfig()?.projectId;

            // Step 1: Find the symbol
            const explain = await graph.getExplain(oldName, projectId);
            if (!explain.symbol) {
                console.error(`  ❌ Symbol "${oldName}" not found in the knowledge graph\n`);
                console.error('  Hint: run `nomik scan` first, then use the exact function/class name\n');
                process.exit(1);
            }

            // Step 2: Collect all references (callers, files that import it, etc.)
            const references: Array<{ filePath: string; type: string; context: string }> = [];

            // The symbol's own file
            if (explain.symbol.filePath) {
                references.push({
                    filePath: explain.symbol.filePath,
                    type: 'definition',
                    context: `${explain.symbol.type}: ${oldName} (line ${explain.symbol.startLine}-${explain.symbol.endLine})`,
                });
            }

            // Callers (incoming CALLS edges)
            for (const e of explain.incomingEdges) {
                if (e.edgeType === 'CALLS' && e.filePath) {
                    references.push({
                        filePath: e.filePath,
                        type: 'caller',
                        context: `${e.sourceType}:${e.sourceName} calls ${oldName}`,
                    });
                }
                if (e.edgeType === 'DEPENDS_ON' && e.filePath) {
                    references.push({
                        filePath: e.filePath,
                        type: 'import',
                        context: `${e.sourceType}:${e.sourceName} imports ${oldName}`,
                    });
                }
            }

            // Callees that reference this symbol (outgoing)
            for (const e of explain.outgoingEdges) {
                if (e.edgeType === 'EXPORTS' && e.filePath) {
                    references.push({
                        filePath: e.filePath,
                        type: 'export',
                        context: `exports ${oldName}`,
                    });
                }
            }

            // Deduplicate by filePath
            const uniqueRefs = new Map<string, typeof references>();
            for (const ref of references) {
                if (!uniqueRefs.has(ref.filePath)) uniqueRefs.set(ref.filePath, []);
                uniqueRefs.get(ref.filePath)!.push(ref);
            }

            const affectedFiles = [...uniqueRefs.entries()].map(([filePath, refs]) => ({
                filePath,
                references: refs,
                exists: fs.existsSync(filePath),
            }));

            // Step 3: If --apply, do the rename in source files
            let applied = 0;
            if (opts.apply) {
                for (const file of affectedFiles) {
                    if (!file.exists) continue;
                    const content = fs.readFileSync(file.filePath, 'utf-8');
                    // Use word-boundary-aware replacement
                    const regex = new RegExp(`\\b${escapeRegex(oldName)}\\b`, 'g');
                    const newContent = content.replace(regex, newName);
                    if (newContent !== content) {
                        fs.writeFileSync(file.filePath, newContent, 'utf-8');
                        applied++;
                    }
                }
            }

            if (opts.json) {
                console.log(JSON.stringify({
                    symbol: explain.symbol,
                    oldName,
                    newName,
                    affectedFiles: affectedFiles.map(f => ({
                        filePath: f.filePath,
                        exists: f.exists,
                        references: f.references.map(r => ({ type: r.type, context: r.context })),
                    })),
                    applied: opts.apply ? applied : undefined,
                    dryRun: !opts.apply,
                }, null, 2));
                return;
            }

            console.log(`\n✏️  Graph-Aware Rename: ${oldName} → ${newName}\n`);
            console.log(`  Symbol: ${explain.symbol.type} in ${explain.symbol.filePath}`);
            console.log(`  Lines:  ${explain.symbol.startLine}-${explain.symbol.endLine}`);
            console.log(`  Edges:  ${explain.incomingEdges.length} incoming, ${explain.outgoingEdges.length} outgoing\n`);

            console.log(`  📁 Affected files (${affectedFiles.length}):\n`);
            for (const file of affectedFiles) {
                const shortPath = file.filePath.split(/[/\\]/).slice(-3).join('/');
                const status = file.exists ? '' : ' \x1b[31m(file not found)\x1b[0m';
                console.log(`  ${shortPath}${status}`);
                for (const ref of file.references) {
                    const icon = ref.type === 'definition' ? '📍' : ref.type === 'caller' ? '📞' : ref.type === 'import' ? '📦' : '📤';
                    console.log(`    ${icon} ${ref.context}`);
                }
            }

            console.log('');
            if (opts.apply) {
                console.log(`  ✅ Applied rename to ${applied} file(s)`);
                console.log('  Run `nomik scan` to update the knowledge graph.\n');
            } else {
                console.log('  \x1b[2mDry run — no files changed. Use --apply to rename.\x1b[0m\n');
            }
        } catch (err) {
            console.error(`  ❌ Error: ${err instanceof Error ? err.message : String(err)}\n`);
        } finally {
            await graph.disconnect();
        }
    });

function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
