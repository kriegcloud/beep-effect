import Parser from 'tree-sitter';
import type { DBTableNode, DBColumnNode, ReadsFromEdge, WritesToEdge, GraphNode, GraphEdge } from '@nomik/core';
import type { ImportInfo } from './imports.js';
import { createNodeId } from '../utils.js';
import { extractFirstStringArg, findEnclosingFunctionName } from './ast-utils.js';

// ────────────────────────────────────────────────────────────────────────
// Database Operation Detection — FULLY DYNAMIC, import-aware
//
// Strategy (works on ANY project, zero hardcoded variable names):
//   1. Import detection: scan file imports for known DB npm packages
//      (@prisma/client, @supabase/supabase-js, knex, drizzle-orm, etc.)
//      → the imported identifier becomes a tracked DB client
//   2. Pattern-based: detect structural patterns unique to each ORM:
//      - Prisma: x.table.findMany() (3-level chain + Prisma method)
//      - Supabase: x.from('table').select() (.from() chain)
//      - Knex/query-builder: x('table').select() (function call + method)
//   3. The receiver name is resolved from imports, not hardcoded
//
// Creates: DBTableNode + READS_FROM / WRITES_TO edges
// ────────────────────────────────────────────────────────────────────────

export interface DBOperationInfo {
    callerName: string;
    tableName: string;
    operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
    receiverName: string | null;
    line: number;
    columns: string[];
}

const PRISMA_PACKAGES = new Set(['@prisma/client']);
const SUPABASE_PACKAGES = new Set(['@supabase/supabase-js', '@supabase/ssr']);
const QUERY_BUILDER_PACKAGES = new Set(['knex', 'better-sqlite3', 'pg', 'mysql2', 'tedious']);
const DRIZZLE_PACKAGES = new Set(['drizzle-orm']);
const TYPEORM_PACKAGES = new Set(['typeorm']);

const PRISMA_READ_METHODS = new Set(['findMany', 'findFirst', 'findUnique', 'findFirstOrThrow', 'findUniqueOrThrow', 'count', 'aggregate', 'groupBy']);
const PRISMA_INSERT_METHODS = new Set(['create', 'createMany', 'createManyAndReturn']);
const PRISMA_UPDATE_METHODS = new Set(['update', 'updateMany', 'upsert']);
const PRISMA_DELETE_METHODS = new Set(['delete', 'deleteMany']);
const ALL_PRISMA_METHODS = new Set([...PRISMA_READ_METHODS, ...PRISMA_INSERT_METHODS, ...PRISMA_UPDATE_METHODS, ...PRISMA_DELETE_METHODS]);


const QB_READ_METHODS = new Set(['select', 'rpc', 'where', 'first', 'pluck', 'count']);
const QB_INSERT_METHODS = new Set(['insert']);
const QB_UPDATE_METHODS = new Set(['update', 'upsert']);
const QB_DELETE_METHODS = new Set(['delete', 'del', 'truncate']);

const TYPEORM_READ_METHODS = new Set(['find', 'findOne', 'findBy', 'findAndCount', 'count', 'exists', 'query']);
const TYPEORM_INSERT_METHODS = new Set(['insert']);
const TYPEORM_UPDATE_METHODS = new Set(['update', 'save', 'upsert', 'softDelete', 'restore']);
const TYPEORM_DELETE_METHODS = new Set(['delete', 'remove']);


export interface DBClientIds {
    prismaIds: Set<string>;
    supabaseIds: Set<string>;
    queryBuilderIds: Set<string>;
    typeormIds: Set<string>;
}

export function buildDBClientIdentifiers(imports: ImportInfo[]): DBClientIds {
    const prismaIds = new Set<string>();
    const supabaseIds = new Set<string>();
    const queryBuilderIds = new Set<string>();
    const typeormIds = new Set<string>();

    for (const imp of imports) {
        const source = imp.source.trim();
        const ids = imp.specifiers.length > 0 ? imp.specifiers : [source.split('/').pop()!];

        if (PRISMA_PACKAGES.has(source)) {
            for (const id of ids) prismaIds.add(id);
        } else if (SUPABASE_PACKAGES.has(source)) {
            for (const id of ids) supabaseIds.add(id);
        } else if (TYPEORM_PACKAGES.has(source)) {
            for (const id of ids) typeormIds.add(id);
        } else if (QUERY_BUILDER_PACKAGES.has(source) || DRIZZLE_PACKAGES.has(source)) {
            for (const id of ids) queryBuilderIds.add(id);
        }
    }

    return { prismaIds, supabaseIds, queryBuilderIds, typeormIds };
}


