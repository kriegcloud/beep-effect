import * as RpcGroup from "@effect/rpc/RpcGroup";
import { Count, Create, Delete, Get, List, Search, Update } from "./contracts";

export class Rpcs extends RpcGroup.make(
  Count.Contract.Rpc,
  Create.Contract.Rpc,
  Delete.Contract.Rpc,
  Get.Contract.Rpc,
  List.Contract.Rpc,
  Search.Contract.Rpc,
  Update.Contract.Rpc
).prefix("entity_") {}

export { Count, Create, Delete, Get, List, Search, Update };
