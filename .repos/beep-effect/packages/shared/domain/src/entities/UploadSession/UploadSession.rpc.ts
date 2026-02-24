import * as RpcGroup from "@effect/rpc/RpcGroup";
import { Delete, DeleteByFileKey, DeleteExpired, FindByFileKey, Get, IsValid, Store } from "./contracts";

export class Rpcs extends RpcGroup.make(
  Get.Contract.Rpc,
  Delete.Contract.Rpc,
  Store.Contract.Rpc,
  FindByFileKey.Contract.Rpc,
  DeleteByFileKey.Contract.Rpc,
  DeleteExpired.Contract.Rpc,
  IsValid.Contract.Rpc
) {}
