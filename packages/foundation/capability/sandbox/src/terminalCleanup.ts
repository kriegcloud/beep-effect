/**
 * Terminal cleanup helpers for abrupt process exits.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

/**
 * Escape sequence that restores terminal cursor visibility.
 *
 * @example
 * ```ts
 * import { SHOW_CURSOR } from "@beep/sandbox"
 *
 * process.stdout.write(SHOW_CURSOR)
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const SHOW_CURSOR = "\x1b[?25h";

/**
 * Minimal stdin surface required by terminal cleanup.
 *
 * @category models
 * @since 0.0.0
 */
export interface TerminalCleanupStdin {
  readonly isTTY?: boolean;
  readonly setRawMode?: (raw: boolean) => void;
}

/**
 * Minimal stdout surface required by terminal cleanup.
 *
 * @category models
 * @since 0.0.0
 */
export interface TerminalCleanupStdout {
  readonly write: (data: string) => boolean;
}

/**
 * Create a synchronous exit handler that restores terminal state.
 *
 * @example
 * ```ts
 * import { makeTerminalCleanupHandler } from "@beep/sandbox"
 *
 * const handler = makeTerminalCleanupHandler(process.stdin, process.stdout)
 * handler()
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const makeTerminalCleanupHandler =
  (stdin: TerminalCleanupStdin, stdout: TerminalCleanupStdout): (() => void) =>
  () => {
    if (stdin.isTTY === true && stdin.setRawMode !== undefined) {
      try {
        stdin.setRawMode(false);
      } catch {
        // Best-effort cleanup for closed or already-restored stdin.
      }
    }
    stdout.write(SHOW_CURSOR);
  };

/**
 * Register terminal cleanup for process exit.
 *
 * @example
 * ```ts
 * import { setupTerminalCleanup } from "@beep/sandbox"
 *
 * setupTerminalCleanup()
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const setupTerminalCleanup = (): void => {
  process.on("exit", makeTerminalCleanupHandler(process.stdin, process.stdout));
};
