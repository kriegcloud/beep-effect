import { $SharedDomainId } from "@beep/identity/packages";
import { File, Folder } from "@beep/shared-domain/entities";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";

const $I = $SharedDomainId.create("rpc/files/list-files");

export class Success extends S.Class<Success>($I`Success`)(
  {
    rootFiles: S.Array(File.Model),
    folders: S.Array(Folder.WithUploadedFiles),
  },
  $I.annotations("ListFilesSuccess", {
    description: "List of files and folders",
  })
) {}

export const Contract = Rpc.make("list", {
  success: Success,
  stream: true,
});
