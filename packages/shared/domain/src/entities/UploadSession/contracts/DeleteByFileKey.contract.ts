import { $SharedDomainId } from "@beep/identity/packages";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as File from "../../file";
import * as UploadSessionErrors from "../UploadSession.errors";

const $I = $SharedDomainId.create("entities/UploadSession/contracts/DeleteByFileKey.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    fileKey: File.UploadKey.to,
  },
  $I.annotations("Payload", {
    description: "Payload for the DeleteByFileKey UploadSession contract.",
  })
) {}

export class Success extends S.Void.annotations(
  $I.annotations("Success", {
    description: "Success response for the DeleteByFileKey UploadSession contract.",
  })
) {}

export const Failure = UploadSessionErrors.UploadSessionRepoError;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "DeleteUploadSessionByFileKey",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Delete UploadSession By File Key Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.del("DeleteUploadSessionByFileKey", "/by-file-key")
    .setPayload(Payload)
    .addError(UploadSessionErrors.UploadSessionRepoError)
    .addSuccess(Success, { status: 204 });
}
