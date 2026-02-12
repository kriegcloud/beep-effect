import * as RpcGroup from "@effect/rpc/RpcGroup";
import {
  CountMembers,
  Delete,
  DeleteByCanonical,
  FindByCanonical,
  FindByMember,
  FindBySource,
  FindHighConfidence,
  Get,
  ResolveCanonical,
} from "./contracts";

export class Rpcs extends RpcGroup.make(
  Get.Contract.Rpc,
  Delete.Contract.Rpc,
  FindByCanonical.Contract.Rpc,
  FindByMember.Contract.Rpc,
  ResolveCanonical.Contract.Rpc,
  FindHighConfidence.Contract.Rpc,
  FindBySource.Contract.Rpc,
  DeleteByCanonical.Contract.Rpc,
  CountMembers.Contract.Rpc
) {}
