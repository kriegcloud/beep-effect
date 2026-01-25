import { Duration, Effect, Schedule } from "effect";
import * as A from "effect/Array";
import * as S from "effect/Schema";

// =============================================================================
// Rate Limit Reason Schema
// =============================================================================

/**
 * Known Gmail API rate limit error reasons
 */
export const RateLimitReason = S.Literal(
  "userRateLimitExceeded",
  "rateLimitExceeded",
  "quotaExceeded",
  "dailyLimitExceeded",
  "backendError",
  "limitExceeded"
);

export type RateLimitReason = typeof RateLimitReason.Type;

// =============================================================================
// Error Shape Schemas - Different ways errors carry status codes
// =============================================================================

/**
 * Error with `code` property (e.g., `{ code: 429 }`)
 */
const ErrorWithCode = S.Struct({
  code: S.Number,
});

/**
 * Error with `status` property (e.g., `{ status: 429 }`)
 */
const ErrorWithStatus = S.Struct({
  status: S.Number,
});

/**
 * Error with nested `response.status` (e.g., Axios errors)
 */
const ErrorWithResponseStatus = S.Struct({
  response: S.Struct({
    status: S.Number,
  }),
});

// =============================================================================
// Error Arrays - Where rate limit reasons appear
// =============================================================================

const ErrorEntry = S.Struct({
  reason: S.String,
});

/**
 * Top-level errors array (e.g., `{ errors: [{ reason: "..." }] }`)
 */
const WithTopLevelErrors = S.Struct({
  errors: S.Array(ErrorEntry),
});

// =============================================================================
// Rate Limit Detection Schemas
// =============================================================================

/**
 * HTTP 429 Too Many Requests - Always a rate limit
 */
const Http429WithCode = ErrorWithCode.pipe(
  S.filter((e) => e.code === 429, {
    message: () => "Expected code 429",
  })
);

const Http429WithStatus = ErrorWithStatus.pipe(
  S.filter((e) => e.status === 429, {
    message: () => "Expected status 429",
  })
);

const Http429WithResponseStatus = ErrorWithResponseStatus.pipe(
  S.filter((e) => e.response.status === 429, {
    message: () => "Expected response.status 429",
  })
);

/**
 * Any error shape with HTTP 429
 */
const Http429Error = S.Union(Http429WithCode, Http429WithStatus, Http429WithResponseStatus);

/**
 * Helper to check if errors array contains a rate limit reason
 */
const hasRateLimitReason = (errors: ReadonlyArray<{ reason: string }>): boolean =>
  A.some(errors, (entry) => S.is(RateLimitReason)(entry.reason));

/**
 * HTTP 403 with rate limit reason in top-level errors
 */
const Http403WithTopLevelErrors = S.Struct({
  ...ErrorWithCode.fields,
  ...WithTopLevelErrors.fields,
}).pipe(
  S.filter((e) => e.code === 403 && hasRateLimitReason(e.errors), {
    message: () => "Expected code 403 with rate limit reason",
  })
);

const Http403StatusWithTopLevelErrors = S.Struct({
  ...ErrorWithStatus.fields,
  ...WithTopLevelErrors.fields,
}).pipe(
  S.filter((e) => e.status === 403 && hasRateLimitReason(e.errors), {
    message: () => "Expected status 403 with rate limit reason",
  })
);

/**
 * HTTP 403 with rate limit reason in nested response errors
 */
const Http403WithNestedErrors = S.Struct({
  response: S.Struct({
    status: S.Number,
    data: S.Struct({
      error: S.Struct({
        errors: S.Array(ErrorEntry),
      }),
    }),
  }),
}).pipe(
  S.filter((e) => e.response.status === 403 && hasRateLimitReason(e.response.data.error.errors), {
    message: () => "Expected response.status 403 with rate limit reason",
  })
);

/**
 * Any HTTP 403 error with rate limit reasons
 */
const Http403RateLimitError = S.Union(
  Http403WithTopLevelErrors,
  Http403StatusWithTopLevelErrors,
  Http403WithNestedErrors
);

// =============================================================================
// Exported Rate Limit Schema
// =============================================================================

/**
 * Schema representing a Gmail API rate limit error.
 *
 * Matches:
 * - HTTP 429 (Too Many Requests) from any error shape
 * - HTTP 403 with rate limit reasons in errors array
 *
 * @example
 * ```ts
 * if (S.is(RateLimit)(error)) {
 *   // error is a rate limit, apply backoff
 * }
 * ```
 */
export const RateLimit = S.Union(Http429Error, Http403RateLimitError).annotations({
  identifier: "RateLimit",
  description: "Gmail API rate limit error",
});

export type RateLimit = typeof RateLimit.Type;

/**
 * Type guard for rate limit errors using the schema.
 * Equivalent to `S.is(RateLimit)`.
 */
export const isRateLimit = S.is(RateLimit);

// =============================================================================
// Retry Scheduling
// =============================================================================

/**
 * A schedule that:
 * - Retries while the error *is* a rate-limit error (max 10 attempts)
 * - Waits 60 seconds between retries (conservative for Gmail user quotas)
 * - Stops immediately for any other error
 */
export const rateLimitSchedule = Schedule.recurWhile(isRateLimit).pipe(
  Schedule.intersect(Schedule.recurs(10)),
  Schedule.addDelay(() => Duration.seconds(60))
);

/**
 * Generic wrapper that applies the rate limit retry schedule.
 */
export const withRetry = <A, E, R>(eff: Effect.Effect<A, E, R>): Effect.Effect<A, E, R> =>
  eff.pipe(Effect.retry(rateLimitSchedule));
