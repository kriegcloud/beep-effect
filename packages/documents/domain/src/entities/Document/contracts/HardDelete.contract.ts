import { $DocumentsDomainId } from "@beep/identity/packages";
import { DocumentsEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as DocumentErrors from "../Document.errors";

const $I = $DocumentsDomainId.create("entities/Document/contracts/HardDelete.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    id: DocumentsEntityIds.DocumentId,
  },
  $I.annotations("Payload", {
    description: "Payload for the HardDelete Document Contract.",
  })
) {}

export class Success extends S.Void.annotations(
  $I.annotations("Success", {
    description: "Success response for the HardDelete Document Contract.",
  })
) {}

export const Failure = DocumentErrors.DocumentNotFoundError;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "HardDelete",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "HardDelete Document Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.del("HardDelete", "/:id")
    .setPayload(Payload)
    .addError(DocumentErrors.DocumentNotFoundError)
    .addSuccess(Success, { status: 204 });
}
