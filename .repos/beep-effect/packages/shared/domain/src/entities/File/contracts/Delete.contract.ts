import { $SharedDomainId } from "@beep/identity/packages";
import { SharedEntityIds } from "@beep/shared-domain/entity-ids";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as FileErrors from "../File.errors";

const $I = $SharedDomainId.create("entities/File/contracts/Delete.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    id: SharedEntityIds.FileId,
  },
  $I.annotations("Payload", {
    description: "Payload for the Delete File contract.",
  })
) {}

export class Success extends S.Void.annotations(
  $I.annotations("Success", {
    description: "Success response for the Delete File contract.",
  })
) {}

export const Failure = S.Union(FileErrors.FileNotFoundError, FileErrors.FilePermissionDeniedError);
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "DeleteFile",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Delete File Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.del("DeleteFile", "/:id")
    .setPayload(Payload)
    .addError(FileErrors.FileNotFoundError)
    .addError(FileErrors.FilePermissionDeniedError)
    .addSuccess(Success, { status: 204 });
}
