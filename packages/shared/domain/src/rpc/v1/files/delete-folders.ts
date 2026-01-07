import { $SharedDomainId } from "@beep/identity/packages";
import { SharedEntityIds } from "@beep/shared-domain/entity-ids";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";

const $I = $SharedDomainId.create("rpc/files/delete-folders");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    folderIds: S.Array(SharedEntityIds.FolderId),
  },
  $I.annotations("DeleteFoldersPayload", {
    description: "Request payload for deleting multiple folders",
  })
) {}

export const Contract = Rpc.make("deleteFolders", {
  payload: Payload,
  success: S.Void,
});
