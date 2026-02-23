import * as AiToolkit from "@effect/ai/Toolkit";
import { CreateSnapshot, Get, GetContent, HardDelete, ListByDocument } from "./contracts";

export const Toolkit = AiToolkit.make(
  Get.Contract.Tool,
  GetContent.Contract.Tool,
  ListByDocument.Contract.Tool,
  CreateSnapshot.Contract.Tool,
  HardDelete.Contract.Tool
);
