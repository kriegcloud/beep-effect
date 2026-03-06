import type Parser from 'tree-sitter';
import type { GraphNode, GraphEdge } from '@nomik/core';
import type { ImportInfo } from './imports.js';
import { findEnclosingFunctionName, extractFirstStringArg } from './ast-utils.js';
import { createNodeId } from '../utils.js';

// ────────────────────────────────────────────────────────────────────────
// Feature Flag Detection — import-aware
//
// Detects:
//   - LaunchDarkly: ldClient.variation(), ldClient.boolVariation()
//   - Unleash: unleash.isEnabled(), client.isEnabled()
//   - Flagsmith: flagsmith.hasFeature(), flagsmith.getValue()
//   - Split.io: client.getTreatment()
//   - GrowthBook: growthbook.isOn(), growthbook.getFeatureValue()
//   - Custom: process.env.FEATURE_*, process.env.FF_*
//
// Creates: EnvVarNode (with flagProvider metadata) + USES_ENV edges
// ────────────────────────────────────────────────────────────────────────

export interface FeatureFlagInfo {
    flagName: string;
    provider: 'launchdarkly' | 'unleash' | 'flagsmith' | 'split' | 'growthbook' | 'custom';
    operation: 'check' | 'value';
    callerName: string;
    line: number;
}

const FLAG_PACKAGES: Record<string, FeatureFlagInfo['provider']> = {
    'launchdarkly-node-server-sdk': 'launchdarkly',
    'launchdarkly-node-client-sdk': 'launchdarkly',
    '@launchdarkly/node-server-sdk': 'launchdarkly',
    'launchdarkly-js-client-sdk': 'launchdarkly',
    'unleash-client': 'unleash',
    'unleash-proxy-client': 'unleash',
    'flagsmith': 'flagsmith',
    'flagsmith-nodejs': 'flagsmith',
    '@splitsoftware/splitio': 'split',
    '@growthbook/growthbook': 'growthbook',
    '@growthbook/growthbook-react': 'growthbook',
};

const VARIATION_METHODS = new Set([
    'variation', 'boolVariation', 'stringVariation', 'numberVariation',
    'jsonVariation', 'variationDetail', 'boolVariationDetail',
]);
const CHECK_METHODS = new Set([
    'isEnabled', 'hasFeature', 'isOn', 'isFeatureEnabled',
]);
const VALUE_METHODS = new Set([
    'getValue', 'getFeatureValue', 'getTreatment', 'getTreatments',
    'getFeature',
]);

// ────────────────────────────────────────────────────────────────────────
// Step 1: Build feature flag client identifiers from imports
// ────────────────────────────────────────────────────────────────────────

export function buildFlagClientIdentifiers(imports: ImportInfo[]): {
    ids: Set<string>;
    providerMap: Map<string, FeatureFlagInfo['provider']>;
} {
    const ids = new Set<string>();
    const providerMap = new Map<string, FeatureFlagInfo['provider']>();

    for (const imp of imports) {
        const source = imp.source.trim();
        const provider = FLAG_PACKAGES[source];
        if (!provider) continue;

        for (const spec of imp.specifiers) {
            ids.add(spec);
            providerMap.set(spec, provider);
        }
    }
    return { ids, providerMap };
}

export function extractFeatureFlags(
    tree: Parser.Tree,
    _filePath: string,
    clientIds: Set<string>,
    providerMap: Map<string, FeatureFlagInfo['provider']>,
): FeatureFlagInfo[] {
    const results: FeatureFlagInfo[] = [];
    const resolvedIds = new Set(clientIds);
    const resolvedProviderMap = new Map(providerMap);

    // Resolve variable assignments: const ldClient = ld.init(), const client = new Unleash()
    resolveClientInstances(tree.rootNode, clientIds, resolvedIds, providerMap, resolvedProviderMap);

    function visit(node: Parser.SyntaxNode): void {
        if (node.type === 'call_expression') {
            const info = parseFlagCall(node, resolvedIds, resolvedProviderMap);
            if (info) results.push(info);
        }

        // Also detect process.env.FEATURE_* / process.env.FF_* patterns
        if (node.type === 'member_expression') {
            const info = parseEnvFeatureFlag(node);
            if (info) results.push(info);
        }

        for (const child of node.children) visit(child);
    }

    visit(tree.rootNode);
    return results;
}

