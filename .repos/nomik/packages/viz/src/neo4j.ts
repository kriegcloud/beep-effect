import neo4j from 'neo4j-driver';

export const driver = neo4j.driver(
    import.meta.env.VITE_NEO4J_URI || 'bolt://localhost:7687',
    neo4j.auth.basic(
        import.meta.env.VITE_NEO4J_USER || 'neo4j',
        import.meta.env.VITE_NEO4J_PASSWORD || 'nomik_local'
    )
);

/** View mode for progressive loading */
export type ViewMode = 'overview' | 'full';

// ── Query result cache with TTL ──
const CACHE_TTL_MS = 60_000; // 60 seconds
const queryCache = new Map<string, { data: any; ts: number }>();

function cacheKey(prefix: string, projectId?: string): string {
    return `${prefix}:${projectId ?? 'all'}`;
}

function getCached<T>(key: string): T | null {
    const entry = queryCache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.ts > CACHE_TTL_MS) {
        queryCache.delete(key);
        return null;
    }
    return entry.data as T;
}

function setCache(key: string, data: any): void {
    queryCache.set(key, { data, ts: Date.now() });
}

/** Invalidate all cache entries (call after project switch) */
export function invalidateCache(): void {
    queryCache.clear();
}

/** Fetch overview: Files + DEPENDS_ON only (fast for any project size) */
export async function fetchGraphOverview(projectId?: string) {
    const key = cacheKey('overview', projectId);
    const cached = getCached<{ nodes: any[]; edges: any[] }>(key);
    if (cached) { console.log('Overview from cache'); return cached; }

    const session = driver.session();
    try {
        console.log('Fetching overview...', projectId ? `(project: ${projectId})` : '(all)');
        const pf = projectId ? 'WHERE f.projectId = $projectId' : '';
        const pf2 = projectId ? 'AND f.projectId = $projectId AND g.projectId = $projectId' : '';
        const params = { projectId: projectId ?? null };

        // Files with function/class counts for sizing
        const fileResult = await session.run(`
            MATCH (f:File) ${pf}
            OPTIONAL MATCH (f)-[:CONTAINS]->(fn:Function)
            OPTIONAL MATCH (f)-[:CONTAINS]->(cls:Class)
            RETURN f, count(DISTINCT fn) as funcCount, count(DISTINCT cls) as classCount
        `, params);

        // DEPENDS_ON edges between files
        const depResult = await session.run(`
            MATCH (f:File)-[r:DEPENDS_ON]->(g:File)
            WHERE NOT f:ScanMeta AND NOT g:ScanMeta ${pf2}
            RETURN f.id as sourceId, g.id as targetId, r
        `, params);

        const nodes = new Map<string, any>();
        const edges: any[] = [];
        const sanitize = (id: string) => id.replace(/:/g, '_');

        fileResult.records.forEach(record => {
            const f = record.get('f');
            const funcCount = record.get('funcCount')?.toNumber?.() ?? record.get('funcCount') ?? 0;
            const classCount = record.get('classCount')?.toNumber?.() ?? record.get('classCount') ?? 0;
            const nId = sanitize(f.elementId);
            const parts = (f.properties.path ?? '').split(/[/\\]/);
            const name = parts[parts.length - 1] || f.properties.name || 'File';
            nodes.set(nId, {
                data: {
                    ...f.properties,
                    id: nId,
                    label: 'File',
                    name,
                    funcCount,
                    classCount,
                    childCount: funcCount + classCount,
                }
            });
        });

        // Build a lookup from property id to elementId
        const propIdToElementId = new Map<string, string>();
        fileResult.records.forEach(record => {
            const f = record.get('f');
            propIdToElementId.set(f.properties.id, sanitize(f.elementId));
        });

        depResult.records.forEach(record => {
            const r = record.get('r');
            const sourceId = propIdToElementId.get(record.get('sourceId'));
            const targetId = propIdToElementId.get(record.get('targetId'));
            if (sourceId && targetId && nodes.has(sourceId) && nodes.has(targetId)) {
                edges.push({
                    data: {
                        id: sanitize(r.elementId),
                        source: sourceId,
                        target: targetId,
                        label: 'DEPENDS_ON',
                    }
                });
            }
        });

        console.log('Overview loaded:', { nodes: nodes.size, edges: edges.length });
        const result = { nodes: Array.from(nodes.values()), edges };
        setCache(key, result);
        return result;
    } finally {
        await session.close();
    }
}

