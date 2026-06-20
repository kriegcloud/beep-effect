/**
 * Side-effect-only stdout guard prelude for the IPC sidecar transport.
 *
 * This module has ZERO non-stdlib imports on purpose: `server/main.ts` imports it
 * first, so the stdout diversion below runs before any other module (the effect
 * runtime, `@beep/*` deps, their transitive imports) can evaluate. In IPC mode the
 * sidecar's stdout is the ndjson rpc frame stream the Tauri Rust shell parses, so
 * any stray byte written to stdout during module initialization would corrupt
 * framing. Routing every non-protocol sink to stderr up front keeps stdout clean.
 *
 * The real (unpatched) stdout writer is captured and re-exported so the protocol
 * sink in {@link ./IpcStdoutGuard.ts} can still reach fd 1 deliberately.
 *
 * Known limitation: this guards the realistic sinks (`console.*`,
 * `process.stdout.write`, `Bun.write` targeting `Bun.stdout`) but not raw
 * file-descriptor writes (e.g. `fs.writeSync(1, …)`). The sidecar IPC stdio
 * integration test asserts stdout stays a clean frame stream as a regression net.
 */

// biome-ignore lint/suspicious/noUndeclaredEnvVars: CHAT_TRANSPORT is declared in turbo.json under global.passThroughEnv.
export const ipcTransport = Bun.env.CHAT_TRANSPORT === "ipc";

// Capture the genuine sinks before patching so the protocol writer can bypass the
// guard on purpose (see IpcStdioLive) and Bun.write can still fan out to stderr.
export const originalStdoutWrite: typeof process.stdout.write = process.stdout.write.bind(process.stdout);
const originalBunWrite = Bun.write.bind(Bun);
const originalBunWriteUnknown = originalBunWrite as (
  destination: unknown,
  input: unknown
) => ReturnType<typeof Bun.write>;

const writeConsoleToStderr = (...values: Array<unknown>): void => {
  const line = values.map(String).join(" ");
  process.stderr.write(line.length === 0 ? "\n" : `${line}\n`);
};

const writeDirectStdoutToStderr = (
  chunk: string | Uint8Array,
  encodingOrCallback?: BufferEncoding | ((error?: Error | null) => void),
  callback?: (error?: Error | null) => void
): boolean => {
  const done = typeof encodingOrCallback === "function" ? encodingOrCallback : callback;
  const encoding = typeof encodingOrCallback === "string" ? encodingOrCallback : undefined;
  return encoding === undefined ? process.stderr.write(chunk, done) : process.stderr.write(chunk, encoding, done);
};

const writeBunStdoutToStderr = ((destination: unknown, input: unknown) =>
  originalBunWriteUnknown(destination === Bun.stdout ? Bun.stderr : destination, input)) as typeof Bun.write;

if (ipcTransport) {
  console.log = writeConsoleToStderr;
  console.info = writeConsoleToStderr;
  console.debug = writeConsoleToStderr;
  console.warn = writeConsoleToStderr;
  console.trace = writeConsoleToStderr;
  process.stdout.write = writeDirectStdoutToStderr as typeof process.stdout.write;
  Bun.write = writeBunStdoutToStderr;
}
