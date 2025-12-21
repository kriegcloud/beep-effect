import { Files } from "@beep/shared-domain/rpc/v1/files";
import * as CreateFolder from "./create-folder.ts";
import * as DeleteFiles from "./delete-files.ts";
import * as DeleteFolders from "./delete-folders.ts";
import * as GetFilesByKeys from "./get-files-by-keys.ts";
import * as InitiateUpload from "./initiate-upload.ts";
import * as ListFiles from "./list-files.ts";
import * as MoveFiles from "./move-files.ts";

const implementation = Files.Rpcs.of({
  files_initiateUpload: InitiateUpload.Handler,
  files_list: ListFiles.Handler,
  files_moveFiles: MoveFiles.Handler,
  files_createFolder: CreateFolder.Handler,
  files_deleteFolders: DeleteFolders.Handler,
  files_deleteFiles: DeleteFiles.Handler,
  files_getFilesByKeys: GetFilesByKeys.Handler,
});

export const layer = Files.Rpcs.toLayer(implementation);
