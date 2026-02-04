/**
 * Domain Errors: Jina Reader API
 *
 * Typed errors for Jina Reader API operations including fetch failures,
 * rate limiting, and parsing errors.
 *
 * @since 2.0.0
 * @module Domain/Error/Jina
 */

import { Duration, Schema } from "effect"

// =============================================================================
// Jina API Errors
// =============================================================================

/**
 * JinaApiError - General API failure
 *
 * Returned when Jina Reader API request fails due to network issues,
 * server errors, or invalid responses.
 *
 * @since 2.0.0
 * @category Error
 */
export class JinaApiError extends Schema.TaggedError<JinaApiError>()(
  "JinaApiError",
  {
    message: Schema.String.annotations({
      title: "Error Message",
      description: "Human-readable error description"
    }),

    statusCode: Schema.optional(Schema.Number).annotations({
      title: "Status Code",
      description: "HTTP status code if available"
    }),

    url: Schema.optional(Schema.String).annotations({
      title: "URL",
      description: "The URL that failed to fetch"
    }),

    cause: Schema.optional(Schema.Unknown).annotations({
      title: "Cause",
      description: "Underlying error or failure cause"
    })
  }
) {}

/**
 * JinaRateLimitError - Rate limit exceeded
 *
 * Returned when Jina API rate limit is exceeded.
 * Free tier: 20 RPM, With API key: 500 RPM
 *
 * @since 2.0.0
 * @category Error
 */
export class JinaRateLimitError extends Schema.TaggedError<JinaRateLimitError>()(
  "JinaRateLimitError",
  {
    retryAfterMs: Schema.Number.annotations({
      title: "Retry After (ms)",
      description: "Milliseconds to wait before retrying"
    }),

    message: Schema.optionalWith(Schema.String, {
      default: () => "Jina API rate limit exceeded"
    }).annotations({
      title: "Message",
      description: "Error message"
    })
  }
) {
  /**
   * Get retry duration as Effect Duration
   */
  get retryAfter(): Duration.Duration {
    return Duration.millis(this.retryAfterMs)
  }
}

/**
 * JinaParseError - Content parsing failure
 *
 * Returned when the response from Jina cannot be parsed correctly.
 *
 * @since 2.0.0
 * @category Error
 */
export class JinaParseError extends Schema.TaggedError<JinaParseError>()(
  "JinaParseError",
  {
    message: Schema.String.annotations({
      title: "Error Message",
      description: "Description of the parsing failure"
    }),

    url: Schema.optional(Schema.String).annotations({
      title: "URL",
      description: "The URL whose content failed to parse"
    }),

    cause: Schema.optional(Schema.Unknown).annotations({
      title: "Cause",
      description: "Underlying parsing error"
    })
  }
) {}

/**
 * JinaTimeoutError - Request timeout
 *
 * Returned when a Jina API request exceeds the configured timeout.
 *
 * @since 2.0.0
 * @category Error
 */
export class JinaTimeoutError extends Schema.TaggedError<JinaTimeoutError>()(
  "JinaTimeoutError",
  {
    url: Schema.String.annotations({
      title: "URL",
      description: "The URL that timed out"
    }),

    timeoutMs: Schema.Number.annotations({
      title: "Timeout (ms)",
      description: "The timeout value that was exceeded"
    }),

    message: Schema.optionalWith(Schema.String, {
      default: () => "Jina API request timed out"
    }).annotations({
      title: "Message",
      description: "Error message"
    })
  }
) {}

/**
 * Union of all Jina errors for convenience typing
 *
 * @since 2.0.0
 * @category Error
 */
export type JinaError =
  | JinaApiError
  | JinaRateLimitError
  | JinaParseError
  | JinaTimeoutError
