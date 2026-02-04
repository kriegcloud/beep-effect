/**
 * Relation RPC contracts for Knowledge slice
 *
 * RPC definitions for relation CRUD and query operations.
 *
 * @module knowledge-domain/entities/relation/relation.rpc
 * @since 0.1.0
 */
import { $KnowledgeDomainId } from "@beep/identity/packages";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Rpc from "@effect/rpc/Rpc";
import * as RpcGroup from "@effect/rpc/RpcGroup";
import * as S from "effect/Schema";
import { Model } from "./relation.model";

const $I = $KnowledgeDomainId.create("entities/relation/relation.rpc");

/**
 * Relation not found error
 *
 * @since 0.1.0
 * @category errors
 */
export class RelationNotFoundError extends S.TaggedError<RelationNotFoundError>($I`RelationNotFoundError`)(
  "RelationNotFoundError",
  {
    id: KnowledgeEntityIds.RelationId,
    message: S.String,
  },
  $I.annotations("RelationNotFoundError", {
    description: "Requested knowledge relation not found",
  })
) {}

/**
 * Relation count result schema
 *
 * @since 0.1.0
 * @category schemas
 */
export const CountResult = S.Struct({
  count: S.Int.pipe(S.nonNegative()),
}).annotations(
  $I.annotations("RelationCountResult", {
    description: "Relation count result",
  })
);

/**
 * RPC contract for Knowledge Relation operations.
 * All RPCs require authentication via RpcAuthMiddleware.
 *
 * @since 0.1.0
 * @category rpc
 */
export class Rpcs extends RpcGroup.make(
  /**
   * Get Relation - Retrieve a relation by its unique identifier.
   */
  Rpc.make("get", {
    payload: {
      id: KnowledgeEntityIds.RelationId,
      organizationId: SharedEntityIds.OrganizationId,
    },
    success: Model.json,
    error: RelationNotFoundError,
  }),

  /**
   * List Relations by Entity - Stream all relations for a given entity.
   */
  Rpc.make("listByEntity", {
    payload: {
      entityId: KnowledgeEntityIds.KnowledgeEntityId,
      organizationId: SharedEntityIds.OrganizationId,
      direction: S.optional(S.Literal("outgoing", "incoming", "both")),
      limit: S.optional(S.Int.pipe(S.positive())),
    },
    success: Model.json,
    error: S.Never,
    stream: true,
  }),

  /**
   * List Relations by Predicate - Stream all relations with a given predicate.
   */
  Rpc.make("listByPredicate", {
    payload: {
      predicate: S.String,
      organizationId: SharedEntityIds.OrganizationId,
      ontologyId: S.optional(KnowledgeEntityIds.OntologyId),
      cursor: S.optional(KnowledgeEntityIds.RelationId),
      limit: S.optional(S.Int.pipe(S.positive())),
    },
    success: Model.json,
    error: S.Never,
    stream: true,
  }),

  /**
   * Create Relation - Create a new knowledge relation.
   */
  Rpc.make("create", {
    payload: Model.insert,
    success: Model.json,
    error: S.Never,
  }),

  /**
   * Delete Relation - Permanently delete a relation.
   */
  Rpc.make("delete", {
    payload: {
      id: KnowledgeEntityIds.RelationId,
      organizationId: SharedEntityIds.OrganizationId,
    },
    success: S.Void,
    error: RelationNotFoundError,
  }),

  /**
   * Count Relations - Count relations matching criteria.
   */
  Rpc.make("count", {
    payload: {
      organizationId: SharedEntityIds.OrganizationId,
      entityId: S.optional(KnowledgeEntityIds.KnowledgeEntityId),
      predicate: S.optional(S.String),
    },
    success: CountResult,
    error: S.Never,
  })
).prefix("relation_") {}
