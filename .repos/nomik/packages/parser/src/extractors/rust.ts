import type Parser from 'tree-sitter';
import type { FunctionNode, ClassNode, ParameterInfo } from '@nomik/core';
import { createNodeId } from '../utils';
import type { ImportInfo } from './imports';
import type { CallInfo } from './calls';

/** Extrait les fonctions Rust (fn, async fn, methodes impl) */
export function extractRustFunctions(tree: Parser.Tree, filePath: string): FunctionNode[] {
    const results: FunctionNode[] = [];
    const cursor = tree.walk();

    function visit(): void {
        const node = cursor.currentNode;

        if (node.type === 'function_item') {
            const fn = buildFunctionNode(node, filePath);
            if (fn) results.push(fn);
        }

        if (cursor.gotoFirstChild()) {
            do { visit(); } while (cursor.gotoNextSibling());
            cursor.gotoParent();
        }
    }

    visit();
    return results;
}

function buildFunctionNode(node: Parser.SyntaxNode, filePath: string): FunctionNode | null {
    const nameNode = node.childForFieldName('name');
    if (!nameNode) return null;
    const name = nameNode.text;

    const paramsNode = node.childForFieldName('parameters');
    const paramInfos: ParameterInfo[] = paramsNode ? paramsNode.namedChildren
        .filter(c => c.type === 'parameter' || c.type === 'self_parameter')
        .map(c => {
            const pattern = c.childForFieldName('pattern');
            const pName = pattern?.text ?? c.text;
            const pType = c.childForFieldName('type')?.text;
            return { name: pName, type: pType, optional: false } as ParameterInfo;
        })
        .filter(p => p.name !== 'self' && p.name !== '&self' && p.name !== '&mut self') : [];

    const isPub = node.children.some(c => c.type === 'visibility_modifier');
    const isAsync = node.text.trimStart().startsWith('async') || node.text.trimStart().startsWith('pub async');

    const attrs = extractAttributes(node);

    return {
        id: createNodeId('function', filePath, name),
        type: 'function',
        name,
        filePath,
        startLine: node.startPosition.row + 1,
        endLine: node.endPosition.row + 1,
        isExported: isPub,
        isAsync,
        params: paramInfos,
        isGenerator: false,
        decorators: attrs,
        confidence: 1.0,
    };
}

