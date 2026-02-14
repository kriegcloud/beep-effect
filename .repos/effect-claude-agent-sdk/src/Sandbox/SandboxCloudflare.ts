import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Option from "effect/Option"
import * as Stream from "effect/Stream"
import { SandboxService, type ExecResult } from "./SandboxService.js"
import { SandboxError } from "./SandboxError.js"

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
  readonly Sandbox: unknown
}

export type CloudflareSandboxOptions = {
  /** Cloudflare Worker env bindings. */
  readonly env: CloudflareSandboxEnv
  /** Unique sandbox instance ID. Same ID = same sandbox. */
  readonly sandboxId: string
  /** Idle timeout before sandbox sleeps. Default: "10m". Accepts duration string ("30s", "5m") or seconds number. */
  readonly sleepAfter?: string | number
  /** ANTHROPIC_API_KEY for the sandboxed agent. */
  readonly apiKey?: string
}

const mapError = (operation: string, cause: unknown) =>
  SandboxError.make({
    message: `cloudflare sandbox ${operation} failed`,
    operation,
    provider: "cloudflare",
    cause
  })

type ExecEvent = {
  type: "start" | "stdout" | "stderr" | "complete" | "error"
  data?: string
  exitCode?: number
  error?: string
}

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
export const layerCloudflare = (
  options: CloudflareSandboxOptions
): Layer.Layer<SandboxService, SandboxError> =>
  Layer.scoped(
    SandboxService,
    Effect.gen(function*() {
      // Dynamic import -- @cloudflare/sandbox is a peer dep.
      // getSandbox returns synchronously (lazy container start on first operation).
      // parseSSEStream converts execStream's ReadableStream into AsyncIterable<T>.
      const { getSandbox, parseSSEStream } = yield* Effect.tryPromise({
        try: () => import("@cloudflare/sandbox") as unknown as Promise<{
          getSandbox: (binding: unknown, id: string, opts?: {
            sleepAfter?: string | number
            keepAlive?: boolean
          }) => CloudflareSandboxHandle
          parseSSEStream: <T>(stream: ReadableStream) => AsyncIterable<T>
        }>,
        catch: (cause) => mapError("import", cause)
      })

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
            catch: () => mapError("destroy.cleanup", "best-effort cleanup")
          }).pipe(Effect.ignore)
      )

      // Set API key in sandbox environment if provided
      if (options.apiKey) {
        yield* Effect.tryPromise({
          try: () => sandbox.setEnvVars({
            ANTHROPIC_API_KEY: options.apiKey!
          }),
          catch: (cause) => mapError("setEnvVars", cause)
        })
      }

      // Cloudflare sandbox.exec() accepts a single command string.
      // When args are provided, construct the full command by shell-escaping
      // each argument to prevent injection via the args parameter.
      const shellEscape = (s: string) =>
        "'" + s.replace(/'/g, "'\\''") + "'"

      const exec = Effect.fn("SandboxCloudflare.exec")(
        (command: string, args?: ReadonlyArray<string>) =>
          Effect.tryPromise({
            try: async () => {
              const fullCommand = args && args.length > 0
                ? `${shellEscape(command)} ${args.map(shellEscape).join(" ")}`
                : command
              const result = await sandbox.exec(fullCommand)
              return {
                stdout: result.stdout,
                stderr: result.stderr,
                exitCode: result.exitCode
              } satisfies ExecResult
            },
            catch: (cause) => mapError("exec", cause)
          })
      )

      const writeFile = Effect.fn("SandboxCloudflare.writeFile")(
        (path: string, content: string) =>
          Effect.tryPromise({
            try: () => sandbox.writeFile(path, content),
            catch: (cause) => mapError("writeFile", cause)
          }).pipe(Effect.asVoid)
      )

      const readFile = Effect.fn("SandboxCloudflare.readFile")(
        (path: string) =>
          Effect.tryPromise({
            try: async () => {
              const result = await sandbox.readFile(path)
              return result.content
            },
            catch: (cause) => mapError("readFile", cause)
          })
      )

      // runAgent: Start a Claude Code session inside the sandbox.
      //
      // Strategy:
      // 1. Exec `claude --output-format stream-json` inside sandbox via execStream()
      // 2. Parse the SSE event stream using parseSSEStream() from @cloudflare/sandbox
      // 3. Extract stdout data from SSE events, buffer into complete NDJSON lines
      // 4. Parse each line as an SDKMessage
      // 5. Return a QueryHandle wrapping the stream
      //
      // IMPORTANT: execStream() returns a ReadableStream of SSE (Server-Sent Events),
      // NOT raw byte chunks. Each event has shape:
      //   { type: "start" | "stdout" | "stderr" | "complete" | "error", data?: string, exitCode?: number }
      // The NDJSON output from Claude Code arrives in "stdout" events' `data` field.
      // We must use parseSSEStream() to iterate these events, then parse the
      // concatenated stdout data as NDJSON.
      //
      // Lifecycle: Uses nested Effect.acquireRelease:
      //   - Outer: sandbox session (acquire: getSandbox, release: destroy)
      //   - Inner: exec stream (acquire: execStream, release: cancel readable)
      //
      // The sandboxed Claude Code process handles its own tool loop.
      // Hooks are applied by the caller (AgentRuntime.decorateHandle)
      // to the message stream outside the sandbox -- see Section 3.6.
      //
      // IMPORTANT: Hooks are JS callbacks (not serializable config).
      // They CANNOT cross the sandbox boundary. The orchestrator must:
      // 1. Strip hooks/tools from Options before passing to sandbox
      // 2. Apply hooks to the message stream post-sandbox
      const runAgent = Effect.fn("SandboxCloudflare.runAgent")(
        (prompt: string, queryOptions?: import("../Schema/Options.js").Options) =>
          Effect.gen(function*() {
            const model = queryOptions?.model ?? "sonnet"

            // Strategy: Write the prompt to a temp file inside the sandbox,
            // then pass --prompt-file to Claude Code. This avoids any shell
            // escaping issues with user-provided prompt content.
            const promptFile = `/tmp/.claude-prompt-${crypto.randomUUID()}.txt`
            yield* Effect.tryPromise({
              try: () => sandbox.writeFile(promptFile, prompt),
              catch: (cause) => mapError("runAgent.writePrompt", cause)
            })

            // Register cleanup for the prompt file
            yield* Effect.addFinalizer(() =>
              Effect.tryPromise({
                try: () => sandbox.exec(`rm -f ${shellEscape(promptFile)}`),
                catch: () => mapError("cleanup", "best-effort prompt cleanup")
              }).pipe(Effect.ignore)
            )

            // Build command with shell-escaped arguments.
            const args = [
              "claude",
              "--output-format", "stream-json",
              "--model", shellEscape(model),
              "--prompt-file", shellEscape(promptFile)
            ]

            if (queryOptions?.maxTurns) {
              args.push("--max-turns", String(queryOptions.maxTurns))
            }

            if (queryOptions?.permissionMode === "bypassPermissions") {
              args.push("--dangerously-skip-permissions")
            }

            const command = args.join(" ")

            // Acquire the streaming exec with scoped lifecycle.
            const readable = yield* Effect.acquireRelease(
              Effect.tryPromise({
                try: () => sandbox.execStream(command),
                catch: (cause) => mapError("runAgent.exec", cause)
              }),
              (stream) =>
                Effect.tryPromise({
                  try: () => stream.cancel(),
                  catch: () => mapError("cleanup", "best-effort stream cleanup")
                }).pipe(Effect.ignore)
            )

            // Convert execStream's SSE ReadableStream into an Effect Stream of SDKMessage.
            //
            // Pipeline:
            // 1. parseSSEStream<ExecEvent>(readable) -> AsyncIterable<ExecEvent>
            // 2. Filter to "stdout" events, extract `data` strings
            // 3. Feed through Ndjson.unpackString for NDJSON line splitting
            // 4. Cast parsed JSON to SDKMessage

            const Ndjson = yield* Effect.tryPromise({
              try: () => import("@effect/platform/Ndjson") as Promise<
                typeof import("@effect/platform/Ndjson")
              >,
              catch: (cause) => mapError("runAgent.import", cause)
            })

            const messageStream = Stream.fromAsyncIterable(
              parseSSEStream<ExecEvent>(readable),
              (cause) => mapError("runAgent.sse", cause)
            ).pipe(
              Stream.filterMap((event) => {
                if (event.type === "stdout" && event.data) {
                  return Option.some(event.data)
                }
                return Option.none()
              }),
              Stream.pipeThroughChannelOrFail(
                Ndjson.unpackString({ ignoreEmptyLines: true })
              ),
              Stream.mapError((cause) => mapError("runAgent.ndjson", cause)),
              Stream.map((value) => value as unknown as import("../Schema/Message.js").SDKMessage)
            )

            const unsupportedInput = (method: string) =>
              Effect.fail(
                SandboxError.make({
                  message: `${method} is not supported for sandboxed queries. The sandbox process manages its own input.`,
                  operation: method,
                  provider: "cloudflare"
                })
              )

            const handle: import("../Query.js").QueryHandle = {
              stream: messageStream,

              // Input methods: explicitly fail -- sandbox stdin is not connected
              send: (_message) => unsupportedInput("send"),
              sendAll: (_messages) => unsupportedInput("sendAll"),
              sendForked: (_message) => unsupportedInput("sendForked"),
              closeInput: Effect.void,  // noop -- no input channel to close

              // Stream sharing: correct return types per QueryHandle interface
              share: (config) => Stream.share(messageStream, config ?? { capacity: "unbounded" }),
              broadcast: (n, maximumLag) =>
                Stream.broadcast(messageStream, n, maximumLag ?? { capacity: "unbounded" }),

              // Control
              interrupt: Effect.tryPromise({
                try: () => readable.cancel(),
                catch: (cause) => mapError("interrupt", cause)
              }).pipe(Effect.asVoid),

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
                  provider: "cloudflare"
                })
              )
            }

            return handle
          })
      )

      const destroy = Effect.tryPromise({
        try: () => sandbox.destroy(),
        catch: (cause) => mapError("destroy", cause)
      })

      return SandboxService.of({
        provider: "cloudflare",
        isolated: true,
        exec,
        writeFile,
        readFile,
        runAgent,
        destroy
      })
    })
  )

