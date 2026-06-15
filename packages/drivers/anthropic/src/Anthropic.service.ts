/**
 * Anthropic Effect AI layers and acquisition retry plan.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { AnthropicClient, AnthropicLanguageModel } from "@effect/ai-anthropic";
import { Config, Duration, ExecutionPlan, Layer, Schedule } from "effect";
import { AiError } from "effect/unstable/ai";
import { FetchHttpClient } from "effect/unstable/http";
import {
  ANTHROPIC_API_KEY_ENV,
  ANTHROPIC_DEFAULT_MAX_TOKENS,
  ANTHROPIC_DEFAULT_MODEL,
  ANTHROPIC_DEFAULT_RETRY_ATTEMPTS,
  ANTHROPIC_DEFAULT_RETRY_BASE_DELAY_MILLIS,
  AnthropicLanguageModelOptions,
} from "./Anthropic.config.ts";

/**
 * Live Anthropic client layer.
 *
 * @example
 * ```ts
 * import { AnthropicLive } from "@beep/anthropic"
 *
 * console.log(AnthropicLive)
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const AnthropicLive: Layer.Layer<AnthropicClient.AnthropicClient, Config.ConfigError, never> =
  AnthropicClient.layerConfig({
    apiKey: Config.redacted(ANTHROPIC_API_KEY_ENV),
  }).pipe(Layer.provide(FetchHttpClient.layer));

const normalizeOptions = (options: AnthropicLanguageModelOptions): Required<AnthropicLanguageModelOptions> => ({
  maxTokens: options.maxTokens ?? ANTHROPIC_DEFAULT_MAX_TOKENS,
  model: options.model ?? ANTHROPIC_DEFAULT_MODEL,
});

/**
 * Build an Anthropic language-model layer.
 *
 * @example
 * ```ts
 * import { makeAnthropicLanguageModelLayer } from "@beep/anthropic"
 *
 * console.log(makeAnthropicLanguageModelLayer())
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const makeAnthropicLanguageModelLayer = (
  options: AnthropicLanguageModelOptions = AnthropicLanguageModelOptions.make({})
) => {
  const normalized = normalizeOptions(options);

  return AnthropicLanguageModel.layer({
    config: { max_tokens: normalized.maxTokens },
    model: normalized.model,
  }).pipe(Layer.provide(AnthropicLive));
};

/**
 * Live language-model layer for the pinned Anthropic model.
 *
 * @example
 * ```ts
 * import { AnthropicLanguageModelLive } from "@beep/anthropic"
 *
 * console.log(AnthropicLanguageModelLive)
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const AnthropicLanguageModelLive = makeAnthropicLanguageModelLayer();

/**
 * Build an acquisition-only execution plan for Anthropic turns.
 *
 * @remarks
 * Use this plan with `Stream.withExecutionPlan` or `Effect.withExecutionPlan`
 * at the caller boundary. The `while` predicate retries only `AiError`
 * failures marked retryable by Effect AI, so auth and invalid-request failures
 * fail fast.
 *
 * @example
 * ```ts
 * import { makeAnthropicTurnPlan } from "@beep/anthropic"
 *
 * console.log(makeAnthropicTurnPlan())
 * ```
 *
 * @category configuration
 * @since 0.0.0
 */
export const makeAnthropicTurnPlan = () =>
  ExecutionPlan.make({
    attempts: ANTHROPIC_DEFAULT_RETRY_ATTEMPTS,
    provide: AnthropicLanguageModelLive,
    schedule: Schedule.exponential(Duration.millis(ANTHROPIC_DEFAULT_RETRY_BASE_DELAY_MILLIS), 2),
    while: (error: AiError.AiError | Config.ConfigError) => AiError.isAiError(error) && error.isRetryable,
  });

/**
 * Default Anthropic turn acquisition plan.
 *
 * @example
 * ```ts
 * import { AnthropicTurnPlan } from "@beep/anthropic"
 *
 * console.log(AnthropicTurnPlan)
 * ```
 *
 * @category configuration
 * @since 0.0.0
 */
export const AnthropicTurnPlan = makeAnthropicTurnPlan();
