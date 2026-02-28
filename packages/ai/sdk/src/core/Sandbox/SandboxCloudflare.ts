import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Ref from "effect/Ref";
import * as Stream from "effect/Stream";
import { defaultCloudflareLifecyclePolicy } from "../internal/lifecyclePolicy.js";
import { decodeNdjson } from "../internal/ndjson.js";
import { SDKMessage as SDKMessageSchema } from "../Schema/Message.js";
import { SandboxError } from "./SandboxError.js";
import { type ExecResult, SandboxService } from "./SandboxService.js";

/**
 * Cloudflare bindings required for the sandbox layer.
 *
 * These come from the Worker's Env type:
 *   - Sandbox: DurableObjectNamespace<Sandbox> (from @cloudflare/sandbox)
 *
 * Wrangler config reference:
 *   containers[].class_name = "Sandbox"
 *   durable_objects.bindings[].class_name = "Sandbox"
 *   migrations[].new_sqlite_classes = ["Sandbox"]
 *
 * See: https://developers.cloudflare.com/sandbox/configuration/wrangler/
 */
export type CloudflareSandboxEnv = {
  // DurableObjectNamespace<Sandbox> from @cloudflare/sandbox
  // Typed as `unknown` to avoid hard import; actual type:
  //   import type { Sandbox } from "@cloudflare/sandbox"
  //   DurableObjectNamespace<Sandbox>
  readonly Sandbox: unknown;
};

export type CloudflareSandboxOptions = {
  /** Cloudflare Worker env bindings. */
  readonly env: CloudflareSandboxEnv;
  /** Unique sandbox instance ID. Same ID = same sandbox. */
  readonly sandboxId: string;
  /** Idle timeout before sandbox sleeps. Default: "10m". Accepts duration string ("30s", "5m") or seconds number. */
  readonly sleepAfter?: string | number;
  /** ANTHROPIC_API_KEY for the sandboxed agent. */
  readonly apiKey?: string;
  /** Optional Claude Code session token for sandboxed auth flows. */
  readonly sessionAccessToken?: string;
  /** Additional env vars set once when the sandbox starts. */
  readonly envVars?: Record<string, string | undefined>;
  /** Optional timeout (milliseconds) applied to sandbox execStream calls. */
  readonly execTimeoutMs?: number;
};

const mapError = (operation: string, cause: unknown) =>
  SandboxError.make({
    message: `cloudflare sandbox ${operation} failed`,
    operation,
    provider: "cloudflare",
    cause,
  });

type ExecEvent = {
  type: "start" | "stdout" | "stderr" | "complete" | "error";
  data?: string;
  exitCode?: number;
  error?: string;
};

const staleResumeIndicators = [
  "session not found",
  "no such session",
  "invalid session",
  "unknown session",
  "resume session not found",
];

const collectStringFragments = (value: unknown): Array<string> => {
  if (typeof value === "string") return [value];
  if (value === null || value === undefined) return [];
  if (Array.isArray(value)) {
    return value.flatMap(collectStringFragments);
  }
  if (typeof value === "object") {
    return Object.values(value as Record<string, unknown>).flatMap(collectStringFragments);
  }
  return [];
};

const isStaleResumeFailure = (error: unknown): boolean => {
  if (!error || typeof error !== "object") return false;
  const candidate = error as {
    readonly _tag?: string;
    readonly message?: string;
    readonly cause?: unknown;
  };
  if (candidate._tag !== "SandboxError") return false;
  const text = [candidate.message ?? "", ...collectStringFragments(candidate.cause)].join("\n").toLowerCase();
  if (!text.includes("resume") && !text.includes("session")) return false;
  return staleResumeIndicators.some((indicator) => text.includes(indicator));
};

/**
 * Build a SandboxService backed by @cloudflare/sandbox.
 *
 * Uses dynamic import so the package is not required at bundle time.
 * Only loaded when this layer is actually constructed.
 *
 * API reference: https://developers.cloudflare.com/sandbox/api/
 */
