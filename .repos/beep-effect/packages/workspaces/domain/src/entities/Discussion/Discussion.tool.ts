import * as AiToolkit from "@effect/ai/Toolkit";
import { Create, CreateWithComment, Delete, Get, ListByDocument, Resolve, Unresolve } from "./contracts";

export const Toolkit = AiToolkit.make(
  Get.Contract.Tool,
  ListByDocument.Contract.Tool,
  Create.Contract.Tool,
  CreateWithComment.Contract.Tool,
  Resolve.Contract.Tool,
  Unresolve.Contract.Tool,
  Delete.Contract.Tool
);
