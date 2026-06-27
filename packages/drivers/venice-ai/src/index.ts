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
 * console.log(service)
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
 * console.log(aiModel)
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export * as VeniceAiLanguageModel from "./VeniceAiLanguageModel.service.ts";
