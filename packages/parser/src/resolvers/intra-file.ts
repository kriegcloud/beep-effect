import type { CallsEdge, CallResolution, GraphEdge } from '@nomik/core';
import type { CallInfo } from '../extractors/calls.js';


/** Resolve intra-file calls into CALLS edges (caller and callee in the same file) */
export function resolveCallEdges(calls: CallInfo[], funcMap: Map<string, string>): CallsEdge[] {
    const edges: CallsEdge[] = [];
    const seen = new Set<string>();

    for (const call of calls) {
        if (call.callerName === '__file__') continue;
        const callerId = funcMap.get(call.callerName);
        const calleeId = funcMap.get(call.calleeName);
        if (!callerId || !calleeId) continue;
        if (callerId === calleeId) continue;

        const key = `${callerId}->${calleeId}`;
        if (seen.has(key)) continue;
        seen.add(key);

        edges.push({
            id: `${callerId}->calls->${calleeId}`,
            type: 'CALLS' as const,
            sourceId: callerId,
            targetId: calleeId,
            confidence: 1.0,
            resolution: 'same-file' as CallResolution,
            line: call.line,
            column: call.column,
        });
    }
    return edges;
}

/** CALLS edges from the file context (calls in anonymous callbacks or top-level) */
export function resolveFileCallEdges(calls: CallInfo[], funcMap: Map<string, string>, fileId: string): CallsEdge[] {
    const edges: CallsEdge[] = [];
    const seen = new Set<string>();

    for (const call of calls) {
        if (call.callerName !== '__file__') continue;
        const calleeId = funcMap.get(call.calleeName);
        if (!calleeId) continue;

        const key = `${fileId}->${calleeId}`;
        if (seen.has(key)) continue;
        seen.add(key);

        edges.push({
            id: `${fileId}->calls->${calleeId}`,
            type: 'CALLS' as const,
            sourceId: fileId,
            targetId: calleeId,
            confidence: 0.90,
            resolution: 'file-context' as CallResolution,
            line: call.line,
            column: call.column,
        });
    }
    return edges;
}

/** Variable array aliases to function references (intra-file).
 * Creates DEPENDS_ON(kind='call') edges for value-flow references:
 *   export const sanitizeInputs = [sanitizeQueryParams, sanitizeBodyParams]
 */
export function resolveVariableArrayReferenceEdges(
    arrayAliases: Record<string, string[]>,
    varMap: Map<string, string>,
    funcMap: Map<string, string>,
): GraphEdge[] {
    const edges: GraphEdge[] = [];
    const seen = new Set<string>();

    for (const [alias, members] of Object.entries(arrayAliases)) {
        const varId = varMap.get(alias);
        if (!varId) continue;
        for (const member of members) {
            const fnId = funcMap.get(member);
            if (!fnId) continue;
            const key = `${varId}->${fnId}`;
            if (seen.has(key)) continue;
            seen.add(key);
            edges.push({
                id: `${varId}->depends_on->${fnId}`,
                type: 'DEPENDS_ON' as const,
                sourceId: varId,
                targetId: fnId,
                confidence: 0.9,
                kind: 'call' as const,
            });
        }
    }

    return edges;
}

export function resolveVariableDeclarationAliasEdges(
    varMap: Map<string, string>,
    funcMap: Map<string, string>,
): GraphEdge[] {
    const edges: GraphEdge[] = [];
    for (const [name, varId] of varMap.entries()) {
        const fnId = funcMap.get(name);
        if (!fnId) continue;
        edges.push({
            id: `${varId}->depends_on->${fnId}`,
            type: 'DEPENDS_ON' as const,
            sourceId: varId,
            targetId: fnId,
            confidence: 1.0,
            kind: 'call' as const,
        });
    }
    return edges;
}
