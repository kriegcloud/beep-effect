/**
 * OpenAI-compatible provider driver exports.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

/**
 * OpenAI-compatible schema model exports.
 *
 * @example
 * ```ts
 * import { OpenAiCompatChatCompletionRequest } from "@beep/openai-compat"
 *
 * const request = OpenAiCompatChatCompletionRequest.make({
 *   messages: [{ content: "Hello", role: "user" }],
 *   model: "compat-model"
 * })
 * console.log(request)
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export * from "./OpenAiCompat.models.ts";
/**
 * OpenAI-compatible HTTP client exports.
 *
 * @example
 * ```ts
 * import { OpenAiCompatClient } from "@beep/openai-compat"
 *
 * const service = OpenAiCompatClient
 * console.log(service)
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export * from "./OpenAiCompatClient.service.ts";
/**
 * Effect AI language-model adapter exports for OpenAI-compatible chat completions.
 *
 * @example
 * ```ts
 * import { model } from "@beep/openai-compat"
 *
 * const aiModel = model("compat-model")
 * console.log(aiModel)
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export * from "./OpenAiCompatLanguageModel.service.ts";
