/**
 * Product-neutral Anthropic repair-call utilities.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { Duration, Effect, ExecutionPlan, Schedule, Stream } from "effect";
import * as Str from "effect/String";
import { AiError, LanguageModel } from "effect/unstable/ai";
import { AnthropicLanguageModelOptions } from "./Anthropic.config.ts";
import { RepairError } from "./Anthropic.errors.ts";
import { makeAnthropicLanguageModelLayer } from "./Anthropic.service.ts";
import type { Config } from "effect";
import type { Response, Tool, Toolkit } from "effect/unstable/ai";
import type { GenerateTextOptions } from "effect/unstable/ai/LanguageModel";

/**
 * Haiku model used for repair calls.
 *
 * @example
 * ```ts
 * import { ANTHROPIC_REPAIR_MODEL } from "@beep/anthropic"
 *
 * console.log(ANTHROPIC_REPAIR_MODEL)
 * ```
 *
 * @category configuration
 * @since 0.0.0
 */
export const ANTHROPIC_REPAIR_MODEL = "claude-haiku-4-5" as const;

/**
 * Token budget used for repair calls.
 *
 * @example
 * ```ts
 * import { ANTHROPIC_REPAIR_MAX_TOKENS } from "@beep/anthropic"
 *
 * console.log(ANTHROPIC_REPAIR_MAX_TOKENS)
 * ```
 *
 * @category configuration
 * @since 0.0.0
 */
export const ANTHROPIC_REPAIR_MAX_TOKENS = 4096 as const;

/**
 * Acquisition attempts used by the repair execution plan.
 *
 * @example
 * ```ts
 * import { ANTHROPIC_REPAIR_ATTEMPTS } from "@beep/anthropic"
 *
 * console.log(ANTHROPIC_REPAIR_ATTEMPTS)
 * ```
 *
 * @category configuration
 * @since 0.0.0
 */
export const ANTHROPIC_REPAIR_ATTEMPTS = 2 as const;

/**
 * Base delay for repair-call acquisition retries.
 *
 * @example
 * ```ts
 * import { ANTHROPIC_REPAIR_RETRY_BASE_DELAY_MILLIS } from "@beep/anthropic"
 *
 * console.log(ANTHROPIC_REPAIR_RETRY_BASE_DELAY_MILLIS)
 * ```
 *
 * @category configuration
 * @since 0.0.0
 */
export const ANTHROPIC_REPAIR_RETRY_BASE_DELAY_MILLIS = 250 as const;

const toRepairError =
  (operation: string) =>
  (error: AiError.AiError | Config.ConfigError): RepairError =>
    RepairError.make({ message: error.message, operation });

/**
 * Build the Anthropic repair-call execution plan.
 *
 * @example
 * ```ts
 * import { makeAnthropicRepairPlan } from "@beep/anthropic"
 *
 * console.log(makeAnthropicRepairPlan())
 * ```
 *
 * @category configuration
 * @since 0.0.0
 */
export const makeAnthropicRepairPlan = (
  options: AnthropicLanguageModelOptions = AnthropicLanguageModelOptions.make({
    maxTokens: ANTHROPIC_REPAIR_MAX_TOKENS,
    model: ANTHROPIC_REPAIR_MODEL,
  })
) =>
  ExecutionPlan.make({
    attempts: ANTHROPIC_REPAIR_ATTEMPTS,
    provide: makeAnthropicLanguageModelLayer(options),
    schedule: Schedule.exponential(Duration.millis(ANTHROPIC_REPAIR_RETRY_BASE_DELAY_MILLIS), 2),
    while: (error: AiError.AiError | Config.ConfigError) => AiError.isAiError(error) && error.isRetryable,
  });

/**
 * Collect streamed forced-tool params into one JSON string.
 *
 * @example
 * ```ts
 * import { collectToolParamsJson } from "@beep/anthropic"
 *
 * console.log(collectToolParamsJson)
 * ```
 *
 * @category combinators
 * @since 0.0.0
 */
export const collectToolParamsJson = <Tools extends Record<string, Tool.Any>, E, R>(
  parts: Stream.Stream<Response.StreamPart<Tools>, E, R>
): Effect.Effect<string, E, R> =>
  parts.pipe(
    Stream.takeUntil((part) => part.type === "tool-params-end"),
    Stream.flatMap((part) => (part.type === "tool-params-delta" ? Stream.succeed(part.delta) : Stream.empty)),
    Stream.runFold(() => "", Str.concat)
  );

/**
 * Run a forced-tool Anthropic call and return the streamed tool-params JSON.
 *
 * @remarks
 * This uses `streamText` and consumes the tool params whole because the
 * non-streaming tool-use path is unsafe for the currently pinned Effect AI
 * Anthropic provider.
 *
 * @example
 * ```ts
 * import { generateAnthropicToolJson } from "@beep/anthropic"
 *
 * console.log(generateAnthropicToolJson)
 * ```
 *
 * @category combinators
 * @since 0.0.0
 */
export const generateAnthropicToolJson = <Tools extends Record<string, Tool.Any>>(
  options: GenerateTextOptions<Tools> & { readonly toolkit: Toolkit.Toolkit<Tools> }
): Effect.Effect<string, RepairError> =>
  LanguageModel.streamText({
    ...options,
    disableToolCallResolution: true,
  }).pipe(
    Stream.withExecutionPlan(makeAnthropicRepairPlan(), { preventFallbackOnPartialStream: true }),
    collectToolParamsJson,
    Effect.mapError(toRepairError("generate_tool_json"))
  );
