import * as AiToolkit from "@effect/ai/Toolkit";
import { Create, Delete, Get, Update } from "./contracts";

export const Toolkit = AiToolkit.make(
  Create.Contract.Tool,
  Delete.Contract.Tool,
  Get.Contract.Tool,
  Update.Contract.Tool
);
