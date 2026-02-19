import { $SharedDomainId } from "@beep/identity/packages";
import { SharedEntityIds } from "@beep/shared-domain/entity-ids";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as FolderErrors from "../Folder.errors";

const $I = $SharedDomainId.create("entities/Folder/contracts/DeleteFolders.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    folderIds: S.Array(SharedEntityIds.FolderId),
  },
  $I.annotations("Payload", {
    description: "Payload for the DeleteFolders contract.",
  })
) {}

export class Success extends S.Void.annotations(
  $I.annotations("Success", {
    description: "Success response for the DeleteFolders contract.",
  })
) {}

export const Failure = FolderErrors.FolderPermissionDeniedError;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "DeleteFolders",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Delete Folders Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.del("DeleteFolders", "/bulk")
    .setPayload(Payload)
    .addError(FolderErrors.FolderPermissionDeniedError)
    .addSuccess(Success, { status: 204 });
}
