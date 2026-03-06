import Parser from 'tree-sitter';
import type { EnvVarNode, UsesEnvEdge, GraphNode, GraphEdge } from '@nomik/core';
import { createNodeId } from '../utils.js';

// ────────────────────────────────────────────────────────────────────────
// Environment Variable Detection — multi-language, tree-sitter based
//
// Patterns detected:
//   TypeScript/JavaScript:
//     - process.env.VAR_NAME           (member_expression)
//     - process.env['VAR_NAME']        (subscript_expression)
//     - process.env.VAR ?? 'default'   (with default extraction)
//     - process.env.VAR || 'default'
//     - process.env.VAR!               (non-null assertion → required)
//   Python:
//     - os.environ['VAR_NAME']
//     - os.environ.get('VAR_NAME')
//     - os.environ.get('VAR_NAME', 'default')
//     - os.getenv('VAR_NAME')
//     - os.getenv('VAR_NAME', 'default')
//
// Creates: EnvVarNode + USES_ENV edges
// ────────────────────────────────────────────────────────────────────────

export interface EnvVarInfo {
    varName: string;
    callerName: string;
    defaultValue?: string;
    required: boolean;
    line: number;
}


export function extractEnvVars(tree: Parser.Tree, _filePath: string): EnvVarInfo[] {
    const results: EnvVarInfo[] = [];
    const cursor = tree.walk();
    let currentFunction = '__file__';
    const functionStack: string[] = [];

    function visit(): void {
        const node = cursor.currentNode;

        // Track function scope
        if (
            node.type === 'function_declaration' ||
            node.type === 'method_definition' ||
            node.type === 'arrow_function' ||
            node.type === 'function_expression' ||
            node.type === 'generator_function_declaration'
        ) {
            const name = node.childForFieldName('name')?.text;
            if (name) {
                functionStack.push(currentFunction);
                currentFunction = name;
            } else if (node.parent?.type === 'variable_declarator') {
                const varName = node.parent.childForFieldName('name')?.text;
                if (varName) {
                    functionStack.push(currentFunction);
                    currentFunction = varName;
                }
            }
        }

        // Pattern 1: process.env.VAR_NAME (member_expression)
        if (node.type === 'member_expression') {
            const envInfo = tryProcessEnvMember(node);
            if (envInfo) {
                results.push({ ...envInfo, callerName: currentFunction });
            }
        }

        // Pattern 2: process.env['VAR_NAME'] (subscript_expression)
        if (node.type === 'subscript_expression') {
            const envInfo = tryProcessEnvSubscript(node);
            if (envInfo) {
                results.push({ ...envInfo, callerName: currentFunction });
            }
        }

        if (cursor.gotoFirstChild()) {
            do { visit(); } while (cursor.gotoNextSibling());
            cursor.gotoParent();
        }

        // Pop function scope
        if (
            (node.type === 'function_declaration' ||
                node.type === 'method_definition' ||
                node.type === 'arrow_function' ||
                node.type === 'function_expression' ||
                node.type === 'generator_function_declaration') &&
            functionStack.length > 0
        ) {
            const name = node.childForFieldName('name')?.text
                ?? (node.parent?.type === 'variable_declarator'
                    ? node.parent.childForFieldName('name')?.text
                    : undefined);
            if (name) {
                currentFunction = functionStack.pop()!;
            }
        }
    }

    visit();
    return results;
}

function tryProcessEnvMember(node: Parser.SyntaxNode): Omit<EnvVarInfo, 'callerName'> | null {
    // process.env.VAR_NAME → member_expression { object: member_expression { object: "process", property: "env" }, property: "VAR_NAME" }
    const obj = node.childForFieldName('object');
    const prop = node.childForFieldName('property');
    if (!obj || !prop) return null;
    if (obj.type !== 'member_expression') return null;

    const innerObj = obj.childForFieldName('object');
    const innerProp = obj.childForFieldName('property');
    if (innerObj?.text !== 'process' || innerProp?.text !== 'env') return null;

    const varName = prop.text;
    if (!varName || varName === 'env') return null;

    const { defaultValue, required } = extractDefaultAndRequired(node);
    return { varName, defaultValue, required, line: node.startPosition.row + 1 };
}

