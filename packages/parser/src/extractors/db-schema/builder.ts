import type { DBTableNode, DBColumnNode, GraphNode, GraphEdge } from '@nomik/core';
import { createNodeId } from '../../utils.js';
import type { DBSchemaTable } from './types.js';

export function buildDBSchemaNodesAndEdges(
    tables: DBSchemaTable[],
    fileId: string,
    filePath: string,
): { nodes: GraphNode[]; edges: GraphEdge[] } {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const seenNodeIds = new Set<string>();
    const seenEdgeIds = new Set<string>();

    for (const t of tables) {
        const tableNodeId = createNodeId('db_table', filePath, t.name);
        if (!seenNodeIds.has(tableNodeId)) {
            const tableNode: DBTableNode = {
                id: tableNodeId,
                type: 'db_table',
                name: t.name,
                schema: t.schema,
                operations: [],
            };
            nodes.push(tableNode);
            seenNodeIds.add(tableNodeId);
        }

        const fileContainsTableId = `${fileId}->contains->${tableNodeId}`;
        if (!seenEdgeIds.has(fileContainsTableId)) {
            edges.push({
                id: fileContainsTableId,
                type: 'CONTAINS',
                sourceId: fileId,
                targetId: tableNodeId,
                confidence: 1.0,
            });
            seenEdgeIds.add(fileContainsTableId);
        }

        for (const c of t.columns) {
            const colNodeId = createNodeId('db_column', filePath, `${t.name}.${c.name}`);
            if (!seenNodeIds.has(colNodeId)) {
                const colNode: DBColumnNode = {
                    id: colNodeId,
                    type: 'db_column',
                    name: c.name,
                    tableName: t.name,
                    dataType: c.dataType,
                    nullable: c.nullable,
                };
                nodes.push(colNode);
                seenNodeIds.add(colNodeId);
            }

            const tableContainsColId = `${tableNodeId}->contains->${colNodeId}`;
            if (!seenEdgeIds.has(tableContainsColId)) {
                edges.push({
                    id: tableContainsColId,
                    type: 'CONTAINS',
                    sourceId: tableNodeId,
                    targetId: colNodeId,
                    confidence: 1.0,
                });
                seenEdgeIds.add(tableContainsColId);
            }
        }
    }

    return { nodes, edges };
}
