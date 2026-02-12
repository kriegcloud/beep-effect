import * as AiToolkit from "@effect/ai/Toolkit";
import { Delete, FindByIds, FindByRelationId, Get, SearchByText } from "./contracts";

export const Toolkit = AiToolkit.make(
  Get.Contract.Tool,
  FindByRelationId.Contract.Tool,
  FindByIds.Contract.Tool,
  SearchByText.Contract.Tool,
  Delete.Contract.Tool
);
