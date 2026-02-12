import { $SharedDomainId } from "@beep/identity/packages";
import { SharedEntityIds } from "@beep/shared-domain/entity-ids";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as FileErrors from "../File.errors";
import * as File from "../File.model";

const $I = $SharedDomainId.create("entities/File/contracts/Get.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    id: SharedEntityIds.FileId,
  },
  $I.annotations("Payload", {
    description: "Payload for the Get File Contract.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    data: File.Model.json,
  },
  $I.annotations("Success", {
    description: "Success response for the Get File Contract.",
  })
) {}

export const Failure = FileErrors.FileNotFoundError;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "GetFile",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Get File Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.get("GetFile", "/:id")
    .setPayload(Payload)
    .addError(FileErrors.FileNotFoundError)
    .addSuccess(Success);
}
