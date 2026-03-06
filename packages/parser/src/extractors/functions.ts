import type Parser from 'tree-sitter';
import type { FunctionNode, ParameterInfo } from '@nomik/core';
import { createNodeId, createBodyHash } from '../utils';
import { isModuleScopeObjectLiteral, resolveFunctionName, extractDecorators } from './ast-utils.js';

export function extractFunctions(tree: Parser.Tree, filePath: string): FunctionNode[] {
    const results: FunctionNode[] = [];
    const cursor = tree.walk();

    function visit(): void {
        const node = cursor.currentNode;

        if (isFunctionLike(node)) {
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

function isFunctionLike(node: Parser.SyntaxNode): boolean {
    if (![
        'function_declaration',
        'method_definition',
        'arrow_function',
        'function',
        'generator_function_declaration',
    ].includes(node.type)) return false;

    // Exclude trivial arrow functions in object properties (config callbacks)
    // Example: { nodeRepulsion: (_node) => 12000 } — not an independent function symbol
    if (node.type === 'arrow_function' && node.parent?.type === 'pair') {
        const body = node.childForFieldName('body');
        if (body && body.type !== 'statement_block') return false;
    }

    // Exclude nested local handlers inside returned/inline objects
    // (example: return { mouseover() {} }) to avoid dead-code false positives.
    // Keep object methods only when the object literal is module-scope.
    if (node.type === 'method_definition' && node.parent?.type === 'object') {
        if (!isModuleScopeObjectLiteral(node.parent)) return false;
    }
    if ((node.type === 'arrow_function' || node.type === 'function') && node.parent?.type === 'pair') {
        if (!isModuleScopeObjectLiteral(node.parent.parent)) return false;
    }

    // Exclude function-valued local variables declared inside another function/block.
    // Example:
    //   socket.on = (...) => {
    //     const wrapped = (...args) => { ... };
    //     return originalOn(event, wrapped);
    //   };
    // These are implementation details and should not be indexed as top-level symbols.
    if ((node.type === 'arrow_function' || node.type === 'function') && node.parent?.type === 'variable_declarator') {
        if (!isModuleScopeVariableDeclarator(node.parent)) return false;
    }

    return true;
}

export function isModuleScopeVariableDeclarator(node: Parser.SyntaxNode | null | undefined): boolean {
    if (!node || node.type !== 'variable_declarator') return false;
    const declaration = node.parent;
    if (!declaration) return false;
    if (declaration.type !== 'lexical_declaration' && declaration.type !== 'variable_declaration') return false;
    const container = declaration.parent;
    if (!container) return false;
    return container.type === 'program' || container.type === 'export_statement';
}

function buildFunctionNode(node: Parser.SyntaxNode, filePath: string): FunctionNode | null {
    const name = resolveFunctionName(node);
    if (!name) return null;

    const params = extractParameters(node);
    const returnType = extractReturnType(node);
    const isAsync = hasModifier(node, 'async');
    const isExported = isNodeExported(node);
    const isGenerator = node.type === 'generator_function_declaration' || hasModifier(node, '*');
    const decorators = extractDecorators(node);
    const body = node.childForFieldName('body');
    const bodyHash = body ? createBodyHash(body.text) : undefined;

    return {
        id: createNodeId('function', filePath, name),
        type: 'function',
        name,
        filePath,
        startLine: node.startPosition.row + 1,
        endLine: node.endPosition.row + 1,
        params,
        returnType,
        isAsync,
        isExported,
        isGenerator,
        decorators,
        confidence: 1.0,
        bodyHash,
    };
}

function extractParameters(node: Parser.SyntaxNode): ParameterInfo[] {
    const params: ParameterInfo[] = [];
    const paramsNode = node.childForFieldName('parameters');
    if (!paramsNode) return params;

    for (const child of paramsNode.namedChildren) {
        if (child.type === 'required_parameter' || child.type === 'optional_parameter') {
            const pattern = child.childForFieldName('pattern');
            const typeAnnotation = child.childForFieldName('type');
            params.push({
                name: pattern?.text ?? child.text,
                type: typeAnnotation?.text?.replace(/^:\s*/, ''),
                optional: child.type === 'optional_parameter',
                defaultValue: child.childForFieldName('value')?.text,
            });
        } else if (child.type === 'identifier') {
            params.push({ name: child.text, optional: false });
        }
    }
    return params;
}

function extractReturnType(node: Parser.SyntaxNode): string | undefined {
    const returnType = node.childForFieldName('return_type');
    return returnType?.text?.replace(/^:\s*/, '');
}

function hasModifier(node: Parser.SyntaxNode, modifier: string): boolean {
    for (const child of node.children) {
        if (child.text === modifier) return true;
    }
    const parent = node.parent;
    if (parent) {
        for (const child of parent.children) {
            if (child === node) break;
            if (child.text === modifier) return true;
        }
    }
    return false;
}

function isNodeExported(node: Parser.SyntaxNode): boolean {
    const parent = node.parent;
    if (parent?.type === 'export_statement') return true;
    if (parent?.type === 'lexical_declaration' && parent.parent?.type === 'export_statement') {
        return true;
    }
    // export const X = () => {} / export const X = function() {}
    // AST: export_statement > lexical_declaration > variable_declarator > arrow_function/function
    if (parent?.type === 'variable_declarator') {
        const decl = parent.parent;
        if (decl?.type === 'lexical_declaration' || decl?.type === 'variable_declaration') {
            if (decl.parent?.type === 'export_statement') return true;
        }
    }
    return false;
}