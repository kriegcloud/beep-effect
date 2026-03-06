import type { CallsEdge, CallResolution, GraphNode, GraphEdge } from '@nomik/core';
import type { ImportInfo } from '../extractors/imports.js';

import type { CallInfo } from '../extractors/calls.js';
import type { ParseResult } from '../parser.js';


interface ParsedImportSpecifier {
    importedName: string;
    localName: string;
    isNamespace: boolean;
}

function parseImportSpecifier(specifier: string): ParsedImportSpecifier | null {
    const trimmed = specifier.trim();
    if (!trimmed) return null;
    if (trimmed === '*') {
        return { importedName: '*', localName: '*', isNamespace: true };
    }
    if (trimmed.startsWith('* as ')) {
        const localName = trimmed.slice(5).trim();
        return localName
            ? { importedName: '*', localName, isNamespace: true }
            : null;
    }
    const asMatch = trimmed.match(/^([A-Za-z_$][\w$]*)\s+as\s+([A-Za-z_$][\w$]*)$/);
    if (asMatch) {
        const importedName = asMatch[1] ?? '';
        const localName = asMatch[2] ?? '';
        if (!importedName || !localName) return null;
        return { importedName, localName, isNamespace: false };
    }
    return { importedName: trimmed, localName: trimmed, isNamespace: false };
}

function normalizeImportSpecifier(specifier: string): string {
    const parsed = parseImportSpecifier(specifier);
    return parsed?.localName ?? '';
}

export function buildImportedReceiverFileIds(
    importerPath: string,
    resolvedImportsByFile: Map<string, Array<{ imp: ImportInfo; resolvedPath: string }>>,
    filePathToId: Map<string, string>,
): Map<string, Set<string>> {
    const map = new Map<string, Set<string>>();
    const resolvedImports = resolvedImportsByFile.get(importerPath) ?? [];

    for (const { imp, resolvedPath } of resolvedImports) {
        if (imp.isTypeOnly) continue;
        const targetFileId = filePathToId.get(resolvedPath);
        if (!targetFileId) continue;
        for (const rawSpecifier of imp.specifiers) {
            const specifier = normalizeImportSpecifier(rawSpecifier);
            if (!specifier) continue;
            const set = map.get(specifier) ?? new Set<string>();
            set.add(targetFileId);
            map.set(specifier, set);
        }
    }
    return map;
}

export function buildImportedAliasFunctionIds(
    importerPath: string,
    resolvedImportsByFile: Map<string, Array<{ imp: ImportInfo; resolvedPath: string }>>,
    resultByPath: Map<string, ParseResult>,
): Map<string, string[]> {
    const map = new Map<string, string[]>();
    const resolvedImports = resolvedImportsByFile.get(importerPath) ?? [];
    for (const { imp, resolvedPath } of resolvedImports) {
        if (imp.isTypeOnly) continue;
        const targetResult = resultByPath.get(resolvedPath);
        if (!targetResult) continue;
        for (const rawSpecifier of imp.specifiers) {
            const parsed = parseImportSpecifier(rawSpecifier);
            if (!parsed || parsed.isNamespace) continue;
            const targetFns = targetResult.nodes.filter(
                (n) => n.type === 'function' && n.name === parsed.importedName,
            );
            if (targetFns.length === 0) continue;
            const existing = map.get(parsed.localName) ?? [];
            const merged = new Set(existing);
            for (const fn of targetFns) merged.add(fn.id);
            map.set(parsed.localName, [...merged]);
        }
    }
    return map;
}

/** Cross-file resolution with multi-map (handles duplicate function names) */
export function resolveCrossFileCallEdges(
    calls: CallInfo[],
    localIds: Set<string>,
    multiMap: Map<string, string[]>,
    importedAliasFunctionIds: Map<string, string[]>,
    importedReceiverFileIds: Map<string, Set<string>>,
    nodeIdToFileId: Map<string, string>,
    importedFileIds: Set<string>,
): CallsEdge[] {
    const edges: CallsEdge[] = [];
    const seen = new Set<string>();

    for (const call of calls) {
        if (call.callerName === '__file__') continue;
        if (call.isLocalIdentifier) continue;
        const callerIds = multiMap.get(call.callerName) ?? [];
        const aliasTargets = importedAliasFunctionIds.get(call.calleeName) ?? [];
        let calleeIds: string[];
        let resolution: CallResolution;
        if (aliasTargets.length > 0) {
            calleeIds = aliasTargets;
            resolution = 'import-resolved';
        } else {
            const globalIds = multiMap.get(call.calleeName) ?? [];
            const hasLocalShadow = !call.isMethodCall && globalIds.some(id => localIds.has(id));
            calleeIds = hasLocalShadow
                ? []
                : globalIds.filter(id => importedFileIds.has(nodeIdToFileId.get(id) ?? ''));
            resolution = 'global-filtered';
        }
        const confidence = resolution === 'import-resolved' ? 0.95 : 0.60;

        const localCallerIds = callerIds.filter((id) => localIds.has(id));
        let remoteCalleeIds = calleeIds.filter((id) => !localIds.has(id));
        remoteCalleeIds = filterMethodCandidatesByReceiverImport(
            remoteCalleeIds,
            call,
            importedReceiverFileIds,
            nodeIdToFileId,
        );

        for (const callerId of localCallerIds) {
            for (const calleeId of remoteCalleeIds) {
                if (callerId === calleeId) continue;
                const key = `${callerId}->${calleeId}`;
                if (seen.has(key)) continue;
                seen.add(key);

                edges.push({
                    id: `${callerId}->calls->${calleeId}`,
                    type: 'CALLS' as const,
                    sourceId: callerId,
                    targetId: calleeId,
                    confidence,
                    resolution,
                    line: call.line,
                    column: call.column,
                });
            }
        }
    }
    return edges;
}

