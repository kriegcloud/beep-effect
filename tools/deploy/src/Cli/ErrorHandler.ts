/**
 * CLI Error Handler
 *
 * Provides consistent error handling for all CLI commands.
 * Catches errors, formats them for display, and sets appropriate exit codes.
 *
 * @since 1.0.0
 * @module Cli/ErrorHandler
 */

import { Cause, Console, Effect, FiberId } from "effect"

// =============================================================================
// Helpers
// =============================================================================

/**
 * Truncate a string with ellipsis
 */
const truncate = (str: string, maxLen: number): string => str.length > maxLen ? `${str.slice(0, maxLen)}...` : str

/**
 * Format any error for display
 */
const formatError = (error: unknown): string => {
  // Handle tagged errors with common properties
  if (typeof error === "object" && error !== null) {
    const e = error as Record<string, unknown>

    // Check for _tag (Effect tagged errors)
    if (typeof e._tag === "string") {
      const lines: Array<string> = []

      lines.push(`✗ ${e._tag}: ${e.message ?? "Unknown error"}`)

      if (typeof e.command === "string") {
        lines.push(`  Command: ${e.command}`)
      }

      if (typeof e.exitCode === "number") {
        lines.push(`  Exit code: ${e.exitCode}`)
      }

      if (typeof e.stderr === "string" && e.stderr) {
        lines.push(`  Output:`)
        const stderrLines = truncate(e.stderr, 500).split("\n")
        for (const line of stderrLines) {
          lines.push(`    ${line}`)
        }
      }

      if (typeof e.field === "string") {
        lines.push(`  Field: ${e.field}`)
      }

      if (typeof e.filePath === "string") {
        lines.push(`  File: ${e.filePath}`)
      }

      if (typeof e.environment === "string") {
        lines.push(`  Environment: ${e.environment}`)
      }

      return lines.join("\n")
    }

    // Standard Error
    if (error instanceof Error) {
      return `✗ Error: ${error.message}`
    }
  }

  return `✗ Error: ${String(error)}`
}

/**
 * Format a Cause for CLI display
 */
const formatCause = <E>(cause: Cause.Cause<E>): string =>
  Cause.match(cause, {
    onEmpty: "",
    onFail: (error) => formatError(error),
    onDie: (defect) => {
      const msg = defect instanceof Error ? defect.message : String(defect)
      return `✗ Unexpected error: ${msg}`
    },
    onInterrupt: (fiberId) => `⚠ Operation interrupted (fiber: ${FiberId.threadName(fiberId)})`,
    onSequential: (left, right) => [left, right].filter(Boolean).join("\n\n"),
    onParallel: (left, right) => [left, right].filter(Boolean).join("\n\n")
  })

// =============================================================================
// Error Handler
// =============================================================================

/**
 * Wrap a command effect with consistent error handling.
 *
 * - Formats errors using Cause for structured output
 * - Logs debug info for troubleshooting
 *
 * @example
 * ```ts
 * const myCommand = Command.make("foo", {}, () =>
 *   Effect.gen(function* () {
 *     // command logic
 *   }).pipe(withErrorHandler)
 * )
 * ```
 */
export const withErrorHandler = <A, E, R>(
  effect: Effect.Effect<A, E, R>
): Effect.Effect<A, E, R> =>
  effect.pipe(
    // Tap into errors for display (doesn't change the effect)
    Effect.tapErrorCause((cause) =>
      Effect.gen(function*() {
        // Format and display the error
        const formatted = formatCause(cause)
        if (formatted) {
          yield* Console.error(`\n${formatted}\n`)
        }
      })
    )
  )

/**
 * Create a success message handler
 */
export const withSuccessMessage =
  (message: string) => <A, E, R>(effect: Effect.Effect<A, E, R>): Effect.Effect<A, E, R> =>
    effect.pipe(Effect.tap(() => Console.log(`\n${message}\n`)))
