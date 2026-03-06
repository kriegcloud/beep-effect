import type { GraphService } from '@nomik/graph';
import { NomikError } from '@nomik/core';

function getProjectId(): string | undefined {
    return process.env.NOMIK_PROJECT_ID || undefined;
}

export async function handleListResources(_graph: GraphService) {
    return [
        {
            uri: 'nomik://stats',
            name: 'Graph Statistics',
            mimeType: 'application/json',
            description: 'Full stats for ALL 17 node types: files, functions, classes, routes, DB tables, columns, APIs, cron jobs, events, env vars, queues, metrics, spans, topics, security issues, variables, modules',
        },
        {
            uri: 'nomik://health',
            name: 'Codebase Health',
            mimeType: 'application/json',
            description: 'Dead code, god files, duplicates, security issues, edge type distribution, and full node counts',
        },
        {
            uri: 'nomik://files',
            name: 'File Index',
            mimeType: 'application/json',
            description: 'All tracked files with language, function count, and line count',
        },
        {
            uri: 'nomik://communities',
            name: 'Code Communities',
            mimeType: 'application/json',
            description: 'Functional clusters detected by call-graph density analysis',
        },
        {
            uri: 'nomik://onboard',
            name: 'Codebase Briefing',
            mimeType: 'application/json',
            description: 'Full codebase overview: stats, languages, DB tables, APIs, env vars, queues, metrics, spans, topics, cron jobs, events, security issues, high-risk functions',
        },
        {
            uri: 'nomik://schema',
            name: 'Graph Schema',
            mimeType: 'application/json',
            description: 'All node labels, relationship types, and their counts in the knowledge graph',
        },
        {
            uri: 'nomik://projects',
            name: 'Projects',
            mimeType: 'application/json',
            description: 'All projects tracked in the NOMIK knowledge graph',
        },
        {
            uri: 'nomik://infrastructure',
            name: 'Infrastructure Overview',
            mimeType: 'application/json',
            description: 'All infrastructure nodes: queue jobs, metrics, spans, topics, cron jobs, events, external APIs, env vars',
        },
        {
            uri: 'nomik://guard',
            name: 'Quality Gate Status',
            mimeType: 'application/json',
            description: 'Current quality gate status: dead code, god files, duplicates with pass/fail thresholds',
        },
    ];
}

