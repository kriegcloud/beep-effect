/**
 * Domain Errors: Jina Reader API
 *
 * Typed errors for Jina Reader API operations including fetch failures,
 * rate limiting, and parsing errors.
 *
 * @since 0.1.0
 * @module Domain/Error/Jina
 */

import { $KnowledgeDomainId } from "@beep/identity/packages";
import { Duration } from "effect";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("errors/Jina.errors");
// =============================================================================
// Jina API Errors
// =============================================================================

/**
 * JinaApiError - General API failure
 *
 * Returned when Jina Reader API request fails due to network issues,
 * server errors, or invalid responses.
 *
 * @since 0.1.0
 * @category Error
 */
export class JinaApiError extends S.TaggedError<JinaApiError>($I`JinaApiError`)(
  "JinaApiError",
  {
    message: S.String.annotations({
      title: "Error Message",
      description: "Human-readable error description",
    }),

    statusCode: S.optional(S.Number).annotations({
      title: "Status Code",
      description: "HTTP status code if available",
    }),

    url: S.optional(S.String).annotations({
      title: "URL",
      description: "The URL that failed to fetch",
    }),

    cause: S.optional(S.Unknown).annotations({
      title: "Cause",
      description: "Underlying error or failure cause",
    }),
  },
  $I.annotations("JinaApiError", {
    description: "General API failure when Jina Reader API request fails",
  })
) {}

/**
 * JinaRateLimitError - Rate limit exceeded
 *
 * Returned when Jina API rate limit is exceeded.
 * Free tier: 20 RPM, With API key: 500 RPM
 *
 * @since 0.1.0
 * @category Error
 */
export class JinaRateLimitError extends S.TaggedError<JinaRateLimitError>($I`JinaRateLimitError`)(
  "JinaRateLimitError",
  {
    retryAfterMs: S.Number.annotations({
      title: "Retry After (ms)",
      description: "Milliseconds to wait before retrying",
    }),

    message: S.optionalWith(S.String, {
      default: () => "Jina API rate limit exceeded",
    }).annotations({
      title: "Message",
      description: "Error message",
    }),
  },
  $I.annotations("JinaRateLimitError", {
    description: "Rate limit exceeded when calling Jina API. Includes retry timing information.",
  })
) {
  /**
   * Get retry duration as Effect Duration
   */
  get retryAfter(): Duration.Duration {
    return Duration.millis(this.retryAfterMs);
  }
}

/**
 * JinaParseError - Content parsing failure
 *
 * Returned when the response from Jina cannot be parsed correctly.
 *
 * @since 0.1.0
 * @category Error
 */
export class JinaParseError extends S.TaggedError<JinaParseError>($I`JinaParseError`)(
  "JinaParseError",
  {
    message: S.String.annotations({
      title: "Error Message",
      description: "Description of the parsing failure",
    }),

    url: S.optional(S.String).annotations({
      title: "URL",
      description: "The URL whose content failed to parse",
    }),

    cause: S.optional(S.Unknown).annotations({
      title: "Cause",
      description: "Underlying parsing error",
    }),
  },
  $I.annotations("JinaParseError", {
    description: "Content parsing failure when processing Jina API response",
  })
) {}

/**
 * JinaTimeoutError - Request timeout
 *
 * Returned when a Jina API request exceeds the configured timeout.
 *
 * @since 0.1.0
 * @category Error
 */
export class JinaTimeoutError extends S.TaggedError<JinaTimeoutError>($I`JinaTimeoutError`)(
  "JinaTimeoutError",
  {
    url: S.String.annotations({
      title: "URL",
      description: "The URL that timed out",
    }),

    timeoutMs: S.Number.annotations({
      title: "Timeout (ms)",
      description: "The timeout value that was exceeded",
    }),

    message: S.optionalWith(S.String, {
      default: () => "Jina API request timed out",
    }).annotations({
      title: "Message",
      description: "Error message",
    }),
  },
  $I.annotations("JinaTimeoutError", {
    description: "Request timeout when Jina API request exceeds the configured timeout duration",
  })
) {}

/**
 * Union of all Jina errors for convenience typing
 *
 * @since 0.1.0
 * @category Error
 */
export class JinaError extends S.Union(JinaApiError, JinaRateLimitError, JinaParseError, JinaTimeoutError).annotations(
  $I.annotations("JinaError", {
    description: "Union of all Jina errors for convenience typing",
  })
) {}

export declare namespace JinaError {
  export type Type = typeof JinaError.Type;
  export type Encoded = typeof JinaError.Encoded;
}
