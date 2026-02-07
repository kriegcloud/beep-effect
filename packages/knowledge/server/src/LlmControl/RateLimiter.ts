import { $KnowledgeServerId } from "@beep/identity/packages";
import { CircuitOpenError, RateLimitError } from "@beep/knowledge-domain/errors";
import { BS } from "@beep/schema";
import * as Bool from "effect/Boolean";
import * as Clock from "effect/Clock";
import * as Context from "effect/Context";
import * as DateTime from "effect/DateTime";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Match from "effect/Match";
import * as Num from "effect/Number";
import * as P from "effect/Predicate";
import * as Ref from "effect/Ref";
import * as S from "effect/Schema";
import * as Struct from "effect/Struct";

const $I = $KnowledgeServerId.create("LlmControl/RateLimiter");

/**
 * Circuit breaker states
 */
export class CircuitState extends BS.StringLiteralKit("closed", "open", "half_open").annotations(
  $I.annotations("CircuitState", {
    description: "Circuit breaker states",
  })
) {}

export declare namespace CircuitState {
  export type Type = typeof CircuitState.Type;
}

export const makeRateLimiterState = CircuitState.toTagged("circuitState").composer({
  /** Requests made in current minute window */
  requestsThisMinute: S.NonNegativeInt.annotations({
    description: "Requests made in current minute window",
  }),
  /** Tokens used in current minute window */
  tokensThisMinute: S.NonNegativeInt.annotations({
    description: "Tokens used in current minute window",
  }),
  /** Timestamp of last counter reset */
  lastReset: BS.DateTimeUtcFromAllAcceptable.annotations({
    description: "Timestamp of last counter reset",
  }),
  /** Consecutive failures count */
  failureCount: S.NonNegativeInt.annotations({
    description: "Consecutive failures count",
  }),
  /** Consecutive successes count (for half_open recovery) */
  successCount: S.NonNegativeInt.annotations({
    description: "Consecutive successes count (for half_open recovery)",
  }),
});

export class Closed extends S.Class<Closed>($I`Closed`)(
  makeRateLimiterState.closed({}),
  $I.annotations("Closed", {
    description: "Circuit breaker is closed",
  })
) {}

export class Open extends S.Class<Open>($I`Open`)(
  makeRateLimiterState.open({}),
  $I.annotations("Open", {
    description: "Circuit breaker is open",
  })
) {}

export class HalfOpen extends S.Class<HalfOpen>($I`HalfOpen`)(
  makeRateLimiterState.half_open({}),
  $I.annotations("HalfOpen", {
    description: "Circuit breaker is half open.",
  })
) {}

export class RateLimiterState extends S.Union(Open, Closed, HalfOpen).annotations(
  $I.annotations("RateLimiterState", {
    description: "Rate limiter state",
  })
) {}

export declare namespace RateLimiterState {
  export type Type = typeof RateLimiterState.Type;
}

export class RateLimiterConfig extends S.Class<RateLimiterConfig>($I`RateLimiterConfig`)(
  {
    /** Maximum requests per minute */
    requestsPerMinute: S.optionalWith(BS.PosInt, {
      default: () => 50,
    }).annotations({
      description: "Maximum requests per minute",
    }),
    /** Maximum tokens per minute */
    tokensPerMinute: S.optionalWith(BS.PosInt, {
      default: () => 100_000,
    }).annotations({
      description: "Maximum tokens per minute",
    }),
    /** Maximum concurrent requests */
    maxConcurrent: S.optionalWith(BS.PosInt, {
      default: () => 5,
    }).annotations({
      description: "Maximum concurrent requests",
    }),
    /** Failures before circuit opens */
    failureThreshold: S.optionalWith(BS.PosInt, {
      default: () => 5,
    }).annotations({
      description: "Failures before circuit opens",
    }),
    /** Recovery timeout in milliseconds */
    recoveryTimeoutMs: S.optionalWith(S.DurationFromMillis, {
      default: () => Duration.millis(120_000),
    }).annotations({
      description: "Recovery timeout in milliseconds",
    }),
    /** Successes in half_open before closing */
    successThreshold: S.optionalWith(BS.PosInt, { default: () => 2 }).annotations({
      description: "Successes in half_open before closing",
    }),
  },
  $I.annotations("RateLimiterConfig", {
    description: "Rate limiter configuration",
  })
) {
  static readonly default = () => new RateLimiterConfig();
}