export function extractDBOperations(
    tree: Parser.Tree,
    _filePath: string,
    dbClientIds: DBClientIds,
): DBOperationInfo[] {
    const ops: DBOperationInfo[] = [];
    const ctx: DBExtractionContext = {
        repositoryAliases: collectRepositoryAliases(tree),
    };

    function visit(node: Parser.SyntaxNode): void {
        if (node.type === 'call_expression') {
            const info = parseDBOperation(node, dbClientIds, ctx);
            if (info) ops.push(info);
        }
        for (const child of node.children) {
            visit(child);
        }
    }

    visit(tree.rootNode);
    return ops;
}

function parseDBOperation(
    callNode: Parser.SyntaxNode,
    dbClientIds: DBClientIds,
    ctx: DBExtractionContext,
): DBOperationInfo | null {
    const funcNode = callNode.childForFieldName('function');
    if (!funcNode || funcNode.type !== 'member_expression') return null;

    const prop = funcNode.childForFieldName('property');
    if (!prop) return null;
    const methodName = prop.text;

    const obj = funcNode.childForFieldName('object');
    if (!obj) return null;

    // ── Pattern 1: Prisma-style — receiver.table.method() ──
    // x.user.findMany() where x is a known Prisma client identifier
    // OR any x.y.prismaMethod() where prismaMethod is unique to Prisma
    if (obj.type === 'member_expression') {
        const outerObj = obj.childForFieldName('object');
        const tableProp = obj.childForFieldName('property');
        if (outerObj && tableProp && outerObj.type === 'identifier') {
            const receiverName = outerObj.text;

            if (dbClientIds.prismaIds.has(receiverName) || ALL_PRISMA_METHODS.has(methodName)) {
                const operation = classifyPrismaMethod(methodName);
                if (operation) {
                    return {
                        callerName: findEnclosingFunctionName(callNode) ?? '__file__',
                        tableName: tableProp.text,
                        operation,
                        receiverName,
                        line: callNode.startPosition.row + 1,
                        columns: extractColumnCandidates(callNode),
                    };
                }
            }
        }

        // ── Pattern 2: Supabase-style — x.from('table').method() ──
        const fromTable = extractFromChain(obj);
        if (fromTable) {
            const operation = classifyQBMethod(methodName);
            if (operation) {
                return {
                    callerName: findEnclosingFunctionName(callNode) ?? '__file__',
                    tableName: fromTable,
                    operation,
                    receiverName: findChainRoot(obj) ?? 'db',
                    line: callNode.startPosition.row + 1,
                    columns: extractColumnCandidates(callNode),
                };
            }
        }

        // ── Pattern 2c: TypeORM manager-style — dataSource.manager.insert(User, ...) ──
        const managerTable = extractTypeormManagerTable(callNode, obj);
        if (managerTable) {
            const operation = classifyTypeOrmMethod(methodName);
            if (operation) {
                return {
                    callerName: findEnclosingFunctionName(callNode) ?? '__file__',
                    tableName: managerTable,
                    operation,
                    receiverName: findChainRoot(obj) ?? 'manager',
                    line: callNode.startPosition.row + 1,
                    columns: extractColumnCandidates(callNode),
                };
            }
        }
    }

    // ── Pattern 2b: Supabase-style via call_expression obj ──
    // supabase.from('users').select() — obj is call_expression `supabase.from('users')`
    // Also handles chained writes: supabase.from('users').insert({}).select()
    if (obj.type === 'call_expression') {
        const fromTable = extractFromChain(obj);
        if (fromTable) {
            // Walk the chain to find the best operation (write > read)
            const operation = classifyChainOperation(callNode) ?? classifyQBMethod(methodName);
            if (operation) {
                return {
                    callerName: findEnclosingFunctionName(callNode) ?? '__file__',
                    tableName: fromTable,
                    operation,
                    receiverName: findChainRoot(obj) ?? 'db',
                    line: callNode.startPosition.row + 1,
                    columns: extractColumnCandidates(callNode),
                };
            }
        }

        // ── Pattern 3: Query-builder-style — x('table').method() ──
        // knex('users').select(), db('posts').insert()
        const innerFunc = obj.childForFieldName('function');
        if (innerFunc && innerFunc.type === 'identifier') {
            const receiverName = innerFunc.text;
            if (dbClientIds.queryBuilderIds.has(receiverName)) {
                const tableName = extractFirstStringArg(obj);
                if (tableName) {
                    const operation = classifyQBMethod(methodName);
                    if (operation) {
                        return {
                            callerName: findEnclosingFunctionName(callNode) ?? '__file__',
                            tableName,
                            operation,
                            receiverName,
                            line: callNode.startPosition.row + 1,
                            columns: extractColumnCandidates(callNode),
                        };
                    }
                }
            }
        }

        // ── Pattern 4: TypeORM repository factory — dataSource.getRepository(User).find(...) ──
        const typeormRepoTable = extractTypeormRepositoryTable(obj);
        if (typeormRepoTable) {
            const operation = classifyTypeOrmMethod(methodName);
            if (operation) {
                return {
                    callerName: findEnclosingFunctionName(callNode) ?? '__file__',
                    tableName: typeormRepoTable,
                    operation,
                    receiverName: findChainRoot(obj) ?? 'repository',
                    line: callNode.startPosition.row + 1,
                    columns: extractColumnCandidates(callNode),
                };
            }
        }
    }

    // ── Pattern 5: TypeORM alias repository variable — userRepo.find(...) ──
    if (obj.type === 'identifier') {
        const aliasTable = ctx.repositoryAliases.get(obj.text);
        if (aliasTable) {
            const operation = classifyTypeOrmMethod(methodName);
            if (operation) {
                return {
                    callerName: findEnclosingFunctionName(callNode) ?? '__file__',
                    tableName: aliasTable,
                    operation,
                    receiverName: obj.text,
                    line: callNode.startPosition.row + 1,
                    columns: extractColumnCandidates(callNode),
                };
            }
        }
    }

    return null;
}

