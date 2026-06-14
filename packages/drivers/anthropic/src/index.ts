/**
 * Anthropic Claude driver package.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

/**
 * Package version for `@beep/anthropic`.
 *
 * @example
 * ```ts
 * import { VERSION } from "@beep/anthropic"
 *
 * console.log(VERSION)
 * ```
 *
 * @category configuration
 * @since 0.0.0
 */
export const VERSION = "0.0.0" as const;

/**
 * Runtime configuration exports for the Anthropic driver.
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
export * from "./Anthropic.config.ts";
/**
 * Effect AI Layer and execution-plan exports for the Anthropic driver.
 *
 * @example
 * ```ts
 * import { AnthropicTurnPlan } from "@beep/anthropic"
 *
 * console.log(AnthropicTurnPlan)
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export * from "./Anthropic.service.ts";
