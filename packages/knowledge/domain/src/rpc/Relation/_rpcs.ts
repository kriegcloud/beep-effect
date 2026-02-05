import * as RpcGroup from "@effect/rpc/RpcGroup";
import * as Count from "./Count";
import * as Create from "./Create";
import * as Delete from "./Delete";
import * as Get from "./Get";
import * as ListByEntity from "./ListByEntity";
import * as ListByPredicate from "./ListByPredicate";

export class Rpcs extends RpcGroup.make(
  Count.Contract,
  Create.Contract,
  Delete.Contract,
  Get.Contract,
  ListByEntity.Contract,
  ListByPredicate.Contract
).prefix("relation_") {}

export { Count, Create, Delete, Get, ListByEntity, ListByPredicate };