function resolveClientInstances(
    root: Parser.SyntaxNode,
    importedIds: Set<string>,
    resolvedIds: Set<string>,
    providerMap: Map<string, FeatureFlagInfo['provider']>,
    resolvedProviderMap: Map<string, FeatureFlagInfo['provider']>,
): void {
    function tryResolve(node: Parser.SyntaxNode): void {
        if (node.type === 'variable_declarator') {
            const nameNode = node.childForFieldName('name');
            const valueNode = node.childForFieldName('value');
            if (nameNode && valueNode) {
                if (valueNode.type === 'new_expression') {
                    const ctor = valueNode.childForFieldName('constructor');
                    if (ctor && (importedIds.has(ctor.text) || resolvedIds.has(ctor.text))) {
                        resolvedIds.add(nameNode.text);
                        const provider = providerMap.get(ctor.text) ?? resolvedProviderMap.get(ctor.text);
                        if (provider) resolvedProviderMap.set(nameNode.text, provider);
                    }
                }
                if (valueNode.type === 'call_expression') {
                    const fn = valueNode.childForFieldName('function');
                    if (fn?.type === 'member_expression') {
                        const obj = fn.childForFieldName('object');
                        if (obj && (importedIds.has(obj.text) || resolvedIds.has(obj.text))) {
                            resolvedIds.add(nameNode.text);
                            const provider = providerMap.get(obj.text) ?? resolvedProviderMap.get(obj.text);
                            if (provider) resolvedProviderMap.set(nameNode.text, provider);
                        }
                    }
                    if (fn?.type === 'identifier' && (importedIds.has(fn.text) || resolvedIds.has(fn.text))) {
                        resolvedIds.add(nameNode.text);
                        const provider = providerMap.get(fn.text) ?? resolvedProviderMap.get(fn.text);
                        if (provider) resolvedProviderMap.set(nameNode.text, provider);
                    }
                }
            }
        }
        for (const child of node.children) tryResolve(child);
    }
    tryResolve(root);
    tryResolve(root);
}

function parseFlagCall(
    callNode: Parser.SyntaxNode,
    clientIds: Set<string>,
    providerMap: Map<string, FeatureFlagInfo['provider']>,
): FeatureFlagInfo | null {
    const fn = callNode.childForFieldName('function');
    if (!fn || fn.type !== 'member_expression') return null;

    const obj = fn.childForFieldName('object');
    const prop = fn.childForFieldName('property');
    if (!obj || !prop) return null;
    if (!clientIds.has(obj.text)) return null;

    const method = prop.text;
    const callerName = findEnclosingFunctionName(callNode) ?? '__file__';
    const line = callNode.startPosition.row + 1;
    const provider = providerMap.get(obj.text) ?? 'custom';

    let operation: FeatureFlagInfo['operation'] = 'check';
    if (VARIATION_METHODS.has(method) || VALUE_METHODS.has(method)) {
        operation = 'value';
    } else if (CHECK_METHODS.has(method)) {
        operation = 'check';
    } else {
        return null;
    }

    const flagName = extractFirstStringArg(callNode);
    if (!flagName) return null;

    return { flagName, provider, operation, callerName, line };
}

function parseEnvFeatureFlag(node: Parser.SyntaxNode): FeatureFlagInfo | null {
    // process.env.FEATURE_DARK_MODE or process.env.FF_NEW_UI
    const text = node.text;
    const match = text.match(/process\.env\.((?:FEATURE_|FF_|FLAG_)\w+)/);
    if (!match?.[1]) return null;

    const callerName = findEnclosingFunctionName(node) ?? '__file__';
    return {
        flagName: match[1],
        provider: 'custom',
        operation: 'check',
        callerName,
        line: node.startPosition.row + 1,
    };
}

export function buildFlagNodesAndEdges(
    flags: FeatureFlagInfo[],
    funcMap: Map<string, string>,
    fileId: string,
    filePath: string,
): { nodes: GraphNode[]; edges: GraphEdge[] } {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const seenNodes = new Set<string>();

    for (const flag of flags) {
        const nodeId = createNodeId('env_var', filePath, `flag:${flag.flagName}`);

        if (!seenNodes.has(nodeId)) {
            seenNodes.add(nodeId);
            nodes.push({
                id: nodeId,
                type: 'env_var',
                name: flag.flagName,
                required: false,
                defaultValue: undefined,
            });
        }

        const sourceId = funcMap.get(flag.callerName) ?? fileId;
        edges.push({
            id: `${sourceId}->uses_env->${nodeId}`,
            type: 'USES_ENV' as const,
            sourceId,
            targetId: nodeId,
            confidence: 0.85,
        });
    }

    return { nodes, edges };
}