function extractAttributes(node: Parser.SyntaxNode): string[] {
    const attrs: string[] = [];
    let prev = node.previousNamedSibling;
    while (prev && prev.type === 'attribute_item') {
        attrs.push(prev.text.replace(/^#\[/, '').replace(/\]$/, ''));
        prev = prev.previousNamedSibling;
    }
    return attrs;
}

/** Extrait les structs, enums, traits Rust comme noeuds Class */
export function extractRustClasses(tree: Parser.Tree, filePath: string): ClassNode[] {
    const results: ClassNode[] = [];
    const cursor = tree.walk();

    function visit(): void {
        const node = cursor.currentNode;

        if (node.type === 'struct_item') {
            const cls = buildStructNode(node, filePath);
            if (cls) results.push(cls);
        } else if (node.type === 'enum_item') {
            const cls = buildEnumNode(node, filePath);
            if (cls) results.push(cls);
        } else if (node.type === 'trait_item') {
            const cls = buildTraitNode(node, filePath);
            if (cls) results.push(cls);
        }

        if (cursor.gotoFirstChild()) {
            do { visit(); } while (cursor.gotoNextSibling());
            cursor.gotoParent();
        }
    }

    visit();
    return results;
}

function buildStructNode(node: Parser.SyntaxNode, filePath: string): ClassNode | null {
    const nameNode = node.childForFieldName('name');
    if (!nameNode) return null;
    const name = nameNode.text;
    const isPub = node.children.some(c => c.type === 'visibility_modifier');

    const body = node.childForFieldName('body');
    const fields = body ? body.namedChildren
        .filter(c => c.type === 'field_declaration')
        .map(c => c.childForFieldName('name')?.text)
        .filter((n): n is string => n !== undefined) : [];

    return {
        id: createNodeId('class', filePath, name),
        type: 'class',
        name,
        filePath,
        startLine: node.startPosition.row + 1,
        endLine: node.endPosition.row + 1,
        isExported: isPub,
        isAbstract: false,
        superClass: undefined,
        interfaces: [],
        decorators: extractAttributes(node),
        methods: [],
        properties: fields,
    };
}

function buildEnumNode(node: Parser.SyntaxNode, filePath: string): ClassNode | null {
    const nameNode = node.childForFieldName('name');
    if (!nameNode) return null;
    const name = nameNode.text;
    const isPub = node.children.some(c => c.type === 'visibility_modifier');

    const body = node.childForFieldName('body');
    const variants = body ? body.namedChildren
        .filter(c => c.type === 'enum_variant')
        .map(c => c.childForFieldName('name')?.text)
        .filter((n): n is string => n !== undefined) : [];

    return {
        id: createNodeId('class', filePath, name),
        type: 'class',
        name,
        filePath,
        startLine: node.startPosition.row + 1,
        endLine: node.endPosition.row + 1,
        isExported: isPub,
        isAbstract: false,
        superClass: undefined,
        interfaces: [],
        decorators: extractAttributes(node),
        methods: [],
        properties: variants,
    };
}

function buildTraitNode(node: Parser.SyntaxNode, filePath: string): ClassNode | null {
    const nameNode = node.childForFieldName('name');
    if (!nameNode) return null;
    const name = nameNode.text;
    const isPub = node.children.some(c => c.type === 'visibility_modifier');

    const body = node.childForFieldName('body');
    const methods = body ? body.namedChildren
        .filter(c => c.type === 'function_item' || c.type === 'function_signature_item')
        .map(c => c.childForFieldName('name')?.text)
        .filter((n): n is string => n !== undefined) : [];

    return {
        id: createNodeId('class', filePath, name),
        type: 'class',
        name,
        filePath,
        startLine: node.startPosition.row + 1,
        endLine: node.endPosition.row + 1,
        isExported: isPub,
        isAbstract: true,
        superClass: undefined,
        interfaces: [],
        decorators: extractAttributes(node),
        methods,
        properties: [],
    };
}

/** Extrait les use statements Rust */
export function extractRustImports(tree: Parser.Tree, _filePath: string): ImportInfo[] {
    const results: ImportInfo[] = [];
    const cursor = tree.walk();

    function visit(): void {
        const node = cursor.currentNode;

        if (node.type === 'use_declaration') {
            const arg = node.childForFieldName('argument');
            if (arg) {
                const source = arg.text.split('::').slice(0, -1).join('::') || arg.text;
                const last = arg.text.split('::').pop() ?? arg.text;
                const specifiers = last.startsWith('{')
                    ? last.replace(/[{}]/g, '').split(',').map(s => s.trim()).filter(Boolean)
                    : [last];
                results.push({ source, specifiers, isDefault: false, isDynamic: false, isTypeOnly: false, line: node.startPosition.row + 1 });
            }
        }

        if (cursor.gotoFirstChild()) {
            do { visit(); } while (cursor.gotoNextSibling());
            cursor.gotoParent();
        }
    }

    visit();
    return results;
}

/** Extrait les appels de fonctions Rust */
export function extractRustCalls(tree: Parser.Tree, _filePath: string): CallInfo[] {
    const results: CallInfo[] = [];
    const cursor = tree.walk();

    function visit(): void {
        const node = cursor.currentNode;

        if (node.type === 'call_expression') {
            const funcNode = node.childForFieldName('function');
            if (funcNode) {
                const callerNode = findEnclosingFunction(node);
                const calleeName = funcNode.text;
                results.push({
                    callerName: callerNode?.childForFieldName('name')?.text ?? '<module>',
                    calleeName,
                    line: node.startPosition.row + 1,
                    column: node.startPosition.column,
                    isMethodCall: calleeName.includes('.') || calleeName.includes('::'),
                    isConstructor: calleeName.endsWith('::new'),
                });
            }
        }

        if (cursor.gotoFirstChild()) {
            do { visit(); } while (cursor.gotoNextSibling());
            cursor.gotoParent();
        }
    }

    visit();
    return results;
}

function findEnclosingFunction(node: Parser.SyntaxNode): Parser.SyntaxNode | null {
    let current = node.parent;
    while (current) {
        if (current.type === 'function_item') return current;
        current = current.parent;
    }
    return null;
}