function tryProcessEnvSubscript(node: Parser.SyntaxNode): Omit<EnvVarInfo, 'callerName'> | null {
    // process.env['VAR_NAME'] → subscript_expression { object: member_expression, index: string }
    const obj = node.childForFieldName('object');
    const index = node.childForFieldName('index');
    if (!obj || !index) return null;
    if (obj.type !== 'member_expression') return null;

    const innerObj = obj.childForFieldName('object');
    const innerProp = obj.childForFieldName('property');
    if (innerObj?.text !== 'process' || innerProp?.text !== 'env') return null;

    // Only accept string literals — skip dynamic references like process.env[variable]
    if (index.type !== 'string') return null;

    const raw = index.text.replace(/['"]/g, '');
    if (!raw) return null;

    const { defaultValue, required } = extractDefaultAndRequired(node);
    return { varName: raw, defaultValue, required, line: node.startPosition.row + 1 };
}

function extractDefaultAndRequired(node: Parser.SyntaxNode): { defaultValue?: string; required: boolean } {
    const parent = node.parent;
    if (!parent) return { required: false };

    // process.env.VAR! → non_null_expression → required
    if (parent.type === 'non_null_expression') {
        return { required: true };
    }

    // process.env.VAR ?? 'default' → binary_expression with ??
    // process.env.VAR || 'default' → binary_expression with ||
    if (parent.type === 'binary_expression' || parent.type === 'augmented_assignment_expression') {
        const op = parent.children.find(c => c.text === '??' || c.text === '||');
        if (op) {
            const right = parent.childForFieldName('right');
            if (right) {
                const val = right.text.replace(/^['"]|['"]$/g, '');
                return { defaultValue: val, required: false };
            }
        }
    }

    return { required: false };
}


export function extractPythonEnvVars(content: string): EnvVarInfo[] {
    const results: EnvVarInfo[] = [];

    // os.environ['VAR'] or os.environ["VAR"]
    const environBracket = /os\.environ\[['"]([A-Z_][A-Z0-9_]*)['"]\]/g;
    let m: RegExpExecArray | null;
    while ((m = environBracket.exec(content)) !== null) {
        const line = content.substring(0, m.index).split('\n').length;
        results.push({ varName: m[1]!, callerName: '__file__', required: true, line });
    }

    // os.environ.get('VAR') or os.environ.get('VAR', 'default')
    const environGet = /os\.environ\.get\(\s*['"]([A-Z_][A-Z0-9_]*)['"]\s*(?:,\s*['"]([^'"]*)['"]\s*)?\)/g;
    while ((m = environGet.exec(content)) !== null) {
        const line = content.substring(0, m.index).split('\n').length;
        results.push({
            varName: m[1]!,
            callerName: '__file__',
            required: !m[2],
            defaultValue: m[2] ?? undefined,
            line,
        });
    }

    // os.getenv('VAR') or os.getenv('VAR', 'default')
    const osGetenv = /os\.getenv\(\s*['"]([A-Z_][A-Z0-9_]*)['"]\s*(?:,\s*['"]([^'"]*)['"]\s*)?\)/g;
    while ((m = osGetenv.exec(content)) !== null) {
        const line = content.substring(0, m.index).split('\n').length;
        results.push({
            varName: m[1]!,
            callerName: '__file__',
            required: !m[2],
            defaultValue: m[2] ?? undefined,
            line,
        });
    }

    return results;
}


export function buildEnvVarNodesAndEdges(
    envVars: EnvVarInfo[],
    funcMap: Map<string, string>,
    fileId: string,
    _filePath: string,
): { nodes: GraphNode[]; edges: GraphEdge[] } {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const seenNodes = new Set<string>();
    const seenEdges = new Set<string>();

    for (const ev of envVars) {
        // Env var nodes are name-scoped (not file-scoped) — same var in multiple files = one node
        const envNodeId = createNodeId('env_var', '__global__', ev.varName);

        if (!seenNodes.has(envNodeId)) {
            seenNodes.add(envNodeId);
            const envNode: EnvVarNode = {
                id: envNodeId,
                type: 'env_var',
                name: ev.varName,
                required: ev.required,
                defaultValue: ev.defaultValue,
            };
            nodes.push(envNode);
        }

        const sourceId = ev.callerName === '__file__'
            ? fileId
            : funcMap.get(ev.callerName) ?? fileId;

        const edgeKey = `${sourceId}->${envNodeId}`;
        if (!seenEdges.has(edgeKey)) {
            seenEdges.add(edgeKey);
            const edge: UsesEnvEdge = {
                id: `${sourceId}->uses_env->${envNodeId}`,
                type: 'USES_ENV',
                sourceId,
                targetId: envNodeId,
                confidence: 0.95,
            };
            edges.push(edge);
        }
    }

    return { nodes, edges };
}
