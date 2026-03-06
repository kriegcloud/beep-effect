/**
 * Role-scoped MCP filtering.
 *
 * Roles define which tools, prompts, and resources are visible to the user.
 * Set via NOMIK_ROLE env var. Default: 'dev' (all tools visible).
 *
 * Roles:
 *   - dev       — full access (all tools)
 *   - architect — architecture-focused: impact, rules, communities, flows, diff, service-links, migration
 *   - security  — security-focused: audit, rules, health, guard, dead code, security issues
 *   - pm        — project management: onboard, stats, health, changes, communities, changelog
 */

export type NomikRole = 'dev' | 'architect' | 'security' | 'pm';

const TOOL_ROLES: Record<string, NomikRole[]> = {
    nm_search:        ['dev', 'architect', 'security', 'pm'],
    nm_context:       ['dev', 'architect'],
    nm_db_impact:     ['dev', 'architect', 'security'],
    nm_impact:        ['dev', 'architect', 'security'],
    nm_health:        ['dev', 'architect', 'security', 'pm'],
    nm_path:          ['dev', 'architect'],
    nm_changes:       ['dev', 'architect', 'pm'],
    nm_trace:         ['dev', 'architect'],
    nm_explain:       ['dev', 'architect'],
    nm_onboard:       ['dev', 'architect', 'pm'],
    nm_wiki:          ['dev', 'architect', 'pm'],
    nm_communities:   ['dev', 'architect', 'pm'],
    nm_flows:         ['dev', 'architect'],
    nm_projects:      ['dev', 'architect', 'security', 'pm'],
    nm_guard:         ['dev', 'architect', 'security'],
    nm_rename:        ['dev', 'architect'],
    nm_diff:          ['dev', 'architect', 'pm'],
    nm_service_links: ['dev', 'architect'],
    nm_test_impact:   ['dev', 'architect'],
    nm_audit:         ['dev', 'security'],
    nm_rules:         ['dev', 'architect', 'security'],
};

const PROMPT_ROLES: Record<string, NomikRole[]> = {
    'nomik-onboard':        ['dev', 'architect', 'pm'],
    'nomik-review-change':  ['dev', 'architect', 'security'],
    'nomik-health-check':   ['dev', 'architect', 'security', 'pm'],
    'nomik-explain-module': ['dev', 'architect'],
    'nomik-migration-plan': ['dev', 'architect'],
    'nomik-infrastructure': ['dev', 'architect', 'security'],
};

const RESOURCE_ROLES: Record<string, NomikRole[]> = {
    'nomik://stats':          ['dev', 'architect', 'security', 'pm'],
    'nomik://health':         ['dev', 'architect', 'security', 'pm'],
    'nomik://files':          ['dev', 'architect'],
    'nomik://communities':    ['dev', 'architect', 'pm'],
    'nomik://onboard':        ['dev', 'architect', 'pm'],
    'nomik://schema':         ['dev', 'architect'],
    'nomik://projects':       ['dev', 'architect', 'security', 'pm'],
    'nomik://infrastructure': ['dev', 'architect', 'security'],
    'nomik://guard':          ['dev', 'architect', 'security'],
};

export function getRole(): NomikRole {
    const role = (process.env.NOMIK_ROLE ?? 'dev').toLowerCase();
    if (['dev', 'architect', 'security', 'pm'].includes(role)) return role as NomikRole;
    return 'dev';
}

export function filterToolsByRole<T extends { name: string }>(tools: T[], role?: NomikRole): T[] {
    const r = role ?? getRole();
    if (r === 'dev') return tools;
    return tools.filter(t => {
        const allowed = TOOL_ROLES[t.name];
        return !allowed || allowed.includes(r);
    });
}

export function filterPromptsByRole<T extends { name: string }>(prompts: T[], role?: NomikRole): T[] {
    const r = role ?? getRole();
    if (r === 'dev') return prompts;
    return prompts.filter(p => {
        const allowed = PROMPT_ROLES[p.name];
        return !allowed || allowed.includes(r);
    });
}

export function filterResourcesByRole<T extends { uri: string }>(resources: T[], role?: NomikRole): T[] {
    const r = role ?? getRole();
    if (r === 'dev') return resources;
    return resources.filter(res => {
        const allowed = RESOURCE_ROLES[res.uri];
        return !allowed || allowed.includes(r);
    });
}
