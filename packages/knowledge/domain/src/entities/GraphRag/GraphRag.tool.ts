import * as AiToolkit from "@effect/ai/Toolkit";
import { Query, QueryFromSeeds } from "./contracts";

export const Toolkit = AiToolkit.make(Query.Contract.Tool, QueryFromSeeds.Contract.Tool);