// Uses Layer.scoped (not Layer.effect) so sandbox.destroy() is called
// automatically when the layer's scope closes. This prevents sandbox
// leaks if the consumer forgets to call service.destroy explicitly.
// The destroy method is still exposed on the service for early cleanup.
export const layerCloudflare = (options: CloudflareSandboxOptions): Layer.Layer<SandboxService, SandboxError> =>
  Layer.effect(
    SandboxService,
    Effect.gen(function* () {
      // Dynamic import -- @cloudflare/sandbox is a peer dep.
      // getSandbox returns synchronously (lazy container start on first operation).
      // parseSSEStream converts execStream's ReadableStream into AsyncIterable<T>.
      const { getSandbox, parseSSEStream } = yield* Effect.tryPromise({
        try: () =>
          import("@cloudflare/sandbox") as unknown as Promise<{
            getSandbox: (
              binding: unknown,
              id: string,
              opts?: {
                sleepAfter?: string | number;
                keepAlive?: boolean;
              }
            ) => CloudflareSandboxHandle;
            parseSSEStream: <T>(stream: ReadableStream) => AsyncIterable<T>;
          }>,
        catch: (cause) => mapError("import", cause),
      });

      // getSandbox is synchronous -- container starts lazily on first operation.
      // Acquire sandbox with scoped lifecycle -- destroy() on scope close.
      const sandbox = yield* Effect.acquireRelease(
        Effect.sync(() =>
          getSandbox(
            options.env.Sandbox,
            options.sandboxId,
            options.sleepAfter !== undefined ? { sleepAfter: options.sleepAfter } : undefined
          )
        ),
        (s) =>
          Effect.tryPromise({
            try: () => s.destroy(),
            catch: () => mapError("destroy.cleanup", "best-effort cleanup"),
          }).pipe(Effect.ignore)
      );

      const baseEnvVars: Record<string, string | undefined> = {
        ...(options.apiKey !== undefined ? { ANTHROPIC_API_KEY: options.apiKey } : {}),
        ...(options.sessionAccessToken !== undefined
          ? {
              CLAUDE_CODE_SESSION_ACCESS_TOKEN: options.sessionAccessToken,
            }
          : {}),
        ...(options.envVars ?? {}),
      };

      // Set auth + runtime env vars in the sandbox once during layer startup.
      if (Object.keys(baseEnvVars).length > 0) {
        yield* Effect.tryPromise({
          try: () => sandbox.setEnvVars(baseEnvVars),
          catch: (cause) => mapError("setEnvVars", cause),
        });
      }

      // Cloudflare sandbox.exec() accepts a single command string.
      // When args are provided, construct the full command by shell-escaping
      // each argument to prevent injection via the args parameter.
      const shellEscape = (s: string) => `'${s.replace(/'/g, "'\\''")}'`;

      const exec = Effect.fn("SandboxCloudflare.exec")((command: string, args?: ReadonlyArray<string>) =>
        Effect.tryPromise({
          try: async () => {
            const fullCommand =
              args && args.length > 0 ? `${shellEscape(command)} ${args.map(shellEscape).join(" ")}` : command;
            const result = await sandbox.exec(fullCommand);
            return {
              stdout: result.stdout,
              stderr: result.stderr,
              exitCode: result.exitCode,
            } satisfies ExecResult;
          },
          catch: (cause) => mapError("exec", cause),
        })
      );

      const writeFile = Effect.fn("SandboxCloudflare.writeFile")((path: string, content: string) =>
        Effect.tryPromise({
          try: () => sandbox.writeFile(path, content),
          catch: (cause) => mapError("writeFile", cause),
        }).pipe(Effect.asVoid)
      );

      const readFile = Effect.fn("SandboxCloudflare.readFile")((path: string) =>
        Effect.tryPromise({
          try: async () => {
            const result = await sandbox.readFile(path);
            return result.content;
          },
          catch: (cause) => mapError("readFile", cause),
        })
      );

      // runAgent: Start a Claude Code session inside the sandbox and decode
      // stream-json events from execStream's SSE channel.
      const runAgent = Effect.fn("SandboxCloudflare.runAgent")(
        (prompt: string, queryOptions?: import("../Schema/Options.js").Options) =>
          Effect.gen(function* () {
            const model = queryOptions?.model ?? "sonnet";

            // Strategy: write the prompt to a temp file and pipe it via stdin.
            // This avoids shell-escaping issues with user-provided content.
            const promptFile = `/tmp/.claude-prompt-${crypto.randomUUID()}.txt`;
            yield* Effect.tryPromise({
              try: () => sandbox.writeFile(promptFile, prompt),
              catch: (cause) => mapError("runAgent.writePrompt", cause),
            });

            // Register cleanup for the prompt file
            yield* Effect.addFinalizer(() =>
              Effect.tryPromise({
                try: () => sandbox.exec(`rm -f ${shellEscape(promptFile)}`),
                catch: () => mapError("cleanup", "best-effort prompt cleanup"),
              }).pipe(Effect.ignore)
            );

            const execTimeoutMs = options.execTimeoutMs ?? defaultCloudflareLifecyclePolicy.defaultExecTimeoutMs;

            const buildCommand = (resumeSessionId: string | undefined) => {
              // Build command: pipe prompt file via stdin to avoid shell escaping.
              // --verbose is required with --output-format stream-json in print mode.
              const args = ["claude", "--output-format", "stream-json", "--verbose", "--model", shellEscape(model)];

              if (resumeSessionId !== undefined) {
                args.push("--resume", shellEscape(resumeSessionId));
              }

              if (queryOptions?.maxTurns) {
                args.push("--max-turns", String(queryOptions.maxTurns));
              }

              if (queryOptions?.permissionMode === "bypassPermissions") {
                args.push("--dangerously-skip-permissions");
              }

              return `cat ${shellEscape(promptFile)} | ${args.join(" ")}`;
            };

            const acquireExecStream = (command: string) =>
              Effect.acquireRelease(
                Effect.tryPromise({
                  try: () =>
                    sandbox.execStream(command, {
                      ...(execTimeoutMs !== undefined
                        ? {
                            timeout: execTimeoutMs,
                          }
                        : {}),
                      ...(queryOptions?.env !== undefined ? { env: queryOptions.env } : {}),
                    }),
                  catch: (cause) => mapError("runAgent.exec", cause),
                }),
                (stream) =>
                  Effect.tryPromise({
                    try: () => stream.cancel(),
                    catch: () => mapError("cleanup", "best-effort stream cleanup"),
                  }).pipe(Effect.ignore)
              );

            const activeReadableRef = yield* Ref.make<ReadableStream | undefined>(undefined);

            const makeAttemptStream = (resumeSessionId: string | undefined, initialReadable?: ReadableStream) =>
              Stream.unwrap(
                Effect.gen(function* () {
                  const readable = initialReadable ?? (yield* acquireExecStream(buildCommand(resumeSessionId)));
                  yield* Ref.set(activeReadableRef, readable);
                  const stderrBuffer = yield* Ref.make("");
                  const stdoutCarry = yield* Ref.make("");

                  const drainStdoutChunk = (chunk: string) =>
                    Effect.gen(function* () {
                      let buffer = `${yield* Ref.get(stdoutCarry)}${chunk}`;
                      const lines: Array<string> = [];
                      while (true) {
                        const newlineIndex = buffer.indexOf("\n");
                        if (newlineIndex >= 0) {
                          const line = buffer.slice(0, newlineIndex).trim();
                          buffer = buffer.slice(newlineIndex + 1);
                          if (line.length > 0) {
                            lines.push(line);
                          }
                          continue;
                        }
                        const trimmed = buffer.trim();
                        if (trimmed.length === 0) {
                          buffer = "";
                          break;
                        }
                        const isCompleteJson = yield* Effect.sync(() => {
                          try {
                            JSON.parse(trimmed);
                            return true;
                          } catch {
                            return false;
                          }
                        });
                        if (isCompleteJson) {
                          lines.push(trimmed);
                          buffer = "";
                        }
                        break;
                      }
                      yield* Ref.set(stdoutCarry, buffer);
                      return lines as ReadonlyArray<string>;
                    });

                  const stdoutData = Stream.fromAsyncIterable(parseSSEStream<ExecEvent>(readable), (cause) =>
                    mapError("runAgent.stream", cause)
                  ).pipe(
                    Stream.mapEffect((event) =>
                      Effect.gen(function* () {
                        switch (event.type) {
                          case "stdout": {
                            if (!event.data || event.data.length === 0) {
                              return [] as ReadonlyArray<string>;
                            }
                            return yield* drainStdoutChunk(event.data);
                          }
                          case "stderr": {
                            if (event.data && event.data.length > 0) {
                              const stderrLine = event.data;
                              yield* Ref.update(stderrBuffer, (current) =>
                                current.length > 0 ? `${current}\n${stderrLine}` : stderrLine
                              );
                            }
                            return [] as ReadonlyArray<string>;
                          }
                          case "error": {
                            const stderr = yield* Ref.get(stderrBuffer);
                            return yield* SandboxError.make({
                              message: event.error ?? "Sandbox process reported an error",
                              operation: "runAgent.exec",
                              provider: "cloudflare",
                              cause: stderr.length > 0 ? { event, stderr } : event,
                            });
                          }
                          case "complete": {
                            const exitCode = event.exitCode ?? 0;
                            if (exitCode !== 0) {
                              const stderr = yield* Ref.get(stderrBuffer);
                              return yield* SandboxError.make({
                                message: `Sandbox process exited with code ${exitCode}`,
                                operation: "runAgent.exec",
                                provider: "cloudflare",
                                cause: stderr.length > 0 ? { event, stderr } : event,
                              });
                            }
                            return [] as ReadonlyArray<string>;
                          }
                          default:
                            return [] as ReadonlyArray<string>;
                        }
                      })
                    ),
                    Stream.flatMap((lines) => Stream.fromIterable(lines)),
                    Stream.concat(
                      Stream.unwrap(drainStdoutChunk("\n").pipe(Effect.map((lines) => Stream.fromIterable(lines))))
                    ),
                    Stream.map((line) => `${line}\n`)
                  );

                  return decodeNdjson(SDKMessageSchema, (details) => mapError("runAgent.ndjson", details))(stdoutData);
                })
              );

            const resumeSessionId = queryOptions?.resume;
            const initialReadable = yield* acquireExecStream(buildCommand(resumeSessionId));
            yield* Ref.set(activeReadableRef, initialReadable);
            const stdoutStream =
              resumeSessionId === undefined
                ? makeAttemptStream(undefined, initialReadable)
                : makeAttemptStream(resumeSessionId, initialReadable).pipe(
                    Stream.catchIf(isStaleResumeFailure, () =>
                      Stream.unwrap(
                        Effect.gen(function* () {
                          yield* Effect.logWarning(
                            `Cloudflare sandbox resume fallback activated for sandbox=${options.sandboxId} session=${resumeSessionId}`
                          );
                          return makeAttemptStream(undefined);
                        })
                      )
                    )
                  );

            const unsupportedInput = (method: string) =>
              Effect.fail(
                SandboxError.make({
                  message: `${method} is not supported for sandboxed queries. The sandbox process manages its own input.`,
                  operation: method,
                  provider: "cloudflare",
                })
              );

            const handle: import("../Query.js").QueryHandle = {
              stream: stdoutStream,

              // Input methods: explicitly fail -- sandbox stdin is not connected
              send: (_message) => unsupportedInput("send"),
              sendAll: (_messages) => unsupportedInput("sendAll"),
              sendForked: (_message) => unsupportedInput("sendForked"),
              closeInput: Effect.void, // noop -- no input channel to close

              // Stream sharing: correct return types per QueryHandle interface
              share: (config) =>
                Stream.share(stdoutStream, config ?? defaultCloudflareLifecyclePolicy.defaultShareConfig),
              broadcast: (config) => {
                const resolved = config ?? defaultCloudflareLifecyclePolicy.defaultBroadcastLag;
                if (typeof resolved === "number") {
                  return Stream.broadcast(stdoutStream, { capacity: resolved });
                }
                return Stream.broadcast(stdoutStream, resolved);
              },

              // Control — cancel the stream to interrupt the sandbox process.
              interrupt: Ref.get(activeReadableRef).pipe(
                Effect.flatMap((readable) =>
                  readable
                    ? Effect.tryPromise({
                        try: () => readable.cancel(),
                        catch: (cause) => mapError("interrupt", cause),
                      })
                    : Effect.void
                ),
                Effect.ignore,
                Effect.asVoid
              ),

              // Configuration: noop in sandbox
              setPermissionMode: () => Effect.void,
              setModel: () => Effect.void,
              setMaxThinkingTokens: () => Effect.void,

              // Read-only queries: return empty/safe defaults
              rewindFiles: () => Effect.succeed({ canRewind: false }),
              supportedCommands: Effect.succeed([]),
              supportedModels: Effect.succeed([]),
              mcpServerStatus: Effect.succeed([]),
              setMcpServers: () => unsupportedInput("setMcpServers"),
              accountInfo: Effect.fail(
                SandboxError.make({
                  message: "accountInfo is not available for sandboxed queries",
                  operation: "accountInfo",
                  provider: "cloudflare",
                })
              ),
              initializationResult: unsupportedInput("initializationResult"),
              stopTask: () => unsupportedInput("stopTask"),
            };

            return handle;
          })
      );

      const destroy = Effect.tryPromise({
        try: () => sandbox.destroy(),
        catch: (cause) => mapError("destroy", cause),
      });

      return SandboxService.of({
        provider: "cloudflare",
        isolated: true,
        exec,
        writeFile,
        readFile,
        runAgent,
        destroy,
      });
    })
  );

