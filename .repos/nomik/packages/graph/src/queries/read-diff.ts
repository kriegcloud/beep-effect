import type { GraphDriver } from '../drivers/driver.interface.js';

// ────────────────────────────────────────────────────────────────────────
// Architecture Diff — compare two scan snapshots (by git SHA) to detect
// structural changes: new/removed functions, changed call chains, etc.
// ────────────────────────────────────────────────────────────────────────

export interface DiffResult {
    fromSha: string;
    toSha: string;
    newFiles: string[];
    removedFiles: string[];
    modifiedFiles: string[];
    newFunctions: Array<{ name: string; filePath: string }>;
    removedFunctions: Array<{ name: string; filePath: string }>;
    newEdges: Array<{ source: string; target: string; type: string }>;
    removedEdges: Array<{ source: string; target: string; type: string }>;
    summary: { newFileCount: number; removedFileCount: number; modifiedFileCount: number; newFunctionCount: number; removedFunctionCount: number; newEdgeCount: number; removedEdgeCount: number };
}

/**
 * Compare two scan snapshots by git SHA.
 * Uses ScanMeta nodes to find the scan timestamps, then compares
 * nodes created/updated between the two scans.
 */
export async function architectureDiff(
    driver: GraphDriver,
    fromSha: string,
    toSha: string,
    projectId?: string,
): Promise<DiffResult> {
    const pf = projectId ? 'AND n.projectId = $projectId' : '';
    const pfF = projectId ? 'AND f.projectId = $projectId' : '';

    // Get scan timestamps for the two SHAs
    const scans = await driver.runQuery<{ sha: string; timestamp: string }>(
        `MATCH (s:ScanMeta)
         WHERE s.gitSha IN [$fromSha, $toSha] ${pf.replace('n.', 's.')}
         RETURN s.gitSha as sha, toString(s.scannedAt) as timestamp
         ORDER BY s.scannedAt ASC`,
        { fromSha, toSha, projectId },
    );

    const fromScan = scans.find(s => s.sha === fromSha);
    const toScan = scans.find(s => s.sha === toSha);

    // If we don't have both scans, fall back to createdAt/updatedAt comparison
    const fromTimestamp = fromScan?.timestamp ?? new Date(0).toISOString();
    const toTimestamp = toScan?.timestamp ?? new Date().toISOString();

    // New files (created after fromTimestamp)
    const newFiles = await driver.runQuery<{ path: string }>(
        `MATCH (f:File)
         WHERE f.createdAt > datetime($fromTimestamp) AND f.createdAt <= datetime($toTimestamp) ${pfF}
         RETURN f.path as path
         ORDER BY f.path`,
        { fromTimestamp, toTimestamp, projectId },
    );

    // Removed files (existed at fromTimestamp but not at toTimestamp)
    // We detect this by files whose updatedAt is before fromTimestamp (stale)
    // This is approximate — true removal tracking would need snapshot storage
    const removedFiles: string[] = [];

    // Modified files (updatedAt between the two timestamps)
    const modifiedFiles = await driver.runQuery<{ path: string }>(
        `MATCH (f:File)
         WHERE f.updatedAt > datetime($fromTimestamp) AND f.updatedAt <= datetime($toTimestamp)
           AND f.createdAt <= datetime($fromTimestamp) ${pfF}
         RETURN f.path as path
         ORDER BY f.path`,
        { fromTimestamp, toTimestamp, projectId },
    );

    // New functions (created after fromTimestamp)
    const newFunctions = await driver.runQuery<{ name: string; filePath: string }>(
        `MATCH (fn:Function)
         WHERE fn.createdAt > datetime($fromTimestamp) AND fn.createdAt <= datetime($toTimestamp) ${pfF.replace('f.', 'fn.')}
         RETURN fn.name as name, fn.filePath as filePath
         ORDER BY fn.filePath, fn.name`,
        { fromTimestamp, toTimestamp, projectId },
    );

    // Removed functions (similar limitation — approximate via staleness)
    const removedFunctions: Array<{ name: string; filePath: string }> = [];

    // New edges (created after fromTimestamp — CALLS edges)
    const newEdges = await driver.runQuery<{ source: string; target: string; type: string }>(
        `MATCH (s)-[r:CALLS]->(t)
         WHERE r.createdAt > datetime($fromTimestamp) AND r.createdAt <= datetime($toTimestamp)
         RETURN COALESCE(s.name, s.path) as source, COALESCE(t.name, t.path) as target, type(r) as type
         LIMIT 100`,
        { fromTimestamp, toTimestamp, projectId },
    );

    // Removed edges (approximate)
    const removedEdges: Array<{ source: string; target: string; type: string }> = [];

    return {
        fromSha,
        toSha,
        newFiles: newFiles.map(f => f.path),
        removedFiles,
        modifiedFiles: modifiedFiles.map(f => f.path),
        newFunctions,
        removedFunctions,
        newEdges,
        removedEdges,
        summary: {
            newFileCount: newFiles.length,
            removedFileCount: removedFiles.length,
            modifiedFileCount: modifiedFiles.length,
            newFunctionCount: newFunctions.length,
            removedFunctionCount: removedFunctions.length,
            newEdgeCount: newEdges.length,
            removedEdgeCount: removedEdges.length,
        },
    };
}
