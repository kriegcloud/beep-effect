import * as AiToolkit from "@effect/ai/Toolkit";
import { CancelBatch, GetBatchStatus, StartBatch } from "./contracts";

export const Toolkit = AiToolkit.make(
  CancelBatch.Contract.Tool,
  GetBatchStatus.Contract.Tool,
  StartBatch.Contract.Tool
);
