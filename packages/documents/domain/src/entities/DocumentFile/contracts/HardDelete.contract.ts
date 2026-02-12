import { $DocumentsDomainId } from "@beep/identity/packages";
import { DocumentsEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as DocumentFileErrors from "../DocumentFile.errors";

const $I = $DocumentsDomainId.create("entities/DocumentFile/contracts/HardDelete.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    id: DocumentsEntityIds.DocumentFileId,
  },
  $I.annotations("Payload", {
    description: "Payload for the HardDelete DocumentFile contract.",
  })
) {}

export class Success extends S.Void.annotations(
  $I.annotations("Success", {
    description: "Success response for the HardDelete DocumentFile contract.",
  })
) {}

export const Failure = DocumentFileErrors.DocumentFileNotFoundError;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "HardDelete",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "HardDelete DocumentFile Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.del("HardDelete", "/:id/hard")
    .setPayload(Payload)
    .addError(DocumentFileErrors.DocumentFileNotFoundError)
    .addSuccess(Success, { status: 204 });
}
