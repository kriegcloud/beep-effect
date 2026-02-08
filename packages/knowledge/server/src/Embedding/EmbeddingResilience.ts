import type { CircuitOpenError, RateLimitError } from "@beep/knowledge-domain/errors";
import { thunkEffectVoid } from "@beep/utils";
import type * as EmbeddingModel from "@effect/ai/EmbeddingModel";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import * as F from "effect/Function";
import * as Num from "effect/Number";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import { CentralRateLimiterService } from "../LlmControl/RateLimiter";

export type EmbeddingResilienceError<E> = E | RateLimitError | CircuitOpenError;

export interface EmbeddingResilienceOptions<A, E, R2> {
  readonly estimatedTokens?: undefined | number;
  readonly maxRetries?: undefined | number;
  readonly baseRetryDelay?: undefined | Duration.DurationInput;
  readonly shouldRetry?: undefined | ((error: EmbeddingResilienceError<E>) => boolean);
  readonly onRetry?:
    | undefined
    | ((params: {
        readonly attempt: number;
        readonly maxRetries: number;
        readonly error: EmbeddingResilienceError<E>;
      }) => Effect.Effect<void>);
  /**
   * Extension seam for provider fallback chains.
   *
   * Example: route to backup provider after primary retries are exhausted.
   */
  readonly recoverWith?: (error: EmbeddingResilienceError<E>) => Effect.Effect<A, EmbeddingResilienceError<E>, R2>;
}

const DEFAULT_MAX_RETRIES = 2;
const DEFAULT_ESTIMATED_TOKENS = 1_000;
const DEFAULT_BASE_RETRY_DELAY = Duration.millis(250);

const hasRetryableFlag = (error: unknown): error is { readonly retryable: boolean } =>
  P.isObject(error) &&
  P.isNotNull(error) &&
  P.hasProperty("retryable")(error) &&
  P.struct({
    retryable: P.isBoolean,
  })(error);
const defaultShouldRetry = <E>(error: EmbeddingResilienceError<E>): boolean => {
  if (P.isTagged("RateLimitError")(error) || P.isTagged(error, "CircuitOpenError")) return false;
  // For EmbeddingError (and similar), honor explicit retryability if present.
  if (hasRetryableFlag(error)) return error.retryable;
  return true;
};

const computeDelay = <E>(
  attempt: number,
  baseRetryDelay: Duration.DurationInput,
  error: EmbeddingResilienceError<E>
): Duration.Duration => {
  // We default to not retrying RateLimitError, but keep the delay logic for override scenarios.
  if (P.isTagged(error, "RateLimitError")) {
    const maybeRetryAfter = error.retryAfterMs;
    if (maybeRetryAfter !== undefined) {
      return Duration.decode(maybeRetryAfter);
    }
  }
  return Duration.times(baseRetryDelay, attempt);
};

const withRateLimitingAndCircuit = <A, E, R>(
  effect: Effect.Effect<A, E, R>,
  estimatedTokens: number
): Effect.Effect<A, E | RateLimitError | CircuitOpenError, R | CentralRateLimiterService> =>
  Effect.gen(function* () {
    const limiter = yield* CentralRateLimiterService;
    yield* limiter.acquire(estimatedTokens);
    return yield* Effect.onExit(
      effect,
      Exit.match({
        onSuccess: () => limiter.release(0, true),
        onFailure: () => limiter.release(0, false),
      })
    );
  });

