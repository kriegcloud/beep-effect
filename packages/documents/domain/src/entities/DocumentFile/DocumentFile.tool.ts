import * as AiToolkit from "@effect/ai/Toolkit";
import { Create, Delete, Get, HardDelete, ListByDocument, ListByUser } from "./contracts";

export const Toolkit = AiToolkit.make(
  Get.Contract.Tool,
  ListByDocument.Contract.Tool,
  ListByUser.Contract.Tool,
  Create.Contract.Tool,
  Delete.Contract.Tool,
  HardDelete.Contract.Tool
);
