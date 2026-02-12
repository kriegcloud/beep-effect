import * as RpcGroup from "@effect/rpc/RpcGroup";
import { Create, Delete, Get, GetClasses, GetProperties, List, Update } from "./contracts";

export class Rpcs extends RpcGroup.make(
  Create.Contract.Rpc,
  Delete.Contract.Rpc,
  Get.Contract.Rpc,
  GetClasses.Contract.Rpc,
  GetProperties.Contract.Rpc,
  List.Contract.Rpc,
  Update.Contract.Rpc
).prefix("ontology_") {}

export { Create, Delete, Get, GetClasses, GetProperties, List, Update };
