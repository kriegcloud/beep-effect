/**
 * EntityCluster Repository
 *
 * Database operations for EntityCluster entities.
 *
 * @module knowledge-server/db/repos/EntityCluster
 * @since 0.1.0
 */
import { $KnowledgeServerId } from "@beep/identity/packages";
import { Entities } from "@beep/knowledge-domain";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { DatabaseError } from "@beep/shared-domain/errors";
import { DbRepo } from "@beep/shared-domain/factories";
import * as SqlClient from "@effect/sql/SqlClient";
import * as SqlSchema from "@effect/sql/SqlSchema";
import * as Effect from "effect/Effect";
import type * as O from "effect/Option";
import * as S from "effect/Schema";
import { dependencies } from "./_common";

const $I = $KnowledgeServerId.create("db/repos/EntityClusterRepo");

const tableName = KnowledgeEntityIds.EntityClusterId.tableName;

// --- Request Schemas ---

class FindByCanonicalEntityRequest extends S.Class<FindByCanonicalEntityRequest>("FindByCanonicalEntityRequest")({
  canonicalEntityId: KnowledgeEntityIds.KnowledgeEntityId,
  organizationId: SharedEntityIds.OrganizationId,
}) {}

class FindByMemberRequest extends S.Class<FindByMemberRequest>("FindByMemberRequest")({
  memberId: S.String,
  organizationId: SharedEntityIds.OrganizationId,
}) {}

class FindClustersByOntologyRequest extends S.Class<FindClustersByOntologyRequest>("FindClustersByOntologyRequest")({
  ontologyId: S.String,
  organizationId: SharedEntityIds.OrganizationId,
  limit: S.Number,
}) {}

class FindHighCohesionRequest extends S.Class<FindHighCohesionRequest>("FindHighCohesionRequest")({
  minCohesion: S.Number,
  organizationId: SharedEntityIds.OrganizationId,
  limit: S.Number,
}) {}

class DeleteByOntologyRequest extends S.Class<DeleteByOntologyRequest>("DeleteByOntologyRequest")({
  ontologyId: S.String,
  organizationId: SharedEntityIds.OrganizationId,
}) {}

/**
 * Custom repo operations for entity clusters
 */
