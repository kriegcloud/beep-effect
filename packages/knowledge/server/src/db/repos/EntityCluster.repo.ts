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
import { KnowledgeEntityIds, type SharedEntityIds } from "@beep/shared-domain";
import { DatabaseError } from "@beep/shared-domain/errors";
import { DbRepo } from "@beep/shared-domain/factories";
import * as SqlClient from "@effect/sql/SqlClient";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import type * as O from "effect/Option";
import { dependencies } from "./_common";

const $I = $KnowledgeServerId.create("db/repos/EntityClusterRepo");

/**
 * Custom repo operations for entity clusters
 */
const makeEntityClusterExtensions = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;
  const tableName = "knowledge_entity_cluster";

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
    sql<Entities.EntityCluster.Model>`
        SELECT *
        FROM ${sql(tableName)}
        WHERE canonical_entity_id = ${canonicalEntityId}
          AND organization_id = ${organizationId} LIMIT 1
    `.pipe(
      Effect.map(A.head),
      Effect.mapError((error) =>
        DatabaseError.$match({
          message: `Failed to find cluster by canonical entity: ${String(error)}`,
          _tag: "DatabaseError",
        })
      ),
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
    sql<Entities.EntityCluster.Model>`
        SELECT *
        FROM ${sql(tableName)}
        WHERE organization_id = ${organizationId}
          AND member_ids @ > ${JSON.stringify([memberId])}::jsonb
        LIMIT 1
    `.pipe(
      Effect.map(A.head),
      Effect.mapError((error) =>
        DatabaseError.$match({
          message: `Failed to find cluster by member: ${String(error)}`,
          _tag: "DatabaseError",
        })
      ),
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
    sql<Entities.EntityCluster.Model>`
        SELECT *
        FROM ${sql(tableName)}
        WHERE organization_id = ${organizationId}
          AND ontology_id = ${ontologyId} LIMIT ${limit}
    `.pipe(
      Effect.mapError((error) =>
        DatabaseError.$match({
          message: `Failed to find clusters by ontology: ${String(error)}`,
          _tag: "DatabaseError",
        })
      ),
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
    sql<Entities.EntityCluster.Model>`
        SELECT *
        FROM ${sql(tableName)}
        WHERE organization_id = ${organizationId}
          AND cohesion >= ${minCohesion}
        ORDER BY cohesion DESC
            LIMIT ${limit}
    `.pipe(
      Effect.mapError((error) =>
        DatabaseError.$match({
          message: `Failed to find high cohesion clusters: ${String(error)}`,
          _tag: "DatabaseError",
        })
      ),
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
   * @returns Number of deleted rows
   */
  const deleteByOntology = (
    ontologyId: string,
    organizationId: SharedEntityIds.OrganizationId.Type
  ): Effect.Effect<number, DatabaseError> =>
    Effect.gen(function* () {
      const result = yield* sql`
          DELETE
          FROM ${sql(tableName)}
          WHERE organization_id = ${organizationId}
            AND ontology_id = ${ontologyId}
      `.pipe(
        Effect.mapError((error) =>
          DatabaseError.$match({
            message: `Failed to delete clusters by ontology: ${String(error)}`,
            _tag: "DatabaseError",
          })
        )
      );
      return result.length;
    }).pipe(
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
