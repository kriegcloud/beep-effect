import type { GraphDriver } from '../drivers/driver.interface.js';

// ────────────────────────────────────────────────────────────────────────
// Process/Flow Detection — trace execution flows from entry points
// through the call graph to terminal operations (DB, API, events)
// ────────────────────────────────────────────────────────────────────────

export interface FlowStep {
    name: string;
    type: string;
    filePath: string;
    depth: number;
}

export interface ExecutionFlow {
    entryPoint: { name: string; type: string; filePath: string; reason: string };
    steps: FlowStep[];
    terminators: Array<{ name: string; type: string; operation: string }>;
    depth: number;
}

export interface FlowResult {
    flows: ExecutionFlow[];
    entryPointCount: number;
}

/**
 * Detect execution flows from entry points through the CALLS graph.
 * Entry points: routes (HANDLES), exported functions with high caller count,
 * event listeners (LISTENS_TO), queue consumers (CONSUMES_JOB).
 * Terminators: DB operations (READS_FROM/WRITES_TO), API calls (CALLS_API),
 * message producers (PRODUCES_MESSAGE/PRODUCES_JOB).
 */
export async function detectFlows(
    driver: GraphDriver,
    projectId?: string,
    maxDepth: number = 8,
    limit: number = 20,
): Promise<FlowResult> {
    const pf = projectId ? 'AND fn.projectId = $projectId' : '';

    // Step 1: Find entry points
    // a) Route handlers
    const routeHandlers = await driver.runQuery<{
        name: string; type: string; filePath: string; method: string; path: string;
    }>(
        `MATCH (fn:Function)-[:HANDLES]->(r:Route)
         WHERE fn.filePath IS NOT NULL ${pf}
         RETURN fn.name as name, 'Function' as type, fn.filePath as filePath,
                COALESCE(r.method, 'GET') as method, r.path as path
         LIMIT 50`,
        { projectId },
    );

    // b) Event listeners
    const eventListeners = await driver.runQuery<{
        name: string; type: string; filePath: string; eventName: string;
    }>(
        `MATCH (fn:Function)-[:LISTENS_TO]->(e:Event)
         WHERE fn.filePath IS NOT NULL ${pf}
         RETURN fn.name as name, 'Function' as type, fn.filePath as filePath,
                e.name as eventName
         LIMIT 30`,
        { projectId },
    );

    // c) Queue consumers
    const queueConsumers = await driver.runQuery<{
        name: string; type: string; filePath: string; queueName: string;
    }>(
        `MATCH (fn:Function)-[:CONSUMES_JOB]->(q:QueueJob)
         WHERE fn.filePath IS NOT NULL ${pf}
         RETURN fn.name as name, 'Function' as type, fn.filePath as filePath,
                q.queueName as queueName
         LIMIT 20`,
        { projectId },
    );

    // Collect all entry points with reasons
    const entryPoints: Array<{ name: string; type: string; filePath: string; reason: string }> = [];

    for (const r of routeHandlers) {
        entryPoints.push({ name: r.name, type: r.type, filePath: r.filePath, reason: `${r.method} ${r.path}` });
    }
    for (const e of eventListeners) {
        entryPoints.push({ name: e.name, type: e.type, filePath: e.filePath, reason: `on('${e.eventName}')` });
    }
    for (const q of queueConsumers) {
        entryPoints.push({ name: q.name, type: q.type, filePath: q.filePath, reason: `consumes(${q.queueName})` });
    }

    // If no route/event/queue entry points, use top exported functions with most callers
    if (entryPoints.length === 0) {
        const topExported = await driver.runQuery<{
            name: string; filePath: string; callerCount: number;
        }>(
            `MATCH (fn:Function)
             WHERE fn.isExported = true AND fn.filePath IS NOT NULL ${pf}
             OPTIONAL MATCH (caller)-[:CALLS]->(fn)
             WITH fn, count(DISTINCT caller) as callerCount
             WHERE callerCount >= 3
             RETURN fn.name as name, fn.filePath as filePath, callerCount
             ORDER BY callerCount DESC
             LIMIT 20`,
            { projectId },
        );
        for (const f of topExported) {
            entryPoints.push({ name: f.name, type: 'Function', filePath: f.filePath, reason: `exported (${f.callerCount} callers)` });
        }
    }

    // Step 2: For each entry point, trace the CALLS chain
    const flows: ExecutionFlow[] = [];

    for (const ep of entryPoints.slice(0, limit)) {
        const steps = await driver.runQuery<FlowStep>(
            `MATCH (start:Function)
             WHERE start.name = $name AND start.filePath = $filePath
             MATCH path = (start)-[:CALLS*1..${maxDepth}]->(node)
             WHERE node <> start
             WITH DISTINCT node, min(length(path)) as depth
             RETURN COALESCE(node.name, node.path) as name,
                    labels(node)[0] as type,
                    COALESCE(node.filePath, node.path, '') as filePath,
                    depth
             ORDER BY depth ASC
             LIMIT 50`,
            { name: ep.name, filePath: ep.filePath, projectId },
        );

        // Step 3: Find terminators (DB/API/Message operations) in the flow
        const flowFunctionNames = [ep.name, ...steps.map(s => s.name)];
        const terminators: Array<{ name: string; type: string; operation: string }> = [];

        if (flowFunctionNames.length > 0) {
            // DB terminators
            const dbOps = await driver.runQuery<{ fnName: string; tableName: string; rel: string }>(
                `MATCH (fn:Function)-[r:READS_FROM|WRITES_TO]->(t:DBTable)
                 WHERE fn.name IN $names AND fn.filePath IS NOT NULL ${pf}
                 RETURN fn.name as fnName, t.name as tableName, type(r) as rel
                 LIMIT 20`,
                { names: flowFunctionNames, projectId },
            );
            for (const op of dbOps) {
                terminators.push({ name: op.tableName, type: 'DBTable', operation: `${op.rel} by ${op.fnName}` });
            }

            // API terminators
            const apiOps = await driver.runQuery<{ fnName: string; url: string }>(
                `MATCH (fn:Function)-[:CALLS_API]->(api:ExternalAPI)
                 WHERE fn.name IN $names AND fn.filePath IS NOT NULL ${pf}
                 RETURN fn.name as fnName, api.url as url
                 LIMIT 20`,
                { names: flowFunctionNames, projectId },
            );
            for (const op of apiOps) {
                terminators.push({ name: op.url, type: 'ExternalAPI', operation: `called by ${op.fnName}` });
            }
        }

        flows.push({
            entryPoint: ep,
            steps,
            terminators,
            depth: steps.length > 0 ? Math.max(...steps.map(s => s.depth)) : 0,
        });
    }

    // Sort by depth descending (deepest flows first)
    flows.sort((a, b) => b.depth - a.depth);

    return {
        flows,
        entryPointCount: entryPoints.length,
    };
}
