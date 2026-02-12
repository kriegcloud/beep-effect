import { $SharedDomainId } from "@beep/identity/packages";
import { SharedEntityIds } from "@beep/shared-domain/entity-ids";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as FileErrors from "../File.errors";
import { UploadKey } from "../schemas";

const $I = $SharedDomainId.create("entities/File/contracts/DeleteFiles.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    fileIds: S.Array(SharedEntityIds.FileId),
    userId: SharedEntityIds.UserId,
  },
  $I.annotations("Payload", {
    description: "Payload for the DeleteFiles contract.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    data: S.Array(UploadKey.to),
  },
  $I.annotations("Success", {
    description: "Success response for the DeleteFiles contract. Returns upload keys for S3 cleanup.",
  })
) {}

export const Failure = FileErrors.FilePermissionDeniedError;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "DeleteFiles",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Delete Files Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.del("DeleteFiles", "/bulk")
    .setPayload(Payload)
    .addError(FileErrors.FilePermissionDeniedError)
    .addSuccess(Success);
}
