/**
 * Entry point for the PromptSubmit hook. Reads JSON from stdin,
 * executes the BM25 keyword search, and writes context to stdout.
 *
 * This file is executed directly by Claude Code on user prompt submission.
 * Uses Effect with BunRuntime for the hook lifecycle.
 *
 * @since 0.0.0
 * @module
 */

import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import { Console, Effect, Layer } from "effect";
import * as S from "effect/Schema";

import { Bm25WriterLive } from "../indexer/index.js";
import { HookEntryPlatformLayer, readStdinWithIdleTimeout, resolveIndexDir } from "../internal/HookEntryRuntime.js";
import { promptSubmitHook } from "./PromptSubmit.js";
import { INDEX_DIR } from "./SessionStart.js";

// ---------------------------------------------------------------------------
// Stdin Schema
// ---------------------------------------------------------------------------

/** @internal */
const StdinPayload = S.Struct({
  cwd: S.optionalKey(S.String),
  prompt: S.optionalKey(S.String),
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
    Effect.orElseSucceed(() => ({ cwd: undefined, prompt: undefined }))
  );
  const cwd = parsed.cwd ?? process.cwd();
  const prompt = parsed.prompt ?? "";
  const indexPath = process.env.INDEX_PATH;
  const indexDir = resolveIndexDir(cwd, indexPath, INDEX_DIR);
  const hookRuntimeLayer = Layer.mergeAll(HookEntryPlatformLayer, Bm25WriterLive(indexDir));

  const result = yield* promptSubmitHook(cwd, prompt, indexPath).pipe(
    Effect.provide(hookRuntimeLayer),
    Effect.timeout("5 seconds"),
    Effect.orElseSucceed(() => "")
  );

  yield* Console.log(result);
}).pipe(Effect.orElseSucceed(() => undefined));

BunRuntime.runMain(program);
