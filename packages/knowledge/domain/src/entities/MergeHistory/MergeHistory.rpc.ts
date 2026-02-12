import * as RpcGroup from "@effect/rpc/RpcGroup";
import {
  Delete,
  FindByOrganization,
  FindBySourceEntity,
  FindByTargetEntity,
  FindByUser,
  Get,
} from "./contracts";

export class Rpcs extends RpcGroup.make(
  Get.Contract.Rpc,
  Delete.Contract.Rpc,
  FindByTargetEntity.Contract.Rpc,
  FindBySourceEntity.Contract.Rpc,
  FindByUser.Contract.Rpc,
  FindByOrganization.Contract.Rpc
) {}
