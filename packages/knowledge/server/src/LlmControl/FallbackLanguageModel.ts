import { $KnowledgeServerId } from "@beep/identity/packages";
import type { LanguageModel } from "@effect/ai";
import * as Context from "effect/Context";
import type * as O from "effect/Option";

const $I = $KnowledgeServerId.create("LlmControl/FallbackLanguageModel");

/**
 * Optional backup LLM provider/model, used for fallback chains once the primary
 * model has exhausted retries/timeouts/circuit behavior.
 */
export class FallbackLanguageModel extends Context.Tag($I`FallbackLanguageModel`)<
  FallbackLanguageModel,
  O.Option<LanguageModel.Service>
>() {}
