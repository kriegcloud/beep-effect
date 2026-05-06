/**
 * Venice AI driver package exports.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

/**
 * Public Venice AI driver exports.
 *
 * @example
 * ```ts
 * import { VeniceAI } from "@beep/venice-ai"
 *
 * const service = VeniceAI
 * void service
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export * from "./VeniceAI.service.ts";

/**
 * Effect AI language-model adapter exports for Venice chat completions.
 *
 * @example
 * ```ts
 * import { VeniceAiLanguageModel } from "@beep/venice-ai"
 *
 * const aiModel = VeniceAiLanguageModel.model("llama-3.3-70b")
 * void aiModel
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export * as VeniceAiLanguageModel from "./VeniceAiLanguageModel.ts";

/**
 * Current version of the `@beep/venice-ai` package.
 *
 * @example
 * ```ts
 * import { VERSION } from "@beep/venice-ai"
 *
 * console.log(VERSION)
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const VERSION = "0.0.0";