// Internal type for the sandbox client returned by getSandbox().
// Based on @cloudflare/sandbox v0.7.0 actual .d.ts types.
//
// Only the methods we use are typed here. The full Sandbox class has
// additional methods (startProcess, createSession, exposePort, git, etc.)
// that we don't need for the initial implementation.
type CloudflareSandboxHandle = {
  exec(
    command: string,
    options?: {
      stream?: boolean;
      timeout?: number;
      env?: Record<string, string | undefined>;
      cwd?: string;
      onOutput?: (stream: "stdout" | "stderr", data: string) => void;
      signal?: AbortSignal;
    }
  ): Promise<{
    success: boolean;
    stdout: string;
    stderr: string;
    exitCode: number;
    command: string;
    duration: number;
    timestamp: string;
  }>;
  // Returns a ReadableStream of SSE events (NOT raw bytes).
  // Use parseSSEStream<ExecEvent>(stream) to iterate events.
  // Event types: "start" | "stdout" | "stderr" | "complete" | "error"
  execStream(
    command: string,
    options?: {
      timeout?: number;
      env?: Record<string, string | undefined>;
      cwd?: string;
      bufferSize?: number;
      signal?: AbortSignal;
    }
  ): Promise<ReadableStream>;
  writeFile(
    path: string,
    content: string,
    options?: {
      encoding?: string;
    }
  ): Promise<{ success: boolean; path: string; timestamp: string }>;
  readFile(
    path: string,
    options?: {
      encoding?: string;
    }
  ): Promise<{ content: string; encoding: string; success: boolean; path: string }>;
  setEnvVars(envVars: Record<string, string | undefined>): Promise<void>;
  destroy(): Promise<void>;
};
