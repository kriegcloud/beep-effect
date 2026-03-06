import type { GraphNode, GraphEdge } from '@nomik/core';
import { createNodeId } from '../utils.js';

// ────────────────────────────────────────────────────────────────────────
// Terraform / IaC Config Parsing
//
// Detects:
//   - .tf files: resource, data, module, variable, output, provider blocks
//   - Extracts resource types, names, and key attributes
//
// Creates: Class-like nodes for resources, variable nodes for tf variables
// ────────────────────────────────────────────────────────────────────────

export interface TerraformResourceInfo {
    resourceType: string;
    name: string;
    provider?: string;
    attributes: Record<string, string>;
}

export interface TerraformVariableInfo {
    name: string;
    type?: string;
    defaultValue?: string;
    description?: string;
}

export interface TerraformModuleInfo {
    name: string;
    source: string;
}

export interface TerraformOutputInfo {
    name: string;
    value?: string;
    description?: string;
}

export function extractTerraformResources(content: string, _filePath: string): TerraformResourceInfo[] {
    const resources: TerraformResourceInfo[] = [];

    // resource "aws_instance" "web" { ... }
    const resourcePattern = /\bresource\s+"(\w+)"\s+"(\w+)"\s*\{/g;
    let match: RegExpExecArray | null;

    while ((match = resourcePattern.exec(content)) !== null) {
        const resourceType = match[1] ?? '';
        const name = match[2] ?? '';
        const blockStart = match.index + match[0].length;
        const block = extractHCLBlock(content, blockStart);

        const attributes: Record<string, string> = {};
        const attrPattern = /(\w+)\s*=\s*"([^"]*)"/g;
        let attrMatch: RegExpExecArray | null;
        while ((attrMatch = attrPattern.exec(block)) !== null) {
            if (attrMatch[1] && attrMatch[2]) attributes[attrMatch[1]] = attrMatch[2];
        }

        const provider = resourceType.split('_')[0];
        resources.push({ resourceType, name, provider, attributes });
    }

    // data "aws_ami" "latest" { ... }
    const dataPattern = /\bdata\s+"(\w+)"\s+"(\w+)"\s*\{/g;
    while ((match = dataPattern.exec(content)) !== null) {
        const resourceType = `data.${match[1] ?? ''}`;
        const name = match[2] ?? '';
        const provider = (match[1] ?? '').split('_')[0];
        resources.push({ resourceType, name, provider, attributes: {} });
    }

    return resources;
}

export function extractTerraformVariables(content: string, _filePath: string): TerraformVariableInfo[] {
    const variables: TerraformVariableInfo[] = [];

    const varPattern = /\bvariable\s+"(\w+)"\s*\{/g;
    let match: RegExpExecArray | null;

    while ((match = varPattern.exec(content)) !== null) {
        const name = match[1] ?? '';
        const blockStart = match.index + match[0].length;
        const block = extractHCLBlock(content, blockStart);

        const typeMatch = block.match(/type\s*=\s*(\S+)/);
        const defaultMatch = block.match(/default\s*=\s*"([^"]*)"/);
        const descMatch = block.match(/description\s*=\s*"([^"]*)"/);

        variables.push({
            name,
            type: typeMatch?.[1],
            defaultValue: defaultMatch?.[1],
            description: descMatch?.[1],
        });
    }

    return variables;
}

export function extractTerraformModules(content: string, _filePath: string): TerraformModuleInfo[] {
    const modules: TerraformModuleInfo[] = [];

    const modulePattern = /\bmodule\s+"(\w+)"\s*\{/g;
    let match: RegExpExecArray | null;

    while ((match = modulePattern.exec(content)) !== null) {
        const name = match[1] ?? '';
        const blockStart = match.index + match[0].length;
        const block = extractHCLBlock(content, blockStart);

        const sourceMatch = block.match(/source\s*=\s*"([^"]*)"/);
        modules.push({ name, source: sourceMatch?.[1] ?? 'unknown' });
    }

    return modules;
}

export function extractTerraformOutputs(content: string, _filePath: string): TerraformOutputInfo[] {
    const outputs: TerraformOutputInfo[] = [];

    const outputPattern = /\boutput\s+"(\w+)"\s*\{/g;
    let match: RegExpExecArray | null;

    while ((match = outputPattern.exec(content)) !== null) {
        const name = match[1] ?? '';
        const blockStart = match.index + match[0].length;
        const block = extractHCLBlock(content, blockStart);

        const valueMatch = block.match(/value\s*=\s*(.+)/);
        const descMatch = block.match(/description\s*=\s*"([^"]*)"/);

        outputs.push({
            name,
            value: valueMatch?.[1]?.trim(),
            description: descMatch?.[1],
        });
    }

    return outputs;
}

/** Extract a brace-delimited block starting from a position after the opening { */
function extractHCLBlock(content: string, startIdx: number): string {
    let depth = 1;
    let i = startIdx;
    while (i < content.length && depth > 0) {
        if (content[i] === '{') depth++;
        if (content[i] === '}') depth--;
        i++;
    }
    return content.slice(startIdx, i - 1);
}

export function buildTerraformNodes(
    resources: TerraformResourceInfo[],
    variables: TerraformVariableInfo[],
    modules: TerraformModuleInfo[],
    _outputs: TerraformOutputInfo[],
    filePath: string,
): { nodes: GraphNode[]; edges: GraphEdge[] } {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];

    // Resources → Class nodes
    for (const res of resources) {
        const nodeId = createNodeId('class', filePath, `tf:${res.resourceType}.${res.name}`);
        nodes.push({
            id: nodeId,
            type: 'class',
            name: `${res.resourceType}.${res.name}`,
            filePath,
            methods: Object.keys(res.attributes),
            properties: Object.values(res.attributes),
            superClass: res.resourceType,
            interfaces: [],
            decorators: ['terraform', res.provider ?? ''],
            isAbstract: res.resourceType.startsWith('data.'),
            isExported: true,
            startLine: 0,
            endLine: 0,
        });
    }

    // Variables → EnvVar nodes
    for (const v of variables) {
        const nodeId = createNodeId('env_var', filePath, `tf-var:${v.name}`);
        nodes.push({
            id: nodeId,
            type: 'env_var',
            name: `tf.var.${v.name}`,
            required: !v.defaultValue,
            defaultValue: v.defaultValue,
        });
    }

    // Modules → Module nodes
    for (const mod of modules) {
        const nodeId = createNodeId('module', filePath, `tf-mod:${mod.name}`);
        nodes.push({
            id: nodeId,
            type: 'module',
            name: `tf.module.${mod.name}`,
            path: mod.source,
            moduleType: mod.source.startsWith('.') ? 'file' : 'external',
        });
    }

    return { nodes, edges };
}
