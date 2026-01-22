/**
 * Entity Repository
 *
 * Database operations for Entity entities with graph traversal support.
 *
 * @module knowledge-server/db/repos/Entity
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

const $I = $KnowledgeServerId.create("db/repos/EntityRepo");

/**
 * Custom repo operations for entities
 */
const makeEntityExtensions = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;
  const tableName = "knowledge_entity";

  /**
   * Find entities by their IDs
   *
   * @param ids - Array of entity IDs
   * @param organizationId - Organization ID for scoping
   * @returns Array of matching entities
   */
  const findByIds = (
    ids: ReadonlyArray<KnowledgeEntityIds.KnowledgeEntityId.Type>,
    organizationId: SharedEntityIds.OrganizationId.Type
  ): Effect.Effect<ReadonlyArray<Entities.Entity.Model>, DatabaseError> =>
    Effect.gen(function* () {
      if (ids.length === 0) return [];

      const results = yield* sql<Entities.Entity.Model>`
        SELECT *
        FROM ${sql(tableName)}
        WHERE organization_id = ${organizationId}
          AND id IN ${sql.in(ids)}
      `.pipe(
        Effect.mapError((error) =>
          DatabaseError.$match({
            message: `Failed to find entities by IDs: ${String(error)}`,
            _tag: "DatabaseError",
          })
        )
      );

      return results;
    }).pipe(
      Effect.withSpan("EntityRepo.findByIds", {
        captureStackTrace: false,
        attributes: { count: ids.length, organizationId },
      })
    );

  /**
   * Find entities by ontology ID
   *
   * @param ontologyId - Ontology ID for filtering
   * @param organizationId - Organization ID for scoping
   * @param limit - Maximum number of results
   * @returns Array of matching entities
   */
  const findByOntology = (
    ontologyId: string,
    organizationId: SharedEntityIds.OrganizationId.Type,
    limit = 100
  ): Effect.Effect<ReadonlyArray<Entities.Entity.Model>, DatabaseError> =>
    sql<Entities.Entity.Model>`
      SELECT *
      FROM ${sql(tableName)}
      WHERE organization_id = ${organizationId}
        AND ontology_id = ${ontologyId}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `.pipe(
      Effect.mapError((error) =>
        DatabaseError.$match({
          message: `Failed to find entities by ontology: ${String(error)}`,
          _tag: "DatabaseError",
        })
      ),
      Effect.withSpan("EntityRepo.findByOntology", {
        captureStackTrace: false,
        attributes: { ontologyId, organizationId, limit },
      })
    );

  /**
   * Find entities by type IRI
   *
   * @param typeIri - Ontology type IRI to match
   * @param organizationId - Organization ID for scoping
   * @param limit - Maximum number of results
   * @returns Array of matching entities
   */
  const findByType = (
    typeIri: string,
    organizationId: SharedEntityIds.OrganizationId.Type,
    limit = 100
  ): Effect.Effect<ReadonlyArray<Entities.Entity.Model>, DatabaseError> =>
    sql<Entities.Entity.Model>`
      SELECT *
      FROM ${sql(tableName)}
      WHERE organization_id = ${organizationId}
        AND types @> ${JSON.stringify([typeIri])}::jsonb
      ORDER BY created_at DESC
      LIMIT ${limit}
    `.pipe(
      Effect.mapError((error) =>
        DatabaseError.$match({
          message: `Failed to find entities by type: ${String(error)}`,
          _tag: "DatabaseError",
        })
      ),
      Effect.withSpan("EntityRepo.findByType", {
        captureStackTrace: false,
        attributes: { typeIri, organizationId, limit },
      })
    );

  /**
   * Count entities by organization
   *
   * @param organizationId - Organization ID for scoping
   * @returns Count of entities
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
            message: `Failed to count entities: ${String(error)}`,
            _tag: "DatabaseError",
          })
        )
      );

      return O.match(A.head(result), {
        onNone: () => 0,
        onSome: (row) => Number.parseInt(row.count, 10),
      });
    }).pipe(
      Effect.withSpan("EntityRepo.countByOrganization", {
        captureStackTrace: false,
        attributes: { organizationId },
      })
    );

  return {
    findByIds,
    findByOntology,
    findByType,
    countByOrganization,
  };
});

/**
 * EntityRepo Effect.Service
 *
 * Provides CRUD operations for Entity entities plus
 * graph traversal support.
 *
 * @since 0.1.0
 * @category services
 */
export class EntityRepo extends Effect.Service<EntityRepo>()($I`EntityRepo`, {
  dependencies,
  accessors: true,
  effect: DbRepo.make(KnowledgeEntityIds.KnowledgeEntityId, Entities.Entity.Model, makeEntityExtensions),
}) {}
