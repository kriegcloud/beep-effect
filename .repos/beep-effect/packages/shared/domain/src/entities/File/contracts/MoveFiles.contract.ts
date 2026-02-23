import { $SharedDomainId } from "@beep/identity/packages";
import { SharedEntityIds } from "@beep/shared-domain/entity-ids";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as FileErrors from "../File.errors";

const $I = $SharedDomainId.create("entities/File/contracts/MoveFiles.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    fileIds: S.Array(SharedEntityIds.FileId),
    folderId: S.NullOr(SharedEntityIds.FolderId),
    userId: SharedEntityIds.UserId,
  },
  $I.annotations("Payload", {
    description: "Payload for the MoveFiles contract.",
  })
) {}

export class Success extends S.Void.annotations(
  $I.annotations("Success", {
    description: "Success response for the MoveFiles contract.",
  })
) {}

export const Failure = FileErrors.FilePermissionDeniedError;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "MoveFiles",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Move Files Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.patch("MoveFiles", "/move")
    .setPayload(Payload)
    .addError(FileErrors.FilePermissionDeniedError)
    .addSuccess(Success);
}
