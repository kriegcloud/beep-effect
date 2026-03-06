import type Parser from 'tree-sitter';
import type { FunctionNode, ClassNode, ParameterInfo } from '@nomik/core';
import { createNodeId } from '../utils';
import type { ImportInfo } from './imports';
import type { CallInfo } from './calls';

/** Extrait les fonctions Python (def, async def, methodes) */
export function extractPythonFunctions(tree: Parser.Tree, filePath: string): FunctionNode[] {
    const results: FunctionNode[] = [];
    const cursor = tree.walk();

    function visit(): void {
        const node = cursor.currentNode;

        if (node.type === 'function_definition') {
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
        .filter(c => c.type === 'identifier' || c.type === 'typed_parameter' || c.type === 'default_parameter')
        .map(c => {
            if (c.type === 'typed_parameter') {
                const pName = c.namedChildren.find(cc => cc.type === 'identifier')?.text ?? c.text;
                const pType = c.childForFieldName('type')?.text;
                return { name: pName, type: pType, optional: false } as ParameterInfo;
            }
            if (c.type === 'default_parameter') {
                const pName = c.childForFieldName('name')?.text ?? c.text;
                return { name: pName, optional: true } as ParameterInfo;
            }
            return { name: c.text, optional: false } as ParameterInfo;
        })
        .filter(p => p.name !== 'self' && p.name !== 'cls') : [];

    const decorators = extractDecorators(node);
    const isExported = !name.startsWith('_');

    return {
        id: createNodeId('function', filePath, name),
        type: 'function',
        name,
        filePath,
        startLine: node.startPosition.row + 1,
        endLine: node.endPosition.row + 1,
        isExported,
        isAsync: node.text.trimStart().startsWith('async'),
        params: paramInfos,
        isGenerator: node.text.includes('yield'),
        decorators,
        confidence: 1.0,
    };
}

function extractDecorators(node: Parser.SyntaxNode): string[] {
    const decorators: string[] = [];
    const parent = node.parent;
    if (parent?.type === 'decorated_definition') {
        for (const child of parent.namedChildren) {
            if (child.type === 'decorator') {
                decorators.push(child.text.replace(/^@/, ''));
            }
        }
    }
    return decorators;
}

/** Extrait les classes Python */
export function extractPythonClasses(tree: Parser.Tree, filePath: string): ClassNode[] {
    const results: ClassNode[] = [];
    const cursor = tree.walk();

    function visit(): void {
        const node = cursor.currentNode;

        if (node.type === 'class_definition') {
            const cls = buildClassNode(node, filePath);
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

function buildClassNode(node: Parser.SyntaxNode, filePath: string): ClassNode | null {
    const nameNode = node.childForFieldName('name');
    if (!nameNode) return null;
    const name = nameNode.text;

    const superclasses = node.childForFieldName('superclasses');
    const bases = superclasses ? superclasses.namedChildren.map(c => c.text) : [];
    const superClass = bases[0];

    const body = node.childForFieldName('body');
    const methods = body ? body.namedChildren
        .filter(c => c.type === 'function_definition' || (c.type === 'decorated_definition' && c.namedChildren.some(cc => cc.type === 'function_definition')))
        .map(c => {
            const fn = c.type === 'function_definition' ? c : c.namedChildren.find(cc => cc.type === 'function_definition');
            return fn?.childForFieldName('name')?.text;
        })
        .filter((n): n is string => n !== undefined) : [];

    const classDecorators = extractDecorators(node);

    return {
        id: createNodeId('class', filePath, name),
        type: 'class',
        name,
        filePath,
        startLine: node.startPosition.row + 1,
        endLine: node.endPosition.row + 1,
        isExported: !name.startsWith('_'),
        isAbstract: classDecorators.some(d => d.includes('abstract') || d.includes('ABC')),
        superClass,
        interfaces: bases.slice(1),
        decorators: classDecorators,
        methods,
        properties: [],
    };
}

/** Extract Python imports (import x, from x import y, from .x import y) */
export function extractPythonImports(tree: Parser.Tree, _filePath: string): ImportInfo[] {
    const results: ImportInfo[] = [];
    const cursor = tree.walk();

    function visit(): void {
        const node = cursor.currentNode;

        if (node.type === 'import_statement') {
            const names = node.namedChildren.filter(c => c.type === 'dotted_name' || c.type === 'aliased_import');
            for (const n of names) {
                const source = n.type === 'aliased_import' ? (n.childForFieldName('name')?.text ?? n.text) : n.text;
                results.push({ source, specifiers: [source.split('.').pop() ?? source], isDefault: false, isDynamic: false, isReExport: false, isTypeOnly: false, line: node.startPosition.row + 1 });
            }
        } else if (node.type === 'import_from_statement') {
            // Determine if this is a relative import (from .x / from ..x / from . import x)
            const relativeImportNode = node.children.find(c => c.type === 'relative_import');

            // Get module source
            let module: string;
            if (relativeImportNode) {
                module = relativeImportNode.text; // ".models", "..utils", "."
            } else {
                module = node.childForFieldName('module_name')?.text
                    ?? node.children.find(c => c.type === 'dotted_name')?.text
                    ?? '';
            }

            // Get imported names.
            // For absolute imports (from search.utils import X): first dotted_name is the module source, skip it.
            // For relative imports (from .models import X): source is a relative_import node, all dotted_name children are imported names.
            const allNameNodes = node.namedChildren.filter(
                c => c.type === 'dotted_name' || c.type === 'aliased_import',
            );
            const importedNameNodes = relativeImportNode ? allNameNodes : allNameNodes.slice(1);

            // Check for wildcard import (from x import *)
            const hasWildcard = node.children.some(c => c.type === 'wildcard_import');

            const names = importedNameNodes.map(c => {
                if (c.type === 'aliased_import') {
                    // Preserve "original as alias" format for cross-file resolver
                    const original = c.childForFieldName('name')?.text ?? c.text;
                    const alias = c.childForFieldName('alias')?.text;
                    return alias && alias !== original ? `${original} as ${alias}` : original;
                }
                return c.text;
            });

            if (hasWildcard) {
                names.push('*');
            }

            if (names.length > 0) {
                results.push({ source: module, specifiers: names, isDefault: false, isDynamic: false, isReExport: false, isTypeOnly: false, line: node.startPosition.row + 1 });
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

/** Extract Python function calls with proper receiver splitting */
export function extractPythonCalls(tree: Parser.Tree, _filePath: string): CallInfo[] {
    const results: CallInfo[] = [];
    const cursor = tree.walk();

    function visit(): void {
        const node = cursor.currentNode;

        if (node.type === 'call') {
            const funcNode = node.childForFieldName('function');
            if (funcNode) {
                const callerNode = findEnclosingFunction(node);
                const rawCalleeName = funcNode.text;

                // Split method calls: obj.method() → receiver + callee
                const isAttribute = funcNode.type === 'attribute';
                let calleeName: string;
                let receiverName: string | undefined;
                let isSelfCall = false;

                if (isAttribute) {
                    const parts = rawCalleeName.split('.');
                    calleeName = parts.pop() ?? rawCalleeName;
                    const receiver = parts.join('.');
                    // self/cls calls are intra-class, not cross-file
                    if (receiver === 'self' || receiver === 'cls' || receiver === 'super()') {
                        isSelfCall = true;
                    } else if (receiver) {
                        receiverName = receiver;
                    }
                } else {
                    calleeName = rawCalleeName;
                }

                results.push({
                    callerName: callerNode?.childForFieldName('name')?.text ?? '__file__',
                    calleeName,
                    receiverName,
                    isLocalIdentifier: isSelfCall,
                    line: node.startPosition.row + 1,
                    column: node.startPosition.column,
                    isMethodCall: isAttribute && receiverName !== undefined,
                    isConstructor: /^[A-Z]/.test(calleeName),
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
        if (current.type === 'function_definition') return current;
        current = current.parent;
    }
    return null;
}
