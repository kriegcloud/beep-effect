import * as RpcGroup from "@effect/rpc/RpcGroup";
import { Create, Delete, Get, HardDelete, ListByDocument, ListByUser } from "./contracts";

export class Rpcs extends RpcGroup.make(
  Get.Contract.Rpc,
  ListByDocument.Contract.Rpc,
  ListByUser.Contract.Rpc,
  Create.Contract.Rpc,
  Delete.Contract.Rpc,
  HardDelete.Contract.Rpc
) {}