export declare namespace RateLimiterConfig {
  export type Type = typeof RateLimiterConfig.Type;
}

// =============================================================================
// Service
// =============================================================================

/**
 * Central rate limiting for LLM API calls
 *
 * Provides:
 * - Request and token rate limiting with sliding window
 * - Concurrent request limiting with semaphore
 * - Circuit breaker pattern for cascading failure protection
 */
export interface CentralRateLimiterServiceShape {
  /**
   * Acquire a rate limit permit
   *
   * Checks circuit breaker, rate limits, and acquires semaphore permit.
   * Fails with RateLimitError or CircuitOpenError if limits exceeded.
   *
   * @param estimatedTokens - Estimated tokens for the request
   */
  readonly acquire: (estimatedTokens: number) => Effect.Effect<void, RateLimitError | CircuitOpenError>;

  /**
   * Release permit and update circuit breaker state
   *
   * @param actualTokens - Actual tokens used (for accurate tracking)
   * @param success - Whether the request succeeded
   */
  readonly release: (actualTokens: number, success: boolean) => Effect.Effect<void>;

  /**
   * Get current rate limiter metrics
   */
  readonly getMetrics: () => Effect.Effect<RateLimiterState.Type>;

  /**
   * Get time until rate limit resets
   *
   * @returns Milliseconds until counters reset
   */
  readonly getResetTime: () => Effect.Effect<number>;

  /**
   * Force circuit breaker state (for testing/recovery)
   *
   * @param state - New circuit state
   */
  readonly setCircuitState: (state: CircuitState.Type) => Effect.Effect<void>;
}

export class CentralRateLimiterService extends Context.Tag($I`CentralRateLimiterService`)<
  CentralRateLimiterService,
  CentralRateLimiterServiceShape
>() {}

// =============================================================================
// Helpers
// =============================================================================

/**
 * Compute elapsed milliseconds between lastReset and now as a Duration.
 */
const elapsedSinceReset = (nowUtc: DateTime.Utc, lastReset: DateTime.Utc): Duration.Duration =>
  Duration.millis(DateTime.distance(lastReset, nowUtc));

/**
 * Compute ms until the next minute window reset.
 */
const msUntilNextReset = (nowUtc: DateTime.Utc, lastReset: DateTime.Utc): Duration.Duration => {
  const elapsed = elapsedSinceReset(nowUtc, lastReset);
  return Duration.subtract(Duration.minutes(1), elapsed);
};

// =============================================================================
// Implementation
// =============================================================================

