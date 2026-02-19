import * as RpcGroup from "@effect/rpc/RpcGroup";
import * as CreateFolder from "./create-folder";
import * as DeleteFiles from "./delete-files";
import * as DeleteFolders from "./delete-folders";
import * as GetFilesByKeys from "./get-files-by-keys";
import * as InitiateUpload from "./initiate-upload";
import * as ListFiles from "./list-files";
import * as MoveFiles from "./move-files";

export class Rpcs extends RpcGroup.make(
  CreateFolder.Contract,
  DeleteFiles.Contract,
  DeleteFolders.Contract,
  GetFilesByKeys.Contract,
  MoveFiles.Contract,
  InitiateUpload.Contract,
  ListFiles.Contract
).prefix("files_") {}

export { ListFiles, CreateFolder, DeleteFiles, DeleteFolders, GetFilesByKeys, MoveFiles, InitiateUpload };
