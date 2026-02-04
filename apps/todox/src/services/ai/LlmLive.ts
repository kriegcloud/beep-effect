/**
 * LLM Layer for todox AI operations.
 * Provides LanguageModel.LanguageModel service via OpenAI.
 *
 * @module todox/services/ai/LlmLive
 */
import { OpenAiClient, OpenAiLanguageModel } from "@effect/ai-openai";
import { FetchHttpClient } from "@effect/platform";
import * as Config from "effect/Config";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import type * as Redacted from "effect/Redacted";

/**
 * Create OpenAI provider Layer
 *
 * @internal
 */
const makeOpenAiLayer = (apiKey: Redacted.Redacted<string>, model: string) =>
  OpenAiLanguageModel.layer({ model }).pipe(
    Layer.provide(OpenAiClient.layer({ apiKey }).pipe(Layer.provide(FetchHttpClient.layer)))
  );

/**
 * LLM configuration from environment variables
 *
 * - OPENAI_API_KEY: OpenAI API key (required)
 * - OPENAI_MODEL: Model identifier (default: "gpt-4-turbo")
 *
 * @category config
 */
export const LlmConfig = Config.all({
  apiKey: Config.redacted("OPENAI_API_KEY"),
  model: Config.string("OPENAI_MODEL").pipe(Config.withDefault("gpt-4-turbo")),
});

/**
 * LlmLive - Production Layer for LanguageModel service
 *
 * Provides LanguageModel.LanguageModel based on environment configuration.
 * Uses FetchHttpClient for browser/Edge runtime compatibility.
 *
 * @category layers
 */
export const LlmLive = Layer.unwrapEffect(
  Effect.gen(function* () {
    const config = yield* LlmConfig;
    return makeOpenAiLayer(config.apiKey, config.model);
  })
);
