/**
 * Codex helper command suite.
 *
 * @module
 * @since 0.0.0
 */

import { Console, Effect } from "effect";
import { Command } from "effect/unstable/cli";
import { runCodexSessionStartHook } from "../TrustGraph/internal/TrustGraphRuntime.js";

const codexHookSessionStartCommand = Command.make(
  "hook-session-start",
  {},
  Effect.fn(function* () {
    yield* runCodexSessionStartHook;
  })
).pipe(Command.withDescription("Emit Codex SessionStart hook JSON enriched with TrustGraph startup context"));

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
