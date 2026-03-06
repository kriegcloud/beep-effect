import type { GraphDriver } from '../drivers/driver.interface.js';

// ────────────────────────────────────────────────────────────────────────
// Community Detection — groups related code by CALLS edge density
// Uses connected-component analysis on the CALLS subgraph, then
// groups by file-cluster affinity (functions in the same file cluster).
// ────────────────────────────────────────────────────────────────────────

export interface Community {
    id: number;
    name: string;
    members: Array<{ name: string; type: string; filePath: string }>;
    memberCount: number;
    internalEdges: number;
    externalEdges: number;
    cohesion: number;
}

export interface CommunityResult {
    communities: Community[];
    totalFunctions: number;
    unclustered: number;
}

/**
 * Detect functional communities by analyzing CALLS-graph connectivity.
 * Groups functions that call each other into clusters, scored by cohesion.
 * Uses file-level clustering as base, then refines by cross-file call density.
 */
export async function detectCommunities(
    driver: GraphDriver,
    projectId?: string,
    minSize: number = 3,
): Promise<CommunityResult> {
    const pf = projectId ? 'AND fn.projectId = $projectId' : '';

    // Step 1: Get all functions with their file paths
    const rawFunctions = await driver.runQuery<{
        name: string; filePath: string;
    }>(
        `MATCH (fn:Function)
         WHERE fn.filePath IS NOT NULL ${pf}
         RETURN fn.name as name, fn.filePath as filePath
         ORDER BY fn.filePath`,
        { projectId },
    );

    // Derive directory from filePath in JS (no APOC dependency)
    const functions = rawFunctions.map(fn => {
        const normalized = fn.filePath.replace(/\\/g, '/');
        const lastSlash = normalized.lastIndexOf('/');
        const fileDir = lastSlash >= 0 ? normalized.substring(0, lastSlash) : '';
        return { name: fn.name, filePath: fn.filePath, fileDir };
    });

    // Step 2: Get call pairs between functions
    const callPairs = await driver.runQuery<{
        callerFile: string; calleeFile: string; weight: number;
    }>(
        `MATCH (caller:Function)-[r:CALLS]->(callee:Function)
         WHERE caller.filePath IS NOT NULL AND callee.filePath IS NOT NULL ${pf.replace(/\bfn\./g, 'caller.')}
         RETURN caller.filePath as callerFile, callee.filePath as calleeFile, count(r) as weight`,
        { projectId },
    );

    // Step 3: Build file-level clusters by directory affinity + call density
    // Group files by their directory
    const dirToFiles = new Map<string, Set<string>>();
    for (const fn of functions) {
        if (!dirToFiles.has(fn.fileDir)) dirToFiles.set(fn.fileDir, new Set());
        dirToFiles.get(fn.fileDir)!.add(fn.filePath);
    }

    // Build file-to-file edge weights
    const fileEdges = new Map<string, Map<string, number>>();
    for (const { callerFile, calleeFile, weight } of callPairs) {
        if (callerFile === calleeFile) continue;
        if (!fileEdges.has(callerFile)) fileEdges.set(callerFile, new Map());
        const existing = fileEdges.get(callerFile)!.get(calleeFile) ?? 0;
        fileEdges.get(callerFile)!.set(calleeFile, existing + weight);
    }

    // Union-Find for file clustering
    const parent = new Map<string, string>();
    const allFiles = new Set(functions.map(f => f.filePath));

    function find(x: string): string {
        if (!parent.has(x)) parent.set(x, x);
        if (parent.get(x) !== x) parent.set(x, find(parent.get(x)!));
        return parent.get(x)!;
    }
    function union(a: string, b: string) {
        const ra = find(a), rb = find(b);
        if (ra !== rb) parent.set(ra, rb);
    }

    // Merge files in the same directory
    for (const [, files] of dirToFiles) {
        const arr = [...files];
        for (let i = 1; i < arr.length; i++) union(arr[0]!, arr[i]!);
    }

    // Also merge files with strong call edges (>= 3 calls)
    for (const [src, targets] of fileEdges) {
        for (const [tgt, weight] of targets) {
            if (weight >= 3) union(src, tgt);
        }
    }

    // Build clusters
    const clusterMap = new Map<string, string[]>();
    for (const file of allFiles) {
        const root = find(file);
        if (!clusterMap.has(root)) clusterMap.set(root, []);
        clusterMap.get(root)!.push(file);
    }

    // Step 4: Build community objects with function members
    const fileToFunctions = new Map<string, Array<{ name: string; filePath: string }>>();
    for (const fn of functions) {
        if (!fileToFunctions.has(fn.filePath)) fileToFunctions.set(fn.filePath, []);
        fileToFunctions.get(fn.filePath)!.push({ name: fn.name, filePath: fn.filePath });
    }

    const communities: Community[] = [];
    let communityId = 0;
    let unclustered = 0;

    for (const [, files] of clusterMap) {
        const members: Array<{ name: string; type: string; filePath: string }> = [];
        for (const file of files) {
            for (const fn of fileToFunctions.get(file) ?? []) {
                members.push({ name: fn.name, type: 'Function', filePath: fn.filePath });
            }
        }

        if (members.length < minSize) {
            unclustered += members.length;
            continue;
        }

        // Calculate internal vs external edges
        const clusterFiles = new Set(files);
        let internal = 0;
        let external = 0;
        for (const file of files) {
            const edges = fileEdges.get(file);
            if (!edges) continue;
            for (const [target, weight] of edges) {
                if (clusterFiles.has(target)) internal += weight;
                else external += weight;
            }
        }

        // Derive community name from common directory path
        const dirs = files.map(f => {
            const parts = f.replace(/\\/g, '/').split('/');
            return parts.slice(-3, -1).join('/');
        });
        const commonDir = dirs[0] ?? 'unknown';
        const name = `${commonDir} (${files.length} files)`;

        const cohesion = internal + external > 0 ? internal / (internal + external) : 0;

        communities.push({
            id: communityId++,
            name,
            members,
            memberCount: members.length,
            internalEdges: internal,
            externalEdges: external,
            cohesion: Math.round(cohesion * 100) / 100,
        });
    }

    // Sort by member count descending
    communities.sort((a, b) => b.memberCount - a.memberCount);

    return {
        communities,
        totalFunctions: functions.length,
        unclustered,
    };
}
