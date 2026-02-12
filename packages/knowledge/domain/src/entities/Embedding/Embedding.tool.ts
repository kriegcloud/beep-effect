import * as AiToolkit from "@effect/ai/Toolkit";
import { Delete, DeleteByEntityIdPrefix, FindByCacheKey, FindByEntityType, FindSimilar, Get } from "./contracts";

export const Toolkit = AiToolkit.make(
  Get.Contract.Tool,
  Delete.Contract.Tool,
  FindByCacheKey.Contract.Tool,
  FindSimilar.Contract.Tool,
  FindByEntityType.Contract.Tool,
  DeleteByEntityIdPrefix.Contract.Tool
);
