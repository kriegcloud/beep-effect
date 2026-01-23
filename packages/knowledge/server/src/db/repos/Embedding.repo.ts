/**
 * Embedding Repository
 *
 * Database operations for Embedding entities with pgvector similarity search.
 *
 * @module knowledge-server/db/repos/Embedding
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
import type * as O from "effect/Option";
import * as S from "effect/Schema";
import { dependencies } from "./_common";

const $I = $KnowledgeServerId.create("db/repos/EmbeddingRepo");

/**
 * Result type for similarity search
 *
 * @since 0.1.0
 * @category schemas
 */
export class SimilarityResult extends S.Class<SimilarityResult>("SimilarityResult")({
  id: KnowledgeEntityIds.EmbeddingId,
  entityType: Entities.Embedding.EntityType,
  entityId: S.String,
  contentText: S.optional(S.String),
  similarity: S.Number,
}) {}

const tableName = KnowledgeEntityIds.EmbeddingId.tableName;

// --- Request Schemas ---

class FindByCacheKeyRequest extends S.Class<FindByCacheKeyRequest>("FindByCacheKeyRequest")({
  cacheKey: S.String,
  organizationId: SharedEntityIds.OrganizationId,
}) {}

class FindSimilarRequest extends S.Class<FindSimilarRequest>("FindSimilarRequest")({
  queryVector: S.Array(S.Number),
  organizationId: SharedEntityIds.OrganizationId,
  limit: S.Number,
  threshold: S.Number,
}) {}

class FindByEntityTypeRequest extends S.Class<FindByEntityTypeRequest>("FindByEntityTypeRequest")({
  entityType: Entities.Embedding.EntityType,
  organizationId: SharedEntityIds.OrganizationId,
  limit: S.Number,
}) {}

/**
 * Custom repo operations for embeddings
 */
