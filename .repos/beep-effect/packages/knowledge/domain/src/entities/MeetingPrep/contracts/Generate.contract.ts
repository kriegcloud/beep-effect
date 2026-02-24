import { $KnowledgeDomainId } from "@beep/identity/packages";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("entities/MeetingPrep/contracts/Generate.contract");

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

export const Failure = S.Never;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "generate",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Generate meeting prep Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.post("Generate", "/generate").setPayload(Payload).addSuccess(Success);
}
