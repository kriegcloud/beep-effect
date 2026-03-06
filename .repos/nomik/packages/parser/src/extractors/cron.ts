import type Parser from 'tree-sitter';
import type { GraphNode, GraphEdge } from '@nomik/core';
import type { ImportInfo } from './imports';
import { createNodeId } from '../utils.js';
import { extractFirstStringArg, findEnclosingFunctionName } from './ast-utils.js';

// ────────────────────────────────────────────────────────────────────────
// Cron Job Detection
//
// Detects scheduled jobs from:
//   - node-cron: cron.schedule('*/5 * * * *', handler)
//   - node-schedule: schedule.scheduleJob('*/5 * * * *', handler)
//   - @nestjs/schedule: @Cron('45 * * * * *') decorator
//   - agenda: agenda.define('job', handler); agenda.every('5 minutes', 'job')
//   - cron (npm): new CronJob('*/5 * * * *', handler)
//
// Creates: CronJobNode + SCHEDULES edges
// ────────────────────────────────────────────────────────────────────────

export interface CronInfo {
    name: string;
    schedule: string;
    framework: string;
    line: number;
    callerFunction?: string;
}

const CRON_PACKAGES: Record<string, string> = {
    'node-cron': 'node-cron',
    'node-schedule': 'node-schedule',
    'cron': 'cron',
    '@nestjs/schedule': 'nestjs-schedule',
    'agenda': 'agenda',
    'bree': 'bree',
};

const CRON_METHODS: Record<string, string[]> = {
    'node-cron': ['schedule'],
    'node-schedule': ['scheduleJob', 'rescheduleJob'],
    'cron': ['CronJob'],
    'agenda': ['define', 'every', 'schedule'],
    'bree': ['add'],
};


export function buildCronClientIdentifiers(imports: ImportInfo[]): {
    ids: Set<string>;
    frameworkMap: Map<string, string>;
} {
    const ids = new Set<string>();
    const frameworkMap = new Map<string, string>();

    for (const imp of imports) {
        const pkg = CRON_PACKAGES[imp.source];
        if (!pkg) continue;

        for (const spec of imp.specifiers) {
            ids.add(spec);
            frameworkMap.set(spec, pkg);
        }
        // Also add the last segment of the package name (e.g. 'cron' from 'cron')
        const lastSegment = imp.source.split('/').pop()!;
        ids.add(lastSegment);
        frameworkMap.set(lastSegment, pkg);
    }

    return { ids, frameworkMap };
}


export function extractCronJobs(
    tree: Parser.Tree | null,
    _filePath: string,
    clientIds: Set<string>,
    frameworkMap: Map<string, string>,
): CronInfo[] {
    if (!tree || clientIds.size === 0) return [];

    const jobs: CronInfo[] = [];
    const cursor = tree.walk();

    function visit(): void {
        const node = cursor.currentNode;

        if (node.type === 'decorator') {
            const callExpr = node.childForFieldName('value') ?? node.children[1];
            if (callExpr?.type === 'call_expression') {
                const fn = callExpr.childForFieldName('function');
                if (fn?.text === 'Cron') {
                    const schedule = extractFirstStringArg(callExpr);
                    if (schedule) {
                        const parent = node.parent;
                        let methodName = 'anonymous';
                        if (parent) {
                            const methodDef = parent.type === 'method_definition'
                                ? parent
                                : parent.children.find((c: Parser.SyntaxNode) => c.type === 'method_definition');
                            if (methodDef) {
                                const nameNode = methodDef.childForFieldName('name');
                                if (nameNode) methodName = nameNode.text;
                            }
                        }
                        jobs.push({
                            name: methodName,
                            schedule,
                            framework: 'nestjs-schedule',
                            line: node.startPosition.row + 1,
                        });
                    }
                }
            }
        }

        // Detect cron.schedule('expr', fn) / schedule.scheduleJob('expr', fn) / new CronJob('expr', fn)
        if (node.type === 'call_expression') {
            const fn = node.childForFieldName('function');
            if (fn?.type === 'member_expression') {
                const obj = fn.childForFieldName('object');
                const prop = fn.childForFieldName('property');
                if (obj && prop) {
                    const framework = frameworkMap.get(obj.text);
                    const methods = framework ? CRON_METHODS[framework] : undefined;
                    if (framework && methods?.includes(prop.text)) {
                        const schedule = extractFirstStringArg(node);
                        if (schedule) {
                            jobs.push({
                                name: schedule,
                                schedule,
                                framework,
                                line: node.startPosition.row + 1,
                                callerFunction: findEnclosingFunctionName(node) ?? undefined,
                            });
                        }
                    }
                }
            }
        }

                if (node.type === 'new_expression') {
            const constructor = node.childForFieldName('constructor');
            if (constructor && clientIds.has(constructor.text)) {
                const framework = frameworkMap.get(constructor.text);
                if (framework === 'cron') {
                    const args = node.childForFieldName('arguments');
                    if (args && args.namedChildCount > 0) {
                        const firstArg = args.namedChildren[0];
                        if (firstArg?.type === 'string' || firstArg?.type === 'template_string') {
                            const schedule = firstArg.text.replace(/^['"`]|['"`]$/g, '');
                            jobs.push({
                                name: schedule,
                                schedule,
                                framework: 'cron',
                                line: node.startPosition.row + 1,
                                callerFunction: findEnclosingFunctionName(node) ?? undefined,
                            });
                        }
                    }
                }
            }
        }

        if (cursor.gotoFirstChild()) {
            do { visit(); } while (cursor.gotoNextSibling());
            cursor.gotoParent();
        }
    }

    visit();
    return jobs;
}


export function buildCronNodesAndEdges(
    jobs: CronInfo[],
    localFuncMap: Map<string, string>,
    fileId: string,
    filePath: string,
): { nodes: GraphNode[]; edges: GraphEdge[] } {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];

    for (const job of jobs) {
        const nodeId = createNodeId('cron_job', filePath, `${job.framework}:${job.schedule}:${job.line}`);
        nodes.push({
            id: nodeId,
            type: 'cron_job' as const,
            name: `${job.framework}:${job.name}`,
            schedule: job.schedule,
            handlerName: job.callerFunction ?? 'anonymous',
            filePath,
        });

        const sourceId = job.callerFunction
            ? (localFuncMap.get(job.callerFunction) ?? fileId)
            : fileId;

        edges.push({
            id: `${sourceId}->schedules->${nodeId}`,
            type: 'SCHEDULES' as const,
            sourceId,
            targetId: nodeId,
            confidence: 1.0,
            schedule: job.schedule,
        });
    }

    return { nodes, edges };
}
