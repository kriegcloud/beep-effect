import path from 'node:path';
import { watch, type FSWatcher } from 'chokidar';
import { getLogger } from '@nomik/core';
import type { GraphService } from '@nomik/graph';
import type { ParserEngine } from '@nomik/parser';
import { isSupportedFile } from '@nomik/parser';

export interface WatcherOptions {
    root: string;
    debounceMs?: number;
    ignored?: string[];
    projectId: string;
}

export interface WatcherService {
    start(): Promise<void>;
    stop(): Promise<void>;
    isRunning(): boolean;
}

/** Creates a watcher that incrementally updates the graph */
export function createWatcher(
    options: WatcherOptions,
    parser: ParserEngine,
    graph: GraphService,
): WatcherService {
    const logger = getLogger();
    const debounceMs = options.debounceMs ?? 500;
    let fsWatcher: FSWatcher | null = null;
    let running = false;

    const pendingFiles = new Map<string, NodeJS.Timeout>();

    /** Exclude node_modules, dist, .git, docker paths even if symlinks bypass chokidar glob */
    function isExcludedPath(filePath: string): boolean {
        const normalized = filePath.replace(/\\/g, '/');
        return /\/node_modules\//.test(normalized)
            || /\/dist\//.test(normalized)
            || /\/\.git\//.test(normalized)
            || /\/docker\//.test(normalized);
    }

    /** Re-parse and re-ingest a modified file */
    async function handleFileChange(filePath: string): Promise<void> {
        const abs = path.resolve(filePath);
        if (isExcludedPath(abs)) return;
        if (!isSupportedFile(abs)) return;

        try {
            const result = await parser.parseFile(abs);
            await graph.ingestFileData(result.nodes, result.edges, result.file.path, options.projectId);
            logger.info({ filePath: abs, nodes: result.nodes.length, edges: result.edges.length }, 'file re-indexed');

            // Real-time impact warnings
            await emitImpactWarnings(abs, result.nodes, options.projectId);
        } catch (err) {
            logger.warn({ filePath: abs, error: err instanceof Error ? err.message : String(err) }, 'watch re-index failed');
        }
    }

    /** Emit real-time impact warnings for changed functions */
    async function emitImpactWarnings(filePath: string, nodes: Array<{ type: string; name?: string }>, projectId: string): Promise<void> {
        try {
            const functionNames = nodes
                .filter(n => n.type === 'function' && n.name)
                .map(n => n.name!);

            if (functionNames.length === 0) return;

            const pf = projectId ? 'AND fn.projectId = $projectId' : '';
            const impacts = await graph.executeQuery<{
                name: string; callerCount: number; callers: string[];
            }>(
                `MATCH (fn:Function)
                 WHERE fn.name IN $names AND fn.filePath CONTAINS $filePath ${pf}
                 OPTIONAL MATCH (caller)-[:CALLS]->(fn)
                 WITH fn, count(DISTINCT caller) as callerCount,
                      collect(DISTINCT caller.name)[..5] as callers
                 WHERE callerCount > 0
                 RETURN fn.name as name, callerCount, callers
                 ORDER BY callerCount DESC
                 LIMIT 10`,
                { names: functionNames, filePath: filePath.replace(/\\/g, '/'), projectId },
            );

            for (const imp of impacts) {
                if (imp.callerCount >= 10) {
                    logger.warn({ function: imp.name, callers: imp.callerCount, topCallers: imp.callers },
                        `⚠️  HIGH IMPACT: ${imp.name} has ${imp.callerCount} callers`);
                } else if (imp.callerCount >= 5) {
                    logger.info({ function: imp.name, callers: imp.callerCount, topCallers: imp.callers },
                        `📢 ${imp.name} affects ${imp.callerCount} callers`);
                }
            }

            // Check for DB table impact
            const dbImpact = await graph.executeQuery<{ fnName: string; tableName: string; rel: string }>(
                `MATCH (fn:Function)-[r:READS_FROM|WRITES_TO]->(t:DBTable)
                 WHERE fn.name IN $names AND fn.filePath CONTAINS $filePath ${pf}
                 RETURN fn.name as fnName, t.name as tableName, type(r) as rel
                 LIMIT 10`,
                { names: functionNames, filePath: filePath.replace(/\\/g, '/'), projectId },
            );

            for (const db of dbImpact) {
                logger.warn({ function: db.fnName, table: db.tableName, operation: db.rel },
                    `🗄️  DB impact: ${db.fnName} ${db.rel} ${db.tableName}`);
            }
        } catch {
            // Non-critical — don't fail the re-index if impact analysis errors
        }
    }

    /** Debounce to avoid change bursts */
    function scheduleReindex(filePath: string): void {
        const existing = pendingFiles.get(filePath);
        if (existing) clearTimeout(existing);

        const timeout = setTimeout(() => {
            pendingFiles.delete(filePath);
            handleFileChange(filePath);
        }, debounceMs);
        pendingFiles.set(filePath, timeout);
    }

    async function start(): Promise<void> {
        if (running) return;

        const root = path.resolve(options.root);
        const ignored = options.ignored ?? ['**/node_modules/**', '**/dist/**', '**/.git/**', '**/docker/**'];

        fsWatcher = watch(root, {
            ignored,
            persistent: true,
            ignoreInitial: true,
            followSymlinks: false,
        });

        fsWatcher.on('change', (fp) => scheduleReindex(fp as string));
        fsWatcher.on('add', (fp) => scheduleReindex(fp as string));
        fsWatcher.on('unlink', (fp) => {
            const abs = path.resolve(fp as string);
            logger.info({ filePath: abs }, 'file deleted — cleaning graph');
            graph.ingestFileData([], [], abs, options.projectId).catch(() => {});
        });

        running = true;
        logger.info({ root, debounceMs }, 'watcher started');
    }

    async function stop(): Promise<void> {
        if (!running || !fsWatcher) return;

        for (const timeout of pendingFiles.values()) {
            clearTimeout(timeout);
        }
        pendingFiles.clear();

        await fsWatcher.close();
        fsWatcher = null;
        running = false;
        logger.info('watcher stopped');
    }

    return {
        start,
        stop,
        isRunning: () => running,
    };
}
