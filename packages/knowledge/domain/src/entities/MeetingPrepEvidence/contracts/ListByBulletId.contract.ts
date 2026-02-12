import { $KnowledgeDomainId } from "@beep/identity/packages";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as MeetingPrepEvidence from "../MeetingPrepEvidence.model";

const $I = $KnowledgeDomainId.create("entities/MeetingPrepEvidence/contracts/ListByBulletId.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    bulletId: KnowledgeEntityIds.MeetingPrepBulletId,
    organizationId: SharedEntityIds.OrganizationId,
  },
  $I.annotations("Payload", {
    description: "Payload for the ListByBulletId MeetingPrepEvidence contract.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    data: S.Array(MeetingPrepEvidence.Model.json),
  },
  $I.annotations("Success", {
    description: "List of meeting prep evidence for a bullet.",
  })
) {}

export const Failure = S.Never;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "ListByBulletId",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "ListByBulletId MeetingPrepEvidence Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.get("ListByBulletId", "/")
    .setPayload(Payload)
    .addSuccess(Success);
}
