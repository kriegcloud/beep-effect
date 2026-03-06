import type { GraphService } from '@nomik/graph';

export interface McpPrompt {
    name: string;
    description: string;
    arguments?: Array<{ name: string; description: string; required?: boolean }>;
}

const PROMPTS: Record<string, McpPrompt> = {
    'nomik-onboard': {
        name: 'nomik-onboard',
        description: 'Get a full architecture briefing for this codebase — stats, languages, DB tables, APIs, infrastructure, high-risk functions, and health summary. Use this when joining a new project or needing a quick overview.',
        arguments: [
            { name: 'project', description: 'Project name to scope the briefing to', required: false },
        ],
    },
    'nomik-review-change': {
        name: 'nomik-review-change',
        description: 'Analyze the impact of changing a specific function or class — shows all callers, dependents, affected DB tables, and risk level. Use this before refactoring or renaming.',
        arguments: [
            { name: 'symbol', description: 'Name of the function/class to analyze', required: true },
            { name: 'project', description: 'Project name', required: false },
        ],
    },
    'nomik-health-check': {
        name: 'nomik-health-check',
        description: 'Run a full codebase health check — dead code, god files, duplicates, security issues, and quality gate status. Use this in CI or before a release.',
        arguments: [
            { name: 'project', description: 'Project name', required: false },
        ],
    },
    'nomik-explain-module': {
        name: 'nomik-explain-module',
        description: 'Deep-dive into a specific file or module — what it exports, who calls it, what it depends on, and its role in the architecture. Use this to understand unfamiliar code.',
        arguments: [
            { name: 'name', description: 'File path or module/function name to explain', required: true },
            { name: 'project', description: 'Project name', required: false },
        ],
    },
    'nomik-migration-plan': {
        name: 'nomik-migration-plan',
        description: 'Plan a safe migration — trace all dependencies of a symbol, find affected files, callers, DB tables, and suggest migration order. Use this before moving code between modules.',
        arguments: [
            { name: 'symbol', description: 'Symbol to migrate', required: true },
            { name: 'project', description: 'Project name', required: false },
        ],
    },
    'nomik-infrastructure': {
        name: 'nomik-infrastructure',
        description: 'List all infrastructure tracked in the codebase — queues, metrics, spans, topics, cron jobs, events, external APIs, env vars. Use this to audit infrastructure coverage.',
        arguments: [
            { name: 'project', description: 'Project name', required: false },
        ],
    },
};

export function handleListPrompts() {
    return Object.values(PROMPTS);
}

function getProjectId(): string | undefined {
    return process.env.NOMIK_PROJECT_ID || undefined;
}

