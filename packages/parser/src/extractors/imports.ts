import type Parser from 'tree-sitter';
import type { ImportsEdge } from '@nomik/core';

export interface ImportInfo {
    source: string;
    specifiers: string[];
    isDefault: boolean;
    isDynamic: boolean;
    isReExport: boolean;
    isTypeOnly: boolean;
    line: number;
}

export function extractImports(tree: Parser.Tree, _filePath: string): ImportInfo[] {
    const results: ImportInfo[] = [];
    const cursor = tree.walk();

    function visit(): void {
        const node = cursor.currentNode;

        if (node.type === 'import_statement') {
            const info = buildImportInfo(node);
            if (info) results.push(info);
        }

        if (node.type === 'export_statement') {
            const reExport = buildReExportImportInfo(node);
            if (reExport) results.push(reExport);
        }

        if (node.type === 'call_expression') {
            const dynamic = tryDynamicImport(node);
            if (dynamic) results.push(dynamic);
        }

        if (cursor.gotoFirstChild()) {
            do { visit(); } while (cursor.gotoNextSibling());
            cursor.gotoParent();
        }
    }

    visit();
    return results;
}

function buildImportInfo(node: Parser.SyntaxNode): ImportInfo | null {
    const sourceNode = node.childForFieldName('source');
    if (!sourceNode) return null;

    const source = sourceNode.text.replace(/['"]/g, '');
    const specifiers: string[] = [];
    let isDefault = false;
    let isTypeOnly = false;

    for (const child of node.namedChildren) {
        if (child.text === 'type') isTypeOnly = true;

        if (child.type === 'import_clause') {
            for (const spec of child.namedChildren) {
                if (spec.type === 'identifier') {
                    isDefault = true;
                    specifiers.push(spec.text);
                }
                if (spec.type === 'named_imports') {
                    for (const named of spec.namedChildren) {
                        if (named.type === 'import_specifier') {
                            specifiers.push(named.text);
                        }
                    }
                }
                if (spec.type === 'namespace_import') {
                    specifiers.push(spec.text);
                }
            }
        }
    }

    return {
        source,
        specifiers,
        isDefault,
        isDynamic: false,
        isReExport: false,
        isTypeOnly,
        line: node.startPosition.row + 1,
    };
}

function buildReExportImportInfo(node: Parser.SyntaxNode): ImportInfo | null {
    const sourceNode = node.childForFieldName('source');
    if (!sourceNode) return null;

    const source = sourceNode.text.replace(/['"]/g, '');
    const specifiers: string[] = [];
    let isTypeOnly = node.children.some((c) => c.text === 'type' && c.type === 'type');

    for (const child of node.namedChildren) {
        if (child.type === 'export_clause') {
            for (const named of child.namedChildren) {
                if (named.type === 'export_specifier') {
                    const raw = named.text.trim();
                    if (!raw) continue;
                    if (raw.startsWith('type ')) isTypeOnly = true;
                    specifiers.push(raw.replace(/^type\s+/, ''));
                }
            }
        }
        if (child.type === 'namespace_export') {
            const raw = child.text.trim();
            if (raw) specifiers.push(raw);
        }
    }

    if (specifiers.length === 0) {
        specifiers.push('*');
    }

    return {
        source,
        specifiers,
        isDefault: false,
        isDynamic: false,
        isReExport: true,
        isTypeOnly,
        line: node.startPosition.row + 1,
    };
}

function tryDynamicImport(node: Parser.SyntaxNode): ImportInfo | null {
    const fn = node.childForFieldName('function');
    if (!fn || fn.text !== 'import') return null;

    const args = node.childForFieldName('arguments');
    if (!args || args.namedChildren.length === 0) return null;

    const source = args.namedChildren[0]?.text?.replace(/['"]/g, '');
    if (!source) return null;

    return {
        source,
        specifiers: [],
        isDefault: false,
        isDynamic: true,
        isReExport: false,
        isTypeOnly: false,
        line: node.startPosition.row + 1,
    };
}

export function importsToEdges(
    imports: ImportInfo[],
    sourceFileId: string,
    resolveModuleId: (source: string) => string,
): ImportsEdge[] {
    return imports.map((imp) => ({
        id: `${sourceFileId}->imports->${imp.source}`,
        type: 'IMPORTS' as const,
        sourceId: sourceFileId,
        targetId: resolveModuleId(imp.source),
        confidence: imp.isDynamic ? 0.8 : 1.0,
        specifiers: imp.specifiers,
        isDefault: imp.isDefault,
        isDynamic: imp.isDynamic,
    }));
}
