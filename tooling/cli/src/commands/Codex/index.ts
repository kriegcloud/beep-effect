/**
 * Codex helper command suite.
 *
 * @module
 * @since 0.0.0
 */

import { Console, Effect } from "effect";
import { Command } from "effect/unstable/cli";
import { runCodexSessionStartHook } from "./internal/CodexSessionStartRuntime.js";

const codexHookSessionStartCommand = Command.make(
  "hook-session-start",
  {},
  Effect.fn(function* () {
    yield* runCodexSessionStartHook;
  })
).pipe(Command.withDescription("Emit Codex SessionStart hook JSON enriched with Graphiti-first startup context"));

/**
 * Codex command group.
 *
 * @category UseCase
 * @since 0.0.0
 */
export const codexCommand = Command.make(
  "codex",
  {},
  Effect.fn(function* () {
    yield* Console.log("Codex commands:");
    yield* Console.log("- bun run beep codex hook-session-start");
  })
).pipe(
  Command.withDescription("Codex integration helper commands"),
  Command.withSubcommands([codexHookSessionStartCommand])
);
