/**
 * Shared terminal printer helpers for repo-cli command adapters.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { Console, Effect } from "effect";

/**
 * Print each line in order.
 *
 * @example
 * ```ts
 * import { printLines } from "@beep/repo-cli/internal/cli/Printer"
 *
 * const program = printLines(["one", "two"])
 *
 * void program
 * ```
 * @category rendering
 * @since 0.0.0
 */
export const printLines = Effect.fn("RepoCli.Printer.printLines")(function* (
  lines: ReadonlyArray<string>
): Effect.fn.Return<void> {
  yield* Effect.forEach(lines, Console.log, { discard: true });
});
