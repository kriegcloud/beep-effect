import * as RpcGroup from "@effect/rpc/RpcGroup";
import { Delete, DeleteFolders, Get } from "./contracts";

export class Rpcs extends RpcGroup.make(
  Get.Contract.Rpc,
  Delete.Contract.Rpc,
  DeleteFolders.Contract.Rpc
) {}
