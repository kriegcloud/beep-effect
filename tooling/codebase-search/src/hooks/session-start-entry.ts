/**
 * Entry point for the SessionStart hook. Reads JSON from stdin,
 * generates a project overview, and writes it to stdout.
 *
 * This file is executed directly by Claude Code on session start.
 * Uses Effect with BunRuntime for the hook lifecycle.
 *
 * @since 0.0.0
 * @module
 */

import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import { Console, Effect } from "effect";
import * as S from "effect/Schema";

import { HookEntryPlatformLayer, readStdinWithIdleTimeout } from "../internal/HookEntryRuntime.js";
import { sessionStartHook } from "./SessionStart.js";

// ---------------------------------------------------------------------------
// Stdin Schema
// ---------------------------------------------------------------------------

/** @internal */
const StdinPayload = S.Struct({
  cwd: S.optionalKey(S.String),
});

// ---------------------------------------------------------------------------
// Main Effect
// ---------------------------------------------------------------------------

/** @internal */
const readStdin = readStdinWithIdleTimeout();

/** @internal */
const program = Effect.gen(function* () {
  const stdin = yield* readStdin;

  // Parse input with Schema — fall back to defaults on failure
  const parsed = yield* S.decodeUnknownEffect(S.fromJsonString(StdinPayload))(stdin).pipe(
    Effect.orElseSucceed(() => ({ cwd: undefined }))
  );
  const cwd = parsed.cwd ?? process.cwd();

  const result = yield* sessionStartHook(cwd).pipe(
    Effect.provide(HookEntryPlatformLayer),
    Effect.timeout("5 seconds"),
    Effect.orElseSucceed(() => "")
  );

  yield* Console.log(result);
}).pipe(Effect.orElseSucceed(() => undefined));

BunRuntime.runMain(program);
