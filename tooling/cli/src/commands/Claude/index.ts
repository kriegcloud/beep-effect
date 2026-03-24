/**
 * Claude helper command suite.
 *
 * @module
 * @since 0.0.0
 */

import { Console, Effect } from "effect";
import { Command } from "effect/unstable/cli";

/**
 * Keep stop-hook behavior no-op and non-blocking.
 *
 * @category UseCase
 * @since 0.0.0
 */
const claudeHookStopCommand = Command.make(
  "hook-stop",
  {},
  Effect.fn(function* () {
    if (process.stdin.isTTY) {
      return;
    }

    yield* Effect.promise<void>(
      () =>
        new Promise((resolve) => {
          process.stdin.setEncoding("utf8");
          process.stdin.on("data", () => undefined);
          process.stdin.on("end", () => {
            resolve();
          });
        })
    );
  })
).pipe(Command.withDescription("No-op stop hook for Claude integration"));

/**
 * Claude command group.
 *
 * @category UseCase
 * @since 0.0.0
 */
export const claudeCommand = Command.make(
  "claude",
  {},
  Effect.fn(function* () {
    yield* Console.log("Claude commands:");
    yield* Console.log("- bun run beep claude hook-stop");
  })
).pipe(Command.withDescription("Claude integration helper commands"), Command.withSubcommands([claudeHookStopCommand]));
