import { $KnowledgeDomainId } from "@beep/identity/packages";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("rpc/MeetingPrep/Generate");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    organizationId: SharedEntityIds.OrganizationId,
    query: S.String,
    ontologyId: S.optional(KnowledgeEntityIds.OntologyId),
    maxBullets: S.optional(S.NonNegativeInt),
  },
  $I.annotations("Payload", {
    description: "meetingprep_generate payload (persists bullets + citations).",
  })
) {}

export class Bullet extends S.Class<Bullet>($I`Bullet`)(
  {
    id: KnowledgeEntityIds.MeetingPrepBulletId,
    meetingPrepId: S.String,
    bulletIndex: S.NonNegativeInt,
    text: S.String,
  },
  $I.annotations("Bullet", {
    description: "Persisted meeting-prep bullet output.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    meetingPrepId: S.String,
    bullets: S.Array(Bullet),
    disclaimer: S.String,
  },
  $I.annotations("Success", {
    description: "meetingprep_generate result (persisted + restart-safe).",
  })
) {}

export const Error = S.Never;

export const Contract = Rpc.make("generate", {
  payload: Payload,
  success: Success,
  error: Error,
});

