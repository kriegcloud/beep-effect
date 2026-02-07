import { $KnowledgeDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("errors/circuit");

/**
 * Error thrown when circuit breaker is open
 *
 * Use catchTag("CircuitOpenError") to handle this error.
 *
 * @since 0.1.0
 */
export class CircuitOpenError extends S.TaggedError<CircuitOpenError>($I`CircuitOpenError`)(
  "CircuitOpenError",
  {
    resetTimeoutMs: S.DurationFromMillis,
    lastFailureTime: S.optional(S.Number),
    retryAfterMs: S.optional(S.DurationFromMillis),
  },
  $I.annotations("CircuitOpenError", {
    description: "Error thrown when circuit breaker is open",
    documentation: 'Use catchTag("CircuitOpenError") to handle this error.',
  })
) {
  override get message(): string {
    const retryMs = this.retryAfterMs ?? this.resetTimeoutMs;
    return `Circuit breaker is open. Will retry in ${retryMs}ms`;
  }
}

export class RateLimitErrorReason extends BS.StringLiteralKit("tokens", "requests", "concurrent").annotations(
  $I.annotations("RateLimitErrorReason", {
    description: "Reason for rate limit exceeded",
  })
) {}

export declare namespace RateLimitErrorReason {
  export type Type = typeof RateLimitErrorReason.Type;
}

/**
 * Error when rate limit is exceeded
 *
 * @since 0.1.0
 */
export class RateLimitError extends S.TaggedError<RateLimitError>($I`RateLimitError`)(
  "RateLimitError",
  {
    reason: RateLimitErrorReason,
    retryAfterMs: S.optional(S.DurationFromMillis),
  },
  $I.annotations("RateLimitError", {
    description: "Error when rate limit is exceeded",
  })
) {
  override get message(): string {
    const base = `Rate limit exceeded: ${this.reason}`;
    return this.retryAfterMs ? `${base}, retry after ${this.retryAfterMs}ms` : base;
  }
}