export const withEmbeddingResilience: <A, E, R, R2 = never>(
  effect: Effect.Effect<A, E, R>,
  options: EmbeddingResilienceOptions<A, E, R2>
) => Effect.Effect<A, EmbeddingResilienceError<E>, R | R2 | CentralRateLimiterService> = Effect.fn(function* <
  A,
  E,
  R,
  R2 = never,
>(effect: Effect.Effect<A, E, R>, options: EmbeddingResilienceOptions<A, E, R2>) {
  const estimatedTokens = options.estimatedTokens ?? DEFAULT_ESTIMATED_TOKENS;
  const maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
  const baseRetryDelay = options.baseRetryDelay ?? DEFAULT_BASE_RETRY_DELAY;
  const shouldRetry = options.shouldRetry ?? defaultShouldRetry<E>;

  const runAttempt: (
    attempt: number
  ) => Effect.Effect<A, EmbeddingResilienceError<E>, R | R2 | CentralRateLimiterService> = Effect.fn(function* (
    attempt: number
  ) {
    return yield* withRateLimitingAndCircuit(effect, estimatedTokens).pipe(
      Effect.catchAll((error) =>
        F.pipe(
          attempt,
          O.liftPredicate((u) => Num.lessThanOrEqualTo(maxRetries)(u) && shouldRetry(error)),
          O.match({
            onNone: () => (options.recoverWith !== undefined ? options.recoverWith(error) : Effect.fail(error)),
            onSome: () => {
              const waitFor = computeDelay(attempt, baseRetryDelay, error);
              return F.pipe(
                options.onRetry,
                O.fromNullable,
                O.match({
                  onNone: thunkEffectVoid,
                  onSome: (onRetry) => onRetry({ attempt, maxRetries, error }),
                }),
                Effect.andThen(() => Effect.sleep(waitFor)),
                Effect.andThen(() => runAttempt(attempt + 1))
              );
            },
          })
        )
      )
    );
  });
  return yield* runAttempt(1);
});

export interface EmbeddingFallbackChainOptions<E> {
  /**
   * Whether a given terminal error should trigger fallback at all.
   *
   * Defaults to `false` for global control-plane failures (rate limit / circuit),
   * and `true` otherwise.
   *
   * Note: this repo's circuit breaker is currently centralized (via
   * CentralRateLimiterService), not per embedding provider. Falling back to
   * another provider cannot bypass a central circuit open condition.
   */
  readonly shouldFallback?: undefined | ((error: EmbeddingResilienceError<E>) => boolean);
  /**
   * Retry budget for the fallback provider. Defaults to 0 to avoid "retry storms".
   */
  readonly maxRetries?: undefined | number;
}

/**
 * Run an embedding operation with retry + circuit protection against a primary
 * EmbeddingModel, and (optionally) fall back to a separately-provided backup
 * model once the primary has exhausted its retries or hit a terminal condition.
 */
export const withEmbeddingResilienceWithFallback: <A, E, R>(
  primaryModel: EmbeddingModel.Service,
  fallbackModel: O.Option<EmbeddingModel.Service>,
  makeOperation: (model: EmbeddingModel.Service) => Effect.Effect<A, E, R>,
  options: Omit<EmbeddingResilienceOptions<A, E, never>, "recoverWith"> & {
    readonly fallback?: undefined | EmbeddingFallbackChainOptions<E>;
  }
) => Effect.Effect<A, EmbeddingResilienceError<E>, R | CentralRateLimiterService> = Effect.fn(function* <A, E, R>(
  primaryModel: EmbeddingModel.Service,
  fallbackModel: O.Option<EmbeddingModel.Service>,
  makeOperation: (model: EmbeddingModel.Service) => Effect.Effect<A, E, R>,
  options: Omit<EmbeddingResilienceOptions<A, E, never>, "recoverWith"> & {
    readonly fallback?: undefined | EmbeddingFallbackChainOptions<E>;
  }
) {
  const { fallback, ...resilience } = options;
  const shouldFallback =
    fallback?.shouldFallback ??
    ((error: EmbeddingResilienceError<E>) =>
      !(P.isTagged(error, "RateLimitError") || P.isTagged(error, "CircuitOpenError")));
  const fallbackMaxRetries = fallback?.maxRetries ?? 0;

  return yield* withEmbeddingResilience(makeOperation(primaryModel), {
    ...resilience,
    recoverWith: (error) =>
      O.match(fallbackModel, {
        onNone: () => Effect.fail(error),
        onSome: Effect.fn(function* (backup) {
          if (!shouldFallback(error)) return yield* Effect.fail(error);
          yield* Effect.logWarning("Primary embedding model exhausted, falling back to backup provider");
          return yield* withEmbeddingResilience(makeOperation(backup), {
            ...resilience,
            maxRetries: fallbackMaxRetries,
          });
        }),
      }),
  });
});