/** Fetch graph data, optionally filtered by projectId */
export async function fetchGraphData(projectId?: string) {
    const key = cacheKey('fullGraph', projectId);
    const cached = getCached<{ nodes: any[]; edges: any[] }>(key);
    if (cached) { console.log('Full graph from cache'); return cached; }

    const session = driver.session();
    try {
        console.log('Connecting to Neo4j...', projectId ? `(project: ${projectId})` : '(all projects)');
        const projectFilter = projectId
            ? 'AND n.projectId = $projectId AND m.projectId = $projectId'
            : '';
        const queryResult = await session.run(`
      MATCH (n)-[r]->(m)
      WHERE NOT n:ScanMeta AND NOT m:ScanMeta AND NOT n:Project AND NOT m:Project
      ${projectFilter}
      RETURN n, r, m
    `, { projectId: projectId ?? null });
        console.log('Query executed. Records:', queryResult.records.length);

        const nodes = new Map();
        const edges: any[] = [];

        // Helper to sanitize Neo4j 5.x elementIds (which contain colons) for Cytoscape
        const sanitize = (id: string) => id.replace(/:/g, '_');

        queryResult.records.forEach(record => {
            const n = record.get('n');
            const m = record.get('m');
            const r = record.get('r');

            const nId = sanitize(n.elementId);
            const mId = sanitize(m.elementId);
            const rId = sanitize(r.elementId);

            // Determine display names (Fixing 'no mapping for property label' warning)
            // Files use 'path', others use 'name'
            const getDisplayName = (node: any) => {
                const props = node.properties;
                if (props.name) return props.name;
                if (props.fileName) return props.fileName;
                if (props.path) {
                    // Extract basename from path (handles both win/unix separators)
                    const parts = props.path.split(/[/\\]/);
                    return parts[parts.length - 1];
                }
                return node.labels[0] || 'Node';
            };

            const nName = getDisplayName(n);
            const mName = getDisplayName(m);

            if (!nodes.has(nId)) {
                nodes.set(nId, {
                    data: {
                        ...n.properties, // Spread first
                        id: nId,
                        label: n.labels[0],
                        name: nName // Ensure name exists
                    }
                });
            }
            if (!nodes.has(mId)) {
                nodes.set(mId, {
                    data: {
                        ...m.properties, // Spread first
                        id: mId,
                        label: m.labels[0],
                        name: mName // Ensure name exists
                    }
                });
            }

            // STRICT FILTERING: Only add edge if both source and target are KNOWN
            if (nodes.has(nId) && nodes.has(mId)) {
                edges.push({
                    data: {
                        id: rId,
                        source: nId,
                        target: mId,
                        label: r.type
                    }
                });
            } else {
                console.warn(`Skipping edge ${rId} because source ${nId} or target ${mId} is missing.`);
            }
        });

        console.log('Parsed data:', { nodes: nodes.size, edges: edges.length });

        const result = { nodes: Array.from(nodes.values()), edges };
        setCache(key, result);
        return result;
    } catch (error) {
        console.error('Neo4j Driver Error:', error);
        throw error;
    } finally {
        await session.close();
    }
}

/** Detail of a dead code or god object function */
export interface DeadCodeItem {
    name: string;
    filePath: string;
}

export interface GodObjectItem {
    name: string;
    filePath: string;
    depCount: number;
}

export interface GodFileItem {
    filePath: string;
    functionCount: number;
    totalLines: number;
}

export interface DuplicateGroup {
    bodyHash: string;
    count: number;
    functions: Array<{ name: string; filePath: string }>;
}

/** Health stats for a project (or all projects) */
export interface HealthStats {
    nodeCount: number;
    edgeCount: number;
    fileCount: number;
    functionCount: number;
    classCount: number;
    routeCount: number;
    variableCount: number;
    eventCount: number;
    envVarCount: number;
    moduleCount: number;
    dbTableCount: number;
    externalApiCount: number;
    securityIssueCount: number;
    deadCodeCount: number;
    godObjectCount: number;
    godFileCount: number;
    duplicateCount: number;
    deadCodeItems: DeadCodeItem[];
    godObjectItems: GodObjectItem[];
    godFileItems: GodFileItem[];
    duplicateGroups: DuplicateGroup[];
}

