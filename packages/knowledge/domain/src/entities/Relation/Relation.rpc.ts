import * as RpcGroup from "@effect/rpc/RpcGroup";
import {
  CountByOrganization,
  Delete,
  FindByEntityIds,
  FindByPredicate,
  FindBySourceIds,
  FindByTargetIds,
  Get,
} from "./contracts";

export class Rpcs extends RpcGroup.make(
  Get.Contract.Rpc,
  Delete.Contract.Rpc,
  FindBySourceIds.Contract.Rpc,
  FindByTargetIds.Contract.Rpc,
  FindByEntityIds.Contract.Rpc,
  FindByPredicate.Contract.Rpc,
  CountByOrganization.Contract.Rpc
) {}
