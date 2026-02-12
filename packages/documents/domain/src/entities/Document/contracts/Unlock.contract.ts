import { $DocumentsDomainId } from "@beep/identity/packages";
import { DocumentsEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as DocumentErrors from "../Document.errors";
import * as Document from "../Document.model";

const $I = $DocumentsDomainId.create("entities/Document/contracts/Unlock.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    id: DocumentsEntityIds.DocumentId,
  },
  $I.annotations("Payload", {
    description: "Payload for the Unlock Document Contract.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    data: Document.Model.json,
  },
  $I.annotations("Success", {
    description: "Success response for the Unlock Document Contract.",
  })
) {}

export const Failure = DocumentErrors.DocumentNotFoundError;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "Unlock",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Unlock Document Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.patch("Unlock", "/:id/unlock")
    .setPayload(Payload)
    .addError(DocumentErrors.DocumentNotFoundError)
    .addSuccess(Success);
}
