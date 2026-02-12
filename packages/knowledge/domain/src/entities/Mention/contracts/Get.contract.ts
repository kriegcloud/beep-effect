import { $KnowledgeDomainId } from "@beep/identity/packages";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as MentionErrors from "../Mention.errors";
import * as Mention from "../Mention.model";

const $I = $KnowledgeDomainId.create("entities/Mention/contracts/Get.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    id: KnowledgeEntityIds.MentionId,
  },
  $I.annotations("Payload", {
    description: "Payload for the Get Mention Contract.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    data: Mention.Model.json,
  },
  $I.annotations("Success", {
    description: "Success response for the Get Mention Contract.",
  })
) {}

export const Failure = MentionErrors.MentionNotFoundError;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "Get",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Get Mention Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.get("Get", "/:id")
    .setPayload(Payload)
    .addError(MentionErrors.MentionNotFoundError)
    .addSuccess(Success);
}