/** Helper to safely extract a number from a Neo4j record field */
function toNum(val: any): number {
    return val?.toNumber?.() ?? val ?? 0;
}

/** Fetch health metrics from the graph */
export async function fetchHealthStats(projectId?: string): Promise<HealthStats> {
    const key = cacheKey('health', projectId);
    const cached = getCached<HealthStats>(key);
    if (cached) return cached;

    const session = driver.session();
    try {
        const nodeProjectFilter = projectId ? 'AND n.projectId = $projectId' : '';
        const functionProjectFilter = projectId ? 'AND f.projectId = $projectId' : '';
        const edgeProjectFilter = projectId ? 'AND a.projectId = $projectId AND b.projectId = $projectId' : '';
        const pfShort = projectId ? '{projectId: $projectId}' : '';
        const params = { projectId: projectId ?? null };

        // All node type counts in a single query
        const counts = await session.run(`
            MATCH (n) WHERE NOT n:ScanMeta AND NOT n:Project ${nodeProjectFilter}
            RETURN
                count(n) as nodeCount,
                count(CASE WHEN n:File THEN 1 END) as fileCount,
                count(CASE WHEN n:Function THEN 1 END) as functionCount,
                count(CASE WHEN n:Class THEN 1 END) as classCount,
                count(CASE WHEN n:Route THEN 1 END) as routeCount,
                count(CASE WHEN n:Variable THEN 1 END) as variableCount,
                count(CASE WHEN n:Event THEN 1 END) as eventCount,
                count(CASE WHEN n:EnvVar THEN 1 END) as envVarCount,
                count(CASE WHEN n:Module THEN 1 END) as moduleCount,
                count(CASE WHEN n:DBTable THEN 1 END) as dbTableCount,
                count(CASE WHEN n:ExternalAPI THEN 1 END) as externalApiCount,
                count(CASE WHEN n:SecurityIssue THEN 1 END) as securityIssueCount
        `, params);
        const c = counts.records[0]!;

        // Edge count
        const edgeResult = await session.run(`
            MATCH (a)-[r]->(b)
            WHERE NOT a:ScanMeta AND NOT b:ScanMeta AND NOT a:Project AND NOT b:Project
            ${edgeProjectFilter}
            RETURN count(r) as edgeCount
        `, params);
        const edgeCount = toNum(edgeResult.records[0]?.get('edgeCount'));

        // Dead code — excludes constructors, class methods, React, barrel re-exports
        const deadCode = await session.run(`
            MATCH (f:Function)
            WHERE NOT (f)<-[:CALLS]-() AND NOT (f)<-[:HANDLES]-()
              AND NOT (f)<-[:DEPENDS_ON]-(:File)
              AND f.name <> 'constructor'
              ${functionProjectFilter}
            WITH f
            WHERE NOT f.filePath ENDS WITH '.tsx'
              AND NOT f.filePath ENDS WITH '.jsx'
              AND NOT f.filePath ENDS WITH '.md'
              AND NOT f.filePath ENDS WITH '.mdx'
            OPTIONAL MATCH (parent:File)-[:CONTAINS]->(f)
            WITH f, parent
            WHERE parent IS NULL
               OR (NOT parent.path ENDS WITH 'index.ts'
                   AND NOT parent.path ENDS WITH 'index.js')
            WITH f, parent
            OPTIONAL MATCH (parent)-[:CONTAINS]->(cls:Class)
            WHERE cls.methods CONTAINS ('"' + f.name + '"')
            WITH f, parent, cls
            WHERE cls IS NULL
            OPTIONAL MATCH (barrel:File)-[:DEPENDS_ON|IMPORTS]->(parent)
            WHERE barrel IS NOT NULL
              AND (barrel.path ENDS WITH 'index.ts' OR barrel.path ENDS WITH 'index.js')
            WITH f, barrel
            WHERE barrel IS NULL
            RETURN f.name as name, f.filePath as filePath
            ORDER BY f.filePath, f.name
        `, params);
        const deadCodeItems: DeadCodeItem[] = deadCode.records.map(r => ({
            name: r.get('name'),
            filePath: r.get('filePath') ?? '',
        }));

        // God objects — unexpected cross-file coupling only
        const godObjects = await session.run(`
            MATCH (f:Function ${pfShort})-[:CALLS]->(target)
            MATCH (ff:File)-[:CONTAINS]->(f)
            WHERE NOT (ff)-[:CONTAINS]->(target)
            MATCH (tf:File)-[:CONTAINS]->(target)
            WHERE NOT (ff)-[:DEPENDS_ON]->(tf)
            WITH f, count(DISTINCT target) as depCount
            WHERE depCount > 15
            RETURN f.name as name, f.filePath as filePath, depCount
            ORDER BY depCount DESC
        `, params);
        const godObjectItems: GodObjectItem[] = godObjects.records.map(r => ({
            name: r.get('name'),
            filePath: r.get('filePath') ?? '',
            depCount: toNum(r.get('depCount')),
        }));

        // God files — files with >10 functions
        const godFiles = await session.run(`
            MATCH (f:File)-[:CONTAINS]->(fn:Function)
            WHERE true ${functionProjectFilter ? functionProjectFilter.replace('f.', 'fn.') : ''}
            ${projectId ? 'AND f.projectId = $projectId' : ''}
            WITH f, count(fn) as functionCount
            WHERE functionCount > 10
            RETURN f.path as filePath, functionCount, COALESCE(f.lineCount, 0) as totalLines
            ORDER BY functionCount DESC
        `, params);
        const godFileItems: GodFileItem[] = godFiles.records.map(r => ({
            filePath: r.get('filePath') ?? '',
            functionCount: toNum(r.get('functionCount')),
            totalLines: toNum(r.get('totalLines')),
        }));

        // Duplicates — functions with identical body hash
        const duplicates = await session.run(`
            MATCH (f:Function)
            WHERE f.bodyHash IS NOT NULL ${functionProjectFilter}
              AND (f.endLine - f.startLine) >= 3
            WITH f.bodyHash as bodyHash, collect({name: f.name, filePath: f.filePath}) as funcs, count(*) as cnt
            WHERE cnt > 1
            RETURN bodyHash, cnt as count, funcs as functions
            ORDER BY cnt DESC
            LIMIT 50
        `, params);
        const duplicateGroups: DuplicateGroup[] = duplicates.records.map(r => ({
            bodyHash: r.get('bodyHash'),
            count: toNum(r.get('count')),
            functions: r.get('functions') as Array<{ name: string; filePath: string }>,
        }));

        const result: HealthStats = {
            nodeCount: toNum(c.get('nodeCount')),
            fileCount: toNum(c.get('fileCount')),
            functionCount: toNum(c.get('functionCount')),
            classCount: toNum(c.get('classCount')),
            routeCount: toNum(c.get('routeCount')),
            variableCount: toNum(c.get('variableCount')),
            eventCount: toNum(c.get('eventCount')),
            envVarCount: toNum(c.get('envVarCount')),
            moduleCount: toNum(c.get('moduleCount')),
            dbTableCount: toNum(c.get('dbTableCount')),
            externalApiCount: toNum(c.get('externalApiCount')),
            securityIssueCount: toNum(c.get('securityIssueCount')),
            edgeCount,
            deadCodeCount: deadCodeItems.length,
            godObjectCount: godObjectItems.length,
            godFileCount: godFileItems.length,
            duplicateCount: duplicateGroups.length,
            deadCodeItems,
            godObjectItems,
            godFileItems,
            duplicateGroups,
        };

        setCache(key, result);
        return result;
    } finally {
        await session.close();
    }
}

