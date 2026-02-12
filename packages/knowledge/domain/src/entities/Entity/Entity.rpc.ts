import * as RpcGroup from "@effect/rpc/RpcGroup";
import {
  CountByOrganization,
  Delete,
  FindByIds,
  FindByNormalizedText,
  FindByOntology,
  FindByType,
  Get,
} from "./contracts";

export class Rpcs extends RpcGroup.make(
  Get.Contract.Rpc,
  Delete.Contract.Rpc,
  FindByIds.Contract.Rpc,
  FindByOntology.Contract.Rpc,
  FindByType.Contract.Rpc,
  CountByOrganization.Contract.Rpc,
  FindByNormalizedText.Contract.Rpc
) {}
