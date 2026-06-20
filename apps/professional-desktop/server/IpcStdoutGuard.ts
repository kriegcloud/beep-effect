// Run the side-effect-only stdout patch before anything else loads. The prelude
// has zero non-stdlib imports, so importing it here (and first in main.ts) keeps
// stdout clean before the effect runtime or any sidecar dependency initializes.

import * as BunStdio from "@effect/platform-bun/BunStdio";
import { Effect, Layer, Sink, Stdio } from "effect";
import { ipcTransport, originalStdoutWrite } from "./IpcStdoutGuard.prelude.ts";

const writeProtocolStdout = (chunk: string | Uint8Array): Effect.Effect<void> =>
  Effect.callback<void>((resume) => {
    originalStdoutWrite(chunk, (error?: Error | null) => {
      resume(error === undefined || error === null ? Effect.void : Effect.die(error));
    });
  });

const IpcStdioLive: Layer.Layer<Stdio.Stdio> = Layer.effect(
  Stdio.Stdio,
  Effect.map(Stdio.Stdio, (stdio) =>
    Stdio.make({
      args: stdio.args,
      stdin: stdio.stdin,
      stdout: () => Sink.forEach(writeProtocolStdout),
      stderr: stdio.stderr,
    })
  )
).pipe(Layer.provide(BunStdio.layer));

/**
 * Stdio layer for the sidecar RPC transport.
 *
 * In HTTP mode this is the normal Bun stdio service. In IPC mode stdout is
 * guarded (see {@link ./IpcStdoutGuard.prelude.ts}) so only the RPC protocol sink
 * writes to stdout; console and stray direct stdout writes are diverted to stderr
 * to keep ndjson framing clean.
 *
 * @category layers
 * @since 0.0.0
 */
export const SidecarStdioLive: Layer.Layer<Stdio.Stdio> = ipcTransport ? IpcStdioLive : BunStdio.layer;
