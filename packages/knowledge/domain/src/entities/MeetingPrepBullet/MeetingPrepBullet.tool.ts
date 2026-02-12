import * as AiToolkit from "@effect/ai/Toolkit";
import { Delete, Get, ListByMeetingPrepId } from "./contracts";

export const Toolkit = AiToolkit.make(
  Get.Contract.Tool,
  ListByMeetingPrepId.Contract.Tool,
  Delete.Contract.Tool
);
