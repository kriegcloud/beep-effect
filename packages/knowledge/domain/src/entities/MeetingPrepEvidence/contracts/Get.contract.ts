import { $KnowledgeDomainId } from "@beep/identity/packages";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as MeetingPrepEvidenceErrors from "../MeetingPrepEvidence.errors";
import * as MeetingPrepEvidence from "../MeetingPrepEvidence.model";

const $I = $KnowledgeDomainId.create("entities/MeetingPrepEvidence/contracts/Get.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    id: KnowledgeEntityIds.MeetingPrepEvidenceId,
  },
  $I.annotations("Payload", {
    description: "Payload for the Get MeetingPrepEvidence Contract.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    data: MeetingPrepEvidence.Model.json,
  },
  $I.annotations("Success", {
    description: "Success response for the Get MeetingPrepEvidence Contract.",
  })
) {}

export const Failure = MeetingPrepEvidenceErrors.MeetingPrepEvidenceNotFoundError;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "Get",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Get MeetingPrepEvidence Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.get("Get", "/:id")
    .setPayload(Payload)
    .addError(MeetingPrepEvidenceErrors.MeetingPrepEvidenceNotFoundError)
    .addSuccess(Success);
}
