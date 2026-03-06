import { Command } from 'commander';
import { loadConfigFromEnv, validateConfig } from '@nomik/core';
import { createGraphService } from '@nomik/graph';
import { readProjectConfig } from '../utils/project-config.js';

export const explainCommand = new Command('explain')
    .description('Explain a symbol — show its role, callers, callees, and relationships')
    .argument('<symbol>', 'Name of the function/class/variable to explain')
    .option('--json', 'Output as JSON')
    .action(async (symbol: string, opts: { json?: boolean }) => {
        const envConfig = loadConfigFromEnv();
        const config = validateConfig({
            ...envConfig,
            target: { root: '.' },
        });

        const graph = createGraphService(config.graph);

        try {
            await graph.connect();

            const projectId = readProjectConfig()?.projectId;
            const result = await graph.getExplain(symbol, projectId);

            if (opts.json) {
                console.log(JSON.stringify(result, null, 2));
                return;
            }

            if (!result.symbol) {
                console.log(`\n  ❌ Symbol "${symbol}" not found in the graph.\n`);
                console.log('  Hint: Run `nomik scan .` first, then try with the exact function/class name.\n');
                return;
            }

            const s = result.symbol;
            console.log(`\n🔍 ${s.type} ${s.name}`);
            console.log(`${'─'.repeat(50)}`);
            console.log(`  📁 File:     ${s.filePath}`);
            if (s.startLine > 0) console.log(`  📍 Lines:    ${s.startLine}–${s.endLine}`);
            console.log(`  📤 Exported: ${s.isExported ? 'yes' : 'no'}`);
            if (s.bodyHash) console.log(`  🔗 Hash:     ${s.bodyHash.substring(0, 12)}...`);
            if (result.containedIn) console.log(`  📦 In file:  ${result.containedIn} (${result.siblingCount} siblings)`);

            // Group edges by type
            const inByType = new Map<string, Array<{ name: string; type: string; file: string }>>();
            for (const e of result.incomingEdges) {
                const arr = inByType.get(e.edgeType) ?? [];
                arr.push({ name: e.sourceName, type: e.sourceType, file: e.filePath });
                inByType.set(e.edgeType, arr);
            }

            const outByType = new Map<string, Array<{ name: string; type: string; file: string }>>();
            for (const e of result.outgoingEdges) {
                const arr = outByType.get(e.edgeType) ?? [];
                arr.push({ name: e.targetName, type: e.targetType, file: e.filePath });
                outByType.set(e.edgeType, arr);
            }

            if (inByType.size > 0) {
                console.log(`\n  ⬅️  Incoming (${result.incomingEdges.length} edges):`);
                for (const [edgeType, items] of inByType) {
                    console.log(`    ${edgeType}:`);
                    for (const item of items.slice(0, 10)) {
                        console.log(`      ← ${item.type.padEnd(10)} ${item.name}`);
                    }
                    if (items.length > 10) console.log(`      ... and ${items.length - 10} more`);
                }
            }

            if (outByType.size > 0) {
                console.log(`\n  ➡️  Outgoing (${result.outgoingEdges.length} edges):`);
                for (const [edgeType, items] of outByType) {
                    console.log(`    ${edgeType}:`);
                    for (const item of items.slice(0, 10)) {
                        console.log(`      → ${item.type.padEnd(10)} ${item.name}`);
                    }
                    if (items.length > 10) console.log(`      ... and ${items.length - 10} more`);
                }
            }

            if (inByType.size === 0 && outByType.size === 0) {
                console.log('\n  ⚠️  No relationships found — this symbol may be dead code.');
            }

            // Summary line
            const callers = result.incomingEdges.filter(e => e.edgeType === 'CALLS').length;
            const callees = result.outgoingEdges.filter(e => e.edgeType === 'CALLS').length;
            console.log(`\n  📊 Summary: ${callers} caller(s), ${callees} callee(s), ${result.incomingEdges.length + result.outgoingEdges.length} total edges\n`);
        } catch (err) {
            console.error(`  ❌ Error: ${err instanceof Error ? err.message : String(err)}\n`);
        } finally {
            await graph.disconnect();
        }
    });
