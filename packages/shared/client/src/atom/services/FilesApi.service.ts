import { $SharedClientId } from "@beep/identity/packages";
import * as Thunk from "@beep/utils/thunk";
import * as Effect from "effect/Effect";
import { flow, pipe } from "effect/Function";
import * as Struct from "effect/Struct";
import * as FilesRpcClient from "./FilesRpcClient.service.ts";

const $I = $SharedClientId.create("atom/services/FilesApi");

export class Service extends Effect.Service<Service>()($I`Service`, {
  dependencies: [FilesRpcClient.Service.Default],
  effect: pipe(
    Effect.Do,
    Effect.bind("rpc", pipe(FilesRpcClient.Service, Effect.map(Struct.get("rpc")), Thunk.thunkEffect)),
    Effect.map(({ rpc }) => ({
      list: flow(rpc.files_list),
      initiateUpload: flow(rpc.files_initiateUpload),
      deleteFiles: flow(rpc.files_deleteFiles),
      deleteFolders: flow(rpc.files_deleteFolders),
      createFolder: flow(rpc.files_createFolder),
      moveFiles: flow(rpc.files_moveFiles),
      getFilesByKeys: flow(rpc.files_getFilesByKeys),
    }))
  ),
}) {}

export const layer = Service.Default;

// export class FilesApi extends
