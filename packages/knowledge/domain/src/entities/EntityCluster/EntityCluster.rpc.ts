import * as RpcGroup from "@effect/rpc/RpcGroup";
import {
  Delete,
  DeleteByOntology,
  FindByCanonicalEntity,
  FindByMember,
  FindByOntology,
  FindHighCohesion,
  Get,
} from "./contracts";

export class Rpcs extends RpcGroup.make(
  Get.Contract.Rpc,
  Delete.Contract.Rpc,
  FindByCanonicalEntity.Contract.Rpc,
  FindByMember.Contract.Rpc,
  FindByOntology.Contract.Rpc,
  FindHighCohesion.Contract.Rpc,
  DeleteByOntology.Contract.Rpc
) {}
