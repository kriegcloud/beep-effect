/**
 * @file Error handling utilities for docgen CLI.
 *
 * Provides error accumulation, retry policies, and formatting.
 *
 * @module docgen/shared/error-handling
 * @since 1.0.0
 */

import * as A from "effect/Array";
import * as Cause from "effect/Cause";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as Ref from "effect/Ref";
import * as Schedule from "effect/Schedule";

// -----------------------------------------------------------------------------
// Error Accumulator
// -----------------------------------------------------------------------------

/**
 * Result of a batch operation with error accumulation.
 *
 * Tracks successful and failed operations along with collected errors.
 * Use with {@link accumulateErrors} to process items with partial success.
 *
 * @example
 * ```ts
 * import type { BatchResult } from "@beep/repo-cli/commands/docgen/shared/error-handling"
 * import * as A from "effect/Array"
 * import * as F from "effect/Function"
 *
 * // Type annotation for batch result
 * const result: BatchResult<Error> = {
 *   succeeded: 5,
 *   failed: 2,
 *   errors: [new Error("Error 1"), new Error("Error 2")]
 * }
 *
 * // Check if any operations failed
 * const hasFailures = result.failed > 0
 *
 * // Extract error messages
 * const messages = F.pipe(
 *   result.errors,
 *   A.map((e) => e.message)
 * )
 * ```
 *
 * @since 0.1.0
 * @category models
 */
export interface BatchResult<E> {
  readonly succeeded: number;
  readonly failed: number;
  readonly errors: ReadonlyArray<E>;
}

/**
 * Accumulates errors from batch operations.
 *
 * Provides stateful error collection with methods to add, retrieve, and inspect
 * accumulated errors. Create instances with {@link makeErrorAccumulator}.
 *
 * @example
 * ```ts
 * import { makeErrorAccumulator } from "@beep/repo-cli/commands/docgen/shared/error-handling"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const accumulator = yield* makeErrorAccumulator<Error>()
 *
 *   // Add errors
 *   yield* accumulator.add(new Error("Failed to process file 1"))
 *   yield* accumulator.add(new Error("Failed to process file 2"))
 *
 *   // Check if errors exist
 *   const hasErrors = yield* accumulator.hasErrors
 *   console.log(hasErrors) // true
 *
 *   // Get error count
 *   const count = yield* accumulator.count
 *   console.log(count) // 2
 *
 *   // Retrieve all errors
 *   const errors = yield* accumulator.getErrors
 *   return errors
 * })
 * ```
 *
 * @since 0.1.0
 * @category models
 */
export interface ErrorAccumulator<E> {
  readonly add: (error: E) => Effect.Effect<void>;
  readonly getErrors: Effect.Effect<ReadonlyArray<E>>;
  readonly hasErrors: Effect.Effect<boolean>;
  readonly count: Effect.Effect<number>;
}

/**
 * Create a new error accumulator.
 *
 * Returns an {@link ErrorAccumulator} instance for collecting errors during
 * batch operations. Use with {@link accumulateErrors} for processing items
 * where partial success is acceptable.
 *
 * @example
 * ```ts
 * import { makeErrorAccumulator } from "@beep/repo-cli/commands/docgen/shared/error-handling"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const accumulator = yield* makeErrorAccumulator<Error>()
 *
 *   yield* accumulator.add(new Error("First error"))
 *   yield* accumulator.add(new Error("Second error"))
 *
 *   const count = yield* accumulator.count
 *   console.log(count) // 2
 *
 *   const allErrors = yield* accumulator.getErrors
 *   return allErrors
 * })
 * ```
 *
 * @since 0.1.0
 * @category constructors
 */
export const makeErrorAccumulator = <E>(): Effect.Effect<ErrorAccumulator<E>> =>
  Effect.gen(function* () {
    const errorsRef = yield* Ref.make<ReadonlyArray<E>>(A.empty());

    return {
      add: (error: E) => Ref.update(errorsRef, A.append(error)),
      getErrors: Ref.get(errorsRef),
      hasErrors: F.pipe(Ref.get(errorsRef), Effect.map(A.isNonEmptyReadonlyArray)),
      count: F.pipe(Ref.get(errorsRef), Effect.map(A.length)),
    };
  });

/**
 * Process items with error accumulation.
 *
 * Collects all errors instead of failing on first.
 * Use for batch operations where partial success is acceptable.
 *
 * @example
 * ```ts
 * import { accumulateErrors } from "@beep/repo-cli/commands/docgen/shared/error-handling"
 * import * as Effect from "effect/Effect"
 * import * as A from "effect/Array"
 * import * as F from "effect/Function"
 *
 * const result = yield* accumulateErrors(
 *   packages,
 *   (pkg) => processPackage(pkg),
 *   { concurrency: 4 }
 * )
 *
 * if (result.failed > 0) {
 *   yield* Effect.logWarning(`${result.failed} packages failed`)
 *   const errorTags = F.pipe(result.errors, A.map((e) => e._tag))
 *   yield* Effect.logDebug("Error tags", { errorTags })
 * }
 * ```
 *
 * @since 0.1.0
 * @category combinators
 */
export const accumulateErrors = <A, B, E, R>(
  items: ReadonlyArray<A>,
  process: (item: A) => Effect.Effect<B, E, R>,
  options?: { readonly concurrency?: number }
): Effect.Effect<BatchResult<E>, never, R> =>
  Effect.gen(function* () {
    const accumulator = yield* makeErrorAccumulator<E>();
    const successCountRef = yield* Ref.make(0);

    yield* Effect.forEach(
      items,
      (item) =>
        F.pipe(
          process(item),
          Effect.tap(() => Ref.update(successCountRef, (n) => n + 1)),
          Effect.catchAll((e) => accumulator.add(e))
        ),
      { concurrency: options?.concurrency ?? 1 }
    );

    const errors = yield* accumulator.getErrors;
    const succeeded = yield* Ref.get(successCountRef);

    return {
      succeeded,
      failed: A.length(errors),
      errors,
    };
  });