interface DBExtractionContext {
    repositoryAliases: Map<string, string>;
}

function collectRepositoryAliases(tree: Parser.Tree): Map<string, string> {
    const aliases = new Map<string, string>();

    function visit(node: Parser.SyntaxNode): void {
        if (node.type === 'variable_declarator') {
            const nameNode = node.childForFieldName('name');
            const valueNode = node.childForFieldName('value');
            if (nameNode && valueNode && valueNode.type === 'call_expression') {
                const table = extractTypeormRepositoryTable(valueNode);
                if (table) aliases.set(nameNode.text, table);
            }
        }

        for (const child of node.children) {
            visit(child);
        }
    }

    visit(tree.rootNode);
    return aliases;
}

function extractTypeormRepositoryTable(node: Parser.SyntaxNode): string | null {
    if (node.type !== 'call_expression') return null;
    const fn = node.childForFieldName('function');
    if (!fn) return null;

    if (fn.type === 'identifier' && fn.text === 'getRepository') {
        return normalizeEntityName(extractFirstIdentifierOrStringArg(node));
    }

    if (fn.type === 'member_expression') {
        const prop = fn.childForFieldName('property');
        if (prop?.text === 'getRepository') {
            return normalizeEntityName(extractFirstIdentifierOrStringArg(node));
        }
    }

    return null;
}

function extractTypeormManagerTable(callNode: Parser.SyntaxNode, obj: Parser.SyntaxNode): string | null {
    if (obj.type !== 'member_expression') return null;
    const managerProp = obj.childForFieldName('property');
    if (managerProp?.text !== 'manager') return null;
    return normalizeEntityName(extractFirstIdentifierOrStringArg(callNode));
}

function classifyTypeOrmMethod(method: string): DBOperationInfo['operation'] | null {
    if (TYPEORM_READ_METHODS.has(method)) return 'SELECT';
    if (TYPEORM_INSERT_METHODS.has(method)) return 'INSERT';
    if (TYPEORM_UPDATE_METHODS.has(method)) return 'UPDATE';
    if (TYPEORM_DELETE_METHODS.has(method)) return 'DELETE';
    return null;
}

function classifyPrismaMethod(method: string): DBOperationInfo['operation'] | null {
    if (PRISMA_READ_METHODS.has(method)) return 'SELECT';
    if (PRISMA_INSERT_METHODS.has(method)) return 'INSERT';
    if (PRISMA_UPDATE_METHODS.has(method)) return 'UPDATE';
    if (PRISMA_DELETE_METHODS.has(method)) return 'DELETE';
    return null;
}

function classifyQBMethod(method: string): DBOperationInfo['operation'] | null {
    if (QB_READ_METHODS.has(method)) return 'SELECT';
    if (QB_INSERT_METHODS.has(method)) return 'INSERT';
    if (QB_UPDATE_METHODS.has(method)) return 'UPDATE';
    if (QB_DELETE_METHODS.has(method)) return 'DELETE';
    return null;
}

