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

const $I = $KnowledgeServerId.create("db/repos/MeetingPrepBulletRepo");

const tableName = KnowledgeEntityIds.MeetingPrepBulletId.tableName;

class ListByMeetingPrepIdRequest extends S.Class<ListByMeetingPrepIdRequest>($I`ListByMeetingPrepIdRequest`)(
  {
    meetingPrepId: S.String,
    organizationId: SharedEntityIds.OrganizationId,
  },
  $I.annotations("ListByMeetingPrepIdRequest", {
    description: "SQL request schema: list bullets for a meeting-prep run (scoped to organization).",
  })
) {}

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

const serviceEffect = DbRepo.make(KnowledgeEntityIds.MeetingPrepBulletId, Entities.MeetingPrepBullet.Model, makeExtensions);

export type MeetingPrepBulletRepoShape = Effect.Effect.Success<typeof serviceEffect>;

export class MeetingPrepBulletRepo extends Context.Tag($I`MeetingPrepBulletRepo`)<
  MeetingPrepBulletRepo,
  MeetingPrepBulletRepoShape
>() {}

export const MeetingPrepBulletRepoLive = Layer.effect(MeetingPrepBulletRepo, serviceEffect).pipe(
  Layer.provide(KnowledgeDb.layer)
);

