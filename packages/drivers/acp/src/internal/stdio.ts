import { Effect, Queue, Sink, Stdio, Stream } from "effect";
import type * as Cause from "effect/Cause";
import * as P from "effect/Predicate";
import type { ChildProcessSpawner } from "effect/unstable/process";
import * as AcpError from "../errors.ts";

const encoder = new TextEncoder();

export const makeChildStdio = (handle: ChildProcessSpawner.ChildProcessHandle) =>
  Stdio.make({
    args: Effect.succeed([]),
    stdin: handle.stdout,
    stdout: () =>
      Sink.mapInput(handle.stdin, (chunk: string | Uint8Array) => (P.isString(chunk) ? encoder.encode(chunk) : chunk)),
    stderr: () => Sink.drain,
  });

export const makeInMemoryStdio = Effect.fn("makeInMemoryStdio")(function* () {
  const input = yield* Queue.unbounded<Uint8Array, Cause.Done<void>>();
  const output = yield* Queue.unbounded<string>();
  const decoder = new TextDecoder();

  return {
    stdio: Stdio.make({
      args: Effect.succeed([]),
      stdin: Stream.fromQueue(input),
      stdout: () =>
        Sink.forEach((chunk: string | Uint8Array) =>
          Queue.offer(output, P.isString(chunk) ? chunk : decoder.decode(chunk, { stream: true }))
        ),
      stderr: () => Sink.drain,
    }),
    input,
    output,
  };
});

export const makeTerminationError = (
  handle: ChildProcessSpawner.ChildProcessHandle
): Effect.Effect<AcpError.AcpError> =>
  Effect.match(handle.exitCode, {
    onFailure: (cause) =>
      new AcpError.AcpTransportError({
        detail: "Failed to determine ACP process exit status",
        cause,
      }),
    onSuccess: (code) => new AcpError.AcpProcessExitedError({ code }),
  });
