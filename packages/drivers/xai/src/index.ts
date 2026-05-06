/**
 * xAI API driver package.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

/**
 * Package version for `@beep/xai`.
 *
 * @example
 * ```ts
 * import { VERSION } from "@beep/xai"
 *
 * console.log(VERSION)
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const VERSION = "0.0.0" as const;

/**
 * Runtime configuration exports for the xAI driver.
 *
 * @example
 * ```ts
 * import { XAiConfigInput } from "@beep/xai"
 *
 * const config = new XAiConfigInput({})
 * void config
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export * from "./XAi.config.ts";

/**
 * Endpoint manifest exports for the xAI driver.
 *
 * @example
 * ```ts
 * import { XAI_ENDPOINTS } from "@beep/xai"
 *
 * console.log(XAI_ENDPOINTS.length)
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export * from "./XAi.endpoints.ts";

/**
 * Error exports for the xAI driver.
 *
 * @example
 * ```ts
 * import { XAiError } from "@beep/xai"
 *
 * const error = XAiError.config()
 * void error
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export * from "./XAi.errors.ts";

/**
 * Model exports for the xAI driver.
 *
 * @example
 * ```ts
 * import { XAiRequestOptions } from "@beep/xai"
 *
 * const request = new XAiRequestOptions({})
 * void request
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export * from "./XAi.models.ts";

/**
 * Service exports for the xAI driver.
 *
 * @example
 * ```ts
 * import { XAi } from "@beep/xai"
 *
 * const layer = XAi.layer
 * void layer
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export * from "./XAi.service.ts";

/**
 * Effect AI language-model adapter exports for xAI chat completions.
 *
 * @example
 * ```ts
 * import { XAiLanguageModel } from "@beep/xai"
 *
 * const aiModel = XAiLanguageModel.model("grok-3")
 * void aiModel
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export * as XAiLanguageModel from "./XAiLanguageModel.ts";
