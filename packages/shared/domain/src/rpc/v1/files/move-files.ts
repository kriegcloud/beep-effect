import { $SharedDomainId } from "@beep/identity/packages";
import { SharedEntityIds } from "@beep/shared-domain/entity-ids";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";

const $I = $SharedDomainId.create("rpc/files/move-files");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    fileIds: S.Array(SharedEntityIds.FileId),
    folderId: S.NullOr(SharedEntityIds.FolderId),
  },
  $I.annotations("MoveFilesPayload", {
    description: "Request payload for moving files to a target folder",
  })
) {}

export const Contract = Rpc.make("moveFiles", {
  payload: Payload,
  success: S.Void,
});
