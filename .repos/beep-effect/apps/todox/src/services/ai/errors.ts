/**
 * Error types for AI text improvement operations.
 *
 * Defines typed errors for AI service failures including API key issues,
 * rate limiting, model availability, and network errors.
 *
 * @module todox/services/ai/errors
 */
import * as S from "effect/Schema";

/**
 * Error codes for AI operation failures.
 *
 * - `API_KEY_MISSING` - No API key configured for the AI provider
 * - `API_KEY_INVALID` - API key is malformed or rejected by provider
 * - `RATE_LIMIT` - Request throttled due to rate limiting
 * - `MODEL_UNAVAILABLE` - Requested model is not available or deprecated
 * - `NETWORK_ERROR` - Connection failure to AI provider
 * - `UNKNOWN` - Unexpected error not matching other categories
 */
export const AiErrorCode = S.Literal(
  "API_KEY_MISSING",
  "API_KEY_INVALID",
  "RATE_LIMIT",
  "MODEL_UNAVAILABLE",
  "NETWORK_ERROR",
  "UNKNOWN"
);
export type AiErrorCode = S.Schema.Type<typeof AiErrorCode>;

/**
 * Tagged error for text improvement operation failures.
 *
 * Wraps AI provider errors with a typed error code for precise
 * error handling via `Effect.catchTag`.
 *
 * @example
 * ```typescript
 * import { TextImprovementError } from "./errors";
 * import * as Effect from "effect/Effect";
 *
 * const program = improveText(text).pipe(
 *   Effect.catchTag("TextImprovementError", (error) =>
 *     Match.value(error.code).pipe(
 *       Match.when("RATE_LIMIT", () => Effect.retry(Schedule.exponential("1 second"))),
 *       Match.when("API_KEY_MISSING", () => Effect.fail(new ConfigurationError())),
 *       Match.orElse(() => Effect.fail(error))
 *     )
 *   )
 * );
 * ```
 */
export class TextImprovementError extends S.TaggedError<TextImprovementError>()("TextImprovementError", {
  code: AiErrorCode,
  message: S.String,
  cause: S.optional(S.Defect),
}) {
  /**
   * Factory method to create a TextImprovementError.
   *
   * @param code - The error classification code
   * @param message - Human-readable error description
   * @param cause - Optional underlying error that triggered this failure
   */
  static readonly from = (code: AiErrorCode, message: string, cause?: unknown) =>
    new TextImprovementError({ code, message, cause });
}
