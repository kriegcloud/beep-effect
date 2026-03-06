import type { GraphNode, GraphEdge, RouteNode } from '@nomik/core';
import { createNodeId } from '../utils.js';

// ────────────────────────────────────────────────────────────────────────
// OpenAPI / Swagger Spec File Parsing
//
// Detects:
//   - openapi.yaml / openapi.json / swagger.json / swagger.yaml
//   - Parses paths → HTTP routes with method, operationId, tags, summary
//
// Creates: RouteNode for each path+method combination
// ────────────────────────────────────────────────────────────────────────

export interface OpenAPIRouteInfo {
    method: string;
    path: string;
    operationId?: string;
    summary?: string;
    tags?: string[];
    responses?: number[];
}

const HTTP_METHODS = new Set(['get', 'post', 'put', 'delete', 'patch', 'options', 'head']);

export function extractOpenAPIRoutesFromJSON(content: string, _filePath: string): OpenAPIRouteInfo[] {
    const routes: OpenAPIRouteInfo[] = [];

    try {
        const spec = JSON.parse(content);
        if (!spec.paths && !spec.openapi && !spec.swagger) return routes;

        const paths = spec.paths ?? {};
        for (const [pathStr, methods] of Object.entries(paths)) {
            if (!methods || typeof methods !== 'object') continue;
            for (const [method, operation] of Object.entries(methods as Record<string, any>)) {
                if (!HTTP_METHODS.has(method.toLowerCase())) continue;
                const op = operation as any;
                const route: OpenAPIRouteInfo = {
                    method: method.toUpperCase(),
                    path: pathStr,
                    operationId: op.operationId,
                    summary: op.summary,
                    tags: op.tags,
                };
                if (op.responses) {
                    route.responses = Object.keys(op.responses)
                        .map(s => parseInt(s, 10))
                        .filter(n => !isNaN(n));
                }
                routes.push(route);
            }
        }
    } catch {
        // Invalid JSON
    }

    return routes;
}

export function extractOpenAPIRoutesFromYAML(content: string, _filePath: string): OpenAPIRouteInfo[] {
    const routes: OpenAPIRouteInfo[] = [];

    // Check it's an OpenAPI/Swagger file
    if (!content.match(/(?:openapi|swagger):\s*['"]?\d/)) return routes;

    // Find paths: section
    const pathsMatch = content.match(/^paths:\s*$/m);
    if (!pathsMatch) return routes;

    const startIdx = (pathsMatch.index ?? 0) + pathsMatch[0].length;
    const pathsBlock = content.slice(startIdx);

    // Match path entries (2-space indented, starting with /)
    const pathPattern = /^  (\/[^\s:]*?):\s*$/gm;
    let match: RegExpExecArray | null;
    const pathStarts: { path: string; idx: number }[] = [];

    while ((match = pathPattern.exec(pathsBlock)) !== null) {
        if (match[1]) pathStarts.push({ path: match[1], idx: match.index });
    }

    for (let i = 0; i < pathStarts.length; i++) {
        const start = pathStarts[i]!;
        const end = pathStarts[i + 1]?.idx ?? pathsBlock.length;
        const block = pathsBlock.slice(start.idx, end);

        // Match HTTP methods (4-space indented)
        const methodPattern = /^    (get|post|put|delete|patch|options|head):\s*$/gm;
        let methodMatch: RegExpExecArray | null;

        while ((methodMatch = methodPattern.exec(block)) !== null) {
            if (!methodMatch[1]) continue;
            const method = methodMatch[1].toUpperCase();
            const methodIdx = methodMatch.index + methodMatch[0].length;
            const nextMethod = block.slice(methodIdx).search(/^    \w+:\s*$/m);
            const methodBlock = nextMethod >= 0
                ? block.slice(methodIdx, methodIdx + nextMethod)
                : block.slice(methodIdx);

            const operationIdMatch = methodBlock.match(/operationId:\s*['"]?([^\s'"]+)['"]?/);
            const summaryMatch = methodBlock.match(/summary:\s*['"]?([^'"\n]+)['"]?/);
            const tagsSection = methodBlock.match(/tags:\s*\n((?:\s+- .+\n?)*)/);
            const tags: string[] = [];
            if (tagsSection?.[1]) {
                const tagMatches = [...tagsSection[1].matchAll(/- ['"]?([^'"\n]+)['"]?/g)];
                for (const m of tagMatches) if (m[1]) tags.push(m[1].trim());
            }

            routes.push({
                method,
                path: start.path,
                operationId: operationIdMatch?.[1],
                summary: summaryMatch?.[1]?.trim(),
                tags: tags.length > 0 ? tags : undefined,
            });
        }
    }

    return routes;
}

export function buildOpenAPIRouteNodes(
    apiRoutes: OpenAPIRouteInfo[],
    filePath: string,
): { nodes: GraphNode[]; edges: GraphEdge[] } {
    const nodes: GraphNode[] = [];

    for (const route of apiRoutes) {
        const nodeId = createNodeId('route', filePath, `${route.method}:${route.path}`);
        const routeNode: RouteNode = {
            id: nodeId,
            type: 'route',
            method: route.method as RouteNode['method'],
            path: route.path,
            handlerName: route.operationId ?? 'spec-defined',
            filePath,
            middleware: [],
            apiTags: route.tags,
            apiSummary: route.summary,
            apiResponseStatus: route.responses,
        };
        nodes.push(routeNode);
    }

    return { nodes, edges: [] };
}