export const make = Effect.fn(
  function* (config: RateLimiterConfig = RateLimiterConfig.default()) {
    const initialTime = yield* Clock.currentTimeMillis;
    const lastReset = yield* S.decode(S.DateTimeUtcFromNumber)(Number(initialTime));
    const state = yield* Ref.make<RateLimiterState.Type>({
      requestsThisMinute: 0,
      tokensThisMinute: 0,
      lastReset,
      circuitState: "closed",
      failureCount: 0,
      successCount: 0,
    });

    const semaphore = yield* Effect.makeSemaphore(config.maxConcurrent);

    /**
     * Reset counters if minute has elapsed
     */
    const maybeResetCounters = Effect.fn(function* (nowUtc: DateTime.Utc) {
      return yield* Ref.update(state, (s) =>
        Bool.match(Duration.greaterThan(elapsedSinceReset(nowUtc, s.lastReset), Duration.minutes(1)), {
          onTrue: () => ({ ...s, requestsThisMinute: 0, tokensThisMinute: 0, lastReset: nowUtc }),
          onFalse: () => s,
        })
      );
    });

    /**
     * Check rate limits after counter reset, fail if limits are exceeded.
     */
    const checkRateLimits = Effect.fn(function* (nowUtc: DateTime.Utc, estimatedTokens: number) {
      const current = yield* Ref.get(state);

      if (current.requestsThisMinute >= config.requestsPerMinute) {
        return yield* new RateLimitError({
          reason: "requests",
          retryAfterMs: msUntilNextReset(nowUtc, current.lastReset),
        });
      }

      if (current.tokensThisMinute + estimatedTokens > config.tokensPerMinute) {
        return yield* new RateLimitError({
          reason: "tokens",
          retryAfterMs: msUntilNextReset(nowUtc, current.lastReset),
        });
      }
    });

    /**
     * Acquire semaphore and increment counters.
     */
    const acquirePermit = Effect.fn(function* (estimatedTokens: number) {
      yield* semaphore.take(1);

      yield* Ref.update(state, (s) => ({
        ...s,
        requestsThisMinute: s.requestsThisMinute + 1,
        tokensThisMinute: s.tokensThisMinute + estimatedTokens,
      }));
    });

    // ---------------------------------------------------------------------------
    // acquire: handles all three circuit states
    // ---------------------------------------------------------------------------
    const acquire = Effect.fn(
      function* (estimatedTokens: number) {
        const nowUtc = yield* Clock.currentTimeMillis.pipe(Effect.flatMap(S.decode(S.DateTimeUtcFromNumber)));
        const current = yield* Ref.get(state);

        yield* Match.value(current.circuitState).pipe(
          // -- Closed: normal operation - check limits, acquire, increment --
          Match.when("closed", () =>
            Effect.gen(function* () {
              yield* maybeResetCounters(nowUtc);
              yield* checkRateLimits(nowUtc, estimatedTokens);
              yield* acquirePermit(estimatedTokens);
            })
          ),
          // -- Open: check recovery timeout, transition to HalfOpen or fail --
          Match.when("open", () =>
            Effect.gen(function* () {
              const elapsed = elapsedSinceReset(nowUtc, current.lastReset);
              if (Duration.lessThan(elapsed, config.recoveryTimeoutMs)) {
                return yield* new CircuitOpenError({
                  resetTimeoutMs: config.recoveryTimeoutMs,
                  retryAfterMs: Duration.subtract(config.recoveryTimeoutMs, elapsed),
                });
              }
              // Recovery timeout elapsed -- transition to HalfOpen
              yield* Ref.update(
                state,
                (s) =>
                  new HalfOpen({
                    ...Struct.omit(s, "circuitState"),
                  })
              );
              yield* maybeResetCounters(nowUtc);
              yield* checkRateLimits(nowUtc, estimatedTokens);
              yield* acquirePermit(estimatedTokens);
            })
          ),
          // -- HalfOpen: allow probe request through --
          Match.when("half_open", () =>
            Effect.gen(function* () {
              yield* maybeResetCounters(nowUtc);
              yield* checkRateLimits(nowUtc, estimatedTokens);
              yield* acquirePermit(estimatedTokens);
            })
          ),
          Match.exhaustive
        );
      },
      Effect.catchTag("ParseError", Effect.die)
    );

    // ---------------------------------------------------------------------------
    // release: update circuit breaker state based on success/failure
    // ---------------------------------------------------------------------------
    const release = Effect.fn(function* (_actualTokens: number, success: boolean) {
      yield* semaphore.release(1);

      const now = yield* DateTime.now;

      yield* Ref.update(state, (s) => {
        if (success) {
          const newSuccessCount = s.successCount + 1;
          // HalfOpen + enough successes -> transition to Closed
          if (P.isTagged(s, "half_open") && newSuccessCount >= config.successThreshold) {
            return new Closed({
              ...Struct.omit(s, "circuitState"),
              successCount: newSuccessCount,
              failureCount: 0,
            });
          }
          return Match.value(s).pipe(
            Match.discriminatorsExhaustive("circuitState")({
              closed: ({ circuitState: _, ...rest }) =>
                new Closed({ ...rest, successCount: newSuccessCount, failureCount: 0 }),
              open: ({ circuitState: _, ...rest }) =>
                new Open({ ...rest, successCount: newSuccessCount, failureCount: 0 }),
              half_open: ({ circuitState: _, ...rest }) =>
                new HalfOpen({ ...rest, successCount: newSuccessCount, failureCount: 0 }),
            })
          );
        }

        const newFailureCount = s.failureCount + 1;
        const shouldOpen = newFailureCount >= config.failureThreshold;
        if (shouldOpen) {
          return new Open({
            ...Struct.omit(s, "circuitState"),
            failureCount: newFailureCount,
            successCount: 0,
            lastReset: now,
          });
        }

        return Match.value(s).pipe(
          Match.discriminatorsExhaustive("circuitState")({
            closed: ({ circuitState: _, ...rest }) =>
              new Closed({ ...rest, failureCount: newFailureCount, successCount: 0 }),
            open: ({ circuitState: _, ...rest }) =>
              new Open({ ...rest, failureCount: newFailureCount, successCount: 0 }),
            half_open: ({ circuitState: _, ...rest }) =>
              new HalfOpen({ ...rest, failureCount: newFailureCount, successCount: 0 }),
          })
        );
      });
    });

    const getMetrics = () => Ref.get(state);

    const getResetTime = Effect.fn(
      function* () {
        const s = yield* Ref.get(state);
        const nowUtc = yield* Clock.currentTimeMillis.pipe(Effect.flatMap(S.decode(S.DateTimeUtcFromNumber)));
        const elapsedMs = DateTime.distance(s.lastReset, nowUtc);
        return Num.max(0, 60_000 - elapsedMs);
      },
      Effect.catchTag("ParseError", Effect.die)
    );

    const setCircuitState = Effect.fn(function* (circuitState: CircuitState.Type) {
      return yield* Ref.update(state, (s) => {
        const common = {
          ...Struct.omit(s, "circuitState"),
          failureCount: s.failureCount,
          successCount: s.successCount,
        };
        return Match.value(circuitState).pipe(
          Match.when(
            CircuitState.Enum.closed,
            () =>
              new Closed({
                ...common,
                failureCount: 0,
                successCount: 0,
              })
          ),
          Match.when(CircuitState.Enum.open, () => new Open(common)),
          Match.when(CircuitState.Enum.half_open, () => new HalfOpen(common)),
          Match.exhaustive
        );
      });
    });

    return {
      acquire,
      release,
      getMetrics,
      getResetTime,
      setCircuitState,
    };
  },
  Effect.catchTags({
    ParseError: Effect.die,
  })
);

