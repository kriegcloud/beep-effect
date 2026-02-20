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
import * as NodeFileSystem from "@effect/platform-node/NodeFileSystem";
import * as NodePath from "@effect/platform-node/NodePath";
import { Console, Effect, Layer } from "effect";
import * as S from "effect/Schema";

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
const PlatformLayer = Layer.mergeAll(NodeFileSystem.layer, NodePath.layer);

/** @internal */
const STDIN_IDLE_TIMEOUT_MS = 250;

/** @internal */
const readStdin: Effect.Effect<string> = Effect.callback<string>((resume) => {
  const chunks: Array<Buffer> = [];
  let resolved = false;
  let idleTimer: ReturnType<typeof setTimeout> | undefined;

  const cleanup = (): void => {
    process.stdin.off("data", onData);
    process.stdin.off("end", onEnd);
    process.stdin.off("error", onError);
    if (idleTimer !== undefined) {
      clearTimeout(idleTimer);
    }
  };

  const resolve = (): void => {
    if (resolved) {
      return;
    }
    resolved = true;
    cleanup();
    resume(Effect.succeed(Buffer.concat(chunks).toString("utf8")));
  };

  const scheduleIdleResolve = (): void => {
    if (idleTimer !== undefined) {
      clearTimeout(idleTimer);
    }
    idleTimer = setTimeout(resolve, STDIN_IDLE_TIMEOUT_MS);
  };

  const onData = (chunk: string | Buffer): void => {
    chunks.push(Buffer.from(chunk));
    scheduleIdleResolve();
  };

  const onEnd = (): void => {
    resolve();
  };

  const onError = (): void => {
    resolve();
  };

  process.stdin.setEncoding("utf8");
  process.stdin.on("data", onData);
  process.stdin.on("end", onEnd);
  process.stdin.on("error", onError);

  // Resolve empty payloads quickly when stdin provides no data.
  scheduleIdleResolve();
});

/** @internal */
const program = Effect.gen(function* () {
  const stdin = yield* readStdin;

  // Parse input with Schema — fall back to defaults on failure
  const parsed = yield* S.decodeUnknownEffect(S.fromJsonString(StdinPayload))(stdin).pipe(
    Effect.orElseSucceed(() => ({ cwd: undefined }))
  );
  const cwd = parsed.cwd ?? process.cwd();

  const result = yield* sessionStartHook(cwd).pipe(
    Effect.provide(PlatformLayer),
    Effect.timeout("5 seconds"),
    Effect.orElseSucceed(() => "")
  );

  yield* Console.log(result);
}).pipe(Effect.orElseSucceed(() => undefined));

BunRuntime.runMain(program);
