import type { GraphDriver } from '../drivers/driver.interface.js';

// ────────────────────────────────────────────────────────────────────────
// Explain + Service Links queries
// Split from read.ts to reduce god file size
// ────────────────────────────────────────────────────────────────────────

/** Cross-service correlation: find producer↔consumer pairs sharing the same topic/queue */
export interface ServiceLink {
    topicName: string;
    broker: string;
    producers: Array<{ name: string; filePath: string }>;
    consumers: Array<{ name: string; filePath: string }>;
}

export async function findServiceLinks(
    driver: GraphDriver,
    projectId?: string,
): Promise<ServiceLink[]> {
    const pf = projectId ? 'AND t.projectId = $projectId' : '';

    // Find topics that have both producers and consumers
    const results = await driver.runQuery<{
        topicName: string; broker: string;
        producers: Array<{ name: string; filePath: string }>;
        consumers: Array<{ name: string; filePath: string }>;
    }>(
        `MATCH (p)-[:PRODUCES_MESSAGE]->(pt:Topic)
         WHERE pt.topicKind = 'producer' ${pf.replace(/\bt\./g, 'pt.')}
         WITH pt.name as topicName, COALESCE(pt.broker, 'unknown') as broker,
              collect(DISTINCT {name: COALESCE(p.name, p.path), filePath: COALESCE(p.filePath, p.path, '')}) as producers
         MATCH (c)-[:CONSUMES_MESSAGE]->(ct:Topic)
         WHERE ct.name = topicName AND ct.topicKind = 'consumer' ${pf.replace(/\bt\./g, 'ct.')}
         WITH topicName, broker, producers,
              collect(DISTINCT {name: COALESCE(c.name, c.path), filePath: COALESCE(c.filePath, c.path, '')}) as consumers
         WHERE size(producers) > 0 AND size(consumers) > 0
         RETURN topicName, broker, producers, consumers
         ORDER BY topicName`,
        { projectId },
    );

    // Also check queue jobs (PRODUCES_JOB / CONSUMES_JOB)
    const queueResults = await driver.runQuery<{
        topicName: string; broker: string;
        producers: Array<{ name: string; filePath: string }>;
        consumers: Array<{ name: string; filePath: string }>;
    }>(
        `MATCH (p)-[:PRODUCES_JOB]->(pq:QueueJob)
         ${projectId ? 'WHERE pq.projectId = $projectId' : ''}
         WITH pq.queueName as topicName,
              collect(DISTINCT {name: COALESCE(p.name, p.path), filePath: COALESCE(p.filePath, p.path, '')}) as producers
         MATCH (c)-[:CONSUMES_JOB]->(cq:QueueJob)
         WHERE cq.queueName = topicName ${projectId ? 'AND cq.projectId = $projectId' : ''}
         WITH topicName, producers,
              collect(DISTINCT {name: COALESCE(c.name, c.path), filePath: COALESCE(c.filePath, c.path, '')}) as consumers
         WHERE size(producers) > 0 AND size(consumers) > 0
         RETURN topicName, 'queue' as broker, producers, consumers
         ORDER BY topicName`,
        { projectId },
    );

    const links: ServiceLink[] = [];

    for (const r of [...results, ...queueResults]) {
        links.push({
            topicName: r.topicName,
            broker: r.broker,
            producers: r.producers,
            consumers: r.consumers,
        });
    }

    return links;
}

/** Full context explanation of a symbol: properties, callers, callees, edges */
export interface ExplainResult {
    symbol: {
        name: string;
        type: string;
        filePath: string;
        startLine: number;
        endLine: number;
        isExported: boolean;
        bodyHash?: string;
    } | null;
    incomingEdges: Array<{ sourceName: string; sourceType: string; edgeType: string; filePath: string }>;
    outgoingEdges: Array<{ targetName: string; targetType: string; edgeType: string; filePath: string }>;
    containedIn: string | null;
    siblingCount: number;
}

export async function explainSymbol(
    driver: GraphDriver,
    symbolName: string,
    projectId?: string,
): Promise<ExplainResult> {
    const pf = projectId ? 'AND n.projectId = $projectId' : '';

    // 1. Find the symbol
    const symbols = await driver.runQuery<{
        name: string; type: string; filePath: string;
        startLine: number; endLine: number; isExported: boolean; bodyHash: string | null;
    }>(
        `MATCH (n)
         WHERE (n.name = $name OR n.id = $name) ${pf}
           AND NOT n:File AND NOT n:Project AND NOT n:ScanMeta
         RETURN COALESCE(n.name, n.path) as name,
                labels(n)[0] as type,
                COALESCE(n.filePath, n.path, '') as filePath,
                COALESCE(n.startLine, 0) as startLine,
                COALESCE(n.endLine, 0) as endLine,
                COALESCE(n.isExported, false) as isExported,
                n.bodyHash as bodyHash
         LIMIT 1`,
        { name: symbolName, projectId },
    );

    const symbol = symbols[0] ?? null;
    if (!symbol) {
        return { symbol: null, incomingEdges: [], outgoingEdges: [], containedIn: null, siblingCount: 0 };
    }

    // 2. Incoming edges (who references this symbol)
    const incoming = await driver.runQuery<{
        sourceName: string; sourceType: string; edgeType: string; filePath: string;
    }>(
        `MATCH (src)-[r]->(target)
         WHERE (target.name = $name OR target.id = $name) ${pf.replace(/\bn\./g, 'target.')}
           AND NOT target:File AND NOT target:Project
         RETURN COALESCE(src.name, src.path) as sourceName,
                labels(src)[0] as sourceType,
                type(r) as edgeType,
                COALESCE(src.filePath, src.path, '') as filePath
         ORDER BY edgeType, sourceName
         LIMIT 50`,
        { name: symbolName, projectId },
    );

    // 3. Outgoing edges (what this symbol references)
    const outgoing = await driver.runQuery<{
        targetName: string; targetType: string; edgeType: string; filePath: string;
    }>(
        `MATCH (src)-[r]->(target)
         WHERE (src.name = $name OR src.id = $name) ${pf.replace(/\bn\./g, 'src.')}
           AND NOT src:File AND NOT src:Project
         RETURN COALESCE(target.name, target.path) as targetName,
                labels(target)[0] as targetType,
                type(r) as edgeType,
                COALESCE(target.filePath, target.path, '') as filePath
         ORDER BY edgeType, targetName
         LIMIT 50`,
        { name: symbolName, projectId },
    );

    // 4. Containing file + sibling count
    const containerInfo = await driver.runQuery<{ filePath: string; siblingCount: number }>(
        `MATCH (f:File)-[:CONTAINS]->(n)
         WHERE (n.name = $name OR n.id = $name) ${pf}
         WITH f LIMIT 1
         OPTIONAL MATCH (f)-[:CONTAINS]->(sibling)
         RETURN f.path as filePath, count(sibling) as siblingCount`,
        { name: symbolName, projectId },
    );

    return {
        symbol: symbol ? { ...symbol, bodyHash: symbol.bodyHash ?? undefined } : null,
        incomingEdges: incoming,
        outgoingEdges: outgoing,
        containedIn: containerInfo[0]?.filePath ?? null,
        siblingCount: containerInfo[0]?.siblingCount ?? 0,
    };
}
