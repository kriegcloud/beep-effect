import type { GraphNode, GraphEdge } from '@nomik/core';
import { createNodeId } from '../utils.js';

// ────────────────────────────────────────────────────────────────────────
// Dependency Tracking — package.json parsing
//
// Detects:
//   - package.json: dependencies, devDependencies, peerDependencies
//   - Extracts package names, versions, and dependency types
//
// Creates: ModuleNode for each dependency with version metadata
// ────────────────────────────────────────────────────────────────────────

export interface DependencyInfo {
    name: string;
    version: string;
    type: 'production' | 'dev' | 'peer' | 'optional';
}


export function extractDependencies(content: string, _filePath: string): DependencyInfo[] {
    const deps: DependencyInfo[] = [];

    try {
        const pkg = JSON.parse(content);

        if (pkg.dependencies && typeof pkg.dependencies === 'object') {
            for (const [name, version] of Object.entries(pkg.dependencies)) {
                deps.push({ name, version: String(version), type: 'production' });
            }
        }
        if (pkg.devDependencies && typeof pkg.devDependencies === 'object') {
            for (const [name, version] of Object.entries(pkg.devDependencies)) {
                deps.push({ name, version: String(version), type: 'dev' });
            }
        }
        if (pkg.peerDependencies && typeof pkg.peerDependencies === 'object') {
            for (const [name, version] of Object.entries(pkg.peerDependencies)) {
                deps.push({ name, version: String(version), type: 'peer' });
            }
        }
        if (pkg.optionalDependencies && typeof pkg.optionalDependencies === 'object') {
            for (const [name, version] of Object.entries(pkg.optionalDependencies)) {
                deps.push({ name, version: String(version), type: 'optional' });
            }
        }
    } catch {
        // Invalid JSON
    }

    return deps;
}


export function extractPythonRequirements(content: string, _filePath: string): DependencyInfo[] {
    const deps: DependencyInfo[] = [];
    const lines = content.split('\n');

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('-')) continue;

                const match = trimmed.match(/^([a-zA-Z0-9_-]+(?:\[[^\]]+\])?)\s*([<>=~!]+\s*\S+)?/);
        if (match?.[1]) {
            deps.push({
                name: match[1].replace(/\[.*\]/, ''),
                version: match[2]?.trim() ?? '*',
                type: 'production',
            });
        }
    }

    return deps;
}


export function buildDependencyNodes(
    deps: DependencyInfo[],
    fileId: string,
    _filePath: string,
): { nodes: GraphNode[]; edges: GraphEdge[] } {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const seen = new Set<string>();

    for (const dep of deps) {
        const nodeId = createNodeId('module', dep.name, '');
        if (!seen.has(nodeId)) {
            seen.add(nodeId);
            nodes.push({
                id: nodeId,
                type: 'module',
                name: dep.name,
                path: dep.name,
                moduleType: 'package' as const,
            });
        }

        edges.push({
            id: `${fileId}->depends_on->${nodeId}`,
            type: 'DEPENDS_ON' as const,
            sourceId: fileId,
            targetId: nodeId,
            confidence: 1.0,
            kind: 'import' as const,
        });
    }

    return { nodes, edges };
}
