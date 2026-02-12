import * as AiToolkit from "@effect/ai/Toolkit";
import {
  CountByOrganization,
  Delete,
  FindByEntityIds,
  FindByPredicate,
  FindBySourceIds,
  FindByTargetIds,
  Get,
} from "./contracts";

export const Toolkit = AiToolkit.make(
  Get.Contract.Tool,
  Delete.Contract.Tool,
  FindBySourceIds.Contract.Tool,
  FindByTargetIds.Contract.Tool,
  FindByEntityIds.Contract.Tool,
  FindByPredicate.Contract.Tool,
  CountByOrganization.Contract.Tool
);
