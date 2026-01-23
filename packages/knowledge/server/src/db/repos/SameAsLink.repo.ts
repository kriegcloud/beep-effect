/**
 * SameAsLink Repository
 *
 * Database operations for SameAsLink entities.
 *
 * @module knowledge-server/db/repos/SameAsLink
 * @since 0.1.0
 */
import { $KnowledgeServerId } from "@beep/identity/packages";
import { Entities } from "@beep/knowledge-domain";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { DatabaseError } from "@beep/shared-domain/errors";
import { DbRepo } from "@beep/shared-domain/factories";
import * as SqlClient from "@effect/sql/SqlClient";
import * as SqlSchema from "@effect/sql/SqlSchema";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { dependencies } from "./_common";

const $I = $KnowledgeServerId.create("db/repos/SameAsLinkRepo");

const tableName = KnowledgeEntityIds.SameAsLinkId.tableName;

// --- Request Schemas ---

class FindByCanonicalRequest extends S.Class<FindByCanonicalRequest>("FindByCanonicalRequest")({
  canonicalId: KnowledgeEntityIds.KnowledgeEntityId,
  organizationId: SharedEntityIds.OrganizationId,
}) {}

class FindByMemberRequest extends S.Class<FindByMemberRequest>("FindByMemberRequest")({
  memberId: KnowledgeEntityIds.KnowledgeEntityId,
  organizationId: SharedEntityIds.OrganizationId,
}) {}

class ResolveCanonicalRequest extends S.Class<ResolveCanonicalRequest>("ResolveCanonicalRequest")({
  entityId: KnowledgeEntityIds.KnowledgeEntityId,
  organizationId: SharedEntityIds.OrganizationId,
}) {}

class ResolveCanonicalResult extends S.Class<ResolveCanonicalResult>("ResolveCanonicalResult")({
  canonical_id: S.String,
}) {}

class FindHighConfidenceRequest extends S.Class<FindHighConfidenceRequest>("FindHighConfidenceRequest")({
  minConfidence: S.Number,
  organizationId: SharedEntityIds.OrganizationId,
  limit: S.Number,
}) {}

class FindBySourceRequest extends S.Class<FindBySourceRequest>("FindBySourceRequest")({
  sourceId: S.String,
  organizationId: SharedEntityIds.OrganizationId,
}) {}

class CountMembersRequest extends S.Class<CountMembersRequest>("CountMembersRequest")({
  canonicalId: KnowledgeEntityIds.KnowledgeEntityId,
  organizationId: SharedEntityIds.OrganizationId,
}) {}

class DeleteByCanonicalRequest extends S.Class<DeleteByCanonicalRequest>("DeleteByCanonicalRequest")({
  canonicalId: KnowledgeEntityIds.KnowledgeEntityId,
  organizationId: SharedEntityIds.OrganizationId,
}) {}

class CountResult extends S.Class<CountResult>("CountResult")({
  count: S.String,
}) {}

/**
 * Custom repo operations for same-as links
 */
