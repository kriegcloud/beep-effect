/**
 * GraphRAG RPC contracts for Knowledge slice
 *
 * RPC definitions for GraphRAG query operations (embedding search, graph traversal).
 *
 * @module knowledge-domain/rpc/graphrag
 * @since 0.1.0
 */
import { $KnowledgeDomainId } from "@beep/identity/packages";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Rpc from "@effect/rpc/Rpc";
import * as RpcGroup from "@effect/rpc/RpcGroup";
import * as S from "effect/Schema";
import { Entity, Relation } from "../entities";
import { GraphRAGError } from "../errors";

const $I = $KnowledgeDomainId.create("rpc/graphrag");

/**
 * GraphRAG query result schema
 *
 * Contains entities, relations, and context assembled from the knowledge graph.
 *
 * @since 0.1.0
 * @category schemas
 */
export const QueryResult = S.Struct({
  entities: S.Array(Entity.Model.json),
  relations: S.Array(Relation.Model.json),
  context: S.String,
  tokenCount: S.optional(S.NonNegativeInt),
}).annotations(
  $I.annotations("GraphRAGQueryResult", {
    description: "GraphRAG query result with entities, relations, and assembled context",
  })
);

/**
 * Seed entity for GraphRAG traversal
 *
 * @since 0.1.0
 * @category schemas
 */
export const SeedEntity = S.Struct({
  entityId: KnowledgeEntityIds.KnowledgeEntityId,
  weight: S.optional(S.Positive),
}).annotations(
  $I.annotations("SeedEntity", {
    description: "Seed entity for graph traversal with optional weight",
  })
);

/**
 * RPC contract for GraphRAG operations.
 * All RPCs require authentication via RpcAuthMiddleware.
 *
 * @since 0.1.0
 * @category rpc
 */
export class Rpcs extends RpcGroup.make(
  /**
   * Query - Perform GraphRAG query with natural language.
   *
   * Embeds the query, finds similar entities via vector search,
   * then traverses the graph to assemble context.
   */
  Rpc.make("query", {
    payload: {
      query: S.String,
      organizationId: SharedEntityIds.OrganizationId,
      ontologyId: S.optional(KnowledgeEntityIds.OntologyId),
      maxEntities: S.optional(S.Int.pipe(S.positive())),
      maxDepth: S.optional(S.Int.pipe(S.positive())),
      maxTokens: S.optional(S.Int.pipe(S.positive())),
    },
    success: QueryResult,
    error: GraphRAGError,
  }),

  /**
   * Query from Seeds - Perform GraphRAG traversal starting from known entities.
   *
   * Starts from specified seed entities and traverses the graph
   * to assemble context without requiring embedding search.
   */
  Rpc.make("queryFromSeeds", {
    payload: {
      seeds: S.NonEmptyArray(SeedEntity),
      organizationId: SharedEntityIds.OrganizationId,
      predicateFilter: S.optional(S.Array(S.String)),
      maxDepth: S.optional(S.Int.pipe(S.positive())),
      maxTokens: S.optional(S.Int.pipe(S.positive())),
    },
    success: QueryResult,
    error: GraphRAGError,
  })
).prefix("graphrag_") {}
