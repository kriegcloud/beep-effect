import { $CommsDomainId } from "@beep/identity/packages";
import { CommsEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as EmailTemplateErrors from "../EmailTemplate.errors";

const $I = $CommsDomainId.create("entities/EmailTemplate/contracts/Delete.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  { id: CommsEntityIds.EmailTemplateId },
  $I.annotations("Payload", { description: "Payload for the Delete EmailTemplate contract." })
) {}

export class Success extends S.Void.annotations(
  $I.annotations("Success", { description: "Success response for the Delete EmailTemplate contract." })
) {}

export const Failure = S.Union(
  EmailTemplateErrors.EmailTemplateNotFoundError,
  EmailTemplateErrors.EmailTemplatePermissionDeniedError,
);
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "Delete",
  { payload: Payload.fields, success: Success, failure: Failure },
  $I.annotationsHttp("Contract", { description: "Delete EmailTemplate Request Contract." })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.del("Delete", "/:id")
    .setPayload(Payload)
    .addError(EmailTemplateErrors.EmailTemplateNotFoundError)
    .addError(EmailTemplateErrors.EmailTemplatePermissionDeniedError)
    .addSuccess(Success, { status: 204 });
}
