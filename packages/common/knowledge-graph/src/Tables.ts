/**
 * Drizzle table definitions for the knowledge graph materialized view.
 *
 * Provides {@link graphNodes} and {@link graphEdges} tables backed by
 * {@link Table.make} from `@beep/shared-tables`, which auto-injects `id`,
 * `createdAt`, `updatedAt`, `deletedAt`, `createdBy`, `updatedBy`,
 * `deletedBy`, `version`, and `source` audit columns.
 *
 * @example
 * ```typescript
 * import { graphNodes, graphEdges } from "@beep/knowledge-graph/Tables"
 *
 * // graphNodes.nodeId   — URI-shaped natural key
 * // graphEdges.edgeId   — deterministic edge identifier
 * ```
 *
 * @module \@beep/knowledge-graph/Tables
 * @since 0.0.0
 */
import { $SharedDomainId } from "@beep/identity/packages";
import { Table } from "@beep/shared-tables";
import { index, integer, real, text } from "drizzle-orm/sqlite-core";

import { GraphEdgeEntityId, GraphNodeEntityId } from "./Models.ts";

const $I = $SharedDomainId.create("knowledge-graph/Tables");
void $I;

// ---------------------------------------------------------------------------
// graphNodes
// ---------------------------------------------------------------------------

/**
 * Materialized view table for knowledge graph nodes.
 *
 * The `nodeId` column holds the URI-shaped natural key (e.g.
 * `beep:page/design-decisions`), while the auto-increment `id` column
 * serves as the integer primary key for foreign-key joins.
 *
 * @example
 * ```typescript
 * import { graphNodes } from "@beep/knowledge-graph/Tables"
 *
 * graphNodes.nodeId   // text("node_id").notNull().unique()
 * graphNodes.kind     // text("kind").notNull()
 * graphNodes.domain   // text("domain").notNull()
 * ```
 *
 * @category tables
 * @since 0.0.0
 */
export const graphNodes = Table.make(GraphNodeEntityId)(
  {
    nodeId: text("node_id").notNull().unique(),
    kind: text("kind").notNull(),
    domain: text("domain").notNull(),
    displayLabel: text("display_label").notNull(),
    certainty: real("certainty").notNull().default(1.0),
    body: text("body"),
    tags: text("tags"),
    aliases: text("aliases"),
    lastSequence: integer("last_sequence"),
  },
  (table) => [
    index("graph_nodes_node_id_idx").on(table.nodeId),
    index("graph_nodes_kind_idx").on(table.kind),
    index("graph_nodes_domain_idx").on(table.domain),
  ]
);

// ---------------------------------------------------------------------------
// graphEdges
// ---------------------------------------------------------------------------

/**
 * Materialized view table for knowledge graph edges.
 *
 * Connects two {@link graphNodes} rows via their URI-shaped node IDs.
 * The `edgeId` is deterministically derived from source, target, and kind,
 * ensuring idempotent re-indexing.
 *
 * @example
 * ```typescript
 * import { graphEdges } from "@beep/knowledge-graph/Tables"
 *
 * graphEdges.edgeId        // text("edge_id").notNull().unique()
 * graphEdges.sourceNodeId  // text("source_node_id").notNull()
 * graphEdges.targetNodeId  // text("target_node_id").notNull()
 * ```
 *
 * @category tables
 * @since 0.0.0
 */
export const graphEdges = Table.make(GraphEdgeEntityId)(
  {
    edgeId: text("edge_id").notNull().unique(),
    sourceNodeId: text("source_node_id").notNull(),
    targetNodeId: text("target_node_id").notNull(),
    kind: text("kind").notNull(),
    displayLabel: text("display_label").notNull(),
    certainty: real("certainty").notNull().default(1.0),
    lastSequence: integer("last_sequence"),
  },
  (table) => [
    index("graph_edges_edge_id_idx").on(table.edgeId),
    index("graph_edges_source_idx").on(table.sourceNodeId),
    index("graph_edges_target_idx").on(table.targetNodeId),
    index("graph_edges_kind_idx").on(table.kind),
  ]
);
