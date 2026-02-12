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

const tableName = KnowledgeEntityIds.MeetingPrepBulletId.tableName;

class ListByMeetingPrepIdRequest extends S.Class<ListByMeetingPrepIdRequest>("ListByMeetingPrepIdRequest")({
  meetingPrepId: S.String,
  organizationId: SharedEntityIds.OrganizationId,
}) {}

const makeExtensions = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;

  const listByMeetingPrepIdSchema = SqlSchema.findAll({
    Request: ListByMeetingPrepIdRequest,
    Result: Entities.MeetingPrepBullet.Model,
    execute: (req) => sql`
      SELECT *
      FROM ${sql(tableName)}
      WHERE organization_id = ${req.organizationId}
        AND meeting_prep_id = ${req.meetingPrepId}
      ORDER BY bullet_index ASC, id ASC
    `,
  });

  const listByMeetingPrepId = (
    meetingPrepId: string,
    organizationId: SharedEntityIds.OrganizationId.Type
  ): Effect.Effect<ReadonlyArray<Entities.MeetingPrepBullet.Model>, DatabaseError> =>
    listByMeetingPrepIdSchema({ meetingPrepId, organizationId }).pipe(
      Effect.catchTag("ParseError", Effect.die),
      Effect.mapError(DatabaseError.$match),
      Effect.withSpan("MeetingPrepBulletRepo.listByMeetingPrepId", {
        captureStackTrace: false,
        attributes: { meetingPrepId, organizationId },
      })
    );

  return { listByMeetingPrepId } as const;
});

const serviceEffect = DbRepo.make(
  KnowledgeEntityIds.MeetingPrepBulletId,
  Entities.MeetingPrepBullet.Model,
  makeExtensions
);

export const RepoLive: Layer.Layer<Entities.MeetingPrepBullet.Repo, never, DbClient.SliceDbRequirements> = Layer.effect(
  Entities.MeetingPrepBullet.Repo,
  serviceEffect
).pipe(Layer.provide(KnowledgeDb.layer));
