/**
 * Anthropic Claude driver package.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

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
 * Technical Anthropic driver errors.
 *
 * @example
 * ```ts
 * import { RepairError } from "@beep/anthropic"
 *
 * console.log(RepairError)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export * from "./Anthropic.errors.ts";
/**
 * Product-neutral Anthropic repair-call utilities.
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
export * from "./Anthropic.repair.ts";
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
