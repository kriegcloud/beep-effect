import * as RpcGroup from "@effect/rpc/RpcGroup";
import { Delete, Get, ListByBulletId } from "./contracts";

export class Rpcs extends RpcGroup.make(
  Get.Contract.Rpc,
  ListByBulletId.Contract.Rpc,
  Delete.Contract.Rpc
) {}
