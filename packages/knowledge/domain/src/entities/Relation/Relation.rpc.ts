import * as RpcGroup from "@effect/rpc/RpcGroup";
import { Count, Create, Delete, Get, ListByEntity, ListByPredicate } from "./contracts";

export class Rpcs extends RpcGroup.make(
  Count.Contract.Rpc,
  Create.Contract.Rpc,
  Delete.Contract.Rpc,
  Get.Contract.Rpc,
  ListByEntity.Contract.Rpc,
  ListByPredicate.Contract.Rpc
).prefix("relation_") {}

export { Count, Create, Delete, Get, ListByEntity, ListByPredicate };
