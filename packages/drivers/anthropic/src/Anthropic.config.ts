/**
 * Runtime configuration for the Anthropic driver.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $AnthropicId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $AnthropicId.create("Anthropic.config");

/**
 * Environment variable read by the live Anthropic client layer.
 *
 * @example
 * ```ts
 * import { ANTHROPIC_API_KEY_ENV } from "@beep/anthropic"
 *
 * console.log(ANTHROPIC_API_KEY_ENV)
 * ```
 *
 * @category configuration
 * @since 0.0.0
 */
export const ANTHROPIC_API_KEY_ENV = "AI_ANTHROPIC_API_KEY" as const;

/**
 * Pinned default Claude model.
 *
 * @remarks
 * The generated `@effect/ai-anthropic` catalog validates streamed response
 * model ids. Keep this pinned until the upstream catalog accepts newer model
 * identifiers.
 *
 * @example
 * ```ts
 * import { ANTHROPIC_DEFAULT_MODEL } from "@beep/anthropic"
 *
 * console.log(ANTHROPIC_DEFAULT_MODEL)
 * ```
 *
 * @category configuration
 * @since 0.0.0
 */
export const ANTHROPIC_DEFAULT_MODEL = "claude-opus-4-6" as const;

/**
 * Default token budget for rich assistant turns.
 *
 * @example
 * ```ts
 * import { ANTHROPIC_DEFAULT_MAX_TOKENS } from "@beep/anthropic"
 *
 * console.log(ANTHROPIC_DEFAULT_MAX_TOKENS)
 * ```
 *
 * @category configuration
 * @since 0.0.0
 */
export const ANTHROPIC_DEFAULT_MAX_TOKENS = 16_384 as const;

/**
 * Number of acquisition attempts in the default turn execution plan.
 *
 * @example
 * ```ts
 * import { ANTHROPIC_DEFAULT_RETRY_ATTEMPTS } from "@beep/anthropic"
 *
 * console.log(ANTHROPIC_DEFAULT_RETRY_ATTEMPTS)
 * ```
 *
 * @category configuration
 * @since 0.0.0
 */
export const ANTHROPIC_DEFAULT_RETRY_ATTEMPTS = 4 as const;

/**
 * Base delay for the default exponential retry schedule.
 *
 * @example
 * ```ts
 * import { ANTHROPIC_DEFAULT_RETRY_BASE_DELAY_MILLIS } from "@beep/anthropic"
 *
 * console.log(ANTHROPIC_DEFAULT_RETRY_BASE_DELAY_MILLIS)
 * ```
 *
 * @category configuration
 * @since 0.0.0
 */
export const ANTHROPIC_DEFAULT_RETRY_BASE_DELAY_MILLIS = 250 as const;

/**
 * Approximate static price table for usage attribution.
 *
 * @remarks
 * Values are intentionally marked approximate; `UsageRecord` rows should use
 * them for product attribution, while OTLP remains observability-only.
 *
 * @example
 * ```ts
 * import { AnthropicApproximatePrice, ANTHROPIC_DEFAULT_MODEL } from "@beep/anthropic"
 *
 * const price = AnthropicApproximatePrice.make({
 *   inputPerMillionTokensUsd: 15,
 *   model: ANTHROPIC_DEFAULT_MODEL,
 *   outputPerMillionTokensUsd: 75,
 * })
 * console.log(price.model)
 * ```
 *
 * @category configuration
 * @since 0.0.0
 */
export class AnthropicApproximatePrice extends S.Class<AnthropicApproximatePrice>($I`AnthropicApproximatePrice`)(
  {
    inputPerMillionTokensUsd: S.Finite,
    model: S.String,
    outputPerMillionTokensUsd: S.Finite,
  },
  $I.annote("AnthropicApproximatePrice", {
    description: "Approximate static Anthropic model price used for usage attribution.",
  })
) {}

/**
 * Approximate default price row for the pinned model.
 *
 * @example
 * ```ts
 * import { ANTHROPIC_DEFAULT_APPROXIMATE_PRICE } from "@beep/anthropic"
 *
 * console.log(ANTHROPIC_DEFAULT_APPROXIMATE_PRICE.model)
 * ```
 *
 * @category configuration
 * @since 0.0.0
 */
export const ANTHROPIC_DEFAULT_APPROXIMATE_PRICE = AnthropicApproximatePrice.make({
  inputPerMillionTokensUsd: 15,
  model: ANTHROPIC_DEFAULT_MODEL,
  outputPerMillionTokensUsd: 75,
});

/**
 * Options accepted by Anthropic language-model layer helpers.
 *
 * @example
 * ```ts
 * import { AnthropicLanguageModelOptions } from "@beep/anthropic"
 *
 * const options = AnthropicLanguageModelOptions.make({})
 * console.log(options)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class AnthropicLanguageModelOptions extends S.Class<AnthropicLanguageModelOptions>(
  $I`AnthropicLanguageModelOptions`
)(
  {
    maxTokens: S.optionalKey(S.Finite),
    model: S.optionalKey(S.String),
  },
  $I.annote("AnthropicLanguageModelOptions", {
    description: "Options accepted by Anthropic language-model layer helpers.",
  })
) {}