/** Walk the method chain from outer call inward, return the first write operation if any.
 *  For: supabase.from('table').insert({}).select() → returns 'INSERT' (not 'SELECT')
 */
function classifyChainOperation(callNode: Parser.SyntaxNode): DBOperationInfo['operation'] | null {
    let writeOp: DBOperationInfo['operation'] | null = null;
    let readOp: DBOperationInfo['operation'] | null = null;
    let current: Parser.SyntaxNode | null = callNode;
    while (current && current.type === 'call_expression') {
        const fn = current.childForFieldName('function');
        if (!fn || fn.type !== 'member_expression') break;
        const prop = fn.childForFieldName('property');
        if (!prop) break;
        const method = prop.text;
        if (method === 'from') break;
        const op = classifyQBMethod(method);
        if (op && (op === 'INSERT' || op === 'UPDATE' || op === 'DELETE')) {
            writeOp = op;
        } else if (op && !readOp) {
            readOp = op;
        }
        current = fn.childForFieldName('object') ?? null;
    }
    return writeOp ?? readOp;
}

function extractFromChain(node: Parser.SyntaxNode): string | null {
    let current: Parser.SyntaxNode | null = node;
    while (current) {
        if (current.type === 'call_expression') {
            const func = current.childForFieldName('function');
            if (func && func.type === 'member_expression') {
                const prop = func.childForFieldName('property');
                if (prop && prop.text === 'from') {
                    return extractFirstStringArg(current);
                }
                current = func.childForFieldName('object');
                continue;
            }
            break;
        }
        if (current.type === 'member_expression') {
            current = current.childForFieldName('object');
            continue;
        }
        break;
    }
    return null;
}

function extractFirstIdentifierOrStringArg(callNode: Parser.SyntaxNode): string | null {
    const args = callNode.childForFieldName('arguments');
    if (!args) return null;
    const first = args.namedChildren[0];
    if (!first) return null;
    if (first.type === 'identifier') return first.text;
    if (first.type === 'string' || first.type === 'template_string') {
        const text = first.text;
        if (text.startsWith("'") || text.startsWith('"')) return text.slice(1, -1);
        if (text.startsWith('`')) return text.slice(1, -1);
        return text;
    }
    return null;
}

