/**
 * CLI: Error Handler
 *
 * Provides consistent error formatting and handling for CLI commands.
 *
 * @since 2.0.0
 * @module Cli/ErrorHandler
 */

import { Cause, Chunk, Console, Effect } from "effect"

/**
 * Format a cause into a human-readable error message
 */
const formatCause = (cause: Cause.Cause<unknown>): string | null => {
  if (Cause.isEmpty(cause)) return null

  // Get the first failure
  const failures = Cause.failures(cause)
  const firstFailure = Chunk.head(failures)
  if (firstFailure._tag === "Some") {
    const error = firstFailure.value
    if (error instanceof Error) {
      return `Error: ${error.message}`
    }
    if (typeof error === "object" && error !== null && "message" in error) {
      return `Error: ${(error as { message: string }).message}`
    }
    return `Error: ${String(error)}`
  }

  // Check for defects
  const defects = Cause.defects(cause)
  const firstDefect = Chunk.head(defects)
  if (firstDefect._tag === "Some") {
    const defect = firstDefect.value
    if (defect instanceof Error) {
      return `Fatal: ${defect.message}`
    }
    return `Fatal: ${String(defect)}`
  }

  return Cause.pretty(cause)
}

/**
 * Wrap an effect with error handling for CLI output
 *
 * @param effect - The effect to wrap
 * @returns The effect with error handler attached
 */
export const withErrorHandler = <A, E, R>(
  effect: Effect.Effect<A, E, R>
): Effect.Effect<A, E, R> =>
  effect.pipe(
    Effect.tapErrorCause((cause) =>
      Effect.gen(function*() {
        const formatted = formatCause(cause)
        if (formatted) {
          yield* Console.error(`\n${formatted}\n`)
        }
      })
    )
  )
