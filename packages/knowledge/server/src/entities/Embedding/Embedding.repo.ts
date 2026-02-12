import { Entities } from "@beep/knowledge-domain";
import { KnowledgeDb } from "@beep/knowledge-server/db";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { DatabaseError } from "@beep/shared-domain/errors";
import type { DbClient } from "@beep/shared-server";
import { DbRepo } from "@beep/shared-server/factories";
import * as SqlClient from "@effect/sql/SqlClient";
import * as SqlSchema from "@effect/sql/SqlSchema";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as S from "effect/Schema";

const tableName = KnowledgeEntityIds.EmbeddingId.tableName;

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

const makeEmbeddingExtensions = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;

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
    Result: Entities.Embedding.SimilarityResult,
    execute: (req) => {
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

  const findByCacheKey = (
    cacheKey: string,
    organizationId: SharedEntityIds.OrganizationId.Type
  ): Effect.Effect<import("effect/Option").Option<Entities.Embedding.Model>, DatabaseError> =>
    findByCacheKeySchema({ cacheKey, organizationId }).pipe(
      Effect.catchTag("ParseError", (e) => Effect.die(e)),
      Effect.mapError(DatabaseError.$match),
      Effect.withSpan("EmbeddingRepo.findByCacheKey", {
        captureStackTrace: false,
        attributes: { cacheKey, organizationId },
      })
    );

  const findSimilar = (
    queryVector: ReadonlyArray<number>,
    organizationId: SharedEntityIds.OrganizationId.Type,
    limit = 10,
    threshold = 0.7
  ): Effect.Effect<ReadonlyArray<Entities.Embedding.SimilarityResult>, DatabaseError> =>
    findSimilarSchema({ queryVector: [...queryVector], organizationId, limit, threshold }).pipe(
      Effect.catchTag("ParseError", Effect.die),
      Effect.mapError(DatabaseError.$match),
      Effect.withSpan("EmbeddingRepo.findSimilar", {
        captureStackTrace: false,
        attributes: { organizationId, limit, threshold },
      })
    );

  const findByEntityType = (
    entityType: Entities.Embedding.EntityType.Type,
    organizationId: SharedEntityIds.OrganizationId.Type,
    limit = 100
  ): Effect.Effect<ReadonlyArray<Entities.Embedding.Model>, DatabaseError> =>
    findByEntityTypeSchema({ entityType, organizationId, limit }).pipe(
      Effect.catchTag("ParseError", Effect.die),
      Effect.mapError(DatabaseError.$match),
      Effect.withSpan("EmbeddingRepo.findByEntityType", {
        captureStackTrace: false,
        attributes: { entityType, organizationId, limit },
      })
    );

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
          DatabaseError.$match(error, `Failed to delete embeddings by prefix: ${String(error)}`)
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

const serviceEffect = DbRepo.make(KnowledgeEntityIds.EmbeddingId, Entities.Embedding.Model, makeEmbeddingExtensions);

export const RepoLive: Layer.Layer<Entities.Embedding.Repo, never, DbClient.SliceDbRequirements> = Layer.effect(
  Entities.Embedding.Repo,
  Effect.map(serviceEffect, (_) => _ as Entities.Embedding.RepoShape)
).pipe(Layer.provide(KnowledgeDb.layer));
