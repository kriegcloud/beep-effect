/**
 * Domain: Circuit Breaker Errors
 *
 * Consolidated circuit breaker errors for use across the codebase.
 * Use Schema.TaggedError for serialization support.
 *
 * @since 2.0.0
 * @module Domain/Error/Circuit
 */

import { Schema } from "effect"

/**
 * Error thrown when circuit breaker is open
 *
 * Use catchTag("CircuitOpenError") to handle this error.
 *
 * @since 2.0.0
 */
export class CircuitOpenError extends Schema.TaggedError<CircuitOpenError>()(
  "CircuitOpenError",
  {
    resetTimeoutMs: Schema.Number,
    lastFailureTime: Schema.optional(Schema.Number),
    retryAfterMs: Schema.optional(Schema.Number)
  }
) {
  get message(): string {
    const retryMs = this.retryAfterMs ?? this.resetTimeoutMs
    return `Circuit breaker is open. Will retry in ${retryMs}ms`
  }
}

/**
 * Error when rate limit is exceeded
 *
 * @since 2.0.0
 */
export class RateLimitError extends Schema.TaggedError<RateLimitError>()(
  "RateLimitError",
  {
    reason: Schema.Literal("tokens", "requests", "concurrent"),
    retryAfterMs: Schema.optional(Schema.Number)
  }
) {
  get message(): string {
    const base = `Rate limit exceeded: ${this.reason}`
    return this.retryAfterMs ? `${base}, retry after ${this.retryAfterMs}ms` : base
  }
}
