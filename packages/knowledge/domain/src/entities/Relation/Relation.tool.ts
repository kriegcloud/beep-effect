import * as AiToolkit from "@effect/ai/Toolkit";
import { Count, Create, Delete, Get } from "./contracts";

export const Toolkit = AiToolkit.make(
  Count.Contract.Tool,
  Create.Contract.Tool,
  Delete.Contract.Tool,
  Get.Contract.Tool
);
