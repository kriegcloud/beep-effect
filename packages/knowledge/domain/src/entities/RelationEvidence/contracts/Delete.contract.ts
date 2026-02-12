import { $KnowledgeDomainId } from "@beep/identity/packages";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as RelationEvidenceErrors from "../RelationEvidence.errors";

const $I = $KnowledgeDomainId.create("entities/RelationEvidence/contracts/Delete.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    id: KnowledgeEntityIds.RelationEvidenceId,
  },
  $I.annotations("Payload", {
    description: "Payload for the Delete RelationEvidence contract.",
  })
) {}

export class Success extends S.Void.annotations(
  $I.annotations("Success", {
    description: "Success response for the Delete RelationEvidence contract.",
  })
) {}

export const Failure = S.Union(
  RelationEvidenceErrors.RelationEvidenceNotFoundError,
  RelationEvidenceErrors.RelationEvidencePermissionDeniedError,
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
    description: "Delete RelationEvidence Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.del("Delete", "/:id")
    .setPayload(Payload)
    .addError(RelationEvidenceErrors.RelationEvidenceNotFoundError)
    .addError(RelationEvidenceErrors.RelationEvidencePermissionDeniedError)
    .addSuccess(Success, { status: 204 });
}
