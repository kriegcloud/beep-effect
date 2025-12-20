import * as RpcGroup from "@effect/rpc/RpcGroup";
import * as CreateFolder from "./create-folder.ts";
import * as DeleteFiles from "./delete-files.ts";
import * as DeleteFolders from "./delete-folders.ts";
import * as GetFilesByKeys from "./get-files-by-keys.ts";
import * as InitiateUpload from "./initiate-upload.ts";
import * as ListFiles from "./list-files.ts";
import * as MoveFiles from "./move-files.ts";

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