const makeEmbeddingExtensions = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;

  // --- SqlSchemas ---

  const findByCacheKeySchema = SqlSchema.findOne({
    Request: FindByCacheKeyRequest,
    Result: Entities.Embedding.Model,
    execute: (req) => sql`
      SELECT *
      FROM ${sql(tableName)}
      WHERE entity_id = ${req.cacheKey}
        AND organization_id = ${req.organizationId}
      LIMIT 1
    `,
  });

  const findSimilarSchema = SqlSchema.findAll({
    Request: FindSimilarRequest,
    Result: SimilarityResult,
    execute: (req) => {
      // Format vector for pgvector: "[0.1,0.2,...]"
      const vectorString = `[${A.join(A.map(req.queryVector, String), ",")}]`;
      return sql`
        SELECT id,
               entity_type,
               entity_id,
               content_text,
               1 - (embedding <=> ${vectorString}::vector) as similarity
        FROM ${sql(tableName)}
        WHERE organization_id = ${req.organizationId}
          AND 1 - (embedding <=> ${vectorString}::vector) >= ${req.threshold}
        ORDER BY embedding <=> ${vectorString}::vector
        LIMIT ${req.limit}
      `;
    },
  });

  const findByEntityTypeSchema = SqlSchema.findAll({
    Request: FindByEntityTypeRequest,
    Result: Entities.Embedding.Model,
    execute: (req) => sql`
      SELECT *
      FROM ${sql(tableName)}
      WHERE organization_id = ${req.organizationId}
        AND entity_type = ${req.entityType}
      LIMIT ${req.limit}
    `,
  });

  // --- Methods ---

  /**
   * Find embedding by cache key (entityId) and organization
   *
   * @param cacheKey - The cache key (stored as entityId)
   * @param organizationId - Organization ID for scoping
   * @returns Option of the matching embedding
   */
  const findByCacheKey = (
    cacheKey: string,
    organizationId: SharedEntityIds.OrganizationId.Type
  ): Effect.Effect<O.Option<Entities.Embedding.Model>, DatabaseError> =>
    findByCacheKeySchema({ cacheKey, organizationId }).pipe(
      Effect.catchTag("ParseError", (e) => Effect.die(e)),
      Effect.mapError(DatabaseError.$match),
      Effect.withSpan("EmbeddingRepo.findByCacheKey", {
        captureStackTrace: false,
        attributes: { cacheKey, organizationId },
      })
    );

  /**
   * Find similar embeddings using pgvector cosine distance
   *
   * @param queryVector - The query embedding vector
   * @param organizationId - Organization ID for scoping
   * @param limit - Maximum number of results (default 10)
   * @param threshold - Minimum similarity threshold (default 0.7)
   * @returns Array of similar embeddings with similarity scores
   */
  const findSimilar = (
    queryVector: ReadonlyArray<number>,
    organizationId: SharedEntityIds.OrganizationId.Type,
    limit = 10,
    threshold = 0.7
  ): Effect.Effect<ReadonlyArray<SimilarityResult>, DatabaseError> =>
    findSimilarSchema({ queryVector: [...queryVector], organizationId, limit, threshold }).pipe(
      Effect.catchTag("ParseError", (e) => Effect.die(e)),
      Effect.mapError(DatabaseError.$match),
      Effect.withSpan("EmbeddingRepo.findSimilar", {
        captureStackTrace: false,
        attributes: { organizationId, limit, threshold },
      })
    );

  /**
   * Find embeddings by entity type within an organization
   *
   * @param entityType - Type of entity (class, entity, claim, example)
   * @param organizationId - Organization ID for scoping
   * @param limit - Maximum number of results
   * @returns Array of matching embeddings
   */
  const findByEntityType = (
    entityType: Entities.Embedding.EntityType.Type,
    organizationId: SharedEntityIds.OrganizationId.Type,
    limit = 100
  ): Effect.Effect<ReadonlyArray<Entities.Embedding.Model>, DatabaseError> =>
    findByEntityTypeSchema({ entityType, organizationId, limit }).pipe(
      Effect.catchTag("ParseError", (e) => Effect.die(e)),
      Effect.mapError(DatabaseError.$match),
      Effect.withSpan("EmbeddingRepo.findByEntityType", {
        captureStackTrace: false,
        attributes: { entityType, organizationId, limit },
      })
    );

  /**
   * Delete embeddings by entity ID prefix
   *
   * Useful for removing all embeddings associated with a specific
   * document or extraction run.
   *
   * @param entityIdPrefix - Prefix to match (e.g., "knowledge_entity__")
   * @param organizationId - Organization ID for scoping
   * @returns Number of deleted rows
   */
  const deleteByEntityIdPrefix = (
    entityIdPrefix: string,
    organizationId: SharedEntityIds.OrganizationId.Type
  ): Effect.Effect<number, DatabaseError> =>
    Effect.gen(function* () {
      const result = yield* sql`
          DELETE
          FROM ${sql(KnowledgeEntityIds.EmbeddingId.tableName)}
          WHERE organization_id = ${organizationId}
            AND entity_id LIKE ${`${entityIdPrefix}%`}
      `.pipe(
        Effect.mapError((error) =>
          DatabaseError.$match({
            message: `Failed to delete embeddings by prefix: ${String(error)}`,
            _tag: "DatabaseError",
          })
        )
      );
      return result.length;
    }).pipe(
      Effect.withSpan("EmbeddingRepo.deleteByEntityIdPrefix", {
        captureStackTrace: false,
        attributes: { entityIdPrefix, organizationId },
      })
    );

  return {
    findByCacheKey,
    findSimilar,
    findByEntityType,
    deleteByEntityIdPrefix,
  };
});

/**
 * EmbeddingRepo Effect.Service
 *
 * Provides CRUD operations for Embedding entities plus
 * pgvector-powered similarity search.
 *
 * @since 0.1.0
 * @category services
 */
export class EmbeddingRepo extends Effect.Service<EmbeddingRepo>()($I`EmbeddingRepo`, {
  dependencies,
  accessors: true,
  effect: DbRepo.make(KnowledgeEntityIds.EmbeddingId, Entities.Embedding.Model, makeEmbeddingExtensions),
}) {}
