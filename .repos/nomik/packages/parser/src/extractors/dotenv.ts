import type { GraphNode, GraphEdge } from '@nomik/core';
import { createNodeId } from '../utils.js';

// ────────────────────────────────────────────────────────────────────────
// .env Config File Parsing
//
// Parses .env, .env.local, .env.production, .env.development, etc.
// Extracts variable definitions and links them to EnvVarNode usage.
//
// Creates: EnvVarNode + CONTAINS edges (File → EnvVar definition)
// ────────────────────────────────────────────────────────────────────────

export interface EnvDefinition {
    name: string;
    value: string;
    line: number;
    hasValue: boolean;
    isComment: boolean;
}


export function extractEnvDefinitions(content: string, _filePath: string): EnvDefinition[] {
    const defs: EnvDefinition[] = [];
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i]!.trim();
        if (!line || line.startsWith('#')) continue;

        // Match: KEY=value, KEY="value", KEY='value', KEY= (empty)
        const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)/);
        if (!match) continue;

        const name = match[1]!;
        let value = match[2]!.trim();

        // Strip surrounding quotes
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }

        defs.push({
            name,
            value,
            line: i + 1,
            hasValue: value.length > 0,
            isComment: false,
        });
    }

    return defs;
}


export function buildEnvDefinitionNodes(
    defs: EnvDefinition[],
    fileId: string,
    _filePath: string,
): { nodes: GraphNode[]; edges: GraphEdge[] } {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];

    for (const def of defs) {
        // Use same ID scheme as env-vars.ts so .env definitions merge with process.env references
        const nodeId = createNodeId('env_var', '__global__', def.name);
        nodes.push({
            id: nodeId,
            type: 'env_var' as const,
            name: def.name,
            required: false,
            defaultValue: def.hasValue ? def.value : undefined,
        });

        edges.push({
            id: `${fileId}->contains->${nodeId}`,
            type: 'CONTAINS' as const,
            sourceId: fileId,
            targetId: nodeId,
            confidence: 1.0,
        });
    }

    return { nodes, edges };
}
