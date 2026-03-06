import type Parser from 'tree-sitter';
import type { ClassNode } from '@nomik/core';
import { createNodeId, createBodyHash } from '../utils';
import { extractDecorators } from './ast-utils.js';

/** Extrait les classes, interfaces, types et enums comme noeuds Class */
export function extractClasses(tree: Parser.Tree, filePath: string): ClassNode[] {
    const results: ClassNode[] = [];
    const cursor = tree.walk();

    function visit(): void {
        const node = cursor.currentNode;

        if (node.type === 'class_declaration' || node.type === 'abstract_class_declaration') {
            const cls = buildClassNode(node, filePath);
            if (cls) results.push(cls);
        } else if (node.type === 'interface_declaration') {
            const iface = buildInterfaceNode(node, filePath);
            if (iface) results.push(iface);
        } else if (node.type === 'type_alias_declaration') {
            const alias = buildTypeAliasNode(node, filePath);
            if (alias) results.push(alias);
        } else if (node.type === 'enum_declaration') {
            const en = buildEnumNode(node, filePath);
            if (en) results.push(en);
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

    const superClass = extractSuperClass(node);
    const interfaces = extractInterfaces(node);
    const methods = extractMethodNames(node);
    const properties = extractPropertyNames(node);
    const decorators = extractDecorators(node);
    const isExported = node.parent?.type === 'export_statement';
    const isAbstract = node.type === 'abstract_class_declaration';
    const body = node.childForFieldName('body');
    const bodyHash = body ? createBodyHash(body.text) : undefined;

    return {
        id: createNodeId('class', filePath, name),
        type: 'class',
        name,
        filePath,
        startLine: node.startPosition.row + 1,
        endLine: node.endPosition.row + 1,
        isExported,
        isAbstract,
        superClass,
        interfaces,
        decorators,
        methods,
        properties,
        bodyHash,
    };
}

/** Construit un noeud Class a partir d'une interface TS */
function buildInterfaceNode(node: Parser.SyntaxNode, filePath: string): ClassNode | null {
    const nameNode = node.childForFieldName('name');
    if (!nameNode) return null;
    const name = nameNode.text;
    const isExported = node.parent?.type === 'export_statement';

    const extendsClause = findChild(node, 'extends_type_clause');
    const superClass = extendsClause?.namedChildren[0]?.text;

    const body = node.childForFieldName('body');
    const methods = body ? body.namedChildren
        .filter(c => c.type === 'method_signature')
        .map(c => c.childForFieldName('name')?.text)
        .filter((n): n is string => n !== undefined) : [];
    const properties = body ? body.namedChildren
        .filter(c => c.type === 'property_signature')
        .map(c => c.childForFieldName('name')?.text)
        .filter((n): n is string => n !== undefined) : [];

    return {
        id: createNodeId('class', filePath, name),
        type: 'class',
        name,
        filePath,
        startLine: node.startPosition.row + 1,
        endLine: node.endPosition.row + 1,
        isExported,
        isAbstract: false,
        superClass,
        interfaces: [],
        decorators: [],
        methods,
        properties,
    };
}

/** Construit un noeud Class a partir d'un type alias TS */
function buildTypeAliasNode(node: Parser.SyntaxNode, filePath: string): ClassNode | null {
    const nameNode = node.childForFieldName('name');
    if (!nameNode) return null;
    const name = nameNode.text;
    const isExported = node.parent?.type === 'export_statement';

    return {
        id: createNodeId('class', filePath, name),
        type: 'class',
        name,
        filePath,
        startLine: node.startPosition.row + 1,
        endLine: node.endPosition.row + 1,
        isExported,
        isAbstract: false,
        superClass: undefined,
        interfaces: [],
        decorators: [],
        methods: [],
        properties: [],
    };
}

/** Construit un noeud Class a partir d'un enum TS */
function buildEnumNode(node: Parser.SyntaxNode, filePath: string): ClassNode | null {
    const nameNode = node.childForFieldName('name');
    if (!nameNode) return null;
    const name = nameNode.text;
    const isExported = node.parent?.type === 'export_statement';

    const body = node.childForFieldName('body');
    const members = body ? body.namedChildren
        .filter(c => c.type === 'enum_assignment' || c.type === 'property_identifier')
        .map(c => c.childForFieldName('name')?.text ?? c.text)
        .filter((n): n is string => n !== undefined) : [];

    return {
        id: createNodeId('class', filePath, name),
        type: 'class',
        name,
        filePath,
        startLine: node.startPosition.row + 1,
        endLine: node.endPosition.row + 1,
        isExported,
        isAbstract: false,
        superClass: undefined,
        interfaces: [],
        decorators: [],
        methods: [],
        properties: members,
    };
}

function extractSuperClass(node: Parser.SyntaxNode): string | undefined {
    const heritage = node.childForFieldName('superclass') ?? findChild(node, 'extends_clause');
    if (!heritage) return undefined;

    const typeNode = heritage.type === 'extends_clause'
        ? heritage.namedChildren[0]
        : heritage;
    return typeNode?.text;
}

function extractInterfaces(node: Parser.SyntaxNode): string[] {
    const impls = findChild(node, 'implements_clause');
    if (!impls) return [];
    return impls.namedChildren.map((c) => c.text);
}

function extractMethodNames(node: Parser.SyntaxNode): string[] {
    const body = node.childForFieldName('body');
    if (!body) return [];
    return body.namedChildren
        .filter((c: Parser.SyntaxNode) => c.type === 'method_definition')
        .map((c: Parser.SyntaxNode) => c.childForFieldName('name')?.text)
        .filter((n: string | undefined): n is string => n !== undefined);
}

function extractPropertyNames(node: Parser.SyntaxNode): string[] {
    const body = node.childForFieldName('body');
    if (!body) return [];
    return body.namedChildren
        .filter((c: Parser.SyntaxNode) => c.type === 'public_field_definition' || c.type === 'property_definition')
        .map((c: Parser.SyntaxNode) => c.childForFieldName('name')?.text)
        .filter((n: string | undefined): n is string => n !== undefined);
}

function findChild(node: Parser.SyntaxNode, type: string): Parser.SyntaxNode | null {
    for (const child of node.namedChildren) {
        if (child.type === type) return child;
    }
    return null;
}