const makeSameAsLinkExtensions = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;

  // --- SqlSchemas ---

  const findByCanonicalSchema = SqlSchema.findAll({
    Request: FindByCanonicalRequest,
    Result: Entities.SameAsLink.Model,
    execute: (req) => sql`
      SELECT *
      FROM ${sql(tableName)}
      WHERE canonical_id = ${req.canonicalId}
        AND organization_id = ${req.organizationId}
    `,
  });

  const findByMemberSchema = SqlSchema.findOne({
    Request: FindByMemberRequest,
    Result: Entities.SameAsLink.Model,
    execute: (req) => sql`
      SELECT *
      FROM ${sql(tableName)}
      WHERE member_id = ${req.memberId}
        AND organization_id = ${req.organizationId}
      LIMIT 1
    `,
  });

  const resolveCanonicalSchema = SqlSchema.findAll({
    Request: ResolveCanonicalRequest,
    Result: ResolveCanonicalResult,
    execute: (req) => sql`
      WITH RECURSIVE chain AS (
        SELECT member_id, canonical_id
        FROM ${sql(tableName)}
        WHERE member_id = ${req.entityId}
          AND organization_id = ${req.organizationId}

        UNION

        SELECT l.member_id, l.canonical_id
        FROM ${sql(tableName)} l
        INNER JOIN chain c ON l.member_id = c.canonical_id
        WHERE l.organization_id = ${req.organizationId}
      )
      SELECT canonical_id
      FROM chain
      ORDER BY canonical_id
      LIMIT 1
    `,
  });

  const findHighConfidenceSchema = SqlSchema.findAll({
    Request: FindHighConfidenceRequest,
    Result: Entities.SameAsLink.Model,
    execute: (req) => sql`
      SELECT *
      FROM ${sql(tableName)}
      WHERE organization_id = ${req.organizationId}
        AND confidence >= ${req.minConfidence}
      ORDER BY confidence DESC
      LIMIT ${req.limit}
    `,
  });

  const findBySourceSchema = SqlSchema.findAll({
    Request: FindBySourceRequest,
    Result: Entities.SameAsLink.Model,
    execute: (req) => sql`
      SELECT *
      FROM ${sql(tableName)}
      WHERE organization_id = ${req.organizationId}
        AND source_id = ${req.sourceId}
    `,
  });

  const countMembersSchema = SqlSchema.findAll({
    Request: CountMembersRequest,
    Result: CountResult,
    execute: (req) => sql`
      SELECT COUNT(*) as count
      FROM ${sql(tableName)}
      WHERE organization_id = ${req.organizationId}
        AND canonical_id = ${req.canonicalId}
    `,
  });

  const deleteByCanonicalSchema = SqlSchema.void({
    Request: DeleteByCanonicalRequest,
    execute: (req) => sql`
      DELETE
      FROM ${sql(tableName)}
      WHERE organization_id = ${req.organizationId}
        AND canonical_id = ${req.canonicalId}
    `,
  });

  // --- Methods ---

  /**
   * Find links by canonical entity
   *
   * @param canonicalId - The canonical entity ID
   * @param organizationId - Organization ID for scoping
   * @returns Array of links pointing to this canonical
   */
  const findByCanonical = (
    canonicalId: KnowledgeEntityIds.KnowledgeEntityId.Type,
    organizationId: SharedEntityIds.OrganizationId.Type
  ): Effect.Effect<ReadonlyArray<Entities.SameAsLink.Model>, DatabaseError> =>
    findByCanonicalSchema({ canonicalId, organizationId }).pipe(
      Effect.catchTag("ParseError", (e) => Effect.die(e)),
      Effect.mapError(DatabaseError.$match),
      Effect.withSpan("SameAsLinkRepo.findByCanonical", {
        captureStackTrace: false,
        attributes: { canonicalId, organizationId },
      })
    );

  /**
   * Find link by member entity
   *
   * @param memberId - The member entity ID
   * @param organizationId - Organization ID for scoping
   * @returns Option of the link for this member
   */
  const findByMember = (
    memberId: KnowledgeEntityIds.KnowledgeEntityId.Type,
    organizationId: SharedEntityIds.OrganizationId.Type
  ): Effect.Effect<O.Option<Entities.SameAsLink.Model>, DatabaseError> =>
    findByMemberSchema({ memberId, organizationId }).pipe(
      Effect.catchTag("ParseError", (e) => Effect.die(e)),
      Effect.mapError(DatabaseError.$match),
      Effect.withSpan("SameAsLinkRepo.findByMember", {
        captureStackTrace: false,
        attributes: { memberId, organizationId },
      })
    );

  /**
   * Find canonical entity for a given entity (resolves through links)
   *
   * @param entityId - Entity ID to resolve
   * @param organizationId - Organization ID for scoping
   * @returns Canonical entity ID (or self if no link)
   */
  const resolveCanonical = (
    entityId: KnowledgeEntityIds.KnowledgeEntityId.Type,
    organizationId: SharedEntityIds.OrganizationId.Type
  ): Effect.Effect<KnowledgeEntityIds.KnowledgeEntityId.Type, DatabaseError> =>
    Effect.gen(function* () {
      const result = yield* resolveCanonicalSchema({ entityId, organizationId });

      // If no link found, return the original entity ID
      const first = A.head(result);
      if (O.isSome(first)) {
        return first.value.canonical_id as KnowledgeEntityIds.KnowledgeEntityId.Type;
      }
      return entityId;
    }).pipe(
      Effect.catchTag("ParseError", (e) => Effect.die(e)),
      Effect.mapError(DatabaseError.$match),
      Effect.withSpan("SameAsLinkRepo.resolveCanonical", {
        captureStackTrace: false,
        attributes: { entityId, organizationId },
      })
    );

  /**
   * Find all links with confidence above threshold
   *
   * @param minConfidence - Minimum confidence score
   * @param organizationId - Organization ID for scoping
   * @param limit - Maximum results
   * @returns Array of high-confidence links
   */
  const findHighConfidence = (
    minConfidence: number,
    organizationId: SharedEntityIds.OrganizationId.Type,
    limit = 100
  ): Effect.Effect<ReadonlyArray<Entities.SameAsLink.Model>, DatabaseError> =>
    findHighConfidenceSchema({ minConfidence, organizationId, limit }).pipe(
      Effect.catchTag("ParseError", (e) => Effect.die(e)),
      Effect.mapError(DatabaseError.$match),
      Effect.withSpan("SameAsLinkRepo.findHighConfidence", {
        captureStackTrace: false,
        attributes: { minConfidence, organizationId, limit },
      })
    );

  /**
   * Find links by source extraction/document ID
   *
   * @param sourceId - The source ID
   * @param organizationId - Organization ID for scoping
   * @returns Array of links from this source
   */
  const findBySource = (
    sourceId: string,
    organizationId: SharedEntityIds.OrganizationId.Type
  ): Effect.Effect<ReadonlyArray<Entities.SameAsLink.Model>, DatabaseError> =>
    findBySourceSchema({ sourceId, organizationId }).pipe(
      Effect.catchTag("ParseError", (e) => Effect.die(e)),
      Effect.mapError(DatabaseError.$match),
      Effect.withSpan("SameAsLinkRepo.findBySource", {
        captureStackTrace: false,
        attributes: { sourceId, organizationId },
      })
    );

  /**
   * Delete links by canonical entity
   *
   * @param canonicalId - The canonical entity ID
   * @param organizationId - Organization ID for scoping
   */
  const deleteByCanonical = (
    canonicalId: KnowledgeEntityIds.KnowledgeEntityId.Type,
    organizationId: SharedEntityIds.OrganizationId.Type
  ): Effect.Effect<void, DatabaseError> =>
    deleteByCanonicalSchema({ canonicalId, organizationId }).pipe(
      Effect.catchTag("ParseError", (e) => Effect.die(e)),
      Effect.mapError(DatabaseError.$match),
      Effect.withSpan("SameAsLinkRepo.deleteByCanonical", {
        captureStackTrace: false,
        attributes: { canonicalId, organizationId },
      })
    );

  /**
   * Count all members linked to a canonical entity (transitive)
   *
   * @param canonicalId - The canonical entity ID
   * @param organizationId - Organization ID for scoping
   * @returns Count of linked members
   */
  const countMembers = (
    canonicalId: KnowledgeEntityIds.KnowledgeEntityId.Type,
    organizationId: SharedEntityIds.OrganizationId.Type
  ): Effect.Effect<number, DatabaseError> =>
    Effect.gen(function* () {
      const result = yield* countMembersSchema({ canonicalId, organizationId });
      const first = A.head(result);
      return O.isSome(first) ? Number.parseInt(first.value.count, 10) : 0;
    }).pipe(
      Effect.catchTag("ParseError", (e) => Effect.die(e)),
      Effect.mapError(DatabaseError.$match),
      Effect.withSpan("SameAsLinkRepo.countMembers", {
        captureStackTrace: false,
        attributes: { canonicalId, organizationId },
      })
    );

  return {
    findByCanonical,
    findByMember,
    resolveCanonical,
    findHighConfidence,
    findBySource,
    deleteByCanonical,
    countMembers,
  };
});

/**
 * SameAsLinkRepo Effect.Service
 *
 * Provides CRUD operations for SameAsLink entities.
 *
 * @since 0.1.0
 * @category services
 */
export class SameAsLinkRepo extends Effect.Service<SameAsLinkRepo>()($I`SameAsLinkRepo`, {
  dependencies,
  accessors: true,
  effect: DbRepo.make(KnowledgeEntityIds.SameAsLinkId, Entities.SameAsLink.Model, makeSameAsLinkExtensions),
}) {}
