import type { GraphNode, GraphEdge } from '@nomik/core';
import { createNodeId } from '../utils.js';

// ────────────────────────────────────────────────────────────────────────
// CloudFormation / SAM Template Parsing
//
// Parses CloudFormation YAML/JSON templates:
//   - Resources (Type, Properties)
//   - Parameters (Type, Default, Description)
//   - Outputs (Value, Export)
//
// Creates: ClassNode (resources), EnvVarNode (parameters), ModuleNode (outputs)
// ────────────────────────────────────────────────────────────────────────

export interface CFNResourceInfo {
    logicalId: string;
    type: string;
    provider: string;
    line: number;
}

export interface CFNParameterInfo {
    name: string;
    type: string;
    defaultValue?: string;
    description?: string;
    line: number;
}

export interface CFNOutputInfo {
    name: string;
    exportName?: string;
    line: number;
}


export function extractCFNResources(content: string, _filePath: string): CFNResourceInfo[] {
    const resources: CFNResourceInfo[] = [];
    const lines = content.split('\n');
    let inResources = false;
    let currentLogicalId: string | null = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i]!;

        if (/^\S/.test(line)) {
            inResources = line.startsWith('Resources:');
            currentLogicalId = null;
            continue;
        }

        if (!inResources) continue;

        const idMatch = line.match(/^  (\w+):\s*$/);
        if (idMatch) {
            currentLogicalId = idMatch[1]!;
            continue;
        }

        if (currentLogicalId) {
            const typeMatch = line.match(/^\s+Type:\s*['"]?([^\s'"#]+)/);
            if (typeMatch) {
                const type = typeMatch[1]!;
                const provider = type.split('::')[1] ?? type.split('::')[0] ?? 'unknown';
                resources.push({ logicalId: currentLogicalId, type, provider, line: i + 1 });
                currentLogicalId = null;
            }
        }
    }

    return resources;
}


export function extractCFNParameters(content: string, _filePath: string): CFNParameterInfo[] {
    const params: CFNParameterInfo[] = [];
    const lines = content.split('\n');
    let inParameters = false;
    let currentParam: { name: string; line: number; type?: string; defaultValue?: string; description?: string } | null = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i]!;

        if (/^\S/.test(line)) {
            if (currentParam) { params.push({ ...currentParam, type: currentParam.type ?? 'String', line: currentParam.line }); currentParam = null; }
            inParameters = line.startsWith('Parameters:');
            continue;
        }

        if (!inParameters) continue;

        const nameMatch = line.match(/^  (\w+):\s*$/);
        if (nameMatch) {
            if (currentParam) params.push({ ...currentParam, type: currentParam.type ?? 'String', line: currentParam.line });
            currentParam = { name: nameMatch[1]!, line: i + 1 };
            continue;
        }

        if (currentParam) {
            const typeMatch = line.match(/^\s+Type:\s*['"]?(\S+)/);
            if (typeMatch) currentParam.type = typeMatch[1];
            const defaultMatch = line.match(/^\s+Default:\s*['"]?([^\s'"#]+)/);
            if (defaultMatch) currentParam.defaultValue = defaultMatch[1];
            const descMatch = line.match(/^\s+Description:\s*['"]?([^'"#\n]+)/);
            if (descMatch) currentParam.description = descMatch[1]?.trim();
        }
    }

    if (currentParam) params.push({ ...currentParam, type: currentParam.type ?? 'String', line: currentParam.line });
    return params;
}


export function extractCFNOutputs(content: string, _filePath: string): CFNOutputInfo[] {
    const outputs: CFNOutputInfo[] = [];
    const lines = content.split('\n');
    let inOutputs = false;
    let currentOutput: { name: string; exportName?: string; line: number } | null = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i]!;

        if (/^\S/.test(line)) {
            if (currentOutput) { outputs.push(currentOutput); currentOutput = null; }
            inOutputs = line.startsWith('Outputs:');
            continue;
        }

        if (!inOutputs) continue;

        const nameMatch = line.match(/^  (\w+):\s*$/);
        if (nameMatch) {
            if (currentOutput) outputs.push(currentOutput);
            currentOutput = { name: nameMatch[1]!, line: i + 1 };
            continue;
        }

        if (currentOutput) {
            const exportMatch = line.match(/^\s+Name:\s*['"]?([^\s'"#]+)/);
            if (exportMatch) currentOutput.exportName = exportMatch[1];
        }
    }

    if (currentOutput) outputs.push(currentOutput);
    return outputs;
}


export function buildCFNNodes(
    resources: CFNResourceInfo[],
    parameters: CFNParameterInfo[],
    _outputs: CFNOutputInfo[],
    filePath: string,
): { nodes: GraphNode[]; edges: GraphEdge[] } {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];

    for (const res of resources) {
        const nodeId = createNodeId('class', filePath, `cfn:${res.type}.${res.logicalId}`);
        nodes.push({
            id: nodeId,
            type: 'class' as const,
            name: `${res.type} (${res.logicalId})`,
            filePath,
            methods: [],
            properties: [res.type, res.provider],
            interfaces: [],
            decorators: ['cloudformation'],
            isAbstract: false,
            isExported: true,
            startLine: res.line,
            endLine: res.line,
        });
    }

    for (const param of parameters) {
        const nodeId = createNodeId('env_var', filePath, `cfn-param:${param.name}`);
        nodes.push({
            id: nodeId,
            type: 'env_var' as const,
            name: param.name,
            required: param.defaultValue === undefined,
            defaultValue: param.defaultValue,
        });
    }

    return { nodes, edges };
}
