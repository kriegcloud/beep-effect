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
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { DatabaseError } from "@beep/shared-domain/errors";
import { DbRepo } from "@beep/shared-domain/factories";
import { thunkZero } from "@beep/utils";
import * as SqlClient from "@effect/sql/SqlClient";
import * as SqlSchema from "@effect/sql/SqlSchema";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { dependencies } from "./_common";

const $I = $KnowledgeServerId.create("db/repos/EntityRepo");

const tableName = KnowledgeEntityIds.KnowledgeEntityId.tableName;

// --- Request Schemas ---

class FindByIdsRequest extends S.Class<FindByIdsRequest>("FindByIdsRequest")({
  ids: S.Array(KnowledgeEntityIds.KnowledgeEntityId),
  organizationId: SharedEntityIds.OrganizationId,
}) {}

class FindByOntologyRequest extends S.Class<FindByOntologyRequest>("FindByOntologyRequest")({
  ontologyId: S.String,
  organizationId: SharedEntityIds.OrganizationId,
  limit: S.Number,
}) {}

class FindByTypeRequest extends S.Class<FindByTypeRequest>("FindByTypeRequest")({
  typeIri: S.String,
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
 * Custom repo operations for entities
 */
const makeEntityExtensions = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;

  // --- SqlSchemas ---

  const findByIdsSchema = SqlSchema.findAll({
    Request: FindByIdsRequest,
    Result: Entities.Entity.Model,
    execute: (req) => sql`
      SELECT *
      FROM ${sql(tableName)}
      WHERE organization_id = ${req.organizationId}
        AND id IN ${sql.in(req.ids)}
    `,
  });

  const findByOntologySchema = SqlSchema.findAll({
    Request: FindByOntologyRequest,
    Result: Entities.Entity.Model,
    execute: (req) => sql`
      SELECT *
      FROM ${sql(tableName)}
      WHERE organization_id = ${req.organizationId}
        AND ontology_id = ${req.ontologyId}
      ORDER BY created_at DESC
      LIMIT ${req.limit}
    `,
  });

  const findByTypeSchema = SqlSchema.findAll({
    Request: FindByTypeRequest,
    Result: Entities.Entity.Model,
    execute: (req) => sql`
      SELECT *
      FROM ${sql(tableName)}
      WHERE organization_id = ${req.organizationId}
        AND types @> ${JSON.stringify([req.typeIri])}::jsonb
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
      if (A.isEmptyReadonlyArray(ids)) return [];
      return yield* findByIdsSchema({ ids: [...ids], organizationId });
    }).pipe(
      Effect.catchTag("ParseError", (e) => Effect.die(e)),
      Effect.mapError(DatabaseError.$match),
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
    findByOntologySchema({ ontologyId, organizationId, limit }).pipe(
      Effect.catchTag("ParseError", (e) => Effect.die(e)),
      Effect.mapError(DatabaseError.$match),
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
    findByTypeSchema({ typeIri, organizationId, limit }).pipe(
      Effect.catchTag("ParseError", (e) => Effect.die(e)),
      Effect.mapError(DatabaseError.$match),
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
      const result = yield* countByOrganizationSchema({ organizationId });
      return O.match(A.head(result), {
        onNone: thunkZero,
        onSome: (row) => Number.parseInt(row.count, 10),
      });
    }).pipe(
      Effect.catchTag("ParseError", (e) => Effect.die(e)),
      Effect.mapError(DatabaseError.$match),
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
