import { $DocumentsDomainId } from "@beep/identity/packages";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as DocumentErrors from "../Document.errors";
import * as Document from "../Document.model";

const $I = $DocumentsDomainId.create("entities/Document/contracts/Update.contract");

export class Payload extends Document.Model.update {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    data: Document.Model.json,
  },
  $I.annotations("Success", {
    description: "Success response for the Update Document Contract.",
  })
) {}

export const Failure = DocumentErrors.DocumentNotFoundError;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "Update",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Update Document Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.patch("Update", "/:id")
    .setPayload(Payload)
    .addError(DocumentErrors.DocumentNotFoundError)
    .addSuccess(Success);
}
