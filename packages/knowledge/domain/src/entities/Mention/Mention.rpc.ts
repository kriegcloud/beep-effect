import * as RpcGroup from "@effect/rpc/RpcGroup";
import { Delete, FindByDocumentId, FindByEntityId, FindByIds, Get } from "./contracts";

export class Rpcs extends RpcGroup.make(
  Get.Contract.Rpc,
  FindByEntityId.Contract.Rpc,
  FindByIds.Contract.Rpc,
  FindByDocumentId.Contract.Rpc,
  Delete.Contract.Rpc
) {}
