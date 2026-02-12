import { $SharedDomainId } from "@beep/identity/packages";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as File from "../../File";
import * as UploadSessionErrors from "../UploadSession.errors";

const $I = $SharedDomainId.create("entities/UploadSession/contracts/IsValid.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    fileKey: File.UploadKey.to,
  },
  $I.annotations("Payload", {
    description: "Payload for the IsValid UploadSession contract.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    data: S.Boolean,
  },
  $I.annotations("Success", {
    description:
      "Success response for the IsValid UploadSession contract. Returns whether the session exists and is not expired.",
  })
) {}

export const Failure = UploadSessionErrors.UploadSessionRepoError;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "IsUploadSessionValid",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Is UploadSession Valid Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.post("IsUploadSessionValid", "/validate")
    .setPayload(Payload)
    .addError(UploadSessionErrors.UploadSessionRepoError)
    .addSuccess(Success);
}
