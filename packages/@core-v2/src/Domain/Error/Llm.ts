/**
 * Domain Errors: LLM Errors
 *
 * Errors specific to LLM operations.
 *
 * @since 2.0.0
 * @module Domain/Error/Llm
 */

import { Schema } from "effect"

/**
 * LlmError - LLM operation errors
 *
 * @since 2.0.0
 * @category Error
 */
export class LlmError extends Schema.TaggedError<LlmError>()(
  "LlmError",
  {
    message: Schema.String,
    cause: Schema.optional(Schema.Unknown)
  }
) {}

/**
 * LlmTimeout - LLM call exceeded timeout
 *
 * @since 2.0.0
 * @category Error
 */
export class LlmTimeout extends Schema.TaggedError<LlmTimeout>()(
  "LlmTimeout",
  {
    message: Schema.String,
    cause: Schema.optional(Schema.Unknown),

    /**
     * Timeout duration in milliseconds
     */
    timeoutMs: Schema.optional(Schema.Number)
  }
) {}

/**
 * LlmRateLimit - Rate limit exceeded
 *
 * @since 2.0.0
 * @category Error
 */
export class LlmRateLimit extends Schema.TaggedError<LlmRateLimit>()(
  "LlmRateLimit",
  {
    message: Schema.String,
    cause: Schema.optional(Schema.Unknown),

    /**
     * Retry after duration in milliseconds (if available)
     */
    retryAfterMs: Schema.optional(Schema.Number)
  }
) {}

/**
 * LlmInvalidResponse - LLM returned invalid/unparseable response
 *
 * @since 2.0.0
 * @category Error
 */
export class LlmInvalidResponse extends Schema.TaggedError<LlmInvalidResponse>()(
  "LlmInvalidResponse",
  {
    message: Schema.String,
    cause: Schema.optional(Schema.Unknown),

    /**
     * Raw response from LLM
     */
    response: Schema.optional(Schema.String)
  }
) {}