function normalizeEntityName(name: string | null): string | null {
    if (!name) return null;
    const trimmed = name.trim();
    if (!trimmed) return null;
    const bare = trimmed.replace(/["'`]/g, '');
    return bare.charAt(0).toLowerCase() + bare.slice(1);
}

function extractColumnCandidates(callNode: Parser.SyntaxNode): string[] {
    const args = callNode.childForFieldName('arguments');
    if (!args) return [];

    const columns = new Set<string>();
    const reserved = new Set(['data', 'where', 'select', 'include', 'orderBy', 'values', 'set']);

    function visit(node: Parser.SyntaxNode, parentKey?: string): void {
        if (node.type === 'pair') {
            const keyNode = node.childForFieldName('key') ?? node.namedChildren[0];
            const valueNode = node.childForFieldName('value') ?? node.namedChildren[1];
            const keyTextRaw = keyNode?.text ?? '';
            const keyText = keyTextRaw.replace(/^['"`]|['"`]$/g, '');
            if (keyText && !reserved.has(keyText) && parentKey && reserved.has(parentKey)) {
                columns.add(keyText);
            }
            if (valueNode) visit(valueNode, keyText || parentKey);
            return;
        }

        if (node.type === 'string' || node.type === 'template_string') {
            const raw = node.text;
            const value = (raw.startsWith("'") || raw.startsWith('"') || raw.startsWith('`'))
                ? raw.slice(1, -1)
                : raw;
            if (value && value !== '*' && /^[a-zA-Z_][\w$]*$/.test(value)) {
                columns.add(value);
            }
        }

        for (const child of node.namedChildren) {
            visit(child, parentKey);
        }
    }

    for (const arg of args.namedChildren) {
        visit(arg);
    }

    return [...columns].slice(0, 20);
}

function findChainRoot(node: Parser.SyntaxNode): string | null {
    let current: Parser.SyntaxNode | null = node;
    while (current) {
        if (current.type === 'identifier') return current.text;
        if (current.type === 'member_expression') {
            current = current.childForFieldName('object');
            continue;
        }
        if (current.type === 'call_expression') {
            current = current.childForFieldName('function');
            continue;
        }
        break;
    }
    return null;
}



export function buildDBNodesAndEdges(
    dbOps: DBOperationInfo[],
    funcMap: Map<string, string>,
    fileId: string,
    filePath: string,
): { nodes: GraphNode[]; edges: GraphEdge[] } {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const seenNodes = new Map<string, DBTableNode>();
    const seenColumnNodes = new Set<string>();
    const seenEdges = new Set<string>();

    for (const op of dbOps) {
        const tableNodeId = createNodeId('db_table', filePath, op.tableName);

        if (!seenNodes.has(tableNodeId)) {
            const tableNode: DBTableNode = {
                id: tableNodeId,
                type: 'db_table',
                name: op.tableName,
                operations: [op.operation],
            };
            seenNodes.set(tableNodeId, tableNode);
            nodes.push(tableNode);
        } else {
            const existing = seenNodes.get(tableNodeId)!;
            if (!existing.operations.includes(op.operation)) {
                existing.operations.push(op.operation);
            }
        }

        const sourceId = op.callerName === '__file__'
            ? fileId
            : funcMap.get(op.callerName) ?? fileId;

        const fileToTable = `${fileId}->contains->${tableNodeId}`;
        if (!seenEdges.has(fileToTable)) {
            seenEdges.add(fileToTable);
            edges.push({
                id: fileToTable,
                type: 'CONTAINS',
                sourceId: fileId,
                targetId: tableNodeId,
                confidence: 1.0,
            });
        }

        const edgeKey = `${sourceId}->${tableNodeId}:${op.operation}`;
        if (seenEdges.has(edgeKey)) continue;
        seenEdges.add(edgeKey);

        if (op.operation === 'SELECT') {
            const edge: ReadsFromEdge = {
                id: `${sourceId}->reads_from->${tableNodeId}`,
                type: 'READS_FROM',
                sourceId,
                targetId: tableNodeId,
                confidence: 0.85,
            };
            edges.push(edge);
        } else {
            const edgeOp = op.operation === 'INSERT' ? 'INSERT'
                : op.operation === 'UPDATE' ? 'UPDATE'
                    : op.operation === 'DELETE' ? 'DELETE'
                        : 'UPSERT';
            const edge: WritesToEdge = {
                id: `${sourceId}->writes_to->${tableNodeId}`,
                type: 'WRITES_TO',
                sourceId,
                targetId: tableNodeId,
                confidence: 0.85,
                operation: edgeOp as WritesToEdge['operation'],
            };
            edges.push(edge);
        }

        for (const column of op.columns) {
            const colName = column.trim();
            if (!colName) continue;
            const columnNodeId = createNodeId('db_column', filePath, `${op.tableName}.${colName}`);

            if (!seenColumnNodes.has(columnNodeId)) {
                const colNode: DBColumnNode = {
                    id: columnNodeId,
                    type: 'db_column',
                    name: colName,
                    tableName: op.tableName,
                };
                nodes.push(colNode);
                seenColumnNodes.add(columnNodeId);
            }

            const tableToCol = `${tableNodeId}->contains->${columnNodeId}`;
            if (!seenEdges.has(tableToCol)) {
                seenEdges.add(tableToCol);
                edges.push({
                    id: tableToCol,
                    type: 'CONTAINS',
                    sourceId: tableNodeId,
                    targetId: columnNodeId,
                    confidence: 1.0,
                });
            }

            const sourceColKey = `${sourceId}->${columnNodeId}:${op.operation}`;
            if (seenEdges.has(sourceColKey)) continue;
            seenEdges.add(sourceColKey);

            if (op.operation === 'SELECT') {
                const readColEdge: ReadsFromEdge = {
                    id: `${sourceId}->reads_from->${columnNodeId}`,
                    type: 'READS_FROM',
                    sourceId,
                    targetId: columnNodeId,
                    confidence: 0.8,
                };
                edges.push(readColEdge);
            } else {
                const edgeOp = op.operation === 'INSERT' ? 'INSERT'
                    : op.operation === 'UPDATE' ? 'UPDATE'
                        : op.operation === 'DELETE' ? 'DELETE'
                            : 'UPSERT';
                const writeColEdge: WritesToEdge = {
                    id: `${sourceId}->writes_to->${columnNodeId}`,
                    type: 'WRITES_TO',
                    sourceId,
                    targetId: columnNodeId,
                    confidence: 0.8,
                    operation: edgeOp as WritesToEdge['operation'],
                };
                edges.push(writeColEdge);
            }
        }
    }

    return { nodes, edges };
}
