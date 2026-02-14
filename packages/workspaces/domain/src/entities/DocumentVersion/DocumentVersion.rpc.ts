import * as RpcGroup from "@effect/rpc/RpcGroup";
import { CreateSnapshot, Get, GetContent, HardDelete, ListByDocument } from "./contracts";

export class Rpcs extends RpcGroup.make(
  Get.Contract.Rpc,
  GetContent.Contract.Rpc,
  ListByDocument.Contract.Rpc,
  CreateSnapshot.Contract.Rpc,
  HardDelete.Contract.Rpc
).prefix("DocumentVersion_") {}
