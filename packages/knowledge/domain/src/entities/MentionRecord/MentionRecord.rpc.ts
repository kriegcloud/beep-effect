import * as RpcGroup from "@effect/rpc/RpcGroup";
import {
  Delete,
  FindByExtractionId,
  FindByResolvedEntityId,
  FindUnresolved,
  Get,
  UpdateResolvedEntityId,
} from "./contracts";

export class Rpcs extends RpcGroup.make(
  Get.Contract.Rpc,
  Delete.Contract.Rpc,
  FindByExtractionId.Contract.Rpc,
  FindByResolvedEntityId.Contract.Rpc,
  FindUnresolved.Contract.Rpc,
  UpdateResolvedEntityId.Contract.Rpc
) {}
