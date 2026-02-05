import * as RpcGroup from "@effect/rpc/RpcGroup";
import * as Count from "./Count";
import * as Create from "./Create";
import * as Delete from "./Delete";
import * as Get from "./Get";
import * as List from "./List";
import * as Search from "./Search";
import * as Update from "./Update";

export class Rpcs extends RpcGroup.make(
  Count.Contract,
  Create.Contract,
  Delete.Contract,
  Get.Contract,
  List.Contract,
  Search.Contract,
  Update.Contract
).prefix("entity_") {}

export { Count, Create, Delete, Get, List, Search, Update };
