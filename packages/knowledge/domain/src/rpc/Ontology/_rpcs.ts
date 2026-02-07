import * as RpcGroup from "@effect/rpc/RpcGroup";
import * as Create from "./Create";
import * as Delete from "./Delete";
import * as Get from "./Get";
import * as GetClasses from "./GetClasses";
import * as GetProperties from "./GetProperties";
import * as List from "./List";
import * as Update from "./Update";

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
