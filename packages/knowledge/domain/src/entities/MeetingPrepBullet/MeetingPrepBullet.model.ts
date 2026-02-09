import { $KnowledgeDomainId } from "@beep/identity/packages";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("entities/MeetingPrepBullet");

export class Model extends M.Class<Model>($I`MeetingPrepBulletModel`)(
  makeFields(KnowledgeEntityIds.MeetingPrepBulletId, {
    organizationId: SharedEntityIds.OrganizationId,

    meetingPrepId: S.String.annotations({
      description: "Execution/run identifier for a meeting-prep generation run",
    }),

    bulletIndex: S.NonNegativeInt.annotations({
      description: "Deterministic ordering within a meeting-prep run",
    }),

    text: S.String.annotations({
      description: "Bullet content (immutable output for auditability)",
    }),
  }),
  $I.annotations("MeetingPrepBulletModel", {
    description: "Persisted meeting-prep bullet output (D-10).",
  })
) {
  static readonly utils = modelKit(Model);
}

