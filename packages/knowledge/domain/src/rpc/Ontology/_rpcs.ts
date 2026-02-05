import * as RpcGroup from "@effect/rpc/RpcGroup";
import * as Create from "./Create.ts";
import * as Delete from "./Delete.ts";
import * as Get from "./Get.ts";
import * as GetClasses from "./GetClasses.ts";
import * as GetProperties from "./GetProperties.ts";
import * as List from "./List.ts";
import * as Update from "./Update.ts";

export class Rpcs extends RpcGroup.make(
  Get.Contract,
  List.Contract,
  Create.Contract,
  Update.Contract,
  Delete.Contract,
  GetClasses.Contract,
  GetProperties.Contract
).prefix("ontology_") {}

export { RpcGroup, Create, Delete, Get, GetClasses, GetProperties, List, Update };
