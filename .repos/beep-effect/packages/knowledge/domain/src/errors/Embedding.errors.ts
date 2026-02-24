import { $KnowledgeDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("errors/Embedding.errors");

/**
 * Base embedding error for general failures
 *
 * @since 0.1.0
 * @category Error
 */
export class EmbeddingError extends S.TaggedError<EmbeddingError>($I`EmbeddingError`)(
  "EmbeddingError",
  {
    message: S.String,
    provider: S.String,
    cause: S.optional(S.Unknown),
  },
  $I.annotations("EmbeddingError", {
    description: "Base embedding error for general provider failures.",
  })
) {}
/**
 * Rate limit exceeded for embedding API
 *
 * @since 0.1.0
 * @category Error
 */
export class EmbeddingRateLimitError extends S.TaggedError<EmbeddingRateLimitError>($I`EmbeddingRateLimitError`)(
  "EmbeddingRateLimitError",
  {
    message: S.String,
    provider: S.String,

    /**
     * Retry after duration in milliseconds (if available from Retry-After header)
     */
    retryAfterMs: S.optional(S.Number),
  },
  $I.annotations("EmbeddingRateLimitError", {
    description: "Embedding provider rate limit exceeded (may include retry-after).",
  })
) {}

/**
 * Embedding request timed out
 *
 * @since 0.1.0
 * @category Error
 */
export class EmbeddingTimeoutError extends S.TaggedError<EmbeddingTimeoutError>($I`EmbeddingTimeoutError`)(
  "EmbeddingTimeoutError",
  {
    message: S.String,
    provider: S.String,

    /**
     * Configured timeout duration in milliseconds
     */
    timeoutMs: S.Number,
  },
  $I.annotations("EmbeddingTimeoutError", {
    description: "Embedding provider request timed out.",
  })
) {}

/**
 * Invalid response from embedding provider
 *
 * @since 0.1.0
 * @category Error
 */
export class EmbeddingInvalidResponseError extends S.TaggedError<EmbeddingInvalidResponseError>(
  $I`EmbeddingInvalidResponseError`
)(
  "EmbeddingInvalidResponseError",
  {
    message: S.String,
    provider: S.String,

    /**
     * Raw response from provider (truncated for debugging)
     */
    response: S.optional(S.String),
  },
  $I.annotations("EmbeddingInvalidResponseError", {
    description: "Embedding provider returned an invalid or unexpected response payload.",
  })
) {}

/**
 * Dimension mismatch between expected and actual embedding vectors
 *
 * @since 0.1.0
 * @category Error
 */
export class EmbeddingDimensionMismatchError extends S.TaggedError<EmbeddingDimensionMismatchError>(
  $I`EmbeddingDimensionMismatchError`
)(
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
  },
  $I.annotations("EmbeddingDimensionMismatchError", {
    description: "Embedding provider returned a vector whose dimensionality did not match expectations.",
  })
) {}

/**
 * Token limit exceeded for embedding request
 *
 * @since 0.1.0
 * @category Error
 */
export class EmbeddingTokenLimitError extends S.TaggedError<EmbeddingTokenLimitError>($I`EmbeddingTokenLimitError`)(
  "EmbeddingTokenLimitError",
  {
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
  },
  $I.annotations("EmbeddingTokenLimitError", {
    description: "Embedding request exceeded the provider token limit (max vs actual).",
  })
) {}

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
