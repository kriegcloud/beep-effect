import { $KnowledgeServerId } from "@beep/identity/packages";
import { Entities } from "@beep/knowledge-domain";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { DatabaseError } from "@beep/shared-domain/errors";
import { DbRepo } from "@beep/shared-server/factories";
import * as SqlClient from "@effect/sql/SqlClient";
import * as SqlSchema from "@effect/sql/SqlSchema";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as S from "effect/Schema";
import { KnowledgeDb } from "../Db";

const $I = $KnowledgeServerId.create("db/repos/MeetingPrepEvidenceRepo");

const tableName = KnowledgeEntityIds.MeetingPrepEvidenceId.tableName;

class ListByBulletIdRequest extends S.Class<ListByBulletIdRequest>($I`ListByBulletIdRequest`)(
  {
    bulletId: KnowledgeEntityIds.MeetingPrepBulletId,
    organizationId: SharedEntityIds.OrganizationId,
  },
  $I.annotations("ListByBulletIdRequest", {
    description: "SQL request schema: list meeting-prep evidence for a bullet (scoped to organization).",
  })
) {}

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

export type MeetingPrepEvidenceRepoShape = Effect.Effect.Success<typeof serviceEffect>;

export class MeetingPrepEvidenceRepo extends Context.Tag($I`MeetingPrepEvidenceRepo`)<
  MeetingPrepEvidenceRepo,
  MeetingPrepEvidenceRepoShape
>() {}

export const MeetingPrepEvidenceRepoLive = Layer.effect(MeetingPrepEvidenceRepo, serviceEffect).pipe(
  Layer.provide(KnowledgeDb.layer)
);
