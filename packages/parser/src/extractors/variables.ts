import type Parser from 'tree-sitter';
import type { VariableNode } from '@nomik/core';
import { createNodeId } from '../utils';

/** Extract module-scope variable declarations.
 * Keeps exported variables as first-class symbols (e.g. exported const arrays).
 */
export function extractVariables(tree: Parser.Tree, filePath: string): VariableNode[] {
    const results: VariableNode[] = [];
    const seen = new Set<string>();
    const cursor = tree.walk();

    function visit(): void {
        const node = cursor.currentNode;

        if (node.type === 'variable_declarator') {
            const declaration = node.parent;
            if (declaration && isModuleScopeDeclaration(declaration)) {
                const isExported = declaration.parent?.type === 'export_statement';
                const nameNode = node.childForFieldName('name');
                const valueNode = node.childForFieldName('value');
                const kind = getDeclarationKind(declaration);

                if (nameNode?.type === 'identifier') {
                    const key = `${nameNode.text}:${node.startPosition.row + 1}`;
                    if (!seen.has(key)) {
                        seen.add(key);
                        results.push({
                            id: createNodeId('variable', filePath, nameNode.text),
                            type: 'variable',
                            name: nameNode.text,
                            filePath,
                            line: node.startPosition.row + 1,
                            kind,
                            isExported,
                            valueType: valueNode?.type,
                        });
                    }
                }
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

function isModuleScopeDeclaration(node: Parser.SyntaxNode): boolean {
    if (node.type !== 'lexical_declaration' && node.type !== 'variable_declaration') return false;
    const parent = node.parent;
    if (!parent) return false;
    if (parent.type === 'program') return true;
    if (parent.type === 'export_statement' && parent.parent?.type === 'program') return true;
    return false;
}

function getDeclarationKind(node: Parser.SyntaxNode): 'const' | 'let' | 'var' {
    const txt = node.text.trimStart();
    if (txt.startsWith('const ')) return 'const';
    if (txt.startsWith('let ')) return 'let';
    return 'var';
}

