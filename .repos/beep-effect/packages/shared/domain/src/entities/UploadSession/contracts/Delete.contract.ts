import { $SharedDomainId } from "@beep/identity/packages";
import { SharedEntityIds } from "@beep/shared-domain/entity-ids";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as UploadSessionErrors from "../UploadSession.errors";

const $I = $SharedDomainId.create("entities/UploadSession/contracts/Delete.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    id: SharedEntityIds.UploadSessionId,
  },
  $I.annotations("Payload", {
    description: "Payload for the Delete UploadSession contract.",
  })
) {}

export class Success extends S.Void.annotations(
  $I.annotations("Success", {
    description: "Success response for the Delete UploadSession contract.",
  })
) {}

export const Failure = S.Union(
  UploadSessionErrors.UploadSessionNotFoundError,
  UploadSessionErrors.UploadSessionPermissionDeniedError
);
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "DeleteUploadSession",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Delete UploadSession Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.del("DeleteUploadSession", "/:id")
    .setPayload(Payload)
    .addError(UploadSessionErrors.UploadSessionNotFoundError)
    .addError(UploadSessionErrors.UploadSessionPermissionDeniedError)
    .addSuccess(Success, { status: 204 });
}
