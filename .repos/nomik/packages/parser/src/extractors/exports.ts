import type Parser from 'tree-sitter';

export interface ExportInfo {
    name: string;
    isDefault: boolean;
    isTypeOnly: boolean;
    line: number;
    kind: 'function' | 'class' | 'variable' | 'reexport' | 'unknown';
}

export function extractExports(tree: Parser.Tree, _filePath: string): ExportInfo[] {
    const results: ExportInfo[] = [];
    const cursor = tree.walk();

    function visit(): void {
        const node = cursor.currentNode;

        if (node.type === 'export_statement') {
            const exports = buildExportInfo(node);
            results.push(...exports);
        }

        if (cursor.gotoFirstChild()) {
            do { visit(); } while (cursor.gotoNextSibling());
            cursor.gotoParent();
        }
    }

    visit();
    return results;
}

function buildExportInfo(node: Parser.SyntaxNode): ExportInfo[] {
    const results: ExportInfo[] = [];
    const isDefault = node.children.some((c) => c.text === 'default');
    const isTypeOnly = node.children.some((c) => c.text === 'type' && c.type === 'type');

    for (const child of node.namedChildren) {
        if (child.type === 'function_declaration' || child.type === 'generator_function_declaration') {
            const name = child.childForFieldName('name')?.text ?? 'default';
            results.push({ name, isDefault, isTypeOnly, line: node.startPosition.row + 1, kind: 'function' });
        }

        if (child.type === 'class_declaration' || child.type === 'abstract_class_declaration') {
            const name = child.childForFieldName('name')?.text ?? 'default';
            results.push({ name, isDefault, isTypeOnly, line: node.startPosition.row + 1, kind: 'class' });
        }

        if (child.type === 'lexical_declaration' || child.type === 'variable_declaration') {
            for (const decl of child.namedChildren) {
                if (decl.type === 'variable_declarator') {
                    const name = decl.childForFieldName('name')?.text;
                    if (name) results.push({ name, isDefault, isTypeOnly, line: node.startPosition.row + 1, kind: 'variable' });
                }
            }
        }

        if (child.type === 'export_clause') {
            for (const spec of child.namedChildren) {
                if (spec.type === 'export_specifier') {
                    const name = spec.childForFieldName('name')?.text ?? spec.text;
                    results.push({ name, isDefault: false, isTypeOnly, line: node.startPosition.row + 1, kind: 'unknown' });
                }
            }
        }

        if (child.type === 'identifier' && isDefault) {
            results.push({ name: child.text, isDefault: true, isTypeOnly, line: node.startPosition.row + 1, kind: 'unknown' });
        }
    }

    return results;
}
