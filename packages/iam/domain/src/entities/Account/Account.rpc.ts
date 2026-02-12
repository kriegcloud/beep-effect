import * as RpcGroup from "@effect/rpc/RpcGroup";
import { Delete, Get } from "./contracts";

export class Rpcs extends RpcGroup.make(Get.Contract.Rpc, Delete.Contract.Rpc) {}
