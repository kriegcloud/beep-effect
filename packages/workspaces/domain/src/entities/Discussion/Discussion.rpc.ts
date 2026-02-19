import * as RpcGroup from "@effect/rpc/RpcGroup";
import { Create, CreateWithComment, Delete, Get, ListByDocument, Resolve, Unresolve } from "./contracts";

export class Rpcs extends RpcGroup.make(
  Get.Contract.Rpc,
  ListByDocument.Contract.Rpc,
  Create.Contract.Rpc,
  CreateWithComment.Contract.Rpc,
  Resolve.Contract.Rpc,
  Unresolve.Contract.Rpc,
  Delete.Contract.Rpc
) {}
