import { $KnowledgeDomainId } from "@beep/identity/packages";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as MentionRecordErrors from "../MentionRecord.errors";

const $I = $KnowledgeDomainId.create("entities/MentionRecord/contracts/UpdateResolvedEntityId.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    id: KnowledgeEntityIds.MentionRecordId,
    entityId: KnowledgeEntityIds.KnowledgeEntityId,
  },
  $I.annotations("Payload", {
    description: "Payload for the UpdateResolvedEntityId MentionRecord contract.",
  })
) {}

export class Success extends S.Void.annotations(
  $I.annotations("Success", {
    description: "Success response for the UpdateResolvedEntityId MentionRecord contract.",
  })
) {}

export const Failure = MentionRecordErrors.MentionRecordNotFoundError;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "UpdateResolvedEntityId",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Update resolved entity ID on a MentionRecord Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.patch("UpdateResolvedEntityId", "/:id/resolved-entity")
    .setPayload(Payload)
    .addError(MentionRecordErrors.MentionRecordNotFoundError)
    .addSuccess(Success);
}
