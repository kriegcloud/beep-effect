import * as RpcGroup from "@effect/rpc/RpcGroup";
import { Delete, Get, ListByMeetingPrepId } from "./contracts";

export class Rpcs extends RpcGroup.make(Get.Contract.Rpc, ListByMeetingPrepId.Contract.Rpc, Delete.Contract.Rpc) {}
