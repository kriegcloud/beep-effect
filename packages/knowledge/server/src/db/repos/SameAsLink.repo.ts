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
import { KnowledgeEntityIds, type SharedEntityIds } from "@beep/shared-domain";
import { DatabaseError } from "@beep/shared-domain/errors";
import { DbRepo } from "@beep/shared-domain/factories";
import * as SqlClient from "@effect/sql/SqlClient";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import type * as O from "effect/Option";
import { dependencies } from "./_common";

const $I = $KnowledgeServerId.create("db/repos/SameAsLinkRepo");

/**
 * Custom repo operations for same-as links
 */
const makeSameAsLinkExtensions = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;
  const tableName = "knowledge_same_as_link";

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
    Effect.gen(function* () {
      const results = yield* sql<Entities.SameAsLink.Model>`
        SELECT *
        FROM ${sql(tableName)}
        WHERE canonical_id = ${canonicalId}
        AND organization_id = ${organizationId}
      `.pipe(
        Effect.mapError((error) =>
          DatabaseError.$match({
            message: `Failed to find links by canonical: ${String(error)}`,
            _tag: "DatabaseError",
          })
        )
      );
      return results;
    }).pipe(
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
    Effect.gen(function* () {
      const result = yield* sql<Entities.SameAsLink.Model>`
        SELECT *
        FROM ${sql(tableName)}
        WHERE member_id = ${memberId}
        AND organization_id = ${organizationId}
        LIMIT 1
      `.pipe(
        Effect.map(A.head),
        Effect.mapError((error) =>
          DatabaseError.$match({
            message: `Failed to find link by member: ${String(error)}`,
            _tag: "DatabaseError",
          })
        )
      );
      return result;
    }).pipe(
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
      // Use recursive CTE to follow sameAs chain
      const result = yield* sql<{ canonical_id: string }>`
        WITH RECURSIVE chain AS (
          SELECT member_id, canonical_id
          FROM ${sql(tableName)}
          WHERE member_id = ${entityId}
          AND organization_id = ${organizationId}

          UNION

          SELECT l.member_id, l.canonical_id
          FROM ${sql(tableName)} l
          INNER JOIN chain c ON l.member_id = c.canonical_id
          WHERE l.organization_id = ${organizationId}
        )
        SELECT canonical_id FROM chain
        ORDER BY canonical_id
        LIMIT 1
      `.pipe(
        Effect.mapError((error) =>
          DatabaseError.$match({
            message: `Failed to resolve canonical: ${String(error)}`,
            _tag: "DatabaseError",
          })
        )
      );

      // If no link found, return the original entity ID
      const first = A.head(result);
      if (first._tag === "Some") {
        return first.value.canonical_id as KnowledgeEntityIds.KnowledgeEntityId.Type;
      }
      return entityId;
    }).pipe(
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
    Effect.gen(function* () {
      const results = yield* sql<Entities.SameAsLink.Model>`
        SELECT *
        FROM ${sql(tableName)}
        WHERE organization_id = ${organizationId}
        AND confidence >= ${minConfidence}
        ORDER BY confidence DESC
        LIMIT ${limit}
      `.pipe(
        Effect.mapError((error) =>
          DatabaseError.$match({
            message: `Failed to find high confidence links: ${String(error)}`,
            _tag: "DatabaseError",
          })
        )
      );
      return results;
    }).pipe(
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
    Effect.gen(function* () {
      const results = yield* sql<Entities.SameAsLink.Model>`
        SELECT *
        FROM ${sql(tableName)}
        WHERE organization_id = ${organizationId}
        AND source_id = ${sourceId}
      `.pipe(
        Effect.mapError((error) =>
          DatabaseError.$match({
            message: `Failed to find links by source: ${String(error)}`,
            _tag: "DatabaseError",
          })
        )
      );
      return results;
    }).pipe(
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
   * @returns Number of deleted rows
   */
  const deleteByCanonical = (
    canonicalId: KnowledgeEntityIds.KnowledgeEntityId.Type,
    organizationId: SharedEntityIds.OrganizationId.Type
  ): Effect.Effect<number, DatabaseError> =>
    Effect.gen(function* () {
      const result = yield* sql`
        DELETE FROM ${sql(tableName)}
        WHERE organization_id = ${organizationId}
        AND canonical_id = ${canonicalId}
      `.pipe(
        Effect.mapError((error) =>
          DatabaseError.$match({
            message: `Failed to delete links by canonical: ${String(error)}`,
            _tag: "DatabaseError",
          })
        )
      );
      return result.length;
    }).pipe(
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
      const result = yield* sql<{ count: number }>`
        SELECT COUNT(*) as count
        FROM ${sql(tableName)}
        WHERE organization_id = ${organizationId}
        AND canonical_id = ${canonicalId}
      `.pipe(
        Effect.mapError((error) =>
          DatabaseError.$match({
            message: `Failed to count members: ${String(error)}`,
            _tag: "DatabaseError",
          })
        )
      );

      const first = A.head(result);
      return first._tag === "Some" ? Number(first.value.count) : 0;
    }).pipe(
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
