/**
 * Domain Errors: Embedding Errors
 *
 * Granular errors for embedding operations, following the existing Llm.ts pattern.
 * Supports typed error handling with catchTag/catchTags.
 *
 * @since 2.0.0
 * @module Domain/Error/Embedding
 */

import { Schema } from "effect"

/**
 * Base embedding error for general failures
 *
 * @since 2.0.0
 * @category Error
 */
export class EmbeddingError extends Schema.TaggedError<EmbeddingError>()(
  "EmbeddingError",
  {
    message: Schema.String,
    provider: Schema.String,
    cause: Schema.optional(Schema.Unknown)
  }
) {}

/**
 * Rate limit exceeded for embedding API
 *
 * @since 2.0.0
 * @category Error
 */
export class EmbeddingRateLimitError extends Schema.TaggedError<EmbeddingRateLimitError>()(
  "EmbeddingRateLimitError",
  {
    message: Schema.String,
    provider: Schema.String,

    /**
     * Retry after duration in milliseconds (if available from Retry-After header)
     */
    retryAfterMs: Schema.optional(Schema.Number)
  }
) {}

/**
 * Embedding request timed out
 *
 * @since 2.0.0
 * @category Error
 */
export class EmbeddingTimeoutError extends Schema.TaggedError<EmbeddingTimeoutError>()(
  "EmbeddingTimeoutError",
  {
    message: Schema.String,
    provider: Schema.String,

    /**
     * Configured timeout duration in milliseconds
     */
    timeoutMs: Schema.Number
  }
) {}

/**
 * Invalid response from embedding provider
 *
 * @since 2.0.0
 * @category Error
 */
export class EmbeddingInvalidResponseError extends Schema.TaggedError<EmbeddingInvalidResponseError>()(
  "EmbeddingInvalidResponseError",
  {
    message: Schema.String,
    provider: Schema.String,

    /**
     * Raw response from provider (truncated for debugging)
     */
    response: Schema.optional(Schema.String)
  }
) {}

/**
 * Dimension mismatch between expected and actual embedding vectors
 *
 * @since 2.0.0
 * @category Error
 */
export class EmbeddingDimensionMismatchError extends Schema.TaggedError<EmbeddingDimensionMismatchError>()(
  "EmbeddingDimensionMismatchError",
  {
    message: Schema.String,

    /**
     * Expected vector dimension
     */
    expected: Schema.Number,

    /**
     * Actual vector dimension received
     */
    actual: Schema.Number
  }
) {}

/**
 * Token limit exceeded for embedding request
 *
 * @since 2.0.0
 * @category Error
 */
export class EmbeddingTokenLimitError extends Schema.TaggedError<EmbeddingTokenLimitError>()(
  "EmbeddingTokenLimitError",
  {
    message: Schema.String,
    provider: Schema.String,

    /**
     * Maximum tokens allowed
     */
    maxTokens: Schema.Number,

    /**
     * Actual tokens in request
     */
    actualTokens: Schema.optional(Schema.Number)
  }
) {}

/**
 * Union of all embedding errors for convenience
 *
 * @since 2.0.0
 * @category Error
 */
export type AnyEmbeddingError =
  | EmbeddingError
  | EmbeddingRateLimitError
  | EmbeddingTimeoutError
  | EmbeddingInvalidResponseError
  | EmbeddingDimensionMismatchError
  | EmbeddingTokenLimitError
