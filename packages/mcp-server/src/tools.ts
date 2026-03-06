import type { GraphService } from '@nomik/graph';
import { NomikError } from '@nomik/core';
import { isSamplingEnabled, sampleImpactSummary, sampleHealthSummary, sampleMigrationPlan } from './sampling';

/** Neo4j labels recognized by the scan */
const KNOWN_LABELS = ['File', 'Function', 'Class', 'Variable', 'Module', 'Route', 'DBTable', 'DBColumn', 'ExternalAPI', 'CronJob', 'Event', 'EnvVar', 'QueueJob', 'Metric', 'Span', 'Topic', 'SecurityIssue'];

/** Get the projectId from env (injected by Cursor/IDE) */
function getProjectId(): string | undefined {
    return process.env.NOMIK_PROJECT_ID || undefined;
}

const TOOLS = {
    nm_search: {
        name: 'nm_search',
        description: 'ALWAYS use this tool when the user mentions "nomik" or asks to find/search for a function, class, file, or symbol. Searches the NOMIK knowledge graph for nodes by name. Returns type, file path, and metadata. Do NOT grep files manually — use this tool first.',
        inputSchema: {
            type: 'object',
            properties: {
                query: { type: 'string', description: 'Search term (name of symbol)' },
                limit: { type: 'number', description: 'Max results', default: 10 },
                project: { type: 'string', description: 'Project name to scope the search to. Overrides NOMIK_PROJECT_ID env var.' },
            },
            required: ['query'],
        },
    },
    nm_db_impact: {
        name: 'nm_db_impact',
        description: 'ALWAYS use this tool when asked about database tables, who reads/writes a table, or column-level impact. Returns all functions that read from or write to a DB table, with file paths and operation types. Do NOT search code manually for SQL queries — this tool has the complete picture from the knowledge graph.',
        inputSchema: {
            type: 'object',
            properties: {
                table: { type: 'string', description: 'Table name (e.g. users)' },
                column: { type: 'string', description: 'Optional column name (e.g. email)' },
                limit: { type: 'number', description: 'Max result rows per reads/writes list', default: 100 },
                project: { type: 'string', description: 'Project name to scope the analysis to. Overrides NOMIK_PROJECT_ID env var.' },
            },
            required: ['table'],
        },
    },
    nm_impact: {
        name: 'nm_impact',
        description: 'ALWAYS use this tool when asked "what would break if I change X" or "what depends on X". Analyzes downstream impact of a change to a symbol by traversing the knowledge graph. Returns all dependent nodes with depth and relationship type. Use this instead of manually tracing call chains.',
        inputSchema: {
            type: 'object',
            properties: {
                symbolId: { type: 'string', description: 'The unique ID of the node (from search)' },
                depth: { type: 'number', description: 'Traversal depth', default: 3 },
                minConfidence: { type: 'number', description: 'Minimum confidence threshold (0.0-1.0) to filter CALLS edges. Default: 0 (all edges). Use 0.8+ for reliable results only.', default: 0 },
                project: { type: 'string', description: 'Project name to scope the analysis to. Overrides NOMIK_PROJECT_ID env var.' },
            },
            required: ['symbolId'],
        },
    },
    nm_trace: {
        name: 'nm_trace',
        description: 'ALWAYS use this tool when asked how two symbols are connected or to trace the dependency chain between them. Returns the shortest path through the knowledge graph. Do NOT manually inspect files to understand connections.',
        inputSchema: {
            type: 'object',
            properties: {
                from: { type: 'string', description: 'Source symbol name' },
                to: { type: 'string', description: 'Target symbol name' },
                project: { type: 'string', description: 'Project name to scope the trace to. Overrides NOMIK_PROJECT_ID env var.' },
            },
            required: ['from', 'to'],
        },
    },
    nm_context: {
        name: 'nm_context',
        description: 'ALWAYS use this tool when asked about a specific file or function context — what it contains, calls, is called by, and imports. Returns the complete context from the knowledge graph. Do NOT read the source file manually to understand its role — this tool already has the graph-level view.',
        inputSchema: {
            type: 'object',
            properties: {
                name: { type: 'string', description: 'Name of the file (path) or function/class name' },
                project: { type: 'string', description: 'Project name to scope the context to. Overrides NOMIK_PROJECT_ID env var.' },
            },
            required: ['name'],
        },
    },
    nm_health: {
        name: 'nm_health',
        description: 'ALWAYS use this tool when asked about codebase health, code quality, dead code, god files, duplicates, or infrastructure stats. Returns full stats for ALL node types (files, functions, classes, routes, DB tables, env vars, queues, metrics, spans, topics, security issues, etc.), plus optional dead code/god object/god file/duplicate analysis with edge type distribution.',
        inputSchema: {
            type: 'object',
            properties: {
                project: { type: 'string', description: 'Project name to scope the analysis to. Overrides NOMIK_PROJECT_ID env var.' },
                includeDeadCode: { type: 'boolean', description: 'Include dead code analysis', default: false },
                includeGodObjects: { type: 'boolean', description: 'Include god object detection', default: false },
                godObjectThreshold: { type: 'number', description: 'Dependency count threshold for god objects', default: 15 },
                includeGodFiles: { type: 'boolean', description: 'Include god file detection (files with too many functions)', default: false },
                godFileThreshold: { type: 'number', description: 'Function count threshold for god files', default: 10 },
                includeDuplicates: { type: 'boolean', description: 'Include duplicate code detection (functions with identical body hash)', default: false },
            },
        },
    },
    nm_path: {
        name: 'nm_path',
        description: 'ALWAYS use this tool when asked to find the path or connection between two code entities. Returns detailed steps with node types and relationship types. More detailed than nm_trace — shows each step in the path.',
        inputSchema: {
            type: 'object',
            properties: {
                from: { type: 'string', description: 'Source node name' },
                to: { type: 'string', description: 'Target node name' },
                project: { type: 'string', description: 'Project name to scope the path search to. Overrides NOMIK_PROJECT_ID env var.' },
            },
            required: ['from', 'to'],
        },
    },
    nm_changes: {
        name: 'nm_changes',
        description: 'ALWAYS use this tool when asked what changed recently, today, or this week. Returns nodes that were modified since a given date with their types and file paths.',
        inputSchema: {
            type: 'object',
            properties: {
                since: { type: 'string', description: 'ISO date string (e.g. 2026-02-05T00:00:00Z). Default: 24h ago' },
                limit: { type: 'number', description: 'Max results', default: 30 },
                project: { type: 'string', description: 'Project name to scope the changes to. Overrides NOMIK_PROJECT_ID env var.' },
            },
        },
    },
    nm_explain: {
        name: 'nm_explain',
        description: 'ALWAYS use this tool when asked to explain what a function/class does, how it connects to other code, or who calls it. Returns type, file location, all incoming edges (callers, containers), all outgoing edges (callees), and summary counts. Do NOT read the source file — this tool provides the complete graph-level understanding.',
        inputSchema: {
            type: 'object',
            properties: {
                symbol: { type: 'string', description: 'Name of the function, class, or variable to explain' },
                project: { type: 'string', description: 'Project name to scope the explanation to. Overrides NOMIK_PROJECT_ID env var.' },
            },
            required: ['symbol'],
        },
    },
    nm_onboard: {
        name: 'nm_onboard',
        description: 'ALWAYS use this tool when asked to describe, summarize, or understand a codebase. Returns a full briefing: stats (functions, files, classes, routes), language distribution, DB tables, external APIs, env vars, high-risk functions, and health summary. Do NOT manually inspect files — this tool already has the complete picture.',
        inputSchema: {
            type: 'object',
            properties: {
                project: { type: 'string', description: 'Project name to scope the briefing to. Overrides NOMIK_PROJECT_ID env var.' },
            },
        },
    },
    nm_wiki: {
        name: 'nm_wiki',
        description: 'ALWAYS use this tool when asked to generate, write, or create documentation for a module, package, or codebase. Returns structured data: file index with function counts, top functions ranked by caller count, health report (dead code, god files, duplicates), and cross-service links. Do NOT manually read source files to write docs — call this tool first to get the authoritative data from the knowledge graph, then format the output.',
        inputSchema: {
            type: 'object',
            properties: {
                section: { type: 'string', description: 'Which section to generate: "index" (file overview), "functions" (top functions), "health" (dead code + god files + duplicates), "service-links" (cross-service connections), or "all" (everything). Default: "all"' },
                limit: { type: 'number', description: 'Max items per section', default: 50 },
                project: { type: 'string', description: 'Project name to scope the wiki to. Overrides NOMIK_PROJECT_ID env var.' },
            },
        },
    },
    nm_communities: {
        name: 'nm_communities',
        description: 'ALWAYS use this tool when asked about code organization, modules, coupling, or architecture structure. Detects functional communities — groups of code that frequently call each other. Returns clusters with cohesion scores, member counts, and internal/external edge ratios.',
        inputSchema: {
            type: 'object',
            properties: {
                minSize: { type: 'number', description: 'Minimum community size (number of functions)', default: 3 },
                project: { type: 'string', description: 'Project name to scope the detection to. Overrides NOMIK_PROJECT_ID env var.' },
            },
        },
    },
    nm_flows: {
        name: 'nm_flows',
        description: 'ALWAYS use this tool when asked about request lifecycles, execution paths, or how data flows through the system. Traces execution flows from entry points (routes, event listeners, queue consumers) through the call graph. Shows call chain depth, per-step file location, and terminal operations (DB writes, API calls).',
        inputSchema: {
            type: 'object',
            properties: {
                maxDepth: { type: 'number', description: 'Maximum traversal depth', default: 8 },
                limit: { type: 'number', description: 'Maximum number of flows to return', default: 20 },
                project: { type: 'string', description: 'Project name to scope the trace to. Overrides NOMIK_PROJECT_ID env var.' },
            },
        },
    },
    nm_projects: {
        name: 'nm_projects',
        description: 'ALWAYS use this tool when asked about available projects or which codebases are tracked. Lists all projects in the NOMIK knowledge graph with their IDs and metadata.',
        inputSchema: {
            type: 'object',
            properties: {},
        },
    },
    nm_guard: {
        name: 'nm_guard',
        description: 'ALWAYS use this tool when asked about code quality gates, CI checks, or whether the codebase passes quality thresholds. Returns dead code count, god file count, duplicate count, and whether each passes the given threshold. Use this instead of manually counting issues.',
        inputSchema: {
            type: 'object',
            properties: {
                deadCodeThreshold: { type: 'number', description: 'Max allowed dead code functions', default: 5 },
                godFileThreshold: { type: 'number', description: 'Max allowed god files (files with >10 functions)', default: 3 },
                duplicateThreshold: { type: 'number', description: 'Max allowed duplicate function groups', default: 2 },
                project: { type: 'string', description: 'Project name to scope the check to. Overrides NOMIK_PROJECT_ID env var.' },
            },
        },
    },
    nm_rename: {
        name: 'nm_rename',
        description: 'ALWAYS use this tool when asked about renaming a symbol or understanding the impact of renaming. Returns the symbol definition, all callers, importers, and affected files — everything needed to safely rename across the codebase. Do NOT manually grep for references — this tool uses the knowledge graph for accurate results.',
        inputSchema: {
            type: 'object',
            properties: {
                symbol: { type: 'string', description: 'Current name of the function/class/variable to rename' },
                project: { type: 'string', description: 'Project name to scope the search to. Overrides NOMIK_PROJECT_ID env var.' },
            },
            required: ['symbol'],
        },
    },
    nm_diff: {
        name: 'nm_diff',
        description: 'ALWAYS use this tool when asked about architecture drift, what changed between two scans, or comparing codebase snapshots. Returns new/removed/modified files, new/removed functions, and new call edges between two git SHAs.',
        inputSchema: {
            type: 'object',
            properties: {
                fromSha: { type: 'string', description: 'Git SHA of the baseline scan' },
                toSha: { type: 'string', description: 'Git SHA of the target scan' },
                project: { type: 'string', description: 'Project name to scope the diff to. Overrides NOMIK_PROJECT_ID env var.' },
            },
            required: ['fromSha', 'toSha'],
        },
    },
    nm_service_links: {
        name: 'nm_service_links',
        description: 'ALWAYS use this tool when asked about cross-service dependencies, microservice connections, or how services communicate. Returns producer/consumer pairs for message queues, event buses, and API calls across service boundaries.',
        inputSchema: {
            type: 'object',
            properties: {
                project: { type: 'string', description: 'Project name to scope the analysis to. Overrides NOMIK_PROJECT_ID env var.' },
            },
        },
    },
    nm_test_impact: {
        name: 'nm_test_impact',
        description: 'ALWAYS use this tool when asked which tests to run, which tests are affected by a change, or test coverage impact. Traces the knowledge graph from a changed symbol or file to find all test files that should be re-run. Do NOT manually search for test files — this tool has the complete dependency picture.',
        inputSchema: {
            type: 'object',
            properties: {
                symbol: { type: 'string', description: 'Name of the changed function/class/variable' },
                files: { type: 'array', items: { type: 'string' }, description: 'Changed file paths (alternative to symbol)' },
                depth: { type: 'number', description: 'Max traversal depth', default: 4 },
                project: { type: 'string', description: 'Project name to scope the analysis to. Overrides NOMIK_PROJECT_ID env var.' },
            },
        },
    },
    nm_audit: {
        name: 'nm_audit',
        description: 'ALWAYS use this tool when asked about dependency vulnerabilities, security audits, or npm/pnpm audit results. Checks for vulnerable packages and cross-references with the knowledge graph to show which files import them (blast radius). Do NOT run npm audit manually — this tool integrates results with the graph.',
        inputSchema: {
            type: 'object',
            properties: {
                project: { type: 'string', description: 'Project name to scope the blast radius check to. Overrides NOMIK_PROJECT_ID env var.' },
            },
        },
    },
    nm_rules: {
        name: 'nm_rules',
        description: 'ALWAYS use this tool when asked about architecture rules, code quality policies, or whether the codebase follows best practices. Evaluates 9 configurable rules: dead code, god files, duplicates, high-fan-in, DB writes per route, circular imports, long functions, long files, security issues. Returns pass/fail per rule with violations.',
        inputSchema: {
            type: 'object',
            properties: {
                maxDeadCode: { type: 'number', description: 'Max allowed dead code functions', default: 5 },
                maxGodFiles: { type: 'number', description: 'Max allowed god files', default: 3 },
                maxDuplicates: { type: 'number', description: 'Max allowed duplicate groups', default: 2 },
                maxFunctionCallers: { type: 'number', description: 'Max callers per function', default: 50 },
                maxDbWritesPerRoute: { type: 'number', description: 'Max DB write functions per route', default: 3 },
                maxFunctionLines: { type: 'number', description: 'Max lines per function', default: 200 },
                maxFileLines: { type: 'number', description: 'Max lines per file', default: 1000 },
                maxSecurityIssues: { type: 'number', description: 'Max security issues', default: 0 },
                noCircularImports: { type: 'boolean', description: 'Disallow circular file imports', default: true },
                project: { type: 'string', description: 'Project name to scope the check to. Overrides NOMIK_PROJECT_ID env var.' },
            },
        },
    },
};

