import { $CommsDomainId } from "@beep/identity/packages";
import { CommsEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as EmailTemplateErrors from "../EmailTemplate.errors";
import * as EmailTemplate from "../EmailTemplate.model";

const $I = $CommsDomainId.create("entities/EmailTemplate/contracts/Get.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  { id: CommsEntityIds.EmailTemplateId },
  $I.annotations("Payload", { description: "Payload for the Get EmailTemplate Contract." })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  { data: EmailTemplate.Model.json },
  $I.annotations("Success", { description: "Success response for the Get EmailTemplate Contract." })
) {}

export const Failure = EmailTemplateErrors.EmailTemplateNotFoundError;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "Get",
  { payload: Payload.fields, success: Success, failure: Failure },
  $I.annotationsHttp("Contract", { description: "Get EmailTemplate Request Contract." })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.get("Get", "/:id")
    .setPayload(Payload)
    .addError(EmailTemplateErrors.EmailTemplateNotFoundError)
    .addSuccess(Success);
}
