import * as AiToolkit from "@effect/ai/Toolkit";
import { Generate } from "./contracts";

export const Toolkit = AiToolkit.make(Generate.Contract.Tool);
