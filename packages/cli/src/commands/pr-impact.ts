import { Command } from 'commander';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { loadConfigFromEnv, validateConfig, createLogger, setLogger, type GraphNode } from '@nomik/core';
import { createParserEngine, getGitDiff, isSupportedFile } from '@nomik/parser';
import { createGraphService, type FileSymbol } from '@nomik/graph';
import { readProjectConfig } from '../utils/project-config.js';

/** Auto-detect the default branch (master or main) */
function detectDefaultBranch(): string {
    try {
        // Check remote HEAD first
        const ref = execSync('git symbolic-ref refs/remotes/origin/HEAD', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
        return ref.replace('refs/remotes/origin/', '');
    } catch {
        // Fallback: check if master or main exists locally
        try {
            execSync('git rev-parse --verify master', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] });
            return 'master';
        } catch {
            return 'main';
        }
    }
}

// ────────────────────────────────────────────────────────────────────────
// PR Impact Analyzer
//
// Workflow:
//   1. git diff <base> → list of changed files + changed line ranges
//   2. Re-parse changed files → find which functions/classes were modified
//   3. Compare old graph symbols vs new parse → detect renames/deletions
//   4. Query graph for each changed/disappeared symbol → blast radius
//   5. Aggregate and print risk report
// ────────────────────────────────────────────────────────────────────────

export type ChangeKind = 'disappeared' | 'modified' | 'added';

export type SymbolType = 'function' | 'class' | 'variable' | 'route';

export interface ChangedSymbol {
    name: string;
    type: SymbolType;
    filePath: string;
    id: string;
    changeKind: ChangeKind;
}

interface ImpactEntry {
    name: string;
    type: string;
    filePath: string;
    depth: number;
    relationship: string;
}

/** Map graph label to lowercase symbol type */
function graphTypeToSymbolType(graphType: string): SymbolType {
    const map: Record<string, SymbolType> = { Function: 'function', Class: 'class', Variable: 'variable', Route: 'route' };
    return map[graphType] ?? 'function';
}

/** Icon for each symbol type */
function symbolIcon(type: SymbolType): string {
    switch (type) {
        case 'function': return '⚡';
        case 'class': return '🏗️';
        case 'variable': return '📦';
        case 'route': return '🌐';
    }
}

/** Tracked node types for pr-impact diff */
const TRACKED_TYPES = new Set(['function', 'class', 'variable', 'route']);

interface TrackedNewNode {
    id: string;
    name: string;
    type: SymbolType;
    startLine: number;
    endLine: number;
}

/** Extract tracked nodes from parse results, normalizing line info */
function extractTrackedNodes(nodes: GraphNode[]): TrackedNewNode[] {
    const result: TrackedNewNode[] = [];
    for (const n of nodes) {
        if (!TRACKED_TYPES.has(n.type)) continue;
        let nodeName: string;
        let sl = 0;
        let el = 0;
        switch (n.type) {
            case 'function':
                nodeName = n.name; sl = n.startLine; el = n.endLine;
                break;
            case 'class':
                nodeName = n.name; sl = n.startLine; el = n.endLine;
                break;
            case 'variable':
                nodeName = n.name; sl = el = n.line;
                break;
            case 'route':
                nodeName = `${n.method} ${n.path}`; sl = 0; el = 0;
                break;
            default:
                continue;
        }
        result.push({ id: n.id, name: nodeName, type: n.type as SymbolType, startLine: sl, endLine: el });
    }
    return result;
}

/**
 * Compare old symbols from the graph with new symbols from re-parsing.
 * Returns categorized changes: disappeared (rename/delete), modified, added.
 * Handles functions, classes, variables, and routes.
 */
