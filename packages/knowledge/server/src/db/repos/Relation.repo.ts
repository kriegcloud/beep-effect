/**
 * Relation Repository
 *
 * Database operations for Relation entities with graph traversal support.
 *
 * @module knowledge-server/db/repos/Relation
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
import * as O from "effect/Option";
import { dependencies } from "./_common";

const $I = $KnowledgeServerId.create("db/repos/RelationRepo");

/**
 * Custom repo operations for relations
 */
const makeRelationExtensions = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;
  const tableName = "knowledge_relation";

  /**
   * Find relations where any of the given IDs are the subject
   * Used for N-hop graph traversal (outgoing edges)
   *
   * @param sourceIds - Array of entity IDs to match as subjects
   * @param organizationId - Organization ID for scoping
   * @returns Array of matching relations
   */
  const findBySourceIds = (
    sourceIds: ReadonlyArray<KnowledgeEntityIds.KnowledgeEntityId.Type>,
    organizationId: SharedEntityIds.OrganizationId.Type
  ): Effect.Effect<ReadonlyArray<Entities.Relation.Model>, DatabaseError> =>
    Effect.gen(function* () {
      if (sourceIds.length === 0) return [];

      const results = yield* sql<Entities.Relation.Model>`
        SELECT *
        FROM ${sql(tableName)}
        WHERE organization_id = ${organizationId}
          AND subject_id IN ${sql.in(sourceIds)}
      `.pipe(
        Effect.mapError((error) =>
          DatabaseError.$match({
            message: `Failed to find relations by source IDs: ${String(error)}`,
            _tag: "DatabaseError",
          })
        )
      );

      return results;
    }).pipe(
      Effect.withSpan("RelationRepo.findBySourceIds", {
        captureStackTrace: false,
        attributes: { count: sourceIds.length, organizationId },
      })
    );

  /**
   * Find relations where any of the given IDs are the object
   * Used for reverse graph traversal (incoming edges)
   *
   * @param targetIds - Array of entity IDs to match as objects
   * @param organizationId - Organization ID for scoping
   * @returns Array of matching relations
   */
  const findByTargetIds = (
    targetIds: ReadonlyArray<KnowledgeEntityIds.KnowledgeEntityId.Type>,
    organizationId: SharedEntityIds.OrganizationId.Type
  ): Effect.Effect<ReadonlyArray<Entities.Relation.Model>, DatabaseError> =>
    Effect.gen(function* () {
      if (targetIds.length === 0) return [];

      const results = yield* sql<Entities.Relation.Model>`
        SELECT *
        FROM ${sql(tableName)}
        WHERE organization_id = ${organizationId}
          AND object_id IN ${sql.in(targetIds)}
      `.pipe(
        Effect.mapError((error) =>
          DatabaseError.$match({
            message: `Failed to find relations by target IDs: ${String(error)}`,
            _tag: "DatabaseError",
          })
        )
      );

      return results;
    }).pipe(
      Effect.withSpan("RelationRepo.findByTargetIds", {
        captureStackTrace: false,
        attributes: { count: targetIds.length, organizationId },
      })
    );

  /**
   * Find all relations for given entity IDs (both as subject and object)
   * Used for bidirectional graph traversal
   *
   * @param entityIds - Array of entity IDs to match
   * @param organizationId - Organization ID for scoping
   * @returns Array of matching relations
   */
  const findByEntityIds = (
    entityIds: ReadonlyArray<KnowledgeEntityIds.KnowledgeEntityId.Type>,
    organizationId: SharedEntityIds.OrganizationId.Type
  ): Effect.Effect<ReadonlyArray<Entities.Relation.Model>, DatabaseError> =>
    Effect.gen(function* () {
      if (entityIds.length === 0) return [];

      const results = yield* sql<Entities.Relation.Model>`
        SELECT *
        FROM ${sql(tableName)}
        WHERE organization_id = ${organizationId}
          AND (subject_id IN ${sql.in(entityIds)} OR object_id IN ${sql.in(entityIds)})
      `.pipe(
        Effect.mapError((error) =>
          DatabaseError.$match({
            message: `Failed to find relations by entity IDs: ${String(error)}`,
            _tag: "DatabaseError",
          })
        )
      );

      return results;
    }).pipe(
      Effect.withSpan("RelationRepo.findByEntityIds", {
        captureStackTrace: false,
        attributes: { count: entityIds.length, organizationId },
      })
    );

  /**
   * Find relations by predicate IRI
   *
   * @param predicateIri - Ontology property IRI
   * @param organizationId - Organization ID for scoping
   * @param limit - Maximum number of results
   * @returns Array of matching relations
   */
  const findByPredicate = (
    predicateIri: string,
    organizationId: SharedEntityIds.OrganizationId.Type,
    limit = 100
  ): Effect.Effect<ReadonlyArray<Entities.Relation.Model>, DatabaseError> =>
    sql<Entities.Relation.Model>`
      SELECT *
      FROM ${sql(tableName)}
      WHERE organization_id = ${organizationId}
        AND predicate = ${predicateIri}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `.pipe(
      Effect.mapError((error) =>
        DatabaseError.$match({
          message: `Failed to find relations by predicate: ${String(error)}`,
          _tag: "DatabaseError",
        })
      ),
      Effect.withSpan("RelationRepo.findByPredicate", {
        captureStackTrace: false,
        attributes: { predicateIri, organizationId, limit },
      })
    );

  /**
   * Count relations by organization
   *
   * @param organizationId - Organization ID for scoping
   * @returns Count of relations
   */
  const countByOrganization = (
    organizationId: SharedEntityIds.OrganizationId.Type
  ): Effect.Effect<number, DatabaseError> =>
    Effect.gen(function* () {
      const result = yield* sql<{ count: string }>`
        SELECT COUNT(*) as count
        FROM ${sql(tableName)}
        WHERE organization_id = ${organizationId}
      `.pipe(
        Effect.mapError((error) =>
          DatabaseError.$match({
            message: `Failed to count relations: ${String(error)}`,
            _tag: "DatabaseError",
          })
        )
      );

      return O.match(A.head(result), {
        onNone: () => 0,
        onSome: (row) => Number.parseInt(row.count, 10),
      });
    }).pipe(
      Effect.withSpan("RelationRepo.countByOrganization", {
        captureStackTrace: false,
        attributes: { organizationId },
      })
    );

  return {
    findBySourceIds,
    findByTargetIds,
    findByEntityIds,
    findByPredicate,
    countByOrganization,
  };
});

/**
 * RelationRepo Effect.Service
 *
 * Provides CRUD operations for Relation entities plus
 * graph traversal support.
 *
 * @since 0.1.0
 * @category services
 */
export class RelationRepo extends Effect.Service<RelationRepo>()($I`RelationRepo`, {
  dependencies,
  accessors: true,
  effect: DbRepo.make(KnowledgeEntityIds.RelationId, Entities.Relation.Model, makeRelationExtensions),
}) {}
