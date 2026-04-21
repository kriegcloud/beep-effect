/**
 * Compatibility re-exports for core NLP error types.
 *
 * @since 0.0.0
 * @module
 */

import { TokenizationError as TokenizationErrorClass } from "./Tokenization.ts";

/**
 * @example
 * ```ts
 * import { TokenizationError } from "@beep/nlp/Core/Errors"
 *
 * console.log(TokenizationError)
 * ```
 *
 * @since 0.0.0
 * @category exports
 */
export const TokenizationError = TokenizationErrorClass;