export function diffFileSymbols(
    oldSymbols: FileSymbol[],
    newNodes: GraphNode[],
    changedLines: Set<number>,
    filePath: string,
): ChangedSymbol[] {
    const result: ChangedSymbol[] = [];

    const oldByName = new Map<string, FileSymbol>();
    for (const s of oldSymbols) oldByName.set(s.name, s);

    const tracked = extractTrackedNodes(newNodes);
    const newByName = new Map<string, TrackedNewNode>();
    for (const n of tracked) newByName.set(n.name, n);

    // Disappeared: in old graph but NOT in new parse → rename or deletion
    for (const [name, old] of oldByName) {
        if (!newByName.has(name)) {
            result.push({
                name,
                type: graphTypeToSymbolType(old.type),
                filePath,
                id: old.id,
                changeKind: 'disappeared',
            });
        }
    }

    // Modified: exists in both old and new, and overlaps changed lines
    for (const [name, newNode] of newByName) {
        const old = oldByName.get(name);
        if (!old) continue;
        if (newNode.startLine > 0 && newNode.endLine > 0) {
            for (let l = newNode.startLine; l <= newNode.endLine; l++) {
                if (changedLines.has(l)) {
                    result.push({
                        name,
                        type: newNode.type,
                        filePath,
                        id: old.id,
                        changeKind: 'modified',
                    });
                    break;
                }
            }
        }
    }

    // Added: in new parse but NOT in old graph, and overlaps changed lines
    for (const [name, newNode] of newByName) {
        if (oldByName.has(name)) continue;
        if (newNode.startLine > 0 && newNode.endLine > 0) {
            for (let l = newNode.startLine; l <= newNode.endLine; l++) {
                if (changedLines.has(l)) {
                    result.push({
                        name,
                        type: newNode.type,
                        filePath,
                        id: newNode.id,
                        changeKind: 'added',
                    });
                    break;
                }
            }
        }
    }

    return result;
}