// =============================================================================
// withRateLimiting utility
// =============================================================================

/**
 * Wrap an Effect with rate limiting and circuit breaker protection.
 *
 * Automatically acquires before execution and releases after (on both
 * success and error paths). The semaphore permit is always returned.
 */
export const withRateLimiting = <A, E, R>(
  effect: Effect.Effect<A, E, R>,
  estimatedTokens = 1000
): Effect.Effect<A, E | RateLimitError | CircuitOpenError, R | CentralRateLimiterService> =>
  Effect.gen(function* () {
    const limiter = yield* CentralRateLimiterService;
    yield* limiter.acquire(estimatedTokens);
    return yield* Effect.onExit(effect, (exit) =>
      Match.value(exit).pipe(
        Match.tag("Success", () => limiter.release(0, true)),
        Match.tag("Failure", () => limiter.release(0, false)),
        Match.exhaustive
      )
    );
  }).pipe(
    Effect.withSpan("withRateLimiting", {
      captureStackTrace: false,
      attributes: { estimatedTokens },
    })
  );

// =============================================================================
// Layers
// =============================================================================

/**
 * Default layer providing CentralRateLimiterService
 */
export const CentralRateLimiterServiceLive = Layer.effect(CentralRateLimiterService, make());

/**
 * Test layer with configurable limits (useful for faster tests)
 */
export const CentralRateLimiterServiceTest = (
  overrides: Partial<RateLimiterConfig> = {}
): Layer.Layer<CentralRateLimiterService> =>
  Layer.effect(CentralRateLimiterService, make({ ...RateLimiterConfig.default(), ...overrides }));
