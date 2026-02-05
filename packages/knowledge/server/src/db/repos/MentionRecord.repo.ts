import { $KnowledgeServerId } from "@beep/identity/packages";
import { Entities } from "@beep/knowledge-domain";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { DatabaseError } from "@beep/shared-domain/errors";
import { DbRepo } from "@beep/shared-domain/factories";
import * as SqlClient from "@effect/sql/SqlClient";
import * as SqlSchema from "@effect/sql/SqlSchema";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as S from "effect/Schema";
import { KnowledgeDb } from "../Db";

const $I = $KnowledgeServerId.create("db/repos/MentionRecordRepo");

const tableName = KnowledgeEntityIds.MentionRecordId.tableName;

class FindByExtractionIdRequest extends S.Class<FindByExtractionIdRequest>("FindByExtractionIdRequest")({
  extractionId: KnowledgeEntityIds.ExtractionId,
  organizationId: SharedEntityIds.OrganizationId,
}) {}

class FindByResolvedEntityIdRequest extends S.Class<FindByResolvedEntityIdRequest>("FindByResolvedEntityIdRequest")({
  entityId: KnowledgeEntityIds.KnowledgeEntityId,
  organizationId: SharedEntityIds.OrganizationId,
}) {}

class FindUnresolvedRequest extends S.Class<FindUnresolvedRequest>("FindUnresolvedRequest")({
  organizationId: SharedEntityIds.OrganizationId,
  limit: S.Number,
}) {}

const makeMentionRecordExtensions = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;

  const findByExtractionIdSchema = SqlSchema.findAll({
    Request: FindByExtractionIdRequest,
    Result: Entities.MentionRecord.Model,
    execute: (req) => sql`
      SELECT *
      FROM ${sql(tableName)}
      WHERE organization_id = ${req.organizationId}
        AND extraction_id = ${req.extractionId}
      ORDER BY chunk_index ASC
    `,
  });

  const findByResolvedEntityIdSchema = SqlSchema.findAll({
    Request: FindByResolvedEntityIdRequest,
    Result: Entities.MentionRecord.Model,
    execute: (req) => sql`
      SELECT *
      FROM ${sql(tableName)}
      WHERE organization_id = ${req.organizationId}
        AND resolved_entity_id = ${req.entityId}
      ORDER BY extracted_at DESC
    `,
  });

  const findUnresolvedSchema = SqlSchema.findAll({
    Request: FindUnresolvedRequest,
    Result: Entities.MentionRecord.Model,
    execute: (req) => sql`
      SELECT *
      FROM ${sql(tableName)}
      WHERE organization_id = ${req.organizationId}
        AND resolved_entity_id IS NULL
      ORDER BY extracted_at ASC
      LIMIT ${req.limit}
    `,
  });

  const findByExtractionId = (
    extractionId: KnowledgeEntityIds.ExtractionId.Type,
    organizationId: SharedEntityIds.OrganizationId.Type
  ): Effect.Effect<ReadonlyArray<Entities.MentionRecord.Model>, DatabaseError> =>
    findByExtractionIdSchema({ extractionId, organizationId }).pipe(
      Effect.catchTag("ParseError", Effect.die),
      Effect.mapError(DatabaseError.$match),
      Effect.withSpan("MentionRecordRepo.findByExtractionId", {
        captureStackTrace: false,
        attributes: { extractionId, organizationId },
      })
    );

  const findByResolvedEntityId = (
    entityId: KnowledgeEntityIds.KnowledgeEntityId.Type,
    organizationId: SharedEntityIds.OrganizationId.Type
  ): Effect.Effect<ReadonlyArray<Entities.MentionRecord.Model>, DatabaseError> =>
    findByResolvedEntityIdSchema({ entityId, organizationId }).pipe(
      Effect.catchTag("ParseError", Effect.die),
      Effect.mapError(DatabaseError.$match),
      Effect.withSpan("MentionRecordRepo.findByResolvedEntityId", {
        captureStackTrace: false,
        attributes: { entityId, organizationId },
      })
    );

  const findUnresolved = (
    organizationId: SharedEntityIds.OrganizationId.Type,
    limit = 100
  ): Effect.Effect<ReadonlyArray<Entities.MentionRecord.Model>, DatabaseError> =>
    findUnresolvedSchema({ organizationId, limit }).pipe(
      Effect.catchTag("ParseError", Effect.die),
      Effect.mapError(DatabaseError.$match),
      Effect.withSpan("MentionRecordRepo.findUnresolved", {
        captureStackTrace: false,
        attributes: { organizationId, limit },
      })
    );

  const updateResolvedEntityId = (
    mentionRecordId: KnowledgeEntityIds.MentionRecordId.Type,
    entityId: KnowledgeEntityIds.KnowledgeEntityId.Type
  ): Effect.Effect<void, DatabaseError> =>
    sql`UPDATE ${sql(tableName)} SET resolved_entity_id = ${entityId} WHERE id = ${mentionRecordId}`.pipe(
      Effect.asVoid,
      Effect.mapError(DatabaseError.$match),
      Effect.withSpan("MentionRecordRepo.updateResolvedEntityId", {
        captureStackTrace: false,
        attributes: { mentionRecordId, entityId },
      })
    );

  return {
    findByExtractionId,
    findByResolvedEntityId,
    findUnresolved,
    updateResolvedEntityId,
  };
});

const serviceEffect = DbRepo.make(
  KnowledgeEntityIds.MentionRecordId,
  Entities.MentionRecord.Model,
  makeMentionRecordExtensions
);

export type MentionRecordRepoShape = Effect.Effect.Success<typeof serviceEffect>;

export class MentionRecordRepo extends Context.Tag($I`MentionRecordRepo`)<
  MentionRecordRepo,
  MentionRecordRepoShape
>() {}

export const MentionRecordRepoLive = Layer.effect(MentionRecordRepo, serviceEffect).pipe(
  Layer.provide(KnowledgeDb.layer)
);
