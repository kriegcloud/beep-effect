import { $SharedDomainId } from "@beep/identity/packages";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as File from "../../File";
import * as UploadSessionErrors from "../UploadSession.errors";
import * as UploadSession from "../UploadSession.model";

const $I = $SharedDomainId.create("entities/UploadSession/contracts/FindByFileKey.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    fileKey: File.UploadKey.to,
  },
  $I.annotations("Payload", {
    description: "Payload for the FindByFileKey UploadSession contract.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    data: S.OptionFromNullOr(UploadSession.Model.json),
  },
  $I.annotations("Success", {
    description: "Success response for the FindByFileKey UploadSession contract. Data is null when not found.",
  })
) {}

export const Failure = UploadSessionErrors.UploadSessionRepoError;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "FindUploadSessionByFileKey",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Find UploadSession By File Key Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.post("FindUploadSessionByFileKey", "/by-file-key")
    .setPayload(Payload)
    .addError(UploadSessionErrors.UploadSessionRepoError)
    .addSuccess(Success);
}
