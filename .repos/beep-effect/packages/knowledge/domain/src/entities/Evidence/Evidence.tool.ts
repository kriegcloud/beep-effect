import * as AiToolkit from "@effect/ai/Toolkit";
import { List } from "./contracts";

export const Toolkit = AiToolkit.make(List.Contract.Tool);