function resolveReExportTargets(targetResult: ParseResult, parsed: ParsedImportSpecifier): GraphNode[] {
    const exportedNames = collectExportedNames(targetResult);
    const symbols = targetResult.nodes.filter(
        (n) => (n.type === 'function' || n.type === 'class' || n.type === 'variable'),
    );

    if (parsed.importedName === '*' || parsed.isNamespace) {
        if (exportedNames.size > 0) {
            return symbols.filter((n) => exportedNames.has(n.name));
        }
        return symbols.filter((n) => Boolean((n as any).isExported));
    }

    if (parsed.importedName === 'default') {
        const defaults = targetResult.exports.filter(e => e.isDefault && !e.isTypeOnly).map(e => e.name);
        if (defaults.length === 0) return [];
        const defaultSet = new Set(defaults);
        return symbols.filter((n) => defaultSet.has(n.name));
    }

    return symbols.filter((n) => n.name === parsed.importedName);
}

function collectExportedNames(targetResult: ParseResult): Set<string> {
    const names = new Set<string>();
    for (const exp of targetResult.exports) {
        if (exp.isTypeOnly || exp.name === 'default') continue;
        names.add(exp.name);
    }
    return names;
}

/** Cross-file resolution of __file__ calls (File → functions in other files) */
export function resolveFileCrossFileCallEdges(
    calls: CallInfo[],
    localIds: Set<string>,
    multiMap: Map<string, string[]>,
    fileId: string,
    importedAliasFunctionIds: Map<string, string[]>,
    importedReceiverFileIds: Map<string, Set<string>>,
    nodeIdToFileId: Map<string, string>,
    importedFileIds: Set<string>,
): CallsEdge[] {
    const edges: CallsEdge[] = [];
    const seen = new Set<string>();

    for (const call of calls) {
        if (call.callerName !== '__file__') continue;
        if (call.isLocalIdentifier) continue;
        const aliasTargets = importedAliasFunctionIds.get(call.calleeName) ?? [];
        let calleeIds: string[];
        let resolution: CallResolution;
        if (aliasTargets.length > 0) {
            calleeIds = aliasTargets;
            resolution = 'import-resolved';
        } else {
            const globalIds = multiMap.get(call.calleeName) ?? [];
            const hasLocalShadow = !call.isMethodCall && globalIds.some(id => localIds.has(id));
            calleeIds = hasLocalShadow
                ? []
                : globalIds.filter(id => importedFileIds.has(nodeIdToFileId.get(id) ?? ''));
            resolution = 'global-filtered';
        }
                const confidence = resolution === 'import-resolved' ? 0.85 : 0.50;
        calleeIds = filterMethodCandidatesByReceiverImport(
            calleeIds,
            call,
            importedReceiverFileIds,
            nodeIdToFileId,
        );

        for (const calleeId of calleeIds) {
            if (localIds.has(calleeId)) continue;
            const key = `${fileId}->${calleeId}`;
            if (seen.has(key)) continue;
            seen.add(key);

            edges.push({
                id: `${fileId}->calls->${calleeId}`,
                type: 'CALLS' as const,
                sourceId: fileId,
                targetId: calleeId,
                confidence,
                resolution,
                line: call.line,
                column: call.column,
            });
        }
    }
    return edges;
}

export function filterMethodCandidatesByReceiverImport(
    calleeIds: string[],
    call: CallInfo,
    importedReceiverFileIds: Map<string, Set<string>>,
    nodeIdToFileId: Map<string, string>,
): string[] {
    if (!call.isMethodCall || !call.receiverName) return calleeIds;
    const importedTargetFileIds = importedReceiverFileIds.get(call.receiverName);
    if (!importedTargetFileIds || importedTargetFileIds.size === 0) return calleeIds;
    return calleeIds.filter((calleeId) => {
        const ownerFileId = nodeIdToFileId.get(calleeId);
        return ownerFileId ? importedTargetFileIds.has(ownerFileId) : false;
    });
}