/** Fetch graph with pagination — loads top N files by importance + their children.
 *  Returns nodeLimit and whether more data exists (hasMore). */
export async function fetchGraphDataPaginated(projectId?: string, nodeLimit = 500) {
    const session = driver.session();
    try {
        const pf = projectId ? 'WHERE f.projectId = $projectId' : '';
        const params = { projectId: projectId ?? null, nodeLimit: neo4j.int(nodeLimit) };

        // Get top files by function count (most important files first)
        const fileResult = await session.run(`
            MATCH (f:File) ${pf}
            OPTIONAL MATCH (f)-[:CONTAINS]->(fn:Function)
            WITH f, count(fn) as funcCount
            ORDER BY funcCount DESC
            LIMIT $nodeLimit
            RETURN f, funcCount
        `, params);

        const fileIds = new Set<string>();
        const propIdToElementId = new Map<string, string>();
        const nodes = new Map<string, any>();
        const edges: any[] = [];
        const sanitize = (id: string) => id.replace(/:/g, '_');

        fileResult.records.forEach(record => {
            const f = record.get('f');
            const nId = sanitize(f.elementId);
            const parts = (f.properties.path ?? '').split(/[/\\]/);
            const name = parts[parts.length - 1] || f.properties.name || 'File';
            fileIds.add(f.properties.id);
            propIdToElementId.set(f.properties.id, nId);
            nodes.set(nId, {
                data: { ...f.properties, id: nId, label: 'File', name }
            });
        });

        // Get children (Functions/Classes) of selected files
        const childResult = await session.run(`
            MATCH (f:File)-[r:CONTAINS]->(n)
            WHERE f.id IN $fileIds
            AND NOT n:ScanMeta AND NOT n:Project
            RETURN f.id as fileId, n, r
        `, { fileIds: Array.from(fileIds) });

        childResult.records.forEach(record => {
            const n = record.get('n');
            const r = record.get('r');
            const fileId = record.get('fileId');
            const nId = sanitize(n.elementId);
            const parentId = propIdToElementId.get(fileId);
            if (!parentId) return;

            const getDisplayName = (node: any) => {
                const props = node.properties;
                return props.name || props.fileName || node.labels[0] || 'Node';
            };

            if (!nodes.has(nId)) {
                propIdToElementId.set(n.properties.id, nId);
                nodes.set(nId, {
                    data: { ...n.properties, id: nId, label: n.labels[0], name: getDisplayName(n) }
                });
            }
            edges.push({
                data: { id: sanitize(r.elementId), source: parentId, target: nId, label: 'CONTAINS' }
            });
        });

        // Get edges between the loaded nodes (CALLS, DEPENDS_ON, etc.)
        const nodeIdList = Array.from(propIdToElementId.keys());
        const edgeResult = await session.run(`
            MATCH (a)-[r]->(b)
            WHERE a.id IN $nodeIds AND b.id IN $nodeIds
            AND NOT a:ScanMeta AND NOT b:ScanMeta AND NOT a:Project AND NOT b:Project
            AND type(r) <> 'CONTAINS'
            RETURN a.id as sourceId, b.id as targetId, r
        `, { nodeIds: nodeIdList });

        edgeResult.records.forEach(record => {
            const r = record.get('r');
            const sourceId = propIdToElementId.get(record.get('sourceId'));
            const targetId = propIdToElementId.get(record.get('targetId'));
            if (sourceId && targetId && nodes.has(sourceId) && nodes.has(targetId)) {
                edges.push({
                    data: { id: sanitize(r.elementId), source: sourceId, target: targetId, label: r.type }
                });
            }
        });

        // Check if there are more files
        const totalResult = await session.run(
            `MATCH (f:File) ${pf} RETURN count(f) as total`, { projectId: projectId ?? null }
        );
        const totalFiles = totalResult.records[0]?.get('total')?.toNumber?.() ?? 0;

        return {
            nodes: Array.from(nodes.values()),
            edges,
            hasMore: totalFiles > fileIds.size,
            totalFiles,
            loadedFiles: fileIds.size,
        };
    } finally {
        await session.close();
    }
}

/** List available projects in the graph */
export async function fetchProjects(): Promise<Array<{ id: string; name: string; rootPath: string }>> {
    const session = driver.session();
    try {
        const result = await session.run(
            `MATCH (p:Project) RETURN p.id as id, p.name as name, p.rootPath as rootPath ORDER BY p.name`
        );
        return result.records.map(r => ({
            id: r.get('id'),
            name: r.get('name'),
            rootPath: r.get('rootPath'),
        }));
    } finally {
        await session.close();
    }
}
