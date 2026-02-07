import type { CircuitOpenError, RateLimitError } from "@beep/knowledge-domain/errors";
import type { LanguageModel } from "@effect/ai";
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
  return !(isTagged(error, "RateLimitError") || isTagged(error, "CircuitOpenError"));
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

export interface LlmFallbackChainOptions<E> {
  /**
   * Whether a given terminal error should trigger fallback at all.
   * Defaults to `true` (fallback is allowed).
   */
  readonly shouldFallback?: (error: LlmResilienceError<E>) => boolean;
  /**
   * Retry budget for the fallback provider. Defaults to 0 to avoid "retry storms".
   */
  readonly maxRetries?: number;
}

/**
 * Runs an LLM operation with `withLlmResilience` against the primary LanguageModel,
 * and (optionally) falls back to a separately-provided `FallbackLanguageModel` once
 * the primary has exhausted retries / reached a terminal condition.
 *
 * Call sites provide an operation builder so the same request can be re-issued
 * against the fallback provider without unsafe casting.
 */
export const withLlmResilienceWithFallback = <A, E, R>(
  primaryModel: LanguageModel.Service,
  fallbackModel: O.Option<LanguageModel.Service>,
  makeOperation: (model: LanguageModel.Service) => Effect.Effect<A, E, R>,
  options: Omit<LlmResilienceOptions<A, E, never>, "recoverWith"> & {
    readonly fallback?: LlmFallbackChainOptions<E>;
  }
): Effect.Effect<A, LlmResilienceError<E>, R> => {
  const { fallback, ...resilience } = options;
  const shouldFallback = fallback?.shouldFallback ?? (() => true);
  const fallbackMaxRetries = fallback?.maxRetries ?? 0;

  return withLlmResilience(makeOperation(primaryModel), {
    ...resilience,
    recoverWith: (error) =>
      O.match(fallbackModel, {
        onNone: () => Effect.fail(error),
        onSome: (backup) => {
          if (!shouldFallback(error)) return Effect.fail(error);
          return Effect.gen(function* () {
            yield* Effect.logWarning("Primary LLM exhausted, falling back to backup provider").pipe(
              Effect.annotateLogs({ stage: resilience.stage })
            );
            return yield* withLlmResilience(makeOperation(backup), {
              ...resilience,
              maxRetries: fallbackMaxRetries,
            });
          });
        },
      }),
  });
};
