/**
 * NOMIK GitHub App — PR Bot Webhook Handler
 *
 * Receives pull_request webhooks, analyzes changed files against the
 * knowledge graph, and posts blast-radius comments on the PR.
 *
 * Deploy as: Vercel serverless function, AWS Lambda, or standalone Express.
 */

import type { GraphService } from '@nomik/graph';

// ────────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────────

export interface PRWebhookPayload {
    action: 'opened' | 'synchronize' | 'reopened';
    number: number;
    pull_request: {
        title: string;
        head: { sha: string; ref: string };
        base: { sha: string; ref: string };
        html_url: string;
    };
    repository: {
        full_name: string;
        owner: { login: string };
        name: string;
    };
}

export interface ChangedFile {
    filename: string;
    status: 'added' | 'modified' | 'removed' | 'renamed';
    additions: number;
    deletions: number;
}

export interface PRAnalysis {
    prNumber: number;
    repo: string;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    changedFiles: ChangedFile[];
    affectedFunctions: Array<{ name: string; filePath: string; callerCount: number }>;
    blastRadius: { totalDownstream: number; filesAffected: number };
    dbTablesAffected: Array<{ name: string; operation: string }>;
    healthImpact: { newDeadCode: number; newGodFiles: number };
}

// ────────────────────────────────────────────────────────────────────────
// Analysis
// ────────────────────────────────────────────────────────────────────────

/**
 * Analyze a PR's changed files against the knowledge graph.
 */
export async function analyzePR(
    graph: GraphService,
    changedFiles: ChangedFile[],
    projectId?: string,
): Promise<Omit<PRAnalysis, 'prNumber' | 'repo'>> {
    const changedPaths = changedFiles.map(f => f.filename);

    // Find functions in changed files
    const pf = projectId ? 'AND fn.projectId = $projectId' : '';
    const affectedFunctions = await graph.executeQuery<{
        name: string; filePath: string; callerCount: number;
    }>(
        `MATCH (fn:Function)
         WHERE fn.filePath IS NOT NULL ${pf}
           AND any(p IN $paths WHERE fn.filePath CONTAINS p)
         OPTIONAL MATCH (caller)-[:CALLS]->(fn)
         WITH fn, count(DISTINCT caller) as callerCount
         RETURN fn.name as name, fn.filePath as filePath, callerCount
         ORDER BY callerCount DESC
         LIMIT 50`,
        { paths: changedPaths, projectId },
    );

    // Blast radius — downstream impact from changed functions
    let totalDownstream = 0;
    const downstreamFiles = new Set<string>();

    for (const fn of affectedFunctions.slice(0, 10)) {
        const downstream = await graph.executeQuery<{ name: string; filePath: string }>(
            `MATCH (start:Function)
             WHERE start.name = $name AND start.filePath = $filePath
             MATCH (start)<-[:CALLS*1..3]-(caller)
             WHERE caller <> start AND caller.filePath IS NOT NULL
             RETURN DISTINCT caller.name as name, caller.filePath as filePath
             LIMIT 30`,
            { name: fn.name, filePath: fn.filePath },
        );
        totalDownstream += downstream.length;
        for (const d of downstream) {
            if (d.filePath) downstreamFiles.add(d.filePath);
        }
    }

    // DB tables affected
    const dbTables = await graph.executeQuery<{ name: string; operation: string }>(
        `MATCH (fn:Function)-[r:READS_FROM|WRITES_TO]->(t:DBTable)
         WHERE fn.filePath IS NOT NULL ${pf}
           AND any(p IN $paths WHERE fn.filePath CONTAINS p)
         RETURN DISTINCT t.name as name, type(r) as operation
         LIMIT 20`,
        { paths: changedPaths, projectId },
    );

    // Health impact
    const deadCode = await graph.getDeadCode(projectId);
    const godFiles = await graph.getGodFiles(10, projectId);

    // Risk calculation
    const maxCallers = affectedFunctions.length > 0 ? Math.max(...affectedFunctions.map(f => f.callerCount)) : 0;
    const riskLevel: PRAnalysis['riskLevel'] =
        maxCallers >= 15 || dbTables.length >= 3 ? 'CRITICAL' :
        maxCallers >= 8 || dbTables.length >= 1 ? 'HIGH' :
        maxCallers >= 3 || totalDownstream >= 10 ? 'MEDIUM' : 'LOW';

    return {
        riskLevel,
        changedFiles,
        affectedFunctions,
        blastRadius: { totalDownstream, filesAffected: downstreamFiles.size },
        dbTablesAffected: dbTables,
        healthImpact: { newDeadCode: deadCode.length, newGodFiles: godFiles.length },
    };
}

// ────────────────────────────────────────────────────────────────────────
// Comment Formatting
// ────────────────────────────────────────────────────────────────────────

