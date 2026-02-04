/**
 * Runtime: LLM Semaphore for Concurrency Control
 *
 * Provides fine-grained concurrency control for LLM API calls.
 * Complements rate limiting with connection-level limits.
 *
 * @since 2.0.0
 * @module Runtime/LlmSemaphore
 */

import { Data, Duration, Effect } from "effect"
import { ConfigService } from "../Service/Config.js"

/**
 * Error thrown when semaphore permit acquisition times out
 *
 * @since 2.0.0
 * @category Errors
 */
export class SemaphoreTimeoutError extends Data.TaggedError("SemaphoreTimeoutError")<{
  readonly message: string
  readonly waitDuration: Duration.Duration
}> {}

/**
 * LlmSemaphoreService - Concurrency control for LLM calls
 *
 * Use this to wrap LLM calls for fine-grained concurrency control.
 * Works in conjunction with rate limiting.
 *
 * @example
 * ```
 *
 * @since 2.0.0
 * @category Services
 */
export class LlmSemaphoreService extends Effect.Service<LlmSemaphoreService>()("@core-v2/Runtime/LlmSemaphore", {
  effect: Effect.gen(function*() {
    const config = yield* ConfigService
    const limit = config.runtime.llmConcurrencyLimit

    const semaphore = yield* Effect.makeSemaphore(limit)

    yield* Effect.logInfo("LLM semaphore initialized", {
      concurrencyLimit: limit
    })

    // Timeout for permit acquisition - prevents deadlock if permits never released
    const permitTimeout = Duration.minutes(5)

    return {
      /**
       * Execute effect with semaphore permit
       *
       * Acquires a permit before execution and releases after.
       * Times out if permit acquisition takes longer than 5 minutes.
       *
       * @throws SemaphoreTimeoutError if permit acquisition times out
       */
      withPermit: <A, E, R>(
        effect: Effect.Effect<A, E, R>
      ): Effect.Effect<A, E | SemaphoreTimeoutError, R> =>
        semaphore.withPermits(1)(effect).pipe(
          Effect.timeoutFail({
            duration: permitTimeout,
            onTimeout: () =>
              new SemaphoreTimeoutError({
                message: `LLM semaphore permit acquisition timed out after ${Duration.toMillis(permitTimeout)}ms`,
                waitDuration: permitTimeout
              })
          })
        ),

      /**
       * Get number of available permits
       */
      availablePermits: (): Effect.Effect<number> => Effect.sync(() => limit), // Semaphore doesn't expose available, return max

      /**
       * Get the concurrency limit
       */
      limit: (): number => limit
    }
  }),
  dependencies: [
    // ConfigService provided by parent scope
  ]
}) {}
