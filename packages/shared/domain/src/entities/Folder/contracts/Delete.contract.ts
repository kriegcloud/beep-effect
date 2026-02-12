import { $SharedDomainId } from "@beep/identity/packages";
import { SharedEntityIds } from "@beep/shared-domain/entity-ids";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as FolderErrors from "../Folder.errors";

const $I = $SharedDomainId.create("entities/Folder/contracts/Delete.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    id: SharedEntityIds.FolderId,
  },
  $I.annotations("Payload", {
    description: "Payload for the Delete Folder contract.",
  })
) {}

export class Success extends S.Void.annotations(
  $I.annotations("Success", {
    description: "Success response for the Delete Folder contract.",
  })
) {}

export const Failure = S.Union(
  FolderErrors.FolderNotFoundError,
  FolderErrors.FolderPermissionDeniedError,
);
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "DeleteFolder",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Delete Folder Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.del("DeleteFolder", "/:id")
    .setPayload(Payload)
    .addError(FolderErrors.FolderNotFoundError)
    .addError(FolderErrors.FolderPermissionDeniedError)
    .addSuccess(Success, { status: 204 });
}
