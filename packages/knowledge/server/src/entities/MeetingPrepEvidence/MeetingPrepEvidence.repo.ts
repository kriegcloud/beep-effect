import { Entities } from "@beep/knowledge-domain";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { DatabaseError } from "@beep/shared-domain/errors";
import type { DbClient } from "@beep/shared-server";
import { DbRepo } from "@beep/shared-server/factories";
import * as SqlClient from "@effect/sql/SqlClient";
import * as SqlSchema from "@effect/sql/SqlSchema";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as S from "effect/Schema";
import { KnowledgeDb } from "../../db/Db";

const tableName = KnowledgeEntityIds.MeetingPrepEvidenceId.tableName;

class ListByBulletIdRequest extends S.Class<ListByBulletIdRequest>("ListByBulletIdRequest")({
  bulletId: KnowledgeEntityIds.MeetingPrepBulletId,
  organizationId: SharedEntityIds.OrganizationId,
}) {}

const makeExtensions = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;

  const listByBulletIdSchema = SqlSchema.findAll({
    Request: ListByBulletIdRequest,
    Result: Entities.MeetingPrepEvidence.Model,
    execute: (req) => sql`
      SELECT *
      FROM ${sql(tableName)}
      WHERE organization_id = ${req.organizationId}
        AND bullet_id = ${req.bulletId}
      ORDER BY created_at ASC, id ASC
    `,
  });

  const listByBulletId = (
    bulletId: KnowledgeEntityIds.MeetingPrepBulletId.Type,
    organizationId: SharedEntityIds.OrganizationId.Type
  ): Effect.Effect<ReadonlyArray<Entities.MeetingPrepEvidence.Model>, DatabaseError> =>
    listByBulletIdSchema({ bulletId, organizationId }).pipe(
      Effect.catchTag("ParseError", Effect.die),
      Effect.mapError(DatabaseError.$match),
      Effect.withSpan("MeetingPrepEvidenceRepo.listByBulletId", {
        captureStackTrace: false,
        attributes: { bulletId, organizationId },
      })
    );

  return { listByBulletId } as const;
});

const serviceEffect = DbRepo.make(
  KnowledgeEntityIds.MeetingPrepEvidenceId,
  Entities.MeetingPrepEvidence.Model,
  makeExtensions
);

export const RepoLive: Layer.Layer<Entities.MeetingPrepEvidence.Repo, never, DbClient.SliceDbRequirements> =
  Layer.effect(Entities.MeetingPrepEvidence.Repo, serviceEffect).pipe(Layer.provide(KnowledgeDb.layer));
