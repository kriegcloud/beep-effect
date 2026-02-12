import * as AiToolkit from "@effect/ai/Toolkit";
import { Delete, FindByMappingKey, Get } from "./contracts";

export const Toolkit = AiToolkit.make(
  Get.Contract.Tool,
  Delete.Contract.Tool,
  FindByMappingKey.Contract.Tool
);
