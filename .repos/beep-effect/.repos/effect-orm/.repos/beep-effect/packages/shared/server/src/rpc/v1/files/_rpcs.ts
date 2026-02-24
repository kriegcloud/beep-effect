import { Policy } from "@beep/shared-domain";
import { Files } from "@beep/shared-domain/rpc/v1/files";
import * as CreateFolder from "./create-folder";
import * as DeleteFiles from "./delete-files";
import * as DeleteFolders from "./delete-folders";
import * as GetFilesByKeys from "./get-files-by-keys";
import * as InitiateUpload from "./initiate-upload";
import * as ListFiles from "./list-files";
import * as MoveFiles from "./move-files";

// Attach middleware to inform toLayer that AuthContext will be provided by middleware
const FilesRpcsWithMiddleware = Files.Rpcs.middleware(Policy.AuthContextRpcMiddleware);

const implementation = FilesRpcsWithMiddleware.of({
  files_initiateUpload: InitiateUpload.Handler,
  files_list: ListFiles.Handler,
  files_moveFiles: MoveFiles.Handler,
  files_createFolder: CreateFolder.Handler,
  files_deleteFolders: DeleteFolders.Handler,
  files_deleteFiles: DeleteFiles.Handler,
  files_getFilesByKeys: GetFilesByKeys.Handler,
});

export const layer = FilesRpcsWithMiddleware.toLayer(implementation);