// -----------------------------------------------------------------------------
// Retry Policies
// -----------------------------------------------------------------------------

/**
 * Retry policy for API calls.
 *
 * Implements exponential backoff starting at 100ms with a maximum of 3 retries.
 * Logs each retry attempt for debugging. Use with {@link withApiRetry} for
 * convenient error handling.
 *
 * @example
 * ```ts
 * import { apiRetrySchedule } from "@beep/repo-cli/commands/docgen/shared/error-handling"
 * import * as Effect from "effect/Effect"
 *
 * const fetchData = Effect.tryPromise(() => fetch("/api/data"))
 *
 * const program = fetchData.pipe(
 *   Effect.retry(apiRetrySchedule)
 * )
 * ```
 *
 * @since 0.1.0
 * @category utilities
 */
export const apiRetrySchedule = F.pipe(
  Schedule.exponential(Duration.millis(100)),
  Schedule.intersect(Schedule.recurs(3)),
  Schedule.tapOutput(([, attempt]) => Effect.logDebug("Retrying API call", { attempt }))
);

/**
 * Wrap an effect with API retry logic.
 *
 * Automatically retries failed API calls using {@link apiRetrySchedule} and
 * logs errors when all retries are exhausted. Simplifies error handling for
 * network requests.
 *
 * @example
 * ```ts
 * import { withApiRetry } from "@beep/repo-cli/commands/docgen/shared/error-handling"
 * import * as Effect from "effect/Effect"
 *
 * const fetchUser = (id: string) =>
 *   Effect.tryPromise(() => fetch(`/api/users/${id}`))
 *
 * const program = Effect.gen(function* () {
 *   const response = yield* withApiRetry(fetchUser("123"))
 *   return response
 * })
 * ```
 *
 * @since 0.1.0
 * @category combinators
 */
export const withApiRetry = <A, E, R>(effect: Effect.Effect<A, E, R>): Effect.Effect<A, E, R> =>
  F.pipe(
    effect,
    Effect.retry(apiRetrySchedule),
    Effect.tapError((e) => Effect.logError("API call failed after retries", { error: String(e) }))
  );

// -----------------------------------------------------------------------------
// Error Formatting
// -----------------------------------------------------------------------------

/**
 * Format a Cause for display.
 *
 * Converts an Effect Cause into a human-readable string with full chain
 * information and indentation. Useful for debugging and error reporting.
 *
 * @example
 * ```ts
 * import { formatCause } from "@beep/repo-cli/commands/docgen/shared/error-handling"
 * import * as Effect from "effect/Effect"
 * import * as Cause from "effect/Cause"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* myEffect.pipe(
 *     Effect.sandbox,
 *     Effect.catchAll((cause) =>
 *       Effect.gen(function* () {
 *         const formatted = formatCause(cause)
 *         yield* Effect.logError(formatted)
 *         return yield* Effect.fail(cause)
 *       })
 *     )
 *   )
 *   return result
 * })
 * ```
 *
 * @since 0.1.0
 * @category utilities
 */
export const formatCause = <E>(cause: Cause.Cause<E>): string => Cause.pretty(cause);

/**
 * Extract error summary from a Cause.
 *
 * Returns just the primary error message without the full chain.
 * Returns None if the cause contains no failure.
 *
 * @example
 * ```ts
 * import { causeMessage } from "@beep/repo-cli/commands/docgen/shared/error-handling"
 * import * as Effect from "effect/Effect"
 * import * as O from "effect/Option"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* myEffect.pipe(
 *     Effect.sandbox,
 *     Effect.catchAll((cause) =>
 *       Effect.gen(function* () {
 *         const message = causeMessage(cause)
 *         if (O.isSome(message)) {
 *           yield* Effect.logError(message.value)
 *         }
 *         return yield* Effect.fail(cause)
 *       })
 *     )
 *   )
 *   return result
 * })
 * ```
 *
 * @since 0.1.0
 * @category utilities
 */
export const causeMessage = <E>(cause: Cause.Cause<E>): O.Option<string> =>
  F.pipe(
    Cause.failureOption(cause),
    O.map((e) => {
      if (P.isObject(e) && P.hasProperty(e, "message")) {
        return String((e as { message: unknown }).message);
      }
      return String(e);
    })
  );

/**
 * Format batch result for display.
 *
 * Converts a {@link BatchResult} into a human-readable summary string showing
 * success rate and failure count. Useful for logging batch operation results.
 *
 * @example
 * ```ts
 * import { formatBatchResult, accumulateErrors } from "@beep/repo-cli/commands/docgen/shared/error-handling"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* accumulateErrors(
 *     items,
 *     (item) => processItem(item)
 *   )
 *
 *   const summary = formatBatchResult(result)
 *   yield* Effect.log(summary)
 *   // Logs: "5/7 succeeded (71%), 2 failed"
 * })
 * ```
 *
 * @since 0.1.0
 * @category utilities
 */
export const formatBatchResult = <E>(result: BatchResult<E>): string => {
  const total = result.succeeded + result.failed;
  const successRate = total > 0 ? Math.round((result.succeeded / total) * 100) : 100;

  const parts = F.pipe(
    [`${result.succeeded}/${total} succeeded (${successRate}%)`, result.failed > 0 ? `${result.failed} failed` : null],
    A.filter(P.isNotNull)
  );

  return A.join(parts, ", ");
};
