import * as RpcGroup from "@effect/rpc/RpcGroup";
import { Delete, DeleteByEntityIdPrefix, FindByCacheKey, FindByEntityType, FindSimilar, Get } from "./contracts";

export class Rpcs extends RpcGroup.make(
  Get.Contract.Rpc,
  Delete.Contract.Rpc,
  FindByCacheKey.Contract.Rpc,
  FindSimilar.Contract.Rpc,
  FindByEntityType.Contract.Rpc,
  DeleteByEntityIdPrefix.Contract.Rpc
) {}
