/**
 * Entity RPC contracts for Knowledge slice
 *
 * RPC definitions for entity CRUD and search operations.
 *
 * @module knowledge-domain/entities/entity/entity.rpc
 * @since 0.1.0
 */
import { $KnowledgeDomainId } from "@beep/identity/packages";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Rpc from "@effect/rpc/Rpc";
import * as RpcGroup from "@effect/rpc/RpcGroup";
import * as S from "effect/Schema";
import { Model } from "./entity.model";

const $I = $KnowledgeDomainId.create("entities/entity/entity.rpc");

/**
 * Entity not found error
 *
 * @since 0.1.0
 * @category errors
 */
export class EntityNotFoundError extends S.TaggedError<EntityNotFoundError>($I`EntityNotFoundError`)(
  "EntityNotFoundError",
  {
    id: KnowledgeEntityIds.KnowledgeEntityId,
    message: S.String,
  },
  $I.annotations("EntityNotFoundError", {
    description: "Requested knowledge entity not found",
  })
) {}

/**
 * Entity search result schema
 *
 * @since 0.1.0
 * @category schemas
 */
export const SearchResult = S.Struct({
  ...Model.select.pick("id", "_rowId", "mention", "types").fields,
  rank: S.Number,
}).annotations(
  $I.annotations("EntitySearchResult", {
    description: "Entity search result with mention, types, and ranking score",
  })
);

/**
 * Entity count result schema
 *
 * @since 0.1.0
 * @category schemas
 */
export const CountResult = S.Struct({
  count: S.Int.pipe(S.nonNegative()),
}).annotations(
  $I.annotations("EntityCountResult", {
    description: "Entity count result",
  })
);

/**
 * RPC contract for Knowledge Entity operations.
 * All RPCs require authentication via RpcAuthMiddleware.
 *
 * @since 0.1.0
 * @category rpc
 */
export class Rpcs extends RpcGroup.make(
  /**
   * Get Entity - Retrieve an entity by its unique identifier.
   */
  Rpc.make("get", {
    payload: {
      id: KnowledgeEntityIds.KnowledgeEntityId,
      organizationId: SharedEntityIds.OrganizationId,
    },
    success: Model.json,
    error: EntityNotFoundError,
  }),

  /**
   * List Entities - Stream all entities in an organization with optional filtering.
   */
  Rpc.make("list", {
    payload: {
      organizationId: SharedEntityIds.OrganizationId,
      ontologyId: S.optional(KnowledgeEntityIds.OntologyId),
      type: S.optional(S.String),
      cursor: S.optional(KnowledgeEntityIds.KnowledgeEntityId),
      limit: S.optional(S.Int.pipe(S.positive())),
    },
    success: Model.json,
    error: S.Never,
    stream: true,
  }),

  /**
   * Search Entities - Full-text search across entity mentions and types.
   */
  Rpc.make("search", {
    payload: {
      query: S.String,
      organizationId: SharedEntityIds.OrganizationId,
      ontologyId: S.optional(KnowledgeEntityIds.OntologyId),
      types: S.optional(S.Array(S.String)),
      limit: S.optional(S.Int.pipe(S.positive())),
      offset: S.optional(S.Int.pipe(S.nonNegative())),
    },
    success: SearchResult,
    error: S.Never,
    stream: true,
  }),

  /**
   * Create Entity - Create a new knowledge entity.
   */
  Rpc.make("create", {
    payload: Model.insert,
    success: Model.json,
    error: S.Never,
  }),

  /**
   * Update Entity - Update an existing entity.
   */
  Rpc.make("update", {
    payload: Model.update,
    success: Model.json,
    error: EntityNotFoundError,
  }),

  /**
   * Delete Entity - Permanently delete an entity.
   */
  Rpc.make("delete", {
    payload: {
      id: KnowledgeEntityIds.KnowledgeEntityId,
      organizationId: SharedEntityIds.OrganizationId,
    },
    success: S.Void,
    error: EntityNotFoundError,
  }),

  /**
   * Count Entities - Count entities matching criteria.
   */
  Rpc.make("count", {
    payload: {
      organizationId: SharedEntityIds.OrganizationId,
      ontologyId: S.optional(KnowledgeEntityIds.OntologyId),
      type: S.optional(S.String),
    },
    success: CountResult,
    error: S.Never,
  })
).prefix("entity_") {}