/**
 * Format the PR analysis into a GitHub-flavored markdown comment.
 */
export function formatPRComment(analysis: PRAnalysis): string {
    const riskEmoji = {
        LOW: '🟢', MEDIUM: '🟡', HIGH: '🟠', CRITICAL: '🔴',
    }[analysis.riskLevel];

    const lines: string[] = [
        `## 🔍 NOMIK Impact Analysis`,
        '',
        `**Risk: ${riskEmoji} ${analysis.riskLevel}** — ${analysis.changedFiles.length} files changed, ${analysis.affectedFunctions.length} functions affected`,
        '',
    ];

    // Changed functions table
    if (analysis.affectedFunctions.length > 0) {
        lines.push('### Changed Functions');
        lines.push('| Function | Callers | Risk |');
        lines.push('|---|---|---|');
        for (const fn of analysis.affectedFunctions.slice(0, 15)) {
            const risk = fn.callerCount >= 10 ? '🔴 HIGH' : fn.callerCount >= 5 ? '🟡 MEDIUM' : '🟢 LOW';
            const shortPath = fn.filePath.split(/[/\\]/).slice(-2).join('/');
            lines.push(`| \`${fn.name}\` (${shortPath}) | ${fn.callerCount} | ${risk} |`);
        }
        if (analysis.affectedFunctions.length > 15) {
            lines.push(`| ... and ${analysis.affectedFunctions.length - 15} more | | |`);
        }
        lines.push('');
    }

    // Blast radius
    lines.push('### Blast Radius');
    lines.push(`- **${analysis.blastRadius.totalDownstream}** downstream functions across **${analysis.blastRadius.filesAffected}** files`);

    // DB tables
    if (analysis.dbTablesAffected.length > 0) {
        lines.push('- DB tables: ' + analysis.dbTablesAffected.map(t => `\`${t.name}\` (${t.operation})`).join(', '));
    }
    lines.push('');

    // Recommendations
    const recommendations: string[] = [];
    for (const fn of analysis.affectedFunctions) {
        if (fn.callerCount >= 10) {
            recommendations.push(`⚠️ \`${fn.name}\` has ${fn.callerCount} callers — consider staging deployment`);
        }
    }
    if (analysis.dbTablesAffected.some(t => t.operation === 'WRITES_TO')) {
        recommendations.push('🗄️ DB write operations detected — verify migration safety window');
    }
    if (analysis.healthImpact.newGodFiles > 0) {
        recommendations.push(`📦 ${analysis.healthImpact.newGodFiles} god file(s) detected — consider splitting`);
    }

    if (recommendations.length > 0) {
        lines.push('### Recommendations');
        for (const r of recommendations) {
            lines.push(`- ${r}`);
        }
        lines.push('');
    }

    lines.push('---');
    lines.push('*Powered by [NOMIK](https://github.com/nomik-ai) — The Living Blueprint*');

    return lines.join('\n');
}

// ────────────────────────────────────────────────────────────────────────
// GitHub API helpers
// ────────────────────────────────────────────────────────────────────────

export interface GitHubConfig {
    appId: string;
    privateKey: string;
    installationId: string;
    webhookSecret: string;
}

/**
 * Fetch changed files for a PR from the GitHub API.
 */
export async function fetchPRFiles(
    owner: string,
    repo: string,
    prNumber: number,
    token: string,
): Promise<ChangedFile[]> {
    const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}/files`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/vnd.github.v3+json',
            },
        },
    );

    if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const files = await response.json() as Array<{
        filename: string; status: string; additions: number; deletions: number;
    }>;

    return files.map(f => ({
        filename: f.filename,
        status: f.status as ChangedFile['status'],
        additions: f.additions,
        deletions: f.deletions,
    }));
}

/**
 * Post or update a comment on a PR.
 */
export async function postPRComment(
    owner: string,
    repo: string,
    prNumber: number,
    body: string,
    token: string,
): Promise<void> {
    // Check for existing NOMIK comment
    const commentsRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/issues/${prNumber}/comments`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/vnd.github.v3+json',
            },
        },
    );

    if (commentsRes.ok) {
        const comments = await commentsRes.json() as Array<{ id: number; body: string }>;
        const existing = comments.find(c => c.body.includes('NOMIK Impact Analysis'));
        if (existing) {
            // Update existing comment
            await fetch(
                `https://api.github.com/repos/${owner}/${repo}/issues/comments/${existing.id}`,
                {
                    method: 'PATCH',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/vnd.github.v3+json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ body }),
                },
            );
            return;
        }
    }

    // Post new comment
    await fetch(
        `https://api.github.com/repos/${owner}/${repo}/issues/${prNumber}/comments`,
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ body }),
        },
    );
}
