import * as RpcGroup from "@effect/rpc/RpcGroup";
import { Delete, FindByIds, FindByRelationId, Get, SearchByText } from "./contracts";

export class Rpcs extends RpcGroup.make(
  Get.Contract.Rpc,
  FindByRelationId.Contract.Rpc,
  FindByIds.Contract.Rpc,
  SearchByText.Contract.Rpc,
  Delete.Contract.Rpc
) {}
