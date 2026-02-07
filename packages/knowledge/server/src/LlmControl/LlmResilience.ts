import type { CircuitOpenError, RateLimitError } from "@beep/knowledge-domain/errors";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Match from "effect/Match";
import * as O from "effect/Option";
import { CentralRateLimiterService } from "./RateLimiter";
import { StageTimeoutService, type TimeoutError } from "./StageTimeout";

export type LlmResilienceError<E> = E | RateLimitError | CircuitOpenError | TimeoutError;

export interface LlmResilienceOptions<A, E, R2> {
  readonly stage:
    | "chunking"
    | "entity_extraction"
    | "relation_extraction"
    | "grounding"
    | "entity_verification"
    | "serialization";
  readonly estimatedTokens?: number;
  readonly maxRetries?: number;
  readonly baseRetryDelay?: Duration.DurationInput;
  readonly shouldRetry?: (error: LlmResilienceError<E>) => boolean;
  readonly onRetry?: (params: {
    readonly attempt: number;
    readonly maxRetries: number;
    readonly error: LlmResilienceError<E>;
  }) => Effect.Effect<void>;
  /**
   * Extension seam for provider fallback chains.
   *
   * Example: route to backup provider after primary retries are exhausted.
   */
  readonly recoverWith?: (error: LlmResilienceError<E>) => Effect.Effect<A, LlmResilienceError<E>, R2>;
}

const DEFAULT_MAX_RETRIES = 2;
const DEFAULT_ESTIMATED_TOKENS = 1_000;
const DEFAULT_BASE_RETRY_DELAY = Duration.millis(250);

const isTagged = (error: unknown, tag: string): boolean =>
  typeof error === "object" && error !== null && "_tag" in error && (error as { readonly _tag: unknown })._tag === tag;

const defaultShouldRetry = <E>(error: LlmResilienceError<E>): boolean => {
  if (isTagged(error, "RateLimitError") || isTagged(error, "CircuitOpenError")) {
    return false;
  }
  return true;
};

const computeDelay = <E>(
  attempt: number,
  baseRetryDelay: Duration.DurationInput,
  error: LlmResilienceError<E>
): Duration.Duration => {
  if (isTagged(error, "RateLimitError")) {
    const maybeRetryAfter = (error as { readonly retryAfterMs?: Duration.DurationInput }).retryAfterMs;
    if (maybeRetryAfter !== undefined) {
      return Duration.decode(maybeRetryAfter);
    }
  }
  return Duration.times(baseRetryDelay, attempt);
};

export const withLlmResilience = <A, E, R, R2 = never>(
  effect: Effect.Effect<A, E, R>,
  options: LlmResilienceOptions<A, E, R2>
): Effect.Effect<A, LlmResilienceError<E>, R | R2> =>
  Effect.gen(function* () {
    const maybeStageTimeout = yield* Effect.serviceOption(StageTimeoutService);
    const maybeRateLimiter = yield* Effect.serviceOption(CentralRateLimiterService);
    const estimatedTokens = options.estimatedTokens ?? DEFAULT_ESTIMATED_TOKENS;
    const maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
    const baseRetryDelay = options.baseRetryDelay ?? DEFAULT_BASE_RETRY_DELAY;
    const shouldRetry = options.shouldRetry ?? defaultShouldRetry<E>;

    const withOptionalRateLimit = <A2, E2>(
      operation: Effect.Effect<A2, E2, R>
    ): Effect.Effect<A2, E2 | LlmResilienceError<E>, R> =>
      O.match(maybeRateLimiter, {
        onNone: () => operation,
        onSome: (limiter) =>
          Effect.gen(function* () {
            yield* limiter.acquire(estimatedTokens);
            return yield* Effect.onExit(operation, (exit) =>
              Match.value(exit).pipe(
                Match.tag("Success", () => limiter.release(0, true)),
                Match.tag("Failure", () => limiter.release(0, false)),
                Match.exhaustive
              )
            );
          }),
      });

    const withOptionalTimeout = <A2, E2, R3>(
      operation: Effect.Effect<A2, E2, R3>
    ): Effect.Effect<A2, E2 | TimeoutError, R3> =>
      O.match(maybeStageTimeout, {
        onNone: () => operation,
        onSome: (timeout) => timeout.withTimeout(options.stage, operation),
      });

    const runAttempt = (attempt: number): Effect.Effect<A, LlmResilienceError<E>, R | R2> =>
      withOptionalTimeout(withOptionalRateLimit(effect)).pipe(
        Effect.catchAll((error) => {
          const canRetry = attempt <= maxRetries && shouldRetry(error);
          if (!canRetry) {
            return options.recoverWith !== undefined ? options.recoverWith(error) : Effect.fail(error);
          }

          const waitFor = computeDelay(attempt, baseRetryDelay, error);
          return Effect.gen(function* () {
            if (options.onRetry !== undefined) {
              yield* options.onRetry({ attempt, maxRetries, error });
            }
            yield* Effect.sleep(waitFor);
            return yield* runAttempt(attempt + 1);
          });
        })
      );

    return yield* runAttempt(1);
  });
