import * as AiToolkit from "@effect/ai/Toolkit";
import { Delete, Get, ListByBulletId } from "./contracts";

export const Toolkit = AiToolkit.make(
  Get.Contract.Tool,
  ListByBulletId.Contract.Tool,
  Delete.Contract.Tool
);
