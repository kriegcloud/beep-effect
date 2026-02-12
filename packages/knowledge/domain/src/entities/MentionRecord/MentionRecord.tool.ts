import * as AiToolkit from "@effect/ai/Toolkit";
import {
  Delete,
  FindByExtractionId,
  FindByResolvedEntityId,
  FindUnresolved,
  Get,
  UpdateResolvedEntityId,
} from "./contracts";

export const Toolkit = AiToolkit.make(
  Get.Contract.Tool,
  Delete.Contract.Tool,
  FindByExtractionId.Contract.Tool,
  FindByResolvedEntityId.Contract.Tool,
  FindUnresolved.Contract.Tool,
  UpdateResolvedEntityId.Contract.Tool
);