export async function handleReadResource(graph: GraphService, uri: string) {
    const projectId = getProjectId();

    switch (uri) {
        case 'nomik://stats': {
            const stats = await graph.getStats(projectId);
            return [{ uri, mimeType: 'application/json', text: JSON.stringify(stats, null, 2) }];
        }

        case 'nomik://health': {
            const stats = await graph.getStats(projectId);
            const deadCode = await graph.getDeadCode(projectId);
            const godFiles = await graph.getGodFiles(10, projectId);
            const duplicates = await graph.getDuplicates(projectId);
            const pf = projectId ? '{projectId: $projectId}' : '';
            const edgeTypes = await graph.executeQuery<{ type: string; count: number }>(
                `MATCH ()-[r ${pf}]->() RETURN type(r) as type, count(r) as count ORDER BY count DESC`,
                { projectId },
            );
            return [{ uri, mimeType: 'application/json', text: JSON.stringify({ ...stats, deadCode, godFiles, duplicates, edgeTypes }, null, 2) }];
        }

        case 'nomik://files': {
            const pf = projectId ? 'AND f.projectId = $projectId' : '';
            const files = await graph.executeQuery<any>(
                `MATCH (f:File) WHERE f.path IS NOT NULL ${pf}
                 OPTIONAL MATCH (f)-[:CONTAINS]->(fn:Function)
                 WITH f, count(fn) as fnCount
                 RETURN f.path as path, f.language as language, fnCount, f.lineCount as lineCount
                 ORDER BY fnCount DESC`,
                { projectId },
            );
            return [{ uri, mimeType: 'application/json', text: JSON.stringify(files, null, 2) }];
        }

        case 'nomik://communities': {
            const communities = await graph.getCommunities(projectId);
            return [{ uri, mimeType: 'application/json', text: JSON.stringify(communities, null, 2) }];
        }

        case 'nomik://onboard': {
            const onboard = await graph.getOnboard(projectId);
            return [{ uri, mimeType: 'application/json', text: JSON.stringify(onboard, null, 2) }];
        }

        case 'nomik://schema': {
            const nodeLabels = await graph.executeQuery<{ label: string; count: number }>(
                `MATCH (n) RETURN labels(n)[0] as label, count(n) as count ORDER BY count DESC`,
                {},
            );
            const relTypes = await graph.executeQuery<{ type: string; count: number }>(
                `MATCH ()-[r]->() RETURN type(r) as type, count(r) as count ORDER BY count DESC`,
                {},
            );
            return [{ uri, mimeType: 'application/json', text: JSON.stringify({ nodeLabels, relationshipTypes: relTypes }, null, 2) }];
        }

        case 'nomik://projects': {
            const projects = await graph.listProjects();
            return [{ uri, mimeType: 'application/json', text: JSON.stringify(projects, null, 2) }];
        }

        case 'nomik://infrastructure': {
            const pf = projectId ? 'AND n.projectId = $projectId' : '';
            const queueJobs = await graph.executeQuery<any>(
                `MATCH (n:QueueJob) WHERE true ${pf} RETURN n.name as name, n.queueName as queueName, n.jobKind as jobKind, n.filePath as filePath ORDER BY n.name LIMIT 50`,
                { projectId },
            );
            const metrics = await graph.executeQuery<any>(
                `MATCH (n:Metric) WHERE true ${pf} RETURN n.name as name, n.metricType as metricType, n.filePath as filePath ORDER BY n.name LIMIT 50`,
                { projectId },
            );
            const spans = await graph.executeQuery<any>(
                `MATCH (n:Span) WHERE true ${pf} RETURN n.name as name, n.tracerLib as tracerLib, n.filePath as filePath ORDER BY n.name LIMIT 50`,
                { projectId },
            );
            const topics = await graph.executeQuery<any>(
                `MATCH (n:Topic) WHERE true ${pf} RETURN n.name as name, n.broker as broker, n.filePath as filePath ORDER BY n.name LIMIT 50`,
                { projectId },
            );
            const cronJobs = await graph.executeQuery<any>(
                `MATCH (n:CronJob) WHERE true ${pf} RETURN n.name as name, n.schedule as schedule, n.filePath as filePath ORDER BY n.name LIMIT 50`,
                { projectId },
            );
            const events = await graph.executeQuery<any>(
                `MATCH (n:Event) WHERE true ${pf} RETURN n.name as name, n.namespace as namespace, n.filePath as filePath ORDER BY n.name LIMIT 50`,
                { projectId },
            );
            const externalAPIs = await graph.executeQuery<any>(
                `MATCH (n:ExternalAPI) WHERE true ${pf} RETURN n.url as url, n.method as method ORDER BY n.url LIMIT 50`,
                { projectId },
            );
            const envVars = await graph.executeQuery<any>(
                `MATCH (n:EnvVar) WHERE true ${pf} RETURN DISTINCT n.name as name ORDER BY n.name LIMIT 50`,
                { projectId },
            );
            return [{ uri, mimeType: 'application/json', text: JSON.stringify({ queueJobs, metrics, spans, topics, cronJobs, events, externalAPIs, envVars }, null, 2) }];
        }

        case 'nomik://guard': {
            const deadCode = await graph.getDeadCode(projectId);
            const godFiles = await graph.getGodFiles(10, projectId);
            const duplicates = await graph.getDuplicates(projectId);
            const checks = {
                dead_code: { count: deadCode.length, threshold: 5, passed: deadCode.length <= 5, items: deadCode.slice(0, 10) },
                god_files: { count: godFiles.length, threshold: 3, passed: godFiles.length <= 3, items: godFiles.slice(0, 10) },
                duplicates: { count: duplicates.length, threshold: 2, passed: duplicates.length <= 2, items: duplicates.slice(0, 5) },
            };
            const allPassed = checks.dead_code.passed && checks.god_files.passed && checks.duplicates.passed;
            return [{ uri, mimeType: 'application/json', text: JSON.stringify({ passed: allPassed, checks }, null, 2) }];
        }

        default:
            throw new NomikError(`Resource not found: ${uri}`, 'NOT_FOUND', 'medium', true);
    }
}
