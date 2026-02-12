import { $KnowledgeDomainId } from "@beep/identity/packages";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as RelationEvidenceErrors from "../RelationEvidence.errors";
import * as RelationEvidence from "../RelationEvidence.model";

const $I = $KnowledgeDomainId.create("entities/RelationEvidence/contracts/Get.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    id: KnowledgeEntityIds.RelationEvidenceId,
  },
  $I.annotations("Payload", {
    description: "Payload for the Get RelationEvidence Contract.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    data: RelationEvidence.Model.json,
  },
  $I.annotations("Success", {
    description: "Success response for the Get RelationEvidence Contract.",
  })
) {}

export const Failure = RelationEvidenceErrors.RelationEvidenceNotFoundError;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "Get",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Get RelationEvidence Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.get("Get", "/:id")
    .setPayload(Payload)
    .addError(RelationEvidenceErrors.RelationEvidenceNotFoundError)
    .addSuccess(Success);
}
