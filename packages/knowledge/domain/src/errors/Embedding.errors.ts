import * as S from "effect/Schema";

/**
 * Base embedding error for general failures
 *
 * @since 0.1.0
 * @category Error
 */
export class EmbeddingError extends S.TaggedError<EmbeddingError>()("EmbeddingError", {
  message: S.String,
  provider: S.String,
  cause: S.optional(S.Unknown),
}) {}
/**
 * Rate limit exceeded for embedding API
 *
 * @since 0.1.0
 * @category Error
 */
export class EmbeddingRateLimitError extends S.TaggedError<EmbeddingRateLimitError>()("EmbeddingRateLimitError", {
  message: S.String,
  provider: S.String,

  /**
   * Retry after duration in milliseconds (if available from Retry-After header)
   */
  retryAfterMs: S.optional(S.Number),
}) {}

/**
 * Embedding request timed out
 *
 * @since 0.1.0
 * @category Error
 */
export class EmbeddingTimeoutError extends S.TaggedError<EmbeddingTimeoutError>()("EmbeddingTimeoutError", {
  message: S.String,
  provider: S.String,

  /**
   * Configured timeout duration in milliseconds
   */
  timeoutMs: S.Number,
}) {}

/**
 * Invalid response from embedding provider
 *
 * @since 0.1.0
 * @category Error
 */
export class EmbeddingInvalidResponseError extends S.TaggedError<EmbeddingInvalidResponseError>()(
  "EmbeddingInvalidResponseError",
  {
    message: S.String,
    provider: S.String,

    /**
     * Raw response from provider (truncated for debugging)
     */
    response: S.optional(S.String),
  }
) {}

/**
 * Dimension mismatch between expected and actual embedding vectors
 *
 * @since 0.1.0
 * @category Error
 */
export class EmbeddingDimensionMismatchError extends S.TaggedError<EmbeddingDimensionMismatchError>()(
  "EmbeddingDimensionMismatchError",
  {
    message: S.String,

    /**
     * Expected vector dimension
     */
    expected: S.Number,

    /**
     * Actual vector dimension received
     */
    actual: S.Number,
  }
) {}

/**
 * Token limit exceeded for embedding request
 *
 * @since 0.1.0
 * @category Error
 */
export class EmbeddingTokenLimitError extends S.TaggedError<EmbeddingTokenLimitError>()("EmbeddingTokenLimitError", {
  message: S.String,
  provider: S.String,

  /**
   * Maximum tokens allowed
   */
  maxTokens: S.Number,

  /**
   * Actual tokens in request
   */
  actualTokens: S.optional(S.Number),
}) {}

/**
 * Union of all embedding errors for convenience
 *
 * @since 0.1.0
 * @category Error
 */
export type AnyEmbeddingError =
  | EmbeddingError
  | EmbeddingRateLimitError
  | EmbeddingTimeoutError
  | EmbeddingInvalidResponseError
  | EmbeddingDimensionMismatchError
  | EmbeddingTokenLimitError;
