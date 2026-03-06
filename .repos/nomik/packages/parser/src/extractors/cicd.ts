import type { GraphNode, GraphEdge } from '@nomik/core';
import { createNodeId } from '../utils.js';

// ────────────────────────────────────────────────────────────────────────
// CI/CD Pipeline Detection
//
// Detects:
//   - GitHub Actions (.github/workflows/*.yml): jobs, steps, actions
//   - GitLab CI (.gitlab-ci.yml): stages, jobs, scripts
//   - Jenkinsfile: pipeline stages
//
// Creates: CronJob-like nodes for pipeline steps
// ────────────────────────────────────────────────────────────────────────

export interface CICDJobInfo {
    name: string;
    platform: 'github-actions' | 'gitlab-ci' | 'jenkins';
    stage?: string;
    runsOn?: string;
    steps: string[];
    triggers: string[];
}


export function extractGitHubActionsJobs(content: string, _filePath: string): CICDJobInfo[] {
    const jobs: CICDJobInfo[] = [];

    const triggers: string[] = [];
    const onMatch = content.match(/^on:\s*\n((?:\s+\w+.*\n?)*)/m);
    if (onMatch?.[1]) {
        const triggerMatches = [...onMatch[1].matchAll(/^\s{2}(\w[\w-]*):/gm)];
        for (const m of triggerMatches) if (m[1]) triggers.push(m[1]);
    }
    const onSimple = content.match(/^on:\s*\[([^\]]+)\]/m);
    if (onSimple?.[1]) {
        triggers.push(...onSimple[1].split(',').map(s => s.trim()).filter(Boolean));
    }

    const jobsMatch = content.match(/^jobs:\s*$/m);
    if (!jobsMatch) return jobs;

    const startIdx = (jobsMatch.index ?? 0) + jobsMatch[0].length;
    const jobsBlock = content.slice(startIdx);

    const jobPattern = /^  (\w[\w-]*):\s*$/gm;
    let match: RegExpExecArray | null;
    const jobStarts: { name: string; idx: number }[] = [];

    while ((match = jobPattern.exec(jobsBlock)) !== null) {
        if (match[1]) jobStarts.push({ name: match[1], idx: match.index });
    }

    for (let i = 0; i < jobStarts.length; i++) {
        const start = jobStarts[i]!;
        const end = jobStarts[i + 1]?.idx ?? jobsBlock.length;
        const block = jobsBlock.slice(start.idx, end);

        const runsOnMatch = block.match(/runs-on:\s*['"]?([^\s'"]+)['"]?/);
        const steps: string[] = [];

        const stepNameMatches = [...block.matchAll(/- name:\s*['"]?([^'"\n]+)['"]?/g)];
        for (const m of stepNameMatches) if (m[1]) steps.push(m[1].trim());

        const usesMatches = [...block.matchAll(/uses:\s*['"]?([^\s'"]+)['"]?/g)];
        for (const m of usesMatches) if (m[1]) steps.push(`action:${m[1].trim()}`);

        jobs.push({
            name: start.name,
            platform: 'github-actions',
            runsOn: runsOnMatch?.[1],
            steps,
            triggers,
        });
    }

    return jobs;
}


export function extractGitLabCIJobs(content: string, _filePath: string): CICDJobInfo[] {
    const jobs: CICDJobInfo[] = [];

    const stagesMatch = content.match(/^stages:\s*\n((?:\s+- .+\n?)*)/m);
    const stages: string[] = [];
    if (stagesMatch?.[1]) {
        const stageMatches = [...stagesMatch[1].matchAll(/- ['"]?(\w[\w-]*)['"]?/g)];
        for (const m of stageMatches) if (m[1]) stages.push(m[1]);
    }

    const reserved = new Set(['stages', 'variables', 'image', 'before_script', 'after_script', 'cache', 'services', 'include', 'default', 'workflow']);
    const jobPattern = /^(\w[\w-]*):\s*$/gm;
    let match: RegExpExecArray | null;

    while ((match = jobPattern.exec(content)) !== null) {
        const jobName = match[1];
        if (!jobName || reserved.has(jobName)) continue;

        const startIdx = match.index + match[0].length;
        const nextJob = content.slice(startIdx).search(/^\w[\w-]*:\s*$/m);
        const block = nextJob >= 0 ? content.slice(startIdx, startIdx + nextJob) : content.slice(startIdx);

        const stageMatch = block.match(/stage:\s*['"]?(\w[\w-]*)['"]?/);
        const scripts: string[] = [];
        const scriptMatches = [...block.matchAll(/- ['"]?([^'"\n]{3,})['"]?/g)];
        for (const m of scriptMatches) if (m[1]) scripts.push(m[1].trim());

        jobs.push({
            name: jobName,
            platform: 'gitlab-ci',
            stage: stageMatch?.[1],
            steps: scripts.slice(0, 10), // Limit
            triggers: [],
        });
    }

    return jobs;
}


export function buildCICDNodes(
    cicdJobs: CICDJobInfo[],
    filePath: string,
): { nodes: GraphNode[]; edges: GraphEdge[] } {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];

    for (const job of cicdJobs) {
        const nodeId = createNodeId('cron_job', filePath, `${job.platform}:${job.name}`);
        nodes.push({
            id: nodeId,
            type: 'cron_job',
            name: `${job.platform}/${job.name}`,
            schedule: job.triggers.join(', ') || 'manual',
            handlerName: job.steps[0] ?? job.name,
            filePath,
        });
    }

    return { nodes, edges };
}
