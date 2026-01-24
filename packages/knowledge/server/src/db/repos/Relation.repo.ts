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
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { DatabaseError } from "@beep/shared-domain/errors";
import { DbRepo } from "@beep/shared-domain/factories";
import { thunkSucceedEffect, thunkZero } from "@beep/utils";
import * as SqlClient from "@effect/sql/SqlClient";
import * as SqlSchema from "@effect/sql/SqlSchema";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { dependencies } from "./_common";

const $I = $KnowledgeServerId.create("db/repos/RelationRepo");

const tableName = KnowledgeEntityIds.RelationId.tableName;

// --- Request Schemas ---

class FindBySourceIdsRequest extends S.Class<FindBySourceIdsRequest>("FindBySourceIdsRequest")({
  sourceIds: S.Array(KnowledgeEntityIds.KnowledgeEntityId),
  organizationId: SharedEntityIds.OrganizationId,
}) {}

class FindByTargetIdsRequest extends S.Class<FindByTargetIdsRequest>("FindByTargetIdsRequest")({
  targetIds: S.Array(KnowledgeEntityIds.KnowledgeEntityId),
  organizationId: SharedEntityIds.OrganizationId,
}) {}

class FindByEntityIdsRequest extends S.Class<FindByEntityIdsRequest>("FindByEntityIdsRequest")({
  entityIds: S.Array(KnowledgeEntityIds.KnowledgeEntityId),
  organizationId: SharedEntityIds.OrganizationId,
}) {}

class FindByPredicateRequest extends S.Class<FindByPredicateRequest>("FindByPredicateRequest")({
  predicateIri: S.String,
  organizationId: SharedEntityIds.OrganizationId,
  limit: S.Number,
}) {}

class CountByOrganizationRequest extends S.Class<CountByOrganizationRequest>("CountByOrganizationRequest")({
  organizationId: SharedEntityIds.OrganizationId,
}) {}

class CountResult extends S.Class<CountResult>("CountResult")({
  count: S.String,
}) {}

/**
 * Custom repo operations for relations
 */
const makeRelationExtensions = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;

  // --- SqlSchemas ---

  const findBySourceIdsSchema = SqlSchema.findAll({
    Request: FindBySourceIdsRequest,
    Result: Entities.Relation.Model,
    execute: (req) => sql`
        SELECT *
        FROM ${sql(tableName)}
        WHERE organization_id = ${req.organizationId}
          AND subject_id IN ${sql.in(req.sourceIds)}
    `,
  });

  const findByTargetIdsSchema = SqlSchema.findAll({
    Request: FindByTargetIdsRequest,
    Result: Entities.Relation.Model,
    execute: (req) => sql`
        SELECT *
        FROM ${sql(tableName)}
        WHERE organization_id = ${req.organizationId}
          AND object_id IN ${sql.in(req.targetIds)}
    `,
  });

  const findByEntityIdsSchema = SqlSchema.findAll({
    Request: FindByEntityIdsRequest,
    Result: Entities.Relation.Model,
    execute: (req) => sql`
        SELECT *
        FROM ${sql(tableName)}
        WHERE organization_id = ${req.organizationId}
          AND (subject_id IN ${sql.in(req.entityIds)} OR object_id IN ${sql.in(req.entityIds)})
    `,
  });

  const findByPredicateSchema = SqlSchema.findAll({
    Request: FindByPredicateRequest,
    Result: Entities.Relation.Model,
    execute: (req) => sql`
        SELECT *
        FROM ${sql(tableName)}
        WHERE organization_id = ${req.organizationId}
          AND predicate = ${req.predicateIri}
        ORDER BY created_at DESC
            LIMIT ${req.limit}
    `,
  });

  const countByOrganizationSchema = SqlSchema.findAll({
    Request: CountByOrganizationRequest,
    Result: CountResult,
    execute: (req) => sql`
        SELECT COUNT(*) as count
        FROM ${sql(tableName)}
        WHERE organization_id = ${req.organizationId}
    `,
  });

  // --- Methods ---

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
  ): Effect.Effect<readonly Entities.Relation.Model[], DatabaseError> =>
    F.pipe(
      A.isEmptyReadonlyArray(sourceIds),
      Effect.if({
        onFalse: thunkSucceedEffect([]),
        onTrue: () => findBySourceIdsSchema({ sourceIds: [...sourceIds], organizationId }),
      }),
      Effect.catchTag("ParseError", Effect.die),
      Effect.mapError(DatabaseError.$match),
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
    F.pipe(
      A.isEmptyReadonlyArray(targetIds),
      Effect.if({
        onFalse: thunkSucceedEffect([]),
        onTrue: () => findByTargetIdsSchema({ targetIds: [...targetIds], organizationId }),
      }),
      Effect.catchTag("ParseError", Effect.die),
      Effect.mapError(DatabaseError.$match),
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
    F.pipe(
      A.isEmptyReadonlyArray(entityIds),
      Effect.if({
        onFalse: thunkSucceedEffect([]),
        onTrue: () => findByEntityIdsSchema({ entityIds: [...entityIds], organizationId }),
      }),
      Effect.catchTag("ParseError", Effect.die),
      Effect.mapError(DatabaseError.$match),
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
    findByPredicateSchema({ predicateIri, organizationId, limit }).pipe(
      Effect.catchTag("ParseError", Effect.die),
      Effect.mapError(DatabaseError.$match),
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
      const result = yield* countByOrganizationSchema({ organizationId });
      return O.match(A.head(result), {
        onNone: thunkZero,
        onSome: (row) => Number.parseInt(row.count, 10),
      });
    }).pipe(
      Effect.catchTag("ParseError", Effect.die),
      Effect.mapError(DatabaseError.$match),
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
