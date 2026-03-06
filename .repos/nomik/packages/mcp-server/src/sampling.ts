/**
 * MCP Sampling — allows the MCP server to request LLM completions from the client.
 *
 * This enables server-side analysis workflows where the server gathers graph data
 * and asks the connected AI to reason over it (e.g., "summarize this impact analysis",
 * "classify this risk level", "suggest a refactoring plan").
 *
 * Usage: Set NOMIK_SAMPLING=true to enable. The server will use sampling in certain
 * tools to provide richer, AI-augmented responses.
 */

import type { Server } from '@modelcontextprotocol/sdk/server/index.js';

export interface SamplingRequest {
    prompt: string;
    systemPrompt?: string;
    maxTokens?: number;
}

export interface SamplingResponse {
    content: string;
    model: string;
    stopReason: string;
}

let serverRef: Server | null = null;

export function initSampling(server: Server) {
    serverRef = server;
}

export function isSamplingEnabled(): boolean {
    return (process.env.NOMIK_SAMPLING ?? '').toLowerCase() === 'true' && serverRef !== null;
}

/**
 * Request an LLM completion from the connected client via MCP sampling.
 * Returns null if sampling is disabled or fails.
 */
export async function requestSampling(req: SamplingRequest): Promise<SamplingResponse | null> {
    if (!isSamplingEnabled() || !serverRef) return null;

    try {
        const messages: Array<{ role: 'user' | 'assistant'; content: { type: 'text'; text: string } }> = [
            {
                role: 'user',
                content: { type: 'text', text: req.prompt },
            },
        ];

        const result = await serverRef.createMessage({
            messages,
            maxTokens: req.maxTokens ?? 1024,
            ...(req.systemPrompt ? { systemPrompt: req.systemPrompt } : {}),
        });

        return {
            content: result.content.type === 'text' ? result.content.text : JSON.stringify(result.content),
            model: result.model,
            stopReason: result.stopReason ?? 'unknown',
        };
    } catch {
        // Sampling may not be supported by the client — fail gracefully
        return null;
    }
}

/**
 * Pre-built sampling requests for common NOMIK use cases.
 */
export async function sampleImpactSummary(symbolName: string, impactData: unknown): Promise<string | null> {
    const resp = await requestSampling({
        systemPrompt: 'You are a senior software architect analyzing code change impact. Be concise and actionable.',
        prompt: `Analyze the impact of changing "${symbolName}" based on this dependency data. Provide: 1) Risk level (LOW/MEDIUM/HIGH), 2) Key concerns, 3) Recommended approach.\n\n${JSON.stringify(impactData, null, 2)}`,
        maxTokens: 512,
    });
    return resp?.content ?? null;
}

export async function sampleHealthSummary(healthData: unknown): Promise<string | null> {
    const resp = await requestSampling({
        systemPrompt: 'You are a code quality expert. Provide actionable recommendations. Be concise.',
        prompt: `Summarize this codebase health report. Prioritize the most critical issues and suggest fixes.\n\n${JSON.stringify(healthData, null, 2)}`,
        maxTokens: 512,
    });
    return resp?.content ?? null;
}

export async function sampleMigrationPlan(symbolName: string, context: unknown): Promise<string | null> {
    const resp = await requestSampling({
        systemPrompt: 'You are a senior engineer planning a safe code migration. Be specific about file changes and ordering.',
        prompt: `Create a step-by-step migration plan for "${symbolName}" based on this context. Include file change order, potential breaking changes, and rollback strategy.\n\n${JSON.stringify(context, null, 2)}`,
        maxTokens: 1024,
    });
    return resp?.content ?? null;
}
