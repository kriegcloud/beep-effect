import * as AiToolkit from "@effect/ai/Toolkit";
import { Cancel, Extract, GetStatus } from "./contracts";

export const Toolkit = AiToolkit.make(Cancel.Contract.Tool, Extract.Contract.Tool, GetStatus.Contract.Tool);
