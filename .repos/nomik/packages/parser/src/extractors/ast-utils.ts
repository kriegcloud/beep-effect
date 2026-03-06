import type Parser from 'tree-sitter';


/** Extract the first string literal argument from a call_expression */
export function extractFirstStringArg(callNode: Parser.SyntaxNode): string | null {
    const args = callNode.childForFieldName('arguments');
    if (!args) return null;
    for (const child of args.children) {
        if (child.type === 'string' || child.type === 'template_string') {
            const text = child.text;
            if (text.startsWith("'") || text.startsWith('"')) return text.slice(1, -1);
            if (text.startsWith('`')) return text.slice(1, -1);
            return text;
        }
    }
    return null;
}

/** Walk up the AST to find the name of the enclosing function */
export function findEnclosingFunctionName(node: Parser.SyntaxNode): string | null {
    let current: Parser.SyntaxNode | null = node.parent;
    while (current) {
        if (current.type === 'function_declaration' || current.type === 'method_definition') {
            const nameNode = current.childForFieldName('name');
            if (nameNode) return nameNode.text;
        }
        if (current.type === 'variable_declarator') {
            const nameNode = current.childForFieldName('name');
            const valueNode = current.childForFieldName('value');
            if (nameNode && valueNode && (valueNode.type === 'arrow_function' || valueNode.type === 'function')) {
                return nameNode.text;
            }
        }
        current = current.parent;
    }
    return null;
}

/** Check if an object literal node is at module scope (top-level const/let/var) */
export function isModuleScopeObjectLiteral(node: Parser.SyntaxNode | null | undefined): boolean {
    if (!node || node.type !== 'object') return false;
    const declarator = node.parent;
    if (!declarator || declarator.type !== 'variable_declarator') return false;
    const declaration = declarator.parent;
    if (!declaration) return false;
    if (declaration.type !== 'lexical_declaration' && declaration.type !== 'variable_declaration') return false;
    const container = declaration.parent;
    if (!container) return false;
    return container.type === 'program' || container.type === 'export_statement';
}

/** Resolve the name of a function-like AST node (declaration, arrow, or pair key) */
export function resolveFunctionName(node: Parser.SyntaxNode): string | null {
    const nameNode = node.childForFieldName('name');
    if (nameNode) return nameNode.text;

    if (node.type === 'arrow_function' || node.type === 'function') {
        const parent = node.parent;
        if (parent?.type === 'variable_declarator') {
            return parent.childForFieldName('name')?.text ?? null;
        }
        if (parent?.type === 'pair') {
            return parent.childForFieldName('key')?.text ?? null;
        }
    }

    return null;
}

/** Extract a string property value from an object literal: { name: 'value' } */
export function extractObjectProperty(objNode: Parser.SyntaxNode, propName: string): string | null {
    for (const child of objNode.namedChildren) {
        if (child.type === 'pair') {
            const key = child.childForFieldName('key');
            const value = child.childForFieldName('value');
            if (key?.text === propName && value && (value.type === 'string' || value.type === 'template_string')) {
                return value.text.replace(/^['"`]|['"`]$/g, '');
            }
        }
    }
    return null;
}

/** Extract decorator names from sibling nodes preceding the target node */
export function extractDecorators(node: Parser.SyntaxNode): string[] {
    const decorators: string[] = [];
    const parent = node.parent;
    if (!parent) return decorators;

    for (const child of parent.children) {
        if (child === node) break;
        if (child.type === 'decorator') {
            decorators.push(child.text.replace(/^@/, ''));
        }
    }
    return decorators;
}
