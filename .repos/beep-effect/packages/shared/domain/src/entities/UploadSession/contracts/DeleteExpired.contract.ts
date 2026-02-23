import { $SharedDomainId } from "@beep/identity/packages";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as UploadSessionErrors from "../UploadSession.errors";

const $I = $SharedDomainId.create("entities/UploadSession/contracts/DeleteExpired.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {},
  $I.annotations("Payload", {
    description: "Payload for the DeleteExpired UploadSession contract. No parameters required.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    data: S.Number,
  },
  $I.annotations("Success", {
    description: "Success response for the DeleteExpired UploadSession contract. Returns count of deleted sessions.",
  })
) {}

export const Failure = UploadSessionErrors.UploadSessionRepoError;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "DeleteExpiredUploadSessions",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Delete Expired UploadSessions Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.del("DeleteExpiredUploadSessions", "/expired")
    .setPayload(Payload)
    .addError(UploadSessionErrors.UploadSessionRepoError)
    .addSuccess(Success);
}
