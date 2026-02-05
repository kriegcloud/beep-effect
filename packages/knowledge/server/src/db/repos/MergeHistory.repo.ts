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

const $I = $KnowledgeServerId.create("db/repos/MergeHistoryRepo");

const tableName = KnowledgeEntityIds.MergeHistoryId.tableName;

class FindByTargetEntityRequest extends S.Class<FindByTargetEntityRequest>("FindByTargetEntityRequest")({
  targetEntityId: KnowledgeEntityIds.KnowledgeEntityId,
  organizationId: SharedEntityIds.OrganizationId,
}) {}

class FindBySourceEntityRequest extends S.Class<FindBySourceEntityRequest>("FindBySourceEntityRequest")({
  sourceEntityId: KnowledgeEntityIds.KnowledgeEntityId,
  organizationId: SharedEntityIds.OrganizationId,
}) {}

class FindByUserRequest extends S.Class<FindByUserRequest>("FindByUserRequest")({
  userId: SharedEntityIds.UserId,
  organizationId: SharedEntityIds.OrganizationId,
  limit: S.Number,
}) {}

class FindByOrganizationRequest extends S.Class<FindByOrganizationRequest>("FindByOrganizationRequest")({
  organizationId: SharedEntityIds.OrganizationId,
  limit: S.Number,
}) {}

const makeMergeHistoryExtensions = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;

  const findByTargetEntitySchema = SqlSchema.findAll({
    Request: FindByTargetEntityRequest,
    Result: Entities.MergeHistory.Model,
    execute: (req) => sql`
      SELECT *
      FROM ${sql(tableName)}
      WHERE organization_id = ${req.organizationId}
        AND target_entity_id = ${req.targetEntityId}
      ORDER BY merged_at DESC
    `,
  });

  const findBySourceEntitySchema = SqlSchema.findAll({
    Request: FindBySourceEntityRequest,
    Result: Entities.MergeHistory.Model,
    execute: (req) => sql`
      SELECT *
      FROM ${sql(tableName)}
      WHERE organization_id = ${req.organizationId}
        AND source_entity_id = ${req.sourceEntityId}
      ORDER BY merged_at DESC
    `,
  });

  const findByUserSchema = SqlSchema.findAll({
    Request: FindByUserRequest,
    Result: Entities.MergeHistory.Model,
    execute: (req) => sql`
      SELECT *
      FROM ${sql(tableName)}
      WHERE organization_id = ${req.organizationId}
        AND merged_by = ${req.userId}
      ORDER BY merged_at DESC
      LIMIT ${req.limit}
    `,
  });

  const findByOrganizationSchema = SqlSchema.findAll({
    Request: FindByOrganizationRequest,
    Result: Entities.MergeHistory.Model,
    execute: (req) => sql`
      SELECT *
      FROM ${sql(tableName)}
      WHERE organization_id = ${req.organizationId}
      ORDER BY merged_at DESC
      LIMIT ${req.limit}
    `,
  });

  const findByTargetEntity = (
    targetEntityId: KnowledgeEntityIds.KnowledgeEntityId.Type,
    organizationId: SharedEntityIds.OrganizationId.Type
  ): Effect.Effect<ReadonlyArray<Entities.MergeHistory.Model>, DatabaseError> =>
    findByTargetEntitySchema({ targetEntityId, organizationId }).pipe(
      Effect.catchTag("ParseError", Effect.die),
      Effect.mapError(DatabaseError.$match),
      Effect.withSpan("MergeHistoryRepo.findByTargetEntity", {
        captureStackTrace: false,
        attributes: { targetEntityId, organizationId },
      })
    );

  const findBySourceEntity = (
    sourceEntityId: KnowledgeEntityIds.KnowledgeEntityId.Type,
    organizationId: SharedEntityIds.OrganizationId.Type
  ): Effect.Effect<ReadonlyArray<Entities.MergeHistory.Model>, DatabaseError> =>
    findBySourceEntitySchema({ sourceEntityId, organizationId }).pipe(
      Effect.catchTag("ParseError", Effect.die),
      Effect.mapError(DatabaseError.$match),
      Effect.withSpan("MergeHistoryRepo.findBySourceEntity", {
        captureStackTrace: false,
        attributes: { sourceEntityId, organizationId },
      })
    );

  const findByUser = (
    userId: SharedEntityIds.UserId.Type,
    organizationId: SharedEntityIds.OrganizationId.Type,
    limit = 100
  ): Effect.Effect<ReadonlyArray<Entities.MergeHistory.Model>, DatabaseError> =>
    findByUserSchema({ userId, organizationId, limit }).pipe(
      Effect.catchTag("ParseError", Effect.die),
      Effect.mapError(DatabaseError.$match),
      Effect.withSpan("MergeHistoryRepo.findByUser", {
        captureStackTrace: false,
        attributes: { userId, organizationId, limit },
      })
    );

  const findByOrganization = (
    organizationId: SharedEntityIds.OrganizationId.Type,
    limit = 100
  ): Effect.Effect<ReadonlyArray<Entities.MergeHistory.Model>, DatabaseError> =>
    findByOrganizationSchema({ organizationId, limit }).pipe(
      Effect.catchTag("ParseError", Effect.die),
      Effect.mapError(DatabaseError.$match),
      Effect.withSpan("MergeHistoryRepo.findByOrganization", {
        captureStackTrace: false,
        attributes: { organizationId, limit },
      })
    );

  return {
    findByTargetEntity,
    findBySourceEntity,
    findByUser,
    findByOrganization,
  };
});

const serviceEffect = DbRepo.make(
  KnowledgeEntityIds.MergeHistoryId,
  Entities.MergeHistory.Model,
  makeMergeHistoryExtensions
);

export type MergeHistoryRepoShape = Effect.Effect.Success<typeof serviceEffect>;

export class MergeHistoryRepo extends Context.Tag($I`MergeHistoryRepo`)<MergeHistoryRepo, MergeHistoryRepoShape>() {}

export const MergeHistoryRepoLive = Layer.effect(MergeHistoryRepo, serviceEffect).pipe(
  Layer.provide(KnowledgeDb.layer)
);