export function resolveImportedSymbolReferenceEdges(
    sourceFileId: string,
    importerPath: string,
    resolvedImportsByFile: Map<string, Array<{ imp: ImportInfo; resolvedPath: string }>>,
    resultByPath: Map<string, ParseResult>,
    calls: CallInfo[],
): GraphEdge[] {
    const edges: GraphEdge[] = [];
    const seen = new Set<string>();
    const resolvedImports = resolvedImportsByFile.get(importerPath) ?? [];
    for (const { imp, resolvedPath } of resolvedImports) {
        if (imp.isTypeOnly) continue;
        const targetResult = resultByPath.get(resolvedPath);
        if (!targetResult) continue;
        for (const rawSpecifier of imp.specifiers) {
            const parsed = parseImportSpecifier(rawSpecifier);
            if (!parsed) continue;

            let targets: GraphNode[];
            if (imp.isReExport) {
                targets = resolveReExportTargets(targetResult, parsed);
            } else if (parsed.isNamespace || imp.isDefault) {
                const accessedNames = new Set<string>();
                for (const call of calls) {
                    if (call.receiverName === parsed.localName && call.isMethodCall) {
                        accessedNames.add(call.calleeName);
                    }
                }
                targets = targetResult.nodes.filter(
                    (n) =>
                        (n.type === 'function' || n.type === 'class' || n.type === 'variable')
                        && accessedNames.has(n.name),
                );
            } else {
                targets = targetResult.nodes.filter(
                    (n) =>
                        (n.type === 'function' || n.type === 'class' || n.type === 'variable')
                        && n.name === parsed.importedName,
                );
            }

            for (const target of targets) {
                const key = `${sourceFileId}->${target.id}`;
                if (seen.has(key)) continue;
                seen.add(key);
                edges.push({
                    id: `${sourceFileId}->depends_on->${target.id}`,
                    type: 'DEPENDS_ON' as const,
                    sourceId: sourceFileId,
                    targetId: target.id,
                    confidence: parsed.isNamespace || imp.isDefault ? 0.7 : 0.85,
                    kind: 'import' as const,
                });
            }
        }
    }
    return edges;
}

/** Resolve calls through imported array aliases.
 * Example:
 *   // sanitizeMiddleware.ts
 *   export const sanitizeInputs = [sanitizeQueryParams, sanitizeBodyParams]
 *   // index.ts
 *   app.use(sanitizeInputs)
 * This creates CALLS edges from the actual caller to both underlying functions.
 */
export function resolveImportedArrayAliasCallEdges(
    current: ParseResult,
    allResults: ParseResult[],
    localFuncMap: Map<string, string>,
    resolvedImportsByFile: Map<string, Array<{ imp: ImportInfo; resolvedPath: string }>>,
): GraphEdge[] {
    const edges: GraphEdge[] = [];
    const seen = new Set<string>();
    const resultByPath = new Map(allResults.map(r => [r.file.path, r] as const));
    const resolvedImports = resolvedImportsByFile.get(current.file.path) ?? [];

    const importedAliasTargets = new Map<string, ParseResult[]>();
    for (const entry of resolvedImports) {
        const targetResult = resultByPath.get(entry.resolvedPath);
        if (!targetResult) continue;
        for (const specifier of entry.imp.specifiers) {
            const normalized = normalizeImportSpecifier(specifier);
            if (!normalized) continue;
            const arr = importedAliasTargets.get(normalized) ?? [];
            arr.push(targetResult);
            importedAliasTargets.set(normalized, arr);
        }
    }

    for (const call of current.calls) {
        const targetFiles = importedAliasTargets.get(call.calleeName);
        if (!targetFiles || targetFiles.length === 0) continue;

        const sourceId =
            call.callerName === '__file__'
                ? current.file.id
                : localFuncMap.get(call.callerName);
        if (!sourceId) continue;

        for (const targetFile of targetFiles) {
            const aliasMembers = targetFile.arrayAliases[call.calleeName] ?? [];
            if (aliasMembers.length === 0) continue;
            const aliasVarNode = targetFile.nodes.find(
                n => n.type === 'variable' && n.name === call.calleeName,
            );

                        if (aliasVarNode) {
                const varKey = `${sourceId}->${aliasVarNode.id}`;
                if (!seen.has(varKey)) {
                    seen.add(varKey);
                    edges.push({
                        id: `${sourceId}->depends_on->${aliasVarNode.id}`,
                        type: 'DEPENDS_ON' as const,
                        sourceId,
                        targetId: aliasVarNode.id,
                        confidence: 0.9,
                        kind: 'call' as const,
                    });
                }
            }

            for (const memberName of aliasMembers) {
                const targetFunctions = targetFile.nodes.filter(
                    n => n.type === 'function' && n.name === memberName,
                );
                for (const fn of targetFunctions) {
                    const key = `${sourceId}->${fn.id}`;
                    if (seen.has(key)) continue;
                    seen.add(key);
                    edges.push({
                        id: `${sourceId}->calls->${fn.id}`,
                        type: 'CALLS' as const,
                        sourceId,
                        targetId: fn.id,
                        confidence: 0.85,
                        line: call.line,
                        column: call.column,
                    });
                }
            }
        }
    }

    return edges;
}
