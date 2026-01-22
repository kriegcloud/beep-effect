/**
 * LlmLayers - Provider Layer definitions for @effect/ai
 *
 * Config-driven language model provider selection (Anthropic or OpenAI).
 *
 * @module knowledge-server/Runtime/LlmLayers
 * @since 0.1.0
 */
import { AnthropicClient, AnthropicLanguageModel } from "@effect/ai-anthropic";
import { OpenAiClient, OpenAiLanguageModel } from "@effect/ai-openai";
import { FetchHttpClient } from "@effect/platform";
import * as Config from "effect/Config";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import type * as Redacted from "effect/Redacted";

/**
 * Create Anthropic provider Layer
 *
 * @internal
 */
const makeAnthropicLayer = (apiKey: Redacted.Redacted<string>, model: string) =>
  AnthropicLanguageModel.layer({ model }).pipe(
    Layer.provide(AnthropicClient.layer({ apiKey }).pipe(Layer.provide(FetchHttpClient.layer)))
  );

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
 * - LLM_PROVIDER: "anthropic" (default) or "openai"
 * - LLM_API_KEY: API key for the selected provider
 * - LLM_MODEL: Model identifier (default: "claude-sonnet-4-20250514")
 *
 * @since 0.1.0
 * @category config
 */
export const LlmConfig = Config.all({
  provider: Config.string("LLM_PROVIDER").pipe(Config.withDefault("anthropic")),
  apiKey: Config.redacted("LLM_API_KEY"),
  model: Config.string("LLM_MODEL").pipe(Config.withDefault("claude-sonnet-4-20250514")),
});

/**
 * LlmLive - Production Layer for LanguageModel service
 *
 * Provides LanguageModel.LanguageModel based on environment configuration.
 *
 * @example
 * ```ts
 * import { LlmLive } from "@beep/knowledge-server/Runtime"
 * import { LanguageModel } from "@effect/ai"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const model = yield* LanguageModel.LanguageModel
 *   const response = yield* model.generateText("Hello world")
 *   console.log(response.text)
 * }).pipe(Effect.provide(LlmLive))
 * ```
 *
 * @since 0.1.0
 * @category layers
 */
export const LlmLive = Layer.unwrapEffect(
  Effect.gen(function* () {
    const config = yield* LlmConfig;
    return config.provider === "openai"
      ? makeOpenAiLayer(config.apiKey, config.model)
      : makeAnthropicLayer(config.apiKey, config.model);
  })
);
