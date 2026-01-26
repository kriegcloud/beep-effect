import { AnthropicLanguageModel } from "@effect/ai-anthropic";
import { OpenAiLanguageModel } from "@effect/ai-openai";
import { ExecutionPlan, Schedule } from "effect";
import * as P from "effect/Predicate";
import type { AiError } from "./errors";

export const Plan = ExecutionPlan.make(
  {
    provide: OpenAiLanguageModel.model("gpt-4o"),
    attempts: 3,
    schedule: Schedule.exponential("100 millis", 1.5),
    while: (error: AiError.Type) => P.isTagged("NetworkError")(error),
  },
  {
    provide: AnthropicLanguageModel.model("claude-4-sonnet-20250514"),
    attempts: 2,
    schedule: Schedule.exponential("100 millis", 1.5),
    while: (error: AiError.Type) => P.isTagged("ProviderOutage")(error),
  }
);