export const prImpactCommand = new Command('pr-impact')
    .description('Analyze the blast radius of a PR (git diff → graph traversal → risk report)')
    .option('-b, --base <branch>', 'Base branch to diff against (auto-detects master/main)')
    .option('-s, --since <commit>', 'Diff since a specific commit SHA (direct diff, no merge-base)')
    .option('--depth <n>', 'Maximum traversal depth', '3')
    .option('-j, --json', 'Output raw JSON')
    .action(async (opts: { base?: string; since?: string; depth: string; json?: boolean }) => {
        const logger = createLogger({ level: 'info', pretty: true });
        setLogger(logger);

        // ── Step 1: Git diff ──
        // --since takes precedence: direct diff against commit (no merge-base)
        // --base: diff against branch (uses merge-base for diverged branches)
        const isDirect = !!opts.since;
        const ref = opts.since ?? opts.base ?? detectDefaultBranch();
        const diffLabel = isDirect ? `commit ${ref.slice(0, 8)}` : ref;
        const diff = getGitDiff(ref, undefined, isDirect);

        if (diff.files.length === 0) {
            console.log(`\n  No changes found against ${diffLabel}\n`);
            return;
        }

        // Separate deleted files from changed files
        const deletedFiles = diff.files.filter(f => f.status === 'deleted' && isSupportedFile(f.filePath));
        const changedFiles = diff.files.filter(f => f.status !== 'deleted' && isSupportedFile(f.filePath));
        const totalParseable = changedFiles.length + deletedFiles.length;

        console.log(`\n🔍 PR Impact Analysis (${isDirect ? 'since' : 'base'}: ${diffLabel})`);
        console.log(`   ${diff.totalChangedFiles} files changed, ${diff.totalChangedLines} lines modified`);
        console.log(`   ${totalParseable} parseable source files${deletedFiles.length > 0 ? ` (${deletedFiles.length} deleted)` : ''}\n`);

        if (totalParseable === 0) {
            console.log('  No parseable source files changed.\n');
            return;
        }

        // ── Step 2: Re-parse changed files ──
        const parser = createParserEngine();
        const filePaths = changedFiles.map(f => f.filePath);
        const results = filePaths.length > 0 ? await parser.parseFiles(filePaths) : [];

        // ── Step 3: Connect to Neo4j for graph comparison ──
        const envConfig = loadConfigFromEnv();
        const config = validateConfig({ ...envConfig, target: { root: '.' } });
        const graph = createGraphService(config.graph);
        const projectId = readProjectConfig()?.projectId;
        const depth = parseInt(opts.depth, 10);

        let graphAvailable = false;
        try {
            await graph.connect();
            graphAvailable = true;
        } catch {
            // Graph not available — fall back to parse-only mode
        }

        // ── Step 4: Diff old graph symbols vs new parse per file ──
        const allSymbols: ChangedSymbol[] = [];

        if (graphAvailable) {
            // Changed files: compare graph symbols vs new parse
            for (const result of results) {
                const diffFile = changedFiles.find(f => path.resolve(f.filePath) === result.file.path);
                if (!diffFile) continue;
                const changedLineSet = new Set(diffFile.changedLines);
                const oldSymbols = await graph.getFileSymbols(result.file.path, projectId);
                const fileChanges = diffFileSymbols(oldSymbols, result.nodes, changedLineSet, result.file.path);
                allSymbols.push(...fileChanges);
            }

            // Deleted files: all graph symbols are disappeared
            for (const delFile of deletedFiles) {
                const absPath = path.resolve(delFile.filePath);
                const oldSymbols = await graph.getFileSymbols(absPath, projectId);
                for (const old of oldSymbols) {
                    allSymbols.push({
                        name: old.name,
                        type: graphTypeToSymbolType(old.type),
                        filePath: absPath,
                        id: old.id,
                        changeKind: 'disappeared',
                    });
                }
            }

            // Stale-graph warning: if graph returned 0 old symbols but parse found tracked nodes
            let staleWarningFiles = 0;
            for (const result of results) {
                const diffFile = changedFiles.find(f => path.resolve(f.filePath) === result.file.path);
                if (!diffFile) continue;
                const oldSymbols = await graph.getFileSymbols(result.file.path, projectId);
                const parsedTracked = extractTrackedNodes(result.nodes);
                if (oldSymbols.length === 0 && parsedTracked.length > 0) {
                    staleWarningFiles++;
                }
            }
            if (staleWarningFiles > 0) {
                console.log(`  ⚠️  ${staleWarningFiles} file(s) have no graph data but contain symbols. Run "nomik scan" to update the graph for accurate rename/deletion detection.\n`);
            }
        } else {
            // No graph — fall back to parse-only (no rename/deletion detection)
            for (const result of results) {
                const diffFile = changedFiles.find(f => path.resolve(f.filePath) === result.file.path);
                if (!diffFile) continue;
                const changedLineSet = new Set(diffFile.changedLines);
                const tracked = extractTrackedNodes(result.nodes);
                for (const tn of tracked) {
                    if (tn.startLine > 0 && tn.endLine > 0) {
                        for (let l = tn.startLine; l <= tn.endLine; l++) {
                            if (changedLineSet.has(l)) {
                                allSymbols.push({
                                    name: tn.name,
                                    type: tn.type,
                                    filePath: result.file.path,
                                    id: tn.id,
                                    changeKind: 'modified',
                                });
                                break;
                            }
                        }
                    }
                }
            }
        }

        // Deduplicate by name+filePath
        const seen = new Set<string>();
        const uniqueSymbols = allSymbols.filter(s => {
            const key = `${s.name}:${s.filePath}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });

        // Print detected changes summary
        const disappeared = uniqueSymbols.filter(s => s.changeKind === 'disappeared');
        const modified = uniqueSymbols.filter(s => s.changeKind === 'modified');
        const added = uniqueSymbols.filter(s => s.changeKind === 'added');

        console.log(`   ${uniqueSymbols.length} changed symbols detected:`);
        if (disappeared.length > 0) console.log(`     💀 ${disappeared.length} removed/renamed`);
        if (modified.length > 0) console.log(`     ⚡ ${modified.length} modified`);
        if (added.length > 0) console.log(`     ✨ ${added.length} added`);
        console.log('');

        for (const s of uniqueSymbols) {
            const relPath = path.relative(process.cwd(), s.filePath);
            const icon = s.changeKind === 'disappeared' ? '💀' : s.changeKind === 'added' ? '✨' : symbolIcon(s.type);
            console.log(`     ${icon}  ${s.name}  (${relPath})`);
        }

        if (uniqueSymbols.length === 0) {
            console.log('  No symbol changes detected in diff.\n');
            if (graphAvailable) await graph.disconnect();
            return;
        }

        // ── Step 5: Query graph for blast radius ──
        if (!graphAvailable) {
            console.log('\n  ⚠️  Cannot connect to Neo4j. Showing diff-only analysis (no graph traversal).\n');
            printSummary(uniqueSymbols, opts.json);
            return;
        }

        const allImpacts = new Map<string, { symbol: ChangedSymbol; impacts: ImpactEntry[] }>();

        for (const symbol of uniqueSymbols) {
            const key = `${symbol.name}:${symbol.filePath}`;
            if (symbol.changeKind === 'added') {
                // New symbols have no callers in the graph yet
                allImpacts.set(key, { symbol, impacts: [] });
                continue;
            }
            try {
                // Use ID for precision (avoids name collisions across files)
                const impacts = await graph.getImpact(symbol.id, depth, projectId);
                allImpacts.set(key, { symbol, impacts });
            } catch {
                allImpacts.set(key, { symbol, impacts: [] });
            }
        }

        await graph.disconnect();

        // ── Step 6: Risk report ──
        printReport(uniqueSymbols, allImpacts, opts.json);
    });

/** Classify impacts: real impact vs transitive file-import noise
 *  - CALLS/HANDLES/TRIGGERS/LISTENS_TO/EMITS at any depth → real impact
 *  - DEPENDS_ON at depth 1 → real impact (direct importers of your file)
 *  - DEPENDS_ON at depth 2+ → transitive noise (imports of imports)
 */
const ALWAYS_DIRECT = new Set(['CALLS', 'HANDLES', 'TRIGGERS', 'LISTENS_TO', 'EMITS']);

export function classifyImpacts(impacts: ImpactEntry[]): { direct: ImpactEntry[]; transitive: ImpactEntry[] } {
    const direct = impacts.filter(i => ALWAYS_DIRECT.has(i.relationship) || (i.relationship === 'DEPENDS_ON' && i.depth <= 1));
    const transitive = impacts.filter(i => !ALWAYS_DIRECT.has(i.relationship) && !(i.relationship === 'DEPENDS_ON' && i.depth <= 1));
    return { direct, transitive };
}

function printReport(
    symbols: ChangedSymbol[],
    allImpacts: Map<string, { symbol: ChangedSymbol; impacts: ImpactEntry[] }>,
    json?: boolean,
): void {
    let totalDirectCallers = 0;
    let disappearedWithCallers = 0;
    const symbolStats: Array<{
        name: string;
        type: string;
        filePath: string;
        changeKind: ChangeKind;
        directCount: number;
        transitiveCount: number;
        direct: ImpactEntry[];
        transitive: ImpactEntry[];
    }> = [];

    for (const [_key, { symbol, impacts }] of allImpacts) {
        const { direct, transitive } = classifyImpacts(impacts);
        totalDirectCallers += direct.length;
        if (symbol.changeKind === 'disappeared' && direct.length > 0) {
            disappearedWithCallers += direct.length;
        }
        symbolStats.push({
            name: symbol.name,
            type: symbol.type,
            filePath: symbol.filePath,
            changeKind: symbol.changeKind,
            directCount: direct.length,
            transitiveCount: transitive.length,
            direct,
            transitive,
        });
    }

    const risk = getRiskLevel(totalDirectCallers, symbols.length, disappearedWithCallers);

    if (json) {
        const data = {
            changedSymbols: symbols.length,
            directCallers: totalDirectCallers,
            disappearedWithCallers,
            riskLevel: risk,
            symbols: symbolStats.map(s => ({
                name: s.name,
                type: s.type,
                changeKind: s.changeKind,
                filePath: path.relative(process.cwd(), s.filePath),
                directCallers: s.directCount,
                transitiveImports: s.transitiveCount,
                callers: s.direct.map(i => ({ name: i.name, type: i.type, filePath: i.filePath, depth: i.depth, relationship: i.relationship })),
            })),
        };
        console.log(JSON.stringify(data, null, 2));
        return;
    }

    console.log('\n' + '═'.repeat(60));
    console.log('  📊 PR IMPACT REPORT');
    console.log('═'.repeat(60));

    const riskEmoji = risk === 'HIGH' ? '🔴' : risk === 'MEDIUM' ? '🟡' : '🟢';
    const verdict = risk === 'LOW' ? 'Safe to merge' : risk === 'MEDIUM' ? 'Review recommended' : 'Careful review needed';
    console.log(`\n  ${riskEmoji} ${risk} — ${verdict}`);
    console.log(`  Changed: ${symbols.length} symbols | Direct callers: ${totalDirectCallers}${disappearedWithCallers > 0 ? ` (${disappearedWithCallers} from removed symbols)` : ''}`);

    for (const s of symbolStats) {
        const icon = s.changeKind === 'disappeared' ? '💀' : s.changeKind === 'added' ? '✨' : symbolIcon(s.type as SymbolType);
        const relPath = path.relative(process.cwd(), s.filePath);
        const kindLabel = s.changeKind === 'disappeared' ? ' [REMOVED]' : s.changeKind === 'added' ? ' [NEW]' : '';
        console.log(`\n  ─── ${icon} ${s.name}${kindLabel} ───`);
        console.log(`      file: ${relPath}`);

        if (s.changeKind === 'added') {
            console.log('      ✨ New symbol — no callers yet');
        } else if (s.directCount === 0) {
            console.log('      ✅ No direct callers affected');
        } else {
            const severity = s.changeKind === 'disappeared' ? ' 🚨 BREAKING' : '';
            console.log(`      ${s.directCount} direct caller(s):${severity}`);
            for (const e of s.direct.slice(0, 15)) {
                const eRelPath = e.filePath ? path.relative(process.cwd(), e.filePath) : '';
                console.log(`        ${e.relationship.padEnd(12)} ${e.name}  ${eRelPath ? `(${eRelPath})` : ''}`);
            }
            if (s.direct.length > 15) {
                console.log(`        ... and ${s.direct.length - 15} more`);
            }
        }

        if (s.transitiveCount > 0) {
            console.log(`      ${s.transitiveCount} transitive imports (file-level)`);
        }
    }

    console.log('\n' + '═'.repeat(60) + '\n');
}

function printSummary(symbols: ChangedSymbol[], json?: boolean): void {
    if (json) {
        console.log(JSON.stringify({ changedSymbols: symbols.length, graphAvailable: false }, null, 2));
        return;
    }
    console.log(`  Changed ${symbols.length} symbols. Run "nomik scan" first to enable graph-based impact analysis.\n`);
}

export function getRiskLevel(directCallers: number, changedSymbols: number, disappearedWithCallers: number = 0): 'LOW' | 'MEDIUM' | 'HIGH' {
    // Disappeared symbols with callers = guaranteed breakage → automatic HIGH
    if (disappearedWithCallers > 0) return 'HIGH';
    const avgCallers = changedSymbols > 0 ? directCallers / changedSymbols : 0;
    if (directCallers > 15 || avgCallers > 5) return 'HIGH';
    if (directCallers > 5 || avgCallers > 2) return 'MEDIUM';
    return 'LOW';
}
