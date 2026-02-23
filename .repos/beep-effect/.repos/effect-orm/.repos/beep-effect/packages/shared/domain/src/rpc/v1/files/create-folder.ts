import { $SharedDomainId } from "@beep/identity/packages";
import { Folder } from "@beep/shared-domain/entities";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";

const $I = $SharedDomainId.create("rpc/files/create-folder");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    folderName: S.String,
  },
  $I.annotations("CreateFolderPayload", {
    description: "Payload for create folder rpc",
  })
) {}

export class Success extends Folder.Model.annotations(
  $I.annotations("CreateFolderSuccess", {
    description: "Success result for the CreateFolder rpc endpoint",
  })
) {}

export const Contract = Rpc.make("createFolder", {
  payload: Payload,
  success: Success,
});