// Internal type for the sandbox client returned by getSandbox().
// Based on @cloudflare/sandbox v0.7.0 actual .d.ts types.
//
// Only the methods we use are typed here. The full Sandbox class has
// additional methods (startProcess, createSession, exposePort, git, etc.)
// that we don't need for the initial implementation.
type CloudflareSandboxHandle = {
  exec(command: string, options?: {
    stream?: boolean
    timeout?: number
    env?: Record<string, string | undefined>
    cwd?: string
    onOutput?: (stream: "stdout" | "stderr", data: string) => void
    signal?: AbortSignal
  }): Promise<{
    success: boolean
    stdout: string
    stderr: string
    exitCode: number
    command: string
    duration: number
    timestamp: string
  }>
  // Returns a ReadableStream of SSE events (NOT raw bytes).
  // Use parseSSEStream<ExecEvent>(stream) to iterate events.
  // Event types: "start" | "stdout" | "stderr" | "complete" | "error"
  execStream(command: string, options?: {
    timeout?: number
    env?: Record<string, string | undefined>
    cwd?: string
    bufferSize?: number
    signal?: AbortSignal
  }): Promise<ReadableStream>
  writeFile(path: string, content: string, options?: {
    encoding?: string
  }): Promise<{ success: boolean; path: string; timestamp: string }>
  readFile(path: string, options?: {
    encoding?: string
  }): Promise<{ content: string; encoding: string; success: boolean; path: string }>
  setEnvVars(envVars: Record<string, string | undefined>): Promise<void>
  destroy(): Promise<void>
}