export async function handleListTools() {
    return Object.values(TOOLS);
}

/** Extract properties from a Neo4j record */
function extractNodeData(record: any): Record<string, unknown> {
    const node = record.n;
    if (!node) return {};
    const props = node.properties ?? node;
    const labels: string[] = node.labels ?? [];
    return { ...props, _labels: labels };
}

export async function handleCallTool(graph: GraphService, name: string, args: any) {
    const projectId = getProjectId();
    /** Resolve effective project: explicit arg > env var */
    const eid = (a: any) => a.project ? String(a.project) : projectId;

    switch (name) {
        case 'nm_search': {
            const effectiveProjectId = eid(args);
            const query = String(args.query ?? '');
            const limit = Number(args.limit) || 10;
            const projectFilter = effectiveProjectId ? 'AND n.projectId = $projectId' : '';
            // Normalize path separators for cross-platform search
            const queryAlt = query.includes('/') ? query.replace(/\//g, '\\') : query.includes('\\') ? query.replace(/\\\\/g, '/') : null;

            const results = await graph.executeQuery<{ n: any }>(
                `MATCH (n)
                 WHERE any(lbl IN labels(n) WHERE lbl IN $labels)
                   AND (
                     $query = '' OR $query = '*'
                     OR (n.name IS NOT NULL AND toLower(n.name) CONTAINS toLower($query))
                     OR (n.path IS NOT NULL AND toLower(n.path) CONTAINS toLower($query))
                     OR (n.id IS NOT NULL AND n.id CONTAINS $query)
                     ${queryAlt ? 'OR (n.path IS NOT NULL AND toLower(n.path) CONTAINS toLower($queryAlt))' : ''}
                   )
                   ${projectFilter}
                 RETURN n
                 ORDER BY CASE WHEN n.name IS NOT NULL THEN n.name ELSE n.path END
                 LIMIT toInteger($limit)`,
                { query, queryAlt, limit, labels: KNOWN_LABELS, projectId: effectiveProjectId }
            );

            const nodes = results.map(extractNodeData);
            return [{ type: 'text', text: JSON.stringify(nodes, null, 2) }];
        }

        case 'nm_impact': {
            const effectiveProjectId = eid(args);
            const symId = String(args.symbolId);
            const depth = Number(args.depth) || 3;
            const minConf = Number(args.minConfidence) || 0;
            const impacts = await graph.getImpact(symId, depth, effectiveProjectId, minConf);
            const result: any = { impacts };
            if (isSamplingEnabled()) {
                const summary = await sampleImpactSummary(symId, impacts);
                if (summary) result.aiSummary = summary;
            }
            return [{ type: 'text', text: JSON.stringify(result, null, 2) }];
        }

        case 'nm_trace': {
            const effectiveProjectId = eid(args);
            const from = String(args.from);
            const to = String(args.to);
            const paths = await graph.getDependencyChain(from, to, effectiveProjectId);
            return [{ type: 'text', text: JSON.stringify(paths, null, 2) }];
        }

        case 'nm_context': {
            const effectiveProjectId = eid(args);
            const target = String(args.name);
            const projectFilter = effectiveProjectId ? 'AND n.projectId = $projectId' : '';
            const preferFile = /\.[a-zA-Z0-9]+$/.test(target);
            // Normalize path separators for cross-platform lookup
            const targetAlt = target.includes('/') ? target.replace(/\//g, '\\') : target.includes('\\') ? target.replace(/\\\\/g, '/') : null;
            const nodeResults = await graph.executeQuery<any>(
                `MATCH (n)
                 WHERE (n.name = $target OR n.path = $target OR n.path CONTAINS $target
                        ${targetAlt ? 'OR n.path = $targetAlt OR n.path CONTAINS $targetAlt' : ''}) ${projectFilter}
                 WITH n,
                      CASE
                        WHEN n.path = $target OR n.path = $targetAlt THEN 3
                        WHEN n.name = $target THEN 2
                        WHEN n.path CONTAINS $target OR ($targetAlt IS NOT NULL AND n.path CONTAINS $targetAlt) THEN 1
                        ELSE 0
                      END as rank
                 RETURN n
                 ORDER BY rank DESC,
                          CASE WHEN $preferFile AND 'File' IN labels(n) THEN 1 ELSE 0 END DESC,
                          size(COALESCE(n.path, n.name, '')) ASC
                 LIMIT 1`,
                { target, targetAlt, projectId: effectiveProjectId, preferFile }
            );

            if (nodeResults.length === 0) {
                return [{ type: 'text', text: JSON.stringify({ error: 'Node not found', query: target }) }];
            }

            const nodeRecord = nodeResults[0];
            const node = nodeRecord.n;
            const nodeProps = node?.properties ?? node ?? {};
            const nodeLabels: string[] = node?.labels ?? [];
            const nodeId = nodeProps.id as string | undefined;
            if (!nodeId) {
                return [{ type: 'text', text: JSON.stringify({ error: 'Node has no id', query: target }) }];
            }

            const toItems = <T>(rows: any[]): T[] =>
                rows
                    .map(r => r.item)
                    .filter((v): v is T => v !== null && v !== undefined);

            const containsRows = await graph.executeQuery<any>(
                `MATCH (n {id: $id})-[:CONTAINS]->(child)
                 RETURN DISTINCT {name: COALESCE(child.name, child.path), type: labels(child)[0]} as item
                 ORDER BY item.name`,
                { id: nodeId }
            );

            let callsRows: any[] = [];
            let calledByRows: any[] = [];
            let importsRows: any[] = [];
            let extendsRows: any[] = [];

            if (nodeLabels.includes('File')) {
                callsRows = await graph.executeQuery<any>(
                    `MATCH (f:File {id: $id})-[:CONTAINS]->(inner)-[:CALLS|HANDLES]->(callee)
                     RETURN DISTINCT {name: COALESCE(callee.name, callee.path), file: COALESCE(callee.filePath, callee.path)} as item
                     ORDER BY item.name`,
                    { id: nodeId }
                );
                calledByRows = await graph.executeQuery<any>(
                    `MATCH (f:File {id: $id})-[:CONTAINS]->(inner)<-[:CALLS|HANDLES]-(caller)
                     RETURN DISTINCT {name: COALESCE(caller.name, caller.path), file: COALESCE(caller.filePath, caller.path)} as item
                     ORDER BY item.name`,
                    { id: nodeId }
                );
                importsRows = await graph.executeQuery<any>(
                    `MATCH (f:File {id: $id})-[:DEPENDS_ON|IMPORTS]->(imp)
                     RETURN DISTINCT {name: COALESCE(imp.name, imp.path)} as item
                     ORDER BY item.name`,
                    { id: nodeId }
                );
                extendsRows = await graph.executeQuery<any>(
                    `MATCH (f:File {id: $id})-[:CONTAINS]->(:Class)-[:EXTENDS]->(parent)
                     RETURN DISTINCT {name: parent.name} as item
                     ORDER BY item.name`,
                    { id: nodeId }
                );
            } else {
                callsRows = await graph.executeQuery<any>(
                    `MATCH (n {id: $id})-[:CALLS|HANDLES]->(callee)
                     RETURN DISTINCT {name: COALESCE(callee.name, callee.path), file: COALESCE(callee.filePath, callee.path)} as item
                     ORDER BY item.name`,
                    { id: nodeId }
                );
                calledByRows = await graph.executeQuery<any>(
                    `MATCH (caller)-[:CALLS|HANDLES]->(n {id: $id})
                     RETURN DISTINCT {name: COALESCE(caller.name, caller.path), file: COALESCE(caller.filePath, caller.path)} as item
                     ORDER BY item.name`,
                    { id: nodeId }
                );
                importsRows = await graph.executeQuery<any>(
                    `MATCH (n {id: $id})-[:DEPENDS_ON|IMPORTS]->(imp)
                     RETURN DISTINCT {name: COALESCE(imp.name, imp.path)} as item
                     ORDER BY item.name`,
                    { id: nodeId }
                );
                extendsRows = await graph.executeQuery<any>(
                    `MATCH (n {id: $id})-[:EXTENDS]->(parent)
                     RETURN DISTINCT {name: parent.name} as item
                     ORDER BY item.name`,
                    { id: nodeId }
                );
            }

            const context = {
                node: { ...nodeProps, _labels: nodeLabels },
                contains: toItems(containsRows),
                calls: toItems(callsRows),
                calledBy: toItems(calledByRows),
                imports: toItems(importsRows),
                extends: toItems(extendsRows),
            };
            return [{ type: 'text', text: JSON.stringify(context, null, 2) }];
        }

        case 'nm_health': {
            const effectiveProjectId = args.project ? String(args.project) : projectId;
            const stats = await graph.getStats(effectiveProjectId);
            const result: any = { ...stats };

            if (args.includeDeadCode) {
                result.deadCode = await graph.getDeadCode(effectiveProjectId);
            }
            if (args.includeGodObjects) {
                const threshold = Number(args.godObjectThreshold) || 15;
                result.godObjects = await graph.getGodObjects(threshold, effectiveProjectId);
            }
            if (args.includeGodFiles) {
                const threshold = Number(args.godFileThreshold) || 15;
                result.godFiles = await graph.getGodFiles(threshold, effectiveProjectId);
            }
            if (args.includeDuplicates) {
                result.duplicates = await graph.getDuplicates(effectiveProjectId);
            }

            const edgeFilter = effectiveProjectId ? '{projectId: $projectId}' : '';
            const edgeCounts = await graph.executeQuery<{ type: string; count: number }>(
                `MATCH ()-[r ${edgeFilter}]->()
                 RETURN type(r) as type, count(r) as count
                 ORDER BY count DESC`,
                { projectId: effectiveProjectId }
            );
            result.edgeTypes = edgeCounts;

            if (isSamplingEnabled()) {
                const summary = await sampleHealthSummary(result);
                if (summary) result.aiSummary = summary;
            }

            return [{ type: 'text', text: JSON.stringify(result, null, 2) }];
        }

        case 'nm_db_impact': {
            const effectiveProjectId = eid(args);
            const table = String(args.table ?? '').trim();
            const column = args.column ? String(args.column).trim() : undefined;
            const limit = Number(args.limit) || 100;
            if (!table) {
                return [{ type: 'text', text: JSON.stringify({ error: 'table is required' }) }];
            }
            const impact = await graph.getDBImpact(table, column, limit, effectiveProjectId);
            return [{ type: 'text', text: JSON.stringify(impact, null, 2) }];
        }

        case 'nm_path': {
            const effectiveProjectId = eid(args);
            const from = String(args.from);
            const to = String(args.to);
            const detailed = await graph.getDetailedPath(from, to, effectiveProjectId);
            if (detailed.length === 0) {
                return [{ type: 'text', text: JSON.stringify({ error: 'No path found', from, to }) }];
            }
            return [{ type: 'text', text: JSON.stringify({ from, to, paths: detailed }, null, 2) }];
        }

        case 'nm_changes': {
            const effectiveProjectId = eid(args);
            const since = args.since ?? new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
            const limit = Number(args.limit) || 30;
            const changes = await graph.getRecentChanges(since, limit, effectiveProjectId);
            return [{ type: 'text', text: JSON.stringify(changes, null, 2) }];
        }

        case 'nm_explain': {
            const effectiveProjectId = eid(args);
            const symbolName = String(args.symbol ?? '').trim();
            if (!symbolName) {
                return [{ type: 'text', text: JSON.stringify({ error: 'symbol is required' }) }];
            }
            const explain = await graph.getExplain(symbolName, effectiveProjectId);
            if (!explain.symbol) {
                return [{ type: 'text', text: JSON.stringify({ error: `Symbol "${symbolName}" not found in graph`, hint: 'Run nomik scan first, then use the exact function/class name' }) }];
            }

            // Build a structured summary
            const inByType: Record<string, string[]> = {};
            for (const e of explain.incomingEdges) {
                (inByType[e.edgeType] ??= []).push(`${e.sourceType}:${e.sourceName}`);
            }
            const outByType: Record<string, string[]> = {};
            for (const e of explain.outgoingEdges) {
                (outByType[e.edgeType] ??= []).push(`${e.targetType}:${e.targetName}`);
            }

            const summary = {
                symbol: explain.symbol,
                containedIn: explain.containedIn,
                siblingCount: explain.siblingCount,
                incoming: inByType,
                outgoing: outByType,
                callerCount: explain.incomingEdges.filter(e => e.edgeType === 'CALLS').length,
                calleeCount: explain.outgoingEdges.filter(e => e.edgeType === 'CALLS').length,
                totalEdges: explain.incomingEdges.length + explain.outgoingEdges.length,
            };
            return [{ type: 'text', text: JSON.stringify(summary, null, 2) }];
        }

        case 'nm_onboard': {
            const effectiveProjectId = eid(args);
            const onboard = await graph.getOnboard(effectiveProjectId);
            return [{ type: 'text', text: JSON.stringify(onboard, null, 2) }];
        }

        case 'nm_wiki': {
            const effectiveProjectId = eid(args);
            const section = String(args.section ?? 'all');
            const limit = Number(args.limit) || 50;
            const wiki: Record<string, any> = {};

            if (section === 'all' || section === 'index') {
                const stats = await graph.getStats(effectiveProjectId);
                const pf = effectiveProjectId ? 'AND f.projectId = $projectId' : '';
                const files = await graph.executeQuery<any>(
                    `MATCH (f:File) WHERE f.path IS NOT NULL ${pf}
                     OPTIONAL MATCH (f)-[:CONTAINS]->(fn:Function)
                     WITH f, count(fn) as fnCount
                     RETURN f.path as path, f.language as language, fnCount, f.lineCount as lineCount
                     ORDER BY fnCount DESC LIMIT toInteger($limit)`,
                    { projectId: effectiveProjectId, limit },
                );
                wiki.index = { stats, files };
            }

            if (section === 'all' || section === 'functions') {
                const pf = effectiveProjectId ? 'AND fn.projectId = $projectId' : '';
                const fns = await graph.executeQuery<any>(
                    `MATCH (fn:Function) WHERE fn.filePath IS NOT NULL ${pf}
                     OPTIONAL MATCH (caller)-[:CALLS]->(fn)
                     WITH fn, count(DISTINCT caller) as callerCount
                     RETURN fn.name as name, fn.filePath as filePath, fn.isExported as isExported,
                            fn.startLine as startLine, fn.endLine as endLine, callerCount
                     ORDER BY callerCount DESC LIMIT toInteger($limit)`,
                    { projectId: effectiveProjectId, limit },
                );
                wiki.functions = fns;
            }

            if (section === 'all' || section === 'health') {
                const deadCode = await graph.getDeadCode(effectiveProjectId);
                const godFiles = await graph.getGodFiles(15, effectiveProjectId);
                const duplicates = await graph.getDuplicates(effectiveProjectId);
                wiki.health = { deadCode, godFiles, duplicates };
            }

            if (section === 'all' || section === 'service-links') {
                const links = await graph.getServiceLinks(effectiveProjectId);
                wiki.serviceLinks = links;
            }

            return [{ type: 'text', text: JSON.stringify(wiki, null, 2) }];
        }

        case 'nm_communities': {
            const effectiveProjectId = eid(args);
            const minSize = Number(args.minSize) || 3;
            const communities = await graph.getCommunities(effectiveProjectId, minSize);
            return [{ type: 'text', text: JSON.stringify(communities, null, 2) }];
        }

        case 'nm_flows': {
            const effectiveProjectId = eid(args);
            const maxDepth = Number(args.maxDepth) || 8;
            const limit = Number(args.limit) || 20;
            const flows = await graph.getFlows(effectiveProjectId, maxDepth, limit);
            return [{ type: 'text', text: JSON.stringify(flows, null, 2) }];
        }

        case 'nm_projects': {
            const projects = await graph.listProjects();
            return [{ type: 'text', text: JSON.stringify(projects, null, 2) }];
        }

        case 'nm_guard': {
            const effectiveProjectId = eid(args);
            const deadCodeThreshold = Number(args.deadCodeThreshold) || 5;
            const godFileThreshold = Number(args.godFileThreshold) || 3;
            const duplicateThreshold = Number(args.duplicateThreshold) || 2;

            const deadCode = await graph.getDeadCode(effectiveProjectId);
            const godFiles = await graph.getGodFiles(15, effectiveProjectId);
            const duplicates = await graph.getDuplicates(effectiveProjectId);

            const checks = {
                dead_code: { count: deadCode.length, threshold: deadCodeThreshold, passed: deadCode.length <= deadCodeThreshold, items: deadCode.slice(0, 10) },
                god_files: { count: godFiles.length, threshold: godFileThreshold, passed: godFiles.length <= godFileThreshold, items: godFiles.slice(0, 10) },
                duplicates: { count: duplicates.length, threshold: duplicateThreshold, passed: duplicates.length <= duplicateThreshold, items: duplicates.slice(0, 5) },
            };
            const allPassed = checks.dead_code.passed && checks.god_files.passed && checks.duplicates.passed;

            return [{ type: 'text', text: JSON.stringify({ passed: allPassed, checks }, null, 2) }];
        }

        case 'nm_rename': {
            const effectiveProjectId = eid(args);
            const symbolName = String(args.symbol ?? '').trim();
            if (!symbolName) {
                return [{ type: 'text', text: JSON.stringify({ error: 'symbol is required' }) }];
            }
            const explain = await graph.getExplain(symbolName, effectiveProjectId);
            if (!explain.symbol) {
                return [{ type: 'text', text: JSON.stringify({ error: `Symbol "${symbolName}" not found in graph` }) }];
            }

            // Collect all affected files
            const affectedFiles: Record<string, string[]> = {};
            const addAffected = (fp: string, desc: string) => { (affectedFiles[fp] ??= []).push(desc); };
            if (explain.symbol.filePath) {
                addAffected(explain.symbol.filePath, `definition: ${explain.symbol.type} ${explain.symbol.name}`);
            }
            for (const e of explain.incomingEdges) {
                if (e.filePath) addAffected(e.filePath, `${e.edgeType}: ${e.sourceType}:${e.sourceName}`);
            }
            for (const e of explain.outgoingEdges) {
                if (e.filePath) addAffected(e.filePath, `${e.edgeType}: ${e.targetType}:${e.targetName}`);
            }

            const renameResult: any = {
                symbol: explain.symbol,
                callerCount: explain.incomingEdges.filter(e => e.edgeType === 'CALLS').length,
                importerCount: explain.incomingEdges.filter(e => e.edgeType === 'DEPENDS_ON').length,
                affectedFiles,
                totalReferences: explain.incomingEdges.length + explain.outgoingEdges.length,
            };
            if (isSamplingEnabled()) {
                const plan = await sampleMigrationPlan(symbolName, renameResult);
                if (plan) renameResult.aiMigrationPlan = plan;
            }
            return [{ type: 'text', text: JSON.stringify(renameResult, null, 2) }];
        }

        case 'nm_diff': {
            const effectiveProjectId = eid(args);
            const fromSha = String(args.fromSha ?? '').trim();
            const toSha = String(args.toSha ?? '').trim();
            if (!fromSha || !toSha) {
                return [{ type: 'text', text: JSON.stringify({ error: 'fromSha and toSha are required' }) }];
            }
            const diff = await graph.getDiff(fromSha, toSha, effectiveProjectId);
            return [{ type: 'text', text: JSON.stringify(diff, null, 2) }];
        }

        case 'nm_service_links': {
            const effectiveProjectId = eid(args);
            const links = await graph.getServiceLinks(effectiveProjectId);
            return [{ type: 'text', text: JSON.stringify(links, null, 2) }];
        }

        case 'nm_audit': {
            const effectiveProjectId = eid(args);
            // Query graph for all external package imports and their file-level usage
            const externalImports = await graph.executeQuery<{ pkg: string; filePath: string; importCount: number }>(
                `MATCH (f:File ${effectiveProjectId ? '{projectId: $projectId}' : ''})-[d:DEPENDS_ON]->(m)
                 WHERE m.type = 'module' OR d.kind = 'import'
                 WITH COALESCE(m.name, d.source) as pkg, f.path as filePath
                 WHERE pkg IS NOT NULL AND NOT pkg STARTS WITH '.' AND NOT pkg STARTS WITH '/'
                 RETURN pkg, filePath, 1 as importCount
                 ORDER BY pkg
                 LIMIT 500`,
                { projectId: effectiveProjectId },
            );

            // Group by package
            const pkgMap: Record<string, string[]> = {};
            for (const row of externalImports) {
                (pkgMap[row.pkg] ??= []).push(row.filePath);
            }

            // Also get security issues from the graph
            const securityIssues = await graph.executeQuery<{ name: string; severity: string; category: string; filePath: string }>(
                `MATCH (s:SecurityIssue ${effectiveProjectId ? '{projectId: $projectId}' : ''})
                 RETURN s.name as name, s.severity as severity, s.category as category, s.filePath as filePath
                 ORDER BY s.severity LIMIT 50`,
                { projectId: effectiveProjectId },
            );

            return [{ type: 'text', text: JSON.stringify({
                externalPackages: Object.entries(pkgMap).map(([pkg, files]) => ({ package: pkg, importedByFiles: files.length, files: files.slice(0, 5) })),
                totalPackages: Object.keys(pkgMap).length,
                securityIssues,
                recommendation: 'Run `nomik audit` CLI for full npm/pnpm audit with blast radius analysis. The graph data above shows all external packages imported and which files use them.',
            }, null, 2) }];
        }

        case 'nm_test_impact': {
            const effectiveProjectId = eid(args);
            const symbolName = args.symbol ? String(args.symbol).trim() : '';
            const filePaths = Array.isArray(args.files) ? args.files.map(String) : [];

            if (filePaths.length > 0) {
                const fileResults = await graph.getTestImpactForFiles(filePaths, effectiveProjectId);
                return [{ type: 'text', text: JSON.stringify({ mode: 'files', changedFiles: filePaths, affectedTests: fileResults, totalTestFiles: fileResults.length }, null, 2) }];
            } else if (symbolName) {
                const result = await graph.getTestImpact(symbolName, Number(args.depth) || 4, effectiveProjectId);
                return [{ type: 'text', text: JSON.stringify(result, null, 2) }];
            } else {
                return [{ type: 'text', text: JSON.stringify({ error: 'Provide either symbol or files parameter' }) }];
            }
        }

        case 'nm_rules': {
            const effectiveProjectId = eid(args);
            const rulesConfig: Record<string, unknown> = {};
            if (args.maxDeadCode !== undefined) rulesConfig.maxDeadCode = Number(args.maxDeadCode);
            if (args.maxGodFiles !== undefined) rulesConfig.maxGodFiles = Number(args.maxGodFiles);
            if (args.maxDuplicates !== undefined) rulesConfig.maxDuplicates = Number(args.maxDuplicates);
            if (args.maxFunctionCallers !== undefined) rulesConfig.maxFunctionCallers = Number(args.maxFunctionCallers);
            if (args.maxDbWritesPerRoute !== undefined) rulesConfig.maxDbWritesPerRoute = Number(args.maxDbWritesPerRoute);
            if (args.maxFunctionLines !== undefined) rulesConfig.maxFunctionLines = Number(args.maxFunctionLines);
            if (args.maxFileLines !== undefined) rulesConfig.maxFileLines = Number(args.maxFileLines);
            if (args.maxSecurityIssues !== undefined) rulesConfig.maxSecurityIssues = Number(args.maxSecurityIssues);
            if (args.noCircularImports !== undefined) rulesConfig.noCircularImports = Boolean(args.noCircularImports);
            const rulesResult = await graph.evaluateRules(rulesConfig as any, effectiveProjectId);
            return [{ type: 'text', text: JSON.stringify(rulesResult, null, 2) }];
        }

        default:
            throw new NomikError(`Unknown tool: ${name}`, 'INVALID_CONFIG', 'low', true);
    }
}
