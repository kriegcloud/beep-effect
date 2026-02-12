import * as RpcGroup from "@effect/rpc/RpcGroup";
import { Delete, FindByMappingKey, Get } from "./contracts";

export class Rpcs extends RpcGroup.make(
  Get.Contract.Rpc,
  Delete.Contract.Rpc,
  FindByMappingKey.Contract.Rpc
) {}
