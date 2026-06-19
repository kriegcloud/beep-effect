import * as BunStdio from "@effect/platform-bun/BunStdio";
import { Effect, Layer, Sink, Stdio } from "effect";
import * as P from "effect/Predicate";

// biome-ignore lint/suspicious/noUndeclaredEnvVars: CHAT_TRANSPORT is declared in turbo.json under global.passThroughEnv.
const ipcTransport = Bun.env.CHAT_TRANSPORT === "ipc";
const originalStdoutWrite = process.stdout.write.bind(process.stdout);

const writeConsoleToStderr = (...values: Array<unknown>): void => {
  const line = values.map(String).join(" ");
  process.stderr.write(line.length === 0 ? "\n" : `${line}\n`);
};

const writeDirectStdoutToStderr = (
  chunk: string | Uint8Array,
  encodingOrCallback?: BufferEncoding | ((error?: Error | null) => void),
  callback?: (error?: Error | null) => void
): boolean => {
  const done = P.isFunction(encodingOrCallback) ? encodingOrCallback : callback;
  const encoding = P.isString(encodingOrCallback) ? encodingOrCallback : undefined;
  return encoding === undefined ? process.stderr.write(chunk, done) : process.stderr.write(chunk, encoding, done);
};

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

if (ipcTransport) {
  console.log = writeConsoleToStderr;
  console.info = writeConsoleToStderr;
  console.debug = writeConsoleToStderr;
  console.warn = writeConsoleToStderr;
  console.trace = writeConsoleToStderr;
  process.stdout.write = writeDirectStdoutToStderr as typeof process.stdout.write;
}

/**
 * Stdio layer for the sidecar RPC transport.
 *
 * In HTTP mode this is the normal Bun stdio service. In IPC mode stdout is
 * guarded so only the RPC protocol sink writes to stdout; console and stray
 * direct stdout writes are diverted to stderr to keep ndjson framing clean.
 *
 * @category layers
 * @since 0.0.0
 */
export const SidecarStdioLive: Layer.Layer<Stdio.Stdio> = ipcTransport ? IpcStdioLive : BunStdio.layer;
