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
import * as NodeFileSystem from "@effect/platform-node/NodeFileSystem";
import * as NodePath from "@effect/platform-node/NodePath";
import { Console, Effect, Layer } from "effect";
import * as S from "effect/Schema";

import { promptSubmitHook } from "./PromptSubmit.js";

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
const PlatformLayer = Layer.mergeAll(NodeFileSystem.layer, NodePath.layer);

/** @internal */
const readStdin: Effect.Effect<string> = Effect.callback<string>((resume) => {
  const chunks: Array<Buffer> = [];
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", (chunk: string | Buffer) => {
    chunks.push(Buffer.from(chunk));
  });
  process.stdin.on("end", () => {
    resume(Effect.succeed(Buffer.concat(chunks).toString("utf8")));
  });
  // If stdin is empty or closed immediately, resolve after a short delay
  setTimeout(() => {
    resume(Effect.succeed(Buffer.concat(chunks).toString("utf8")));
  }, 1000);
});

/** @internal */
const program = Effect.gen(function* () {
  const stdin = yield* readStdin;

  // Parse input with Schema — fall back to defaults on failure
  const parsed = yield* S.decodeUnknownEffect(S.fromJsonString(StdinPayload))(stdin).pipe(
    Effect.orElseSucceed(() => ({ cwd: undefined, prompt: undefined }))
  );
  const cwd = parsed.cwd ?? process.cwd();
  const prompt = parsed.prompt ?? "";

  const result = yield* promptSubmitHook(cwd, prompt).pipe(
    Effect.provide(PlatformLayer),
    Effect.timeout("5 seconds"),
    Effect.orElseSucceed(() => "")
  );

  yield* Console.log(result);
}).pipe(Effect.orElseSucceed(() => undefined));

BunRuntime.runMain(program);
