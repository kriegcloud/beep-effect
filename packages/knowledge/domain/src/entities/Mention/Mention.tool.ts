import * as AiToolkit from "@effect/ai/Toolkit";
import { Delete, FindByDocumentId, FindByEntityId, FindByIds, Get } from "./contracts";

export const Toolkit = AiToolkit.make(
  Get.Contract.Tool,
  FindByEntityId.Contract.Tool,
  FindByIds.Contract.Tool,
  FindByDocumentId.Contract.Tool,
  Delete.Contract.Tool
);
