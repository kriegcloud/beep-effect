import { $SharedDomainId } from "@beep/identity/packages";
import { SharedEntityIds } from "@beep/shared-domain/entity-ids";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";

const $I = $SharedDomainId.create("rpc/files/delete-files");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    fileIds: S.Array(SharedEntityIds.FileId),
  },
  $I.annotations("DeleteFilesPayload", {
    description: "Payload for delete files rpc",
  })
) {}

export const Contract = Rpc.make("deleteFiles", {
  payload: Payload,
  success: S.Void,
});
