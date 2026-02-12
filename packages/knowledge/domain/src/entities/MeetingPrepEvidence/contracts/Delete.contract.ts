import { $KnowledgeDomainId } from "@beep/identity/packages";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as MeetingPrepEvidenceErrors from "../MeetingPrepEvidence.errors";

const $I = $KnowledgeDomainId.create("entities/MeetingPrepEvidence/contracts/Delete.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    id: KnowledgeEntityIds.MeetingPrepEvidenceId,
  },
  $I.annotations("Payload", {
    description: "Payload for the Delete MeetingPrepEvidence contract.",
  })
) {}

export class Success extends S.Void.annotations(
  $I.annotations("Success", {
    description: "Success response for the Delete MeetingPrepEvidence contract.",
  })
) {}

export const Failure = S.Union(
  MeetingPrepEvidenceErrors.MeetingPrepEvidenceNotFoundError,
  MeetingPrepEvidenceErrors.MeetingPrepEvidencePermissionDeniedError,
);
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "Delete",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Delete MeetingPrepEvidence Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.del("Delete", "/:id")
    .setPayload(Payload)
    .addError(MeetingPrepEvidenceErrors.MeetingPrepEvidenceNotFoundError)
    .addError(MeetingPrepEvidenceErrors.MeetingPrepEvidencePermissionDeniedError)
    .addSuccess(Success, { status: 204 });
}
