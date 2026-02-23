import * as RpcGroup from "@effect/rpc/RpcGroup";
import { Delete, DeleteFiles, Get, GetFilesByKeys, ListPaginated, MoveFiles } from "./contracts";

export class Rpcs extends RpcGroup.make(
  Get.Contract.Rpc,
  Delete.Contract.Rpc,
  ListPaginated.Contract.Rpc,
  MoveFiles.Contract.Rpc,
  DeleteFiles.Contract.Rpc,
  GetFilesByKeys.Contract.Rpc
) {}
