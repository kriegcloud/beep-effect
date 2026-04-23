/**
 * Shared slice entity-id schemas.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $SharedDomainId } from "@beep/identity";
import { EntityId } from "./EntityId/index.ts";

const $I = $SharedDomainId.create("entity-ids/Mem");

const make = EntityId.factory("mem", $I);

/**
 * EntityId for a Knowledge Graph node.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const NodeId = make("Node", {
  tableName: "node",
});

export type NodeId = typeof NodeId.Type;

export declare namespace NodeId {
  export type Public = typeof NodeId.Public.Type;
}

/**
 * EntityId for a Knowledge Graph node.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const EdgeId = make("Edge", {
  tableName: "edge",
});

export type EdgeId = typeof EdgeId.Type;

export declare namespace EdgeId {
  export type Public = typeof EdgeId.Public.Type;
}

/**
 * EntityId for a Knowledge Graph node.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const DocumentId = make("Document", {
  tableName: "document",
});

export type DocumentId = typeof DocumentId.Type;

export declare namespace DocumentId {
  export type Public = typeof DocumentId.Public.Type;
}

/**
 * EntityId for a Knowledge Graph node.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const KnowledgeGraphId = make("KnowledgeGraph", {
  tableName: "knowledge_graph",
});

export type KnowledgeGraphId = typeof KnowledgeGraphId.Type;

export declare namespace KnowledgeGraphId {
  export type Public = typeof KnowledgeGraphId.Public.Type;
}