export async function handleGetPrompt(
    graph: GraphService,
    name: string,
    args: Record<string, unknown> = {},
): Promise<{ description: string; messages: Array<{ role: string; content: { type: string; text: string } }> }> {
    const projectId = (args.project as string) || getProjectId();

    switch (name) {
        case 'nomik-onboard': {
            const summary = await graph.getOnboard(projectId);
            return {
                description: 'Full codebase architecture briefing',
                messages: [{
                    role: 'user',
                    content: {
                        type: 'text',
                        text: `Give me a comprehensive architecture briefing for this codebase based on the following NOMIK knowledge graph data. Explain the tech stack, key patterns, risks, and infrastructure.\n\n${JSON.stringify(summary, null, 2)}`,
                    },
                }],
            };
        }

        case 'nomik-review-change': {
            const symbolName = String(args.symbol ?? '').trim();
            if (!symbolName) {
                return {
                    description: 'Impact analysis for a symbol change',
                    messages: [{ role: 'user', content: { type: 'text', text: 'Please provide a symbol name to analyze.' } }],
                };
            }
            const explain = await graph.getExplain(symbolName, projectId);
            const impact = explain.symbol
                ? await graph.getImpact(symbolName, 4, projectId)
                : [];
            return {
                description: `Impact analysis for changing "${symbolName}"`,
                messages: [{
                    role: 'user',
                    content: {
                        type: 'text',
                        text: `Analyze the impact of changing the symbol "${symbolName}" in this codebase. Show me all affected code, risk level, and a safe refactoring plan.\n\nSymbol context:\n${JSON.stringify(explain, null, 2)}\n\nDownstream impact (depth 4):\n${JSON.stringify(impact, null, 2)}`,
                    },
                }],
            };
        }

        case 'nomik-health-check': {
            const stats = await graph.getStats(projectId);
            const deadCode = await graph.getDeadCode(projectId);
            const godFiles = await graph.getGodFiles(10, projectId);
            const duplicates = await graph.getDuplicates(projectId);
            return {
                description: 'Full codebase health report',
                messages: [{
                    role: 'user',
                    content: {
                        type: 'text',
                        text: `Generate a comprehensive codebase health report. Identify critical issues, prioritize fixes, and suggest improvements.\n\nStats:\n${JSON.stringify(stats, null, 2)}\n\nDead code (${deadCode.length}):\n${JSON.stringify(deadCode.slice(0, 20), null, 2)}\n\nGod files (${godFiles.length}):\n${JSON.stringify(godFiles.slice(0, 10), null, 2)}\n\nDuplicate groups (${duplicates.length}):\n${JSON.stringify(duplicates.slice(0, 10), null, 2)}`,
                    },
                }],
            };
        }

        case 'nomik-explain-module': {
            const modName = String(args.name ?? '').trim();
            if (!modName) {
                return {
                    description: 'Module explanation',
                    messages: [{ role: 'user', content: { type: 'text', text: 'Please provide a file path or module name to explain.' } }],
                };
            }
            const explain = await graph.getExplain(modName, projectId);
            return {
                description: `Deep-dive into "${modName}"`,
                messages: [{
                    role: 'user',
                    content: {
                        type: 'text',
                        text: `Explain this module/file in detail — its purpose, what it exports, who uses it, what it depends on, and its role in the overall architecture.\n\nContext from NOMIK knowledge graph:\n${JSON.stringify(explain, null, 2)}`,
                    },
                }],
            };
        }

        case 'nomik-migration-plan': {
            const sym = String(args.symbol ?? '').trim();
            if (!sym) {
                return {
                    description: 'Migration plan',
                    messages: [{ role: 'user', content: { type: 'text', text: 'Please provide a symbol name to plan the migration for.' } }],
                };
            }
            const symExplain = await graph.getExplain(sym, projectId);
            const symImpact = symExplain.symbol
                ? await graph.getImpact(sym, 5, projectId)
                : [];
            return {
                description: `Migration plan for "${sym}"`,
                messages: [{
                    role: 'user',
                    content: {
                        type: 'text',
                        text: `Create a detailed migration plan for moving/refactoring the symbol "${sym}". List all files that need to change, the correct order of changes, potential breaking changes, and a step-by-step plan.\n\nSymbol context:\n${JSON.stringify(symExplain, null, 2)}\n\nFull downstream impact (depth 5):\n${JSON.stringify(symImpact, null, 2)}`,
                    },
                }],
            };
        }

        case 'nomik-infrastructure': {
            const stats = await graph.getStats(projectId);
            const infraSummary = await graph.getOnboard(projectId);
            return {
                description: 'Infrastructure audit',
                messages: [{
                    role: 'user',
                    content: {
                        type: 'text',
                        text: `Audit all infrastructure tracked in this codebase. List every queue, metric, span, topic, cron job, event, external API, and env var. Identify any gaps or risks.\n\nNode counts:\n${JSON.stringify(stats, null, 2)}\n\nInfrastructure details:\n${JSON.stringify({
                            queueJobs: infraSummary.queueJobs,
                            metrics: infraSummary.metrics,
                            spans: infraSummary.spans,
                            topics: infraSummary.topics,
                            cronJobs: infraSummary.cronJobs,
                            events: infraSummary.events,
                            externalAPIs: infraSummary.externalAPIs,
                            envVars: infraSummary.envVars,
                        }, null, 2)}`,
                    },
                }],
            };
        }

        default:
            throw new Error(`Unknown prompt: ${name}`);
    }
}