const makeEntityClusterExtensions = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;

  // --- SqlSchemas ---

  const findByCanonicalEntitySchema = SqlSchema.findOne({
    Request: FindByCanonicalEntityRequest,
    Result: Entities.EntityCluster.Model,
    execute: (req) => sql`
      SELECT *
      FROM ${sql(tableName)}
      WHERE canonical_entity_id = ${req.canonicalEntityId}
        AND organization_id = ${req.organizationId}
      LIMIT 1
    `,
  });

  const findByMemberSchema = SqlSchema.findOne({
    Request: FindByMemberRequest,
    Result: Entities.EntityCluster.Model,
    execute: (req) => sql`
      SELECT *
      FROM ${sql(tableName)}
      WHERE organization_id = ${req.organizationId}
        AND member_ids @> ${JSON.stringify([req.memberId])}::jsonb
      LIMIT 1
    `,
  });

  const findByOntologySchema = SqlSchema.findAll({
    Request: FindClustersByOntologyRequest,
    Result: Entities.EntityCluster.Model,
    execute: (req) => sql`
      SELECT *
      FROM ${sql(tableName)}
      WHERE organization_id = ${req.organizationId}
        AND ontology_id = ${req.ontologyId}
      LIMIT ${req.limit}
    `,
  });

  const findHighCohesionSchema = SqlSchema.findAll({
    Request: FindHighCohesionRequest,
    Result: Entities.EntityCluster.Model,
    execute: (req) => sql`
      SELECT *
      FROM ${sql(tableName)}
      WHERE organization_id = ${req.organizationId}
        AND cohesion >= ${req.minCohesion}
      ORDER BY cohesion DESC
      LIMIT ${req.limit}
    `,
  });

  const deleteByOntologySchema = SqlSchema.void({
    Request: DeleteByOntologyRequest,
    execute: (req) => sql`
      DELETE
      FROM ${sql(tableName)}
      WHERE organization_id = ${req.organizationId}
        AND ontology_id = ${req.ontologyId}
    `,
  });

  // --- Methods ---

  /**
   * Find cluster by canonical entity ID
   *
   * @param canonicalEntityId - The canonical entity ID
   * @param organizationId - Organization ID for scoping
   * @returns Option of the matching cluster
   */
  const findByCanonicalEntity = (
    canonicalEntityId: KnowledgeEntityIds.KnowledgeEntityId.Type,
    organizationId: SharedEntityIds.OrganizationId.Type
  ): Effect.Effect<O.Option<Entities.EntityCluster.Model>, DatabaseError> =>
    findByCanonicalEntitySchema({ canonicalEntityId, organizationId }).pipe(
      Effect.catchTag("ParseError", Effect.die),
      Effect.mapError(DatabaseError.$match),
      Effect.withSpan("EntityClusterRepo.findByCanonicalEntity", {
        captureStackTrace: false,
        attributes: { canonicalEntityId, organizationId },
      })
    );

  /**
   * Find cluster containing a specific member entity
   *
   * @param memberId - The member entity ID to search for
   * @param organizationId - Organization ID for scoping
   * @returns Option of the cluster containing this member
   */
  const findByMember = (
    memberId: string,
    organizationId: SharedEntityIds.OrganizationId.Type
  ): Effect.Effect<O.Option<Entities.EntityCluster.Model>, DatabaseError> =>
    findByMemberSchema({ memberId, organizationId }).pipe(
      Effect.catchTag("ParseError", Effect.die),
      Effect.mapError(DatabaseError.$match),
      Effect.withSpan("EntityClusterRepo.findByMember", {
        captureStackTrace: false,
        attributes: { memberId, organizationId },
      })
    );

  /**
   * Find clusters by ontology ID
   *
   * @param ontologyId - The ontology ID
   * @param organizationId - Organization ID for scoping
   * @param limit - Maximum results
   * @returns Array of matching clusters
   */
  const findByOntology = (
    ontologyId: string,
    organizationId: SharedEntityIds.OrganizationId.Type,
    limit = 100
  ): Effect.Effect<ReadonlyArray<Entities.EntityCluster.Model>, DatabaseError> =>
    findByOntologySchema({ ontologyId, organizationId, limit }).pipe(
      Effect.catchTag("ParseError", Effect.die),
      Effect.mapError(DatabaseError.$match),
      Effect.withSpan("EntityClusterRepo.findByOntology", {
        captureStackTrace: false,
        attributes: { ontologyId, organizationId, limit },
      })
    );

  /**
   * Find clusters with high cohesion
   *
   * @param minCohesion - Minimum cohesion score (0-1)
   * @param organizationId - Organization ID for scoping
   * @param limit - Maximum results
   * @returns Array of clusters meeting threshold
   */
  const findHighCohesion = (
    minCohesion: number,
    organizationId: SharedEntityIds.OrganizationId.Type,
    limit = 100
  ): Effect.Effect<ReadonlyArray<Entities.EntityCluster.Model>, DatabaseError> =>
    findHighCohesionSchema({ minCohesion, organizationId, limit }).pipe(
      Effect.catchTag("ParseError", Effect.die),
      Effect.mapError(DatabaseError.$match),
      Effect.withSpan("EntityClusterRepo.findHighCohesion", {
        captureStackTrace: false,
        attributes: { minCohesion, organizationId, limit },
      })
    );

  /**
   * Delete clusters by ontology
   *
   * @param ontologyId - The ontology ID
   * @param organizationId - Organization ID for scoping
   */
  const deleteByOntology = (
    ontologyId: string,
    organizationId: SharedEntityIds.OrganizationId.Type
  ): Effect.Effect<void, DatabaseError> =>
    deleteByOntologySchema({ ontologyId, organizationId }).pipe(
      Effect.catchTag("ParseError", Effect.die),
      Effect.mapError(DatabaseError.$match),
      Effect.withSpan("EntityClusterRepo.deleteByOntology", {
        captureStackTrace: false,
        attributes: { ontologyId, organizationId },
      })
    );

  return {
    findByCanonicalEntity,
    findByMember,
    findByOntology,
    findHighCohesion,
    deleteByOntology,
  };
});

/**
 * EntityClusterRepo Effect.Service
 *
 * Provides CRUD operations for EntityCluster entities.
 *
 * @since 0.1.0
 * @category services
 */
export class EntityClusterRepo extends Effect.Service<EntityClusterRepo>()($I`EntityClusterRepo`, {
  dependencies,
  accessors: true,
  effect: DbRepo.make(KnowledgeEntityIds.EntityClusterId, Entities.EntityCluster.Model, makeEntityClusterExtensions),
}) {}
