import { $SharedDomainId } from "@beep/identity/packages";
import { SharedEntityIds } from "@beep/shared-domain/entity-ids";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as UploadSessionErrors from "../UploadSession.errors";
import * as UploadSession from "../UploadSession.model";

const $I = $SharedDomainId.create("entities/UploadSession/contracts/Get.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    id: SharedEntityIds.UploadSessionId,
  },
  $I.annotations("Payload", {
    description: "Payload for the Get UploadSession Contract.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    data: UploadSession.Model.json,
  },
  $I.annotations("Success", {
    description: "Success response for the Get UploadSession Contract.",
  })
) {}

export const Failure = UploadSessionErrors.UploadSessionNotFoundError;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "GetUploadSession",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Get UploadSession Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.get("GetUploadSession", "/:id")
    .setPayload(Payload)
    .addError(UploadSessionErrors.UploadSessionNotFoundError)
    .addSuccess(Success);
}
