# Engineering Specification: SandboxService, Deployment Profiles, and Cloudflare Storage Backends

**Version:** 1.6
**Date:** 2026-02-06
**Status:** Implemented (type corrections verified against actual packages)
**Scope:** `effect-claude-agent-sdk` v0.5.0

---

## 1. Overview

This specification defines three additions to `effect-claude-agent-sdk`:

1. **SandboxService** -- An Effect service that abstracts agent execution backends, supporting local passthrough and Cloudflare Sandbox (`@cloudflare/sandbox`) with agent-in-sandbox isolation.
2. **Deployment Profiles** -- Extended `QuickConfig` and `AgentSdkConfig` with environment-driven backend selection for sandbox provider, storage backend, and storage mode.
3. **R2 and KV Storage Backends** -- Two new `KeyValueStore` implementations backed by Cloudflare R2 (object storage) and KV (key-value), integrated into the existing `StorageLayers` factory.

All three integrate with the existing hook, tool, and persistence systems without breaking backwards compatibility.

---

## 2. Design Principles

- **Backwards compatible.** All new behavior is opt-in via config or layer composition. **Minor breaking change:** Adding `SandboxError` to the `AgentSdkError` union means consumers with exhaustive pattern matches on `AgentSdkError._tag` will get compile-time errors for the unhandled `"SandboxError"` case. This is intentional -- it ensures all error handlers are updated.
- **Effect-native.** Follow existing codebase patterns: `Context.Tag` services, `Layer` composition, `Schema.TaggedError` errors, `Effect.fn` naming, `Effect.serviceOption` for optional dependencies.
- **Peer dependencies only.** `@cloudflare/sandbox` is a peer dependency. Users who run locally never install it. The Cloudflare layer module uses dynamic import to avoid hard dependency.
- **Hooks stay outside.** Hooks are in-process JavaScript callbacks (closures captured via `Effect.runtime()`). They are NOT serializable config and CANNOT cross the sandbox process boundary. The orchestrator strips all non-serializable fields (hooks, canUseTool, stderr, spawnClaudeCodeProcess, abortController) from `Options` before passing to the sandbox, then applies hook-driven behavior to the returned message stream. **Limitation:** Custom MCP tools defined in the orchestrator are not reachable from inside the sandbox (MCP bridge deferred -- see Open Questions).
- **YAGNI.** No workflow DSL, no Docker backend, no autoscaling. Build the minimum needed to run agents locally or in Cloudflare Sandbox with pluggable storage.

---

## 3. SandboxService

### 3.1 Error Type

**File:** `src/Sandbox/SandboxError.ts`

Follows the project's `Schema.TaggedError` pattern (see `src/Errors.ts:6-12`):

```typescript
import * as Schema from "effect/Schema"

export class SandboxError extends Schema.TaggedError<SandboxError>()(
  "SandboxError",
  {
    message: Schema.String,
    operation: Schema.String,
    provider: Schema.Literal("local", "cloudflare"),
    cause: Schema.optional(Schema.Defect)
  }
) {}
```

Add `SandboxError` to the `AgentSdkError` union in `src/Errors.ts`:

```typescript
export const AgentSdkError = Schema.Union(
  ConfigError,
  DecodeError,
  TransportError,
  HookError,
  McpError,
  SandboxError  // NEW
)
```

### 3.2 Service Interface

**File:** `src/Sandbox/SandboxService.ts`

Uses `Context.Tag` pattern matching `ArtifactStore` (see `src/Storage/ArtifactStore.ts:674-687`):

```typescript
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Stream from "effect/Stream"
import type * as Scope from "effect/Scope"
import type { SandboxError } from "./SandboxError.js"
import type { QueryHandle } from "../Query.js"
import type { Options } from "../Schema/Options.js"
import type { SDKMessage } from "../Schema/Message.js"

export type SandboxProvider = "local" | "cloudflare"

export type ExecResult = {
  readonly stdout: string
  readonly stderr: string
  readonly exitCode: number
}

export class SandboxService extends Context.Tag(
  "@effect/claude-agent-sdk/SandboxService"
)<
  SandboxService,
  {
    /** Which backend is active. */
    readonly provider: SandboxProvider

    /** Whether execution is isolated from the host. */
    readonly isolated: boolean

    /** Execute a shell command in the sandbox environment. */
    readonly exec: (
      command: string,
      args?: ReadonlyArray<string>
    ) => Effect.Effect<ExecResult, SandboxError>

    /** Write a file inside the sandbox. */
    readonly writeFile: (
      path: string,
      content: string
    ) => Effect.Effect<void, SandboxError>

    /** Read a file from the sandbox. */
    readonly readFile: (
      path: string
    ) => Effect.Effect<string, SandboxError>

    /**
     * Run a full agent session inside the sandbox.
     *
     * Returns a QueryHandle whose stream emits SDKMessage events
     * from the sandboxed agent. Hooks are applied by the caller
     * (AgentRuntime), not inside the sandbox.
     */
    readonly runAgent: (
      prompt: string,
      options?: Options
    ) => Effect.Effect<QueryHandle, SandboxError, Scope.Scope>

    /** Tear down the sandbox instance. Noop for local. */
    readonly destroy: Effect.Effect<void, SandboxError>
  }
>() {}
```

### 3.3 Local Layer

**File:** `src/Sandbox/SandboxLocal.ts`

Passthrough implementation. `exec` uses `Bun.$`, file ops use `Bun.file`. `runAgent` delegates to the existing `QuerySupervisor.submit()`. This is the default -- zero behavioral change from today.

```typescript
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import { SandboxService, type ExecResult } from "./SandboxService.js"
import { SandboxError } from "./SandboxError.js"
import { QuerySupervisor } from "../QuerySupervisor.js"

const mapError = (operation: string, cause: unknown) =>
  SandboxError.make({
    message: `local sandbox ${operation} failed`,
    operation,
    provider: "local",
    cause
  })

const make = Effect.gen(function*() {
  const supervisor = yield* QuerySupervisor

  // Uses array-form spawn (no shell interpretation) to prevent command injection.
  // Matches existing pattern in src/Diagnose.ts:93.
  const exec = Effect.fn("SandboxLocal.exec")(
    (command: string, args?: ReadonlyArray<string>) =>
      Effect.tryPromise({
        try: async () => {
          const cmd = args ? [command, ...args] : [command]
          const result = Bun.spawnSync({ cmd })
          return {
            stdout: result.stdout.toString(),
            stderr: result.stderr.toString(),
            exitCode: result.exitCode
          } satisfies ExecResult
        },
        catch: (cause) => mapError("exec", cause)
      })
  )

  const writeFile = Effect.fn("SandboxLocal.writeFile")(
    (path: string, content: string) =>
      Effect.tryPromise({
        try: () => Bun.write(path, content),
        catch: (cause) => mapError("writeFile", cause)
      }).pipe(Effect.asVoid)
  )

  const readFile = Effect.fn("SandboxLocal.readFile")(
    (path: string) =>
      Effect.tryPromise({
        try: () => Bun.file(path).text(),
        catch: (cause) => mapError("readFile", cause)
      })
  )

  const runAgent = Effect.fn("SandboxLocal.runAgent")(
    (prompt: string, options?: import("../Schema/Options.js").Options) =>
      supervisor.submit(prompt, options).pipe(
        Effect.mapError((cause) => mapError("runAgent", cause))
      )
  )

  // INVARIANT: isolated MUST be false for the local layer.
  // The QuerySupervisor's dispatchQuery checks `isolated === true` before
  // routing to SandboxService.runAgent. If this were true, it would create
  // an infinite loop: supervisor.submit -> dispatchQuery -> runAgent -> supervisor.submit -> ...
  // The `isolated: false` guard breaks this cycle. Do NOT change this
  // without also changing the supervisor dispatch logic.
  return SandboxService.of({
    provider: "local",
    isolated: false,
    exec,
    writeFile,
    readFile,
    runAgent,
    destroy: Effect.void
  })
})

export const layerLocal: Layer.Layer<SandboxService, never, QuerySupervisor> =
  Layer.effect(SandboxService, make)
```

### 3.4 Cloudflare Sandbox Layer

**File:** `src/Sandbox/SandboxCloudflare.ts`

Wraps `@cloudflare/sandbox`. Uses the Sandbox SDK API:
- `getSandbox(env.Sandbox, sandboxId)` -- lifecycle ([docs: Sandbox SDK Lifecycle](https://developers.cloudflare.com/sandbox/api/lifecycle/))
- `sandbox.exec(command)` returns `{ success, stdout, stderr, exitCode }` ([docs: Commands API](https://developers.cloudflare.com/sandbox/api/commands/))
- `sandbox.writeFile(path, content)` / `sandbox.readFile(path)` ([docs: Files API](https://developers.cloudflare.com/sandbox/api/files/))

The `runAgent` method starts a Claude Code session inside the sandbox by:
1. Writing the `ANTHROPIC_API_KEY` env var into the sandbox via `sandbox.setEnvVars()`
2. Writing the prompt to a temp file, running `claude --output-format stream-json --prompt-file <path>` via `sandbox.execStream()`
3. Using `parseSSEStream()` from `@cloudflare/sandbox` to iterate SSE events (stdout, stderr, complete, error)
4. Extracting stdout data, feeding through `@effect/platform/Ndjson.unpack()` for NDJSON line splitting
5. Wrapping the parsed `SDKMessage` stream as a `QueryHandle`

```typescript
import * as Chunk from "effect/Chunk"
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
): Layer.Layer<SandboxService> =>
  Layer.scoped(
    SandboxService,
    Effect.gen(function*() {
      // Dynamic import -- @cloudflare/sandbox is a peer dep.
      // getSandbox returns synchronously (lazy container start on first operation).
      // parseSSEStream converts execStream's ReadableStream into AsyncIterable<T>.
      const { getSandbox, parseSSEStream } = yield* Effect.tryPromise({
        try: () => import("@cloudflare/sandbox") as Promise<{
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
            catch: () => void 0  // best-effort cleanup
          })
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
          })
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
      // See P1-6 in the review corrections.
      const runAgent = Effect.fn("SandboxCloudflare.runAgent")(
        (prompt: string, queryOptions?: import("../Schema/Options.js").Options) =>
          Effect.gen(function*() {
            const model = queryOptions?.model ?? "sonnet"

            // Strategy: Write the prompt to a temp file inside the sandbox,
            // then pass --prompt-file to Claude Code. This avoids any shell
            // escaping issues with user-provided prompt content.
            //
            // The sandbox.execStream API accepts a single command string
            // interpreted by the sandbox's shell, so we must ensure all
            // arguments are safely escaped.
            //
            // Use crypto.randomUUID() for uniqueness (no collisions).
            // File is cleaned up after the exec stream completes via
            // Effect.addFinalizer below.
            const promptFile = `/tmp/.claude-prompt-${crypto.randomUUID()}.txt`
            yield* Effect.tryPromise({
              try: () => sandbox.writeFile(promptFile, prompt),
              catch: (cause) => mapError("runAgent.writePrompt", cause)
            })

            // Register cleanup for the prompt file
            yield* Effect.addFinalizer(() =>
              Effect.tryPromise({
                try: () => sandbox.exec(`rm -f ${shellEscape(promptFile)}`),
                catch: () => void 0  // best-effort cleanup
              })
            )

            // Build command with shell-escaped arguments.
            // Prompt content is in the file, not in the command string.
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
            // When the scope closes, the readable stream is cancelled,
            // which signals the sandbox to terminate the process.
            const readable = yield* Effect.acquireRelease(
              Effect.tryPromise({
                try: () => sandbox.execStream(command),
                catch: (cause) => mapError("runAgent.exec", cause)
              }),
              (stream) =>
                Effect.tryPromise({
                  try: () => stream.cancel(),
                  catch: () => void 0  // best-effort cleanup
                })
            )

            // Convert execStream's SSE ReadableStream into an Effect Stream of SDKMessage.
            //
            // execStream() returns a ReadableStream of SSE events, NOT raw bytes.
            // Each SSE event has shape: { type, data?, exitCode?, error? }
            // The Claude Code NDJSON output arrives in "stdout" events' `data` field.
            //
            // Pipeline:
            // 1. parseSSEStream<ExecEvent>(readable) -> AsyncIterable<ExecEvent>
            // 2. Filter to "stdout" events, extract `data` strings
            // 3. Buffer partial NDJSON lines (a single stdout event may contain
            //    a partial line, or multiple complete lines)
            // 4. Parse each complete line as JSON -> SDKMessage
            //
            // NOTE: We use @effect/platform/Ndjson.unpack() for step 3-4 to handle
            // NDJSON line splitting correctly (including partial lines across events).
            // The stdout data strings are UTF-8 encoded, so we convert them to
            // Uint8Array chunks for Ndjson.unpack's input type.

            type ExecEvent = {
              type: "start" | "stdout" | "stderr" | "complete" | "error"
              data?: string
              exitCode?: number
              error?: string
            }

            const Ndjson = yield* Effect.tryPromise({
              try: () => import("@effect/platform/Ndjson") as Promise<
                typeof import("@effect/platform/Ndjson")
              >,
              catch: (cause) => mapError("runAgent.import", cause)
            })

            const encoder = new TextEncoder()

            // Convert SSE events -> stdout data chunks -> NDJSON -> SDKMessage
            const messageStream = Stream.fromAsyncIterable(
              parseSSEStream<ExecEvent>(readable),
              (cause) => mapError("runAgent.sse", cause)
            ).pipe(
              // Filter to stdout events and extract data as Uint8Array chunks.
              // stderr events are ignored (Claude Code diagnostic output).
              // "complete" and "error" events signal stream end.
              Stream.filterMap((event) => {
                if (event.type === "stdout" && event.data) {
                  return Option.some(encoder.encode(event.data))
                }
                if (event.type === "error") {
                  // Surface sandbox exec errors -- these indicate the process failed
                  return Option.none()
                }
                return Option.none()
              }),
              // Chunk into Uint8Array arrays for Ndjson.unpack's input type.
              Stream.map((bytes) => Chunk.of(bytes)),
              Stream.flatMap((chunk) => Stream.fromChunk(chunk)),
              // Ndjson.unpack is a Channel -- pipe through it.
              // Handles line splitting, partial lines across chunks, empty lines.
              Stream.pipeThroughChannelOrFail(
                Ndjson.unpack({ ignoreEmptyLines: true })
              ),
              // Map NdjsonError into SandboxError
              Stream.mapError((cause) => mapError("runAgent.ndjson", cause)),
              // Cast parsed JSON to SDKMessage. Consider Ndjson.unpackSchema
              // for runtime validation in production.
              Stream.map((json) => json as unknown as import("../Schema/Message.js").SDKMessage)
            )

            // Build a QueryHandle that satisfies the full interface contract.
            //
            // The sandbox QueryHandle has these semantics:
            // - stream: full SDKMessage stream from sandboxed agent
            // - interrupt: cancels the sandbox exec stream
            // - closeInput: noop (sandbox stdin not connected)
            // - send/sendAll/sendForked: fail with SandboxError (input not supported)
            // - share/broadcast: delegate to Stream.share/Stream.broadcast with correct types
            // - read-only queries (supportedCommands, etc.): return empty defaults
            // - accountInfo: fails (not available in sandbox)
            //
            // Rationale: Consumers (AgentRuntime, AgentHttpHandlers, AgentRpcHandlers,
            // SessionPool) depend on the full QueryHandle semantics. Silent stubs hide
            // bugs. Explicit failures surface misuse immediately.
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

              // Configuration: noop in sandbox (sandboxed agent has its own config)
              setPermissionMode: () => Effect.void,
              setModel: () => Effect.void,
              setMaxThinkingTokens: () => Effect.void,

              // Read-only queries: return empty/safe defaults
              // RewindFilesResult shape: { canRewind, error?, filesChanged?, insertions?, deletions? }
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
// See: node_modules/@cloudflare/sandbox/dist/sandbox-CEsJ1edi.d.ts
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
```

### 3.5 Public Exports

**File:** `src/Sandbox/index.ts`

```typescript
export { SandboxService, type SandboxProvider, type ExecResult } from "./SandboxService.js"
export { SandboxError } from "./SandboxError.js"
export { layerLocal } from "./SandboxLocal.js"
export {
  layerCloudflare,
  type CloudflareSandboxEnv,
  type CloudflareSandboxOptions
} from "./SandboxCloudflare.js"
```

### 3.6 AgentRuntime Integration

**File:** `src/QuerySupervisor.ts` -- modification to `submit()`

> **Critical design decision:** Sandbox queries MUST route through `QuerySupervisor.submit()`.
> The supervisor provides concurrency control (semaphore), query tracking (`activeRef` map),
> backpressure queueing, pending timeouts, scope-based cancellation, metrics, event
> publishing, and distributed tracing. Bypassing the supervisor would lose all of these
> guarantees and break `interruptAll()`, `stats()`, and `events` stream.

The integration point is in `QuerySupervisor`, not `AgentRuntime.query()`. The supervisor
already wraps the SDK `query()` call inside `startQuery` (line ~232). We replace the
`sdk.query()` call with a sandbox-aware dispatch so all supervisor guarantees apply.

**File:** `src/QuerySupervisor.ts` -- modification to `startQuery()` (line ~237)

The current code at line ~237 calls `sdk.query(request.prompt, request.options)`. We
extract a `dispatchQuery` helper and replace that call:

```typescript
// New helper: sandbox-aware query dispatch
// Replaces the direct sdk.query() call inside startQuery (line ~237).
const dispatchQuery = (
  prompt: string | AsyncIterable<SDKUserMessage>,
  options?: Options
) => {
  // Check for optional sandbox service
  const sandboxOption = Effect.serviceOption(SandboxService)
  return Effect.flatMap(sandboxOption, (option) => {
    if (Option.isSome(option) && option.value.isolated) {
      // Sandbox only supports string prompts. Non-string prompts
      // (AsyncIterable<SDKUserMessage>) cannot be serialized across
      // the process boundary. Fail explicitly rather than silently
      // falling back to the host SDK (which would bypass isolation).
      if (typeof prompt !== "string") {
        return Effect.fail(
          SandboxError.make({
            message: "Sandbox queries only support string prompts. " +
              "AsyncIterable<SDKUserMessage> cannot cross the sandbox boundary.",
            operation: "dispatchQuery",
            provider: option.value.provider
          })
        )
      }
      // Strip non-serializable fields before passing to sandbox.
      const sandboxOptions = options
        ? stripNonSerializableOptions(options)
        : options
      return option.value.runAgent(prompt, sandboxOptions)
    }
    // Existing path: delegate to AgentSdk.query() -- unchanged
    return sdk.query(prompt, options)
  })
}
```

Then in `startQuery` (line ~237), replace:
```typescript
// Before:
sdk.query(request.prompt, request.options).pipe(Scope.extend(request.scope))
// After:
dispatchQuery(request.prompt, request.options).pipe(Scope.extend(request.scope))
```

This preserves the existing `Scope.extend(request.scope)` handling, so the sandbox
handle's scope is correctly extended to the caller's scope. All supervisor guarantees
still apply because `dispatchQuery` is called INSIDE `startQuery`:
- Semaphore acquisition (concurrency control)
- Active query tracking (enables `interruptAll()`)
- Pending queue management (backpressure)
- Metrics collection (started/completed/failed/duration)
- Event publishing (QueryQueued/Started/Completed)
- Scope-based cancellation

**File:** `src/AgentRuntime.ts` -- NO CHANGES to `query()` or `runQuery()`

The existing `AgentRuntime.query()` path remains unchanged:
```typescript
// Unchanged -- already routes through supervisor
const runQuery = (prompt, options) =>
  applyRetry(supervisor.submit(prompt, options), settings)

const query = Effect.fn("AgentRuntime.query")(function*(prompt, options) {
  const handle = yield* runQuery(prompt, options)
  return yield* decorateHandle(handle, settings)
})
```

Retry logic (`applyRetry`) also applies to sandbox queries because they flow through `submit()`.

**Scope.Scope note:** `SandboxService.runAgent` requires `Scope.Scope` for `Effect.acquireRelease`.
This is satisfied by the same scope the supervisor's `submit()` already operates within
(via `Effect.uninterruptibleMask` and `Effect.forkScoped`).

**Non-serializable options stripping:**

The `Options` type has 5 non-serializable fields that cannot cross a process boundary:

```typescript
/**
 * Strip ALL non-serializable fields from Options before passing
 * to a sandboxed agent process.
 *
 * Non-serializable fields (callbacks, AbortController):
 * - hooks: HookMap (callback arrays)
 * - canUseTool: CanUseTool callback
 * - stderr: StderrCallback
 * - spawnClaudeCodeProcess: SpawnClaudeCodeProcess callback
 * - abortController: AbortController (has AbortSignal methods)
 *
 * These are applied by the orchestrator to the message stream
 * AFTER it exits the sandbox, via decorateHandle() and layerWithPersistence().
 */
const stripNonSerializableOptions = (options: Options): Options => {
  const {
    hooks,
    canUseTool,
    stderr,
    spawnClaudeCodeProcess,
    abortController,
    ...rest
  } = options
  return rest as Options
}
```

**Import additions:**

```typescript
import * as Option from "effect/Option"   // already imported
import { SandboxService } from "./Sandbox/SandboxService.js"  // NEW
import { SandboxError } from "./Sandbox/SandboxError.js"       // NEW
```

**Hook execution model:**

Hooks are in-process JavaScript callbacks, not serializable configuration. They are captured via `Effect.runtime()` closures.

**Important distinction:** Hooks serve two purposes:
- **Observability** (e.g., `PostToolUse` logging, `SessionEnd` audit) -- these are applied to the message stream after it exits the sandbox, so they observe sandboxed activity correctly.
- **Enforcement** (e.g., `withAuditOptions` in `AgentRuntime.ts:295-313` wraps permission hooks via `wrapPermissionHooks`, and merges audit hooks PRE-query into options) -- these are enforcement decisions, not just observation. Sandboxed queries run WITHOUT the orchestrator's permission enforcement hooks, since those hooks are stripped before crossing the boundary. The sandboxed Claude Code process uses its own `--dangerously-skip-permissions` or default permission mode.

The execution flow for sandboxed queries:

1. `QuerySupervisor.submit()` acquires semaphore, tracks query in `activeRef`
2. `dispatchQuery()` detects sandbox service, strips 5 non-serializable fields (including enforcement hooks)
3. The sandbox runs the agent with serializable-only options (no orchestrator permission enforcement)
4. `AgentRuntime.decorateHandle()` applies timeouts to the returned handle
5. `layerWithPersistence()` applies observability hooks (audit logging, event publishing) to the message stream _after_ it exits the sandbox

**Consequence:** Sandboxed queries are NOT subject to the orchestrator's `canUseTool` or permission hooks. If the sandbox runs with `--dangerously-skip-permissions`, the sandboxed agent has unrestricted tool access within its sandbox. This is acceptable because the sandbox provides process-level isolation.

All supervisor guarantees (concurrency, tracking, queueing, metrics, events, retry) apply uniformly to both local and sandboxed queries.

---

## 4. Deployment Profiles

### 4.1 Extended QuickConfig

**File:** `src/QuickConfig.ts` -- modification

Add three new optional fields to `QuickConfig`:

```typescript
export type QuickConfig = {
  // Existing fields (unchanged)
  readonly apiKey?: string
  readonly model?: string
  readonly timeout?: Duration.DurationInput
  readonly concurrency?: number
  readonly persistence?:
    | "memory"
    | "filesystem"
    | { readonly directory: string }
    | { readonly sync: string }

  // NEW: execution backend
  // NAMING: This is DIFFERENT from Options.sandbox (src/Schema/Options.ts),
  // which controls Claude Code's built-in sandboxing restrictions (network,
  // ripgrep, etc. -- see src/Schema/Sandbox.ts). QuickConfig.sandbox controls
  // the execution backend (where the agent process runs).
  // Note: "cloudflare" as a bare string is NOT supported because Worker
  // bindings must be passed programmatically. Use the object form instead.
  readonly sandbox?: "local" | {
    readonly provider: "cloudflare"
    readonly sandboxId: string
    readonly env: import("./Sandbox/SandboxCloudflare.js").CloudflareSandboxEnv
    readonly sleepAfter?: string
    readonly apiKey?: string
  }

  // NEW: storage backend selection
  readonly storageBackend?: "bun" | "filesystem" | "r2" | "kv"

  // NEW: storage mode
  readonly storageMode?: "standard" | "journaled"
}
```

### 4.2 Extended Environment Variables

**File:** `src/AgentSdkConfig.ts` -- additions

> **Architecture note:** Environment variables are consumed exclusively by `AgentSdkConfig`
> (which already reads 15+ env vars via `Config.option` + `Schema.Config`).
> `QuickConfig` is intentionally programmatic-only -- it does NOT read from env.
> This separation is by design: `AgentSdkConfig` = env-driven (deployment config),
> `QuickConfig` = code-driven (developer convenience).

New config keys parsed from environment, following the existing `Config.option` + `Option` pattern (see `src/AgentSdkConfig.ts:61-261`):

| Env Var | Type | Default | Description |
|---------|------|---------|-------------|
| `SANDBOX_PROVIDER` | `"local" \| "cloudflare"` | `"local"` | Execution backend hint (see note below) |
| `SANDBOX_ID` | `string` | `undefined` | Sandbox instance ID (cloudflare only) |
| `SANDBOX_SLEEP_AFTER` | `string` | `"10m"` | Idle timeout (cloudflare only) |

> **Activation note:** `SANDBOX_PROVIDER=cloudflare` is consumed by `AgentSdkConfig` and
> exposes the config value, but it does NOT activate the sandbox on its own. Cloudflare
> Worker bindings (the `env.Sandbox` DO binding) must be passed programmatically via
> `layerCloudflare({ env, sandboxId, ... })`. The env var serves as a signal to
> application code (e.g., in a Worker's `fetch` handler) to construct the Cloudflare
> sandbox layer. The `QuickConfig` path uses the object form directly.
| `STORAGE_BACKEND` | `"bun" \| "filesystem" \| "r2" \| "kv"` | `"bun"` | Storage backend |
| `STORAGE_MODE` | `"standard" \| "journaled"` | `"standard"` | Storage mode |
| `R2_BUCKET_BINDING` | `string` | `"BUCKET"` | R2 binding name in Cloudflare env |
| `KV_NAMESPACE_BINDING` | `string` | `"KV"` | KV binding name in Cloudflare env |

Parsing follows the existing `Schema.Config` pattern:

```typescript
const SandboxProviderSchema = Schema.Literal("local", "cloudflare")
const StorageBackendSchema = Schema.Literal("bun", "filesystem", "r2", "kv")
const StorageModeSchema = Schema.Literal("standard", "journaled")

// In makeAgentSdkConfig:
const sandboxProvider = yield* Config.option(
  Schema.Config("SANDBOX_PROVIDER", SandboxProviderSchema)
)
const sandboxId = yield* Config.option(Config.string("SANDBOX_ID"))
const sandboxSleepAfter = yield* Config.option(Config.string("SANDBOX_SLEEP_AFTER"))
const storageBackend = yield* Config.option(
  Schema.Config("STORAGE_BACKEND", StorageBackendSchema)
)
const storageMode = yield* Config.option(
  Schema.Config("STORAGE_MODE", StorageModeSchema)
)
```

These are exposed on the `AgentSdkConfig` object as `Option` values. Application code reads them to decide which layers to construct (e.g., checking `config.sandboxProvider` to choose between `layerLocal` and `layerCloudflare`). Note that `QuickConfig.runtimeLayer()` does NOT read these env vars -- it uses its own programmatic `QuickConfig` fields exclusively.

### 4.3 Layer Selection in runtimeLayer()

**File:** `src/QuickConfig.ts` -- modification to `runtimeLayer()`

```typescript
export const runtimeLayer = (config?: QuickConfig) => {
  const resolved = resolveQuickConfig(config)
  const runtime = buildRuntimeLayer(resolved)

  // Select sandbox layer
  const sandboxLayer = resolveSandboxLayer(resolved)

  // Select storage layers
  const storageLayers = resolveStorageLayers(resolved)

  // Compose runtime with persistence and sandbox
  const base = AgentRuntime.layerWithPersistence({
    layers: {
      runtime,
      chatHistory: storageLayers.chatHistory,
      artifacts: storageLayers.artifacts,
      auditLog: storageLayers.auditLog,
      sessionIndex: storageLayers.sessionIndex,
      storageConfig: StorageConfig.layer
    }
  })

  return sandboxLayer
    ? Layer.provide(base, sandboxLayer)
    : base
}
```

Where `resolveSandboxLayer()` returns `Layer<SandboxService> | undefined` based on config:

```typescript
// QuickConfig.sandbox type is: "local" | { provider: "cloudflare", ... } | undefined
// The bare string "cloudflare" is NOT in the type -- the type system prevents
// misconfiguration at compile time. Cloudflare Worker bindings must be passed
// programmatically via the object form.
const resolveSandboxLayer = (config: ResolvedQuickConfig) => {
  if (config.sandbox === "local" || config.sandbox === undefined) {
    return undefined  // No SandboxService in layer = local passthrough
  }
  if (typeof config.sandbox === "object") {
    return layerCloudflare(config.sandbox)
  }
  return undefined
}
```

And `resolveStorageLayers()` extends the existing `storageLayers()` factory:

```typescript
const resolveStorageLayers = (config: ResolvedQuickConfig) => {
  if (config.persistence === "memory") {
    return memoryPersistenceLayers(/* ... */)
  }
  const backend = config.storageBackend ?? "bun"
  const mode = config.storageMode ?? "standard"
  const directory = typeof config.persistence === "object" && "directory" in config.persistence
    ? config.persistence.directory
    : undefined
  return storageLayers({ backend, mode, directory })
}
```

---

## 5. R2 Storage Backend

### 5.1 R2 KeyValueStore

**File:** `src/Storage/StorageR2.ts`

Implements `@effect/platform/KeyValueStore.KeyValueStore` backed by Cloudflare R2.

R2 API reference: https://developers.cloudflare.com/r2/api/workers/workers-api-reference/

Key R2 operations used:
- `bucket.put(key, value)` -- write object, returns `R2Object | null`
- `bucket.get(key)` -- read object, returns `R2ObjectBody | null`
- `bucket.delete(key)` -- delete object
- `bucket.list({ prefix, limit, cursor })` -- list keys, returns `R2Objects`

```typescript
import { KeyValueStore } from "@effect/platform"
import * as PlatformError from "@effect/platform/Error"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Option from "effect/Option"

/**
 * Helper to create PlatformError.SystemError for KVS operations.
 * Matches the internal pattern from @effect/platform's layerStorage.
 * All KeyValueStore methods must return PlatformError.PlatformError
 * (not a custom error type).
 */
const storageError = (method: string, description: string, cause?: unknown) =>
  new PlatformError.SystemError({
    reason: "Unknown",
    module: "KeyValueStore",
    method,
    description,
    ...(cause !== undefined ? { cause } : {})
  })

/**
 * R2Bucket binding type.
 *
 * Minimal subset of the actual `R2Bucket` abstract class from
 * `@cloudflare/workers-types` (v4.20260203.0). At implementation time,
 * consider using `import type { R2Bucket } from "@cloudflare/workers-types"`
 * directly instead of this local type.
 *
 * Full reference: https://developers.cloudflare.com/r2/api/workers/workers-api-reference/
 *
 * Key differences from naive types:
 * - `get()` returns `R2ObjectBody | null` (has `.text()`, `.json()`, `.arrayBuffer()`)
 * - `list()` returns a discriminated union: `cursor` only exists when `truncated: true`
 * - `put()` accepts `ReadableStream | ArrayBuffer | ArrayBufferView | string | null | Blob`
 */
export type R2Bucket = {
  put(key: string, value: string | ArrayBuffer | ArrayBufferView | ReadableStream | null | Blob,
    options?: Record<string, unknown>): Promise<unknown>
  get(key: string, options?: Record<string, unknown>): Promise<{
    text(): Promise<string>
    json<T>(): Promise<T>
    arrayBuffer(): Promise<ArrayBuffer>
  } | null>
  head(key: string): Promise<{ key: string; size: number; etag: string } | null>
  delete(keys: string | string[]): Promise<void>
  list(options?: {
    prefix?: string
    limit?: number
    cursor?: string
    delimiter?: string
  }): Promise<R2ListResult>
}

// Discriminated union matching @cloudflare/workers-types R2Objects type.
// `cursor` only exists when `truncated: true`.
type R2ListResult =
  | { objects: Array<{ key: string }>; truncated: true; cursor: string; delimitedPrefixes: string[] }
  | { objects: Array<{ key: string }>; truncated: false; delimitedPrefixes: string[] }

/**
 * KeyValueStore implementation backed by Cloudflare R2.
 *
 * Key mapping: keys are stored as R2 object keys directly.
 * Values are stored as UTF-8 text objects.
 *
 * Uses `KeyValueStore.makeStringOnly()` which auto-derives binary methods
 * (`getUint8Array`, `modifyUint8Array`) from string `get`/`set` via base64
 * encoding. This is required because `EventJournalKeyValueStore` (used by
 * journaled mode) reads via `getUint8Array()` and writes `Uint8Array` to `set()`.
 * `makeStringOnly` handles this transparently:
 *   - `getUint8Array`: tries base64 decode first, falls back to UTF-8 encode
 *   - `set(key, Uint8Array)`: base64 encodes before storing as string
 *
 * Suitable for: ArtifactStore (large tool results), ChatHistoryStore,
 * AuditEventStore. R2 has no size limit per object (up to 5 TB),
 * making it ideal for artifact storage.
 *
 * Limits:
 * - Key max length: 1024 bytes
 * - No per-key rate limit (unlike KV's 1 write/sec/key)
 * - Strongly consistent within a region
 */
export const layerR2 = (bucket: R2Bucket): Layer.Layer<KeyValueStore.KeyValueStore> =>
  Layer.succeed(
    KeyValueStore.KeyValueStore,
    KeyValueStore.makeStringOnly({
      get: (key) =>
        Effect.tryPromise({
          try: async () => {
            const obj = await bucket.get(key)
            if (!obj) return Option.none()
            return Option.some(await obj.text())
          },
          catch: (cause) => storageError("get", "R2 get failed", cause)
        }),

      set: (key, value) =>
        Effect.tryPromise({
          try: () => bucket.put(key, value),
          catch: (cause) => storageError("set", "R2 set failed", cause)
        }).pipe(Effect.asVoid),

      remove: (key) =>
        Effect.tryPromise({
          try: () => bucket.delete(key),
          catch: (cause) => storageError("remove", "R2 remove failed", cause)
        }),

      // Uses head() instead of get() to avoid downloading the full object body.
      // R2 head() returns metadata only, which is more efficient for large artifacts.
      has: (key) =>
        Effect.tryPromise({
          try: async () => {
            const obj = await bucket.head(key)
            return obj !== null
          },
          catch: (cause) => storageError("has", "R2 has failed", cause)
        }),

      isEmpty:
        Effect.tryPromise({
          try: async () => {
            const result = await bucket.list({ limit: 1 })
            return result.objects.length === 0
          },
          catch: (cause) => storageError("isEmpty", "R2 isEmpty failed", cause)
        }),

      // R2 list() returns a discriminated union: cursor only exists when truncated === true.
      // Use type narrowing via `result.truncated` check before accessing `result.cursor`.
      size:
        Effect.tryPromise({
          try: async () => {
            let count = 0
            let cursor: string | undefined
            do {
              const result = await bucket.list({ limit: 1000, cursor })
              count += result.objects.length
              cursor = result.truncated ? result.cursor : undefined
            } while (cursor)
            return count
          },
          catch: (cause) => storageError("size", "R2 size failed", cause)
        }),

      clear:
        Effect.tryPromise({
          try: async () => {
            let cursor: string | undefined
            do {
              const result = await bucket.list({ limit: 1000, cursor })
              const keys = result.objects.map((o) => o.key)
              if (keys.length > 0) await bucket.delete(keys)
              cursor = result.truncated ? result.cursor : undefined
            } while (cursor)
          },
          catch: (cause) => storageError("clear", "R2 clear failed", cause)
        })
    })
  )
```

### 5.2 KV KeyValueStore

**File:** `src/Storage/StorageKV.ts`

Implements `KeyValueStore.KeyValueStore` backed by Cloudflare KV.

KV API reference: https://developers.cloudflare.com/kv/api/

Key KV operations used:
- `namespace.put(key, value, options?)` -- write, max 25 MiB per value
- `namespace.get(key, type?)` -- read, returns `string | null`
- `namespace.delete(key)` -- delete
- `namespace.list({ prefix?, limit?, cursor? })` -- list keys

```typescript
import { KeyValueStore } from "@effect/platform"
import * as PlatformError from "@effect/platform/Error"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Option from "effect/Option"

// Same storageError helper as StorageR2 (could be shared in a common file)
const storageError = (method: string, description: string, cause?: unknown) =>
  new PlatformError.SystemError({
    reason: "Unknown",
    module: "KeyValueStore",
    method,
    description,
    ...(cause !== undefined ? { cause } : {})
  })

/**
 * KVNamespace binding type.
 *
 * Minimal subset of the actual `KVNamespace` interface from
 * `@cloudflare/workers-types` (v4.20260203.0). At implementation time,
 * consider using `import type { KVNamespace } from "@cloudflare/workers-types"`
 * directly instead of this local type.
 *
 * Full reference: https://developers.cloudflare.com/kv/api/
 *
 * Key differences from naive types:
 * - `KVNamespace<Key extends string = string>` is generic
 * - `get()` has many overloads for "text", "json", "arrayBuffer", "stream"
 * - `list()` returns a discriminated union: `cursor` only exists when `list_complete: false`
 * - `put()` accepts `string | ArrayBuffer | ArrayBufferView | ReadableStream`
 */
export type KVNamespace = {
  get(key: string, type?: "text"): Promise<string | null>
  put(key: string, value: string | ArrayBuffer | ArrayBufferView | ReadableStream, options?: {
    expiration?: number
    expirationTtl?: number
    metadata?: unknown | null
  }): Promise<void>
  delete(key: string): Promise<void>
  list(options?: {
    prefix?: string | null
    limit?: number
    cursor?: string | null
  }): Promise<KVListResult>
}

// Discriminated union matching @cloudflare/workers-types KVNamespaceListResult.
// `cursor` only exists when `list_complete: false`.
type KVListResult =
  | { keys: Array<{ name: string; expiration?: number; metadata?: unknown }>; list_complete: false; cursor: string; cacheStatus: string | null }
  | { keys: Array<{ name: string; expiration?: number; metadata?: unknown }>; list_complete: true; cacheStatus: string | null }

/**
 * KeyValueStore implementation backed by Cloudflare KV.
 *
 * Uses `KeyValueStore.makeStringOnly()` (same rationale as R2 -- see above).
 * Binary methods are auto-derived via base64 encoding/decoding.
 *
 * Suitable for: SessionIndexStore (small metadata), ChatHistoryStore
 * (when individual events are < 25 MiB), AuditEventStore.
 *
 * Characteristics:
 * - Eventually consistent reads (up to 60s propagation)
 * - 1 write per second per key limit
 * - Max value size: 25 MiB
 * - Max key length: 512 bytes
 * - Global distribution with edge caching
 *
 * NOT suitable for: Large artifacts, high-write-rate stores,
 * or stores requiring strong consistency.
 * NOT compatible with journaled mode (blocked at config validation).
 */
export const layerKV = (namespace: KVNamespace): Layer.Layer<KeyValueStore.KeyValueStore> =>
  Layer.succeed(
    KeyValueStore.KeyValueStore,
    KeyValueStore.makeStringOnly({
      get: (key) =>
        Effect.tryPromise({
          try: async () => {
            const value = await namespace.get(key, "text")
            return value === null ? Option.none() : Option.some(value)
          },
          catch: (cause) => storageError("get", "KV get failed", cause)
        }),

      set: (key, value) =>
        Effect.tryPromise({
          try: () => namespace.put(key, value),
          catch: (cause) => storageError("set", "KV set failed", cause)
        }),

      remove: (key) =>
        Effect.tryPromise({
          try: () => namespace.delete(key),
          catch: (cause) => storageError("remove", "KV remove failed", cause)
        }),

      has: (key) =>
        Effect.tryPromise({
          try: async () => {
            const value = await namespace.get(key, "text")
            return value !== null
          },
          catch: (cause) => storageError("has", "KV has failed", cause)
        }),

      isEmpty:
        Effect.tryPromise({
          try: async () => {
            const result = await namespace.list({ limit: 1 })
            return result.keys.length === 0
          },
          catch: (cause) => storageError("isEmpty", "KV isEmpty failed", cause)
        }),

      // KV list() returns a discriminated union: cursor only exists when list_complete === false.
      // Use type narrowing via `!result.list_complete` check before accessing `result.cursor`.
      size:
        Effect.tryPromise({
          try: async () => {
            let count = 0
            let cursor: string | undefined
            do {
              const result = await namespace.list({ limit: 1000, cursor })
              count += result.keys.length
              cursor = !result.list_complete ? result.cursor : undefined
            } while (cursor)
            return count
          },
          catch: (cause) => storageError("size", "KV size failed", cause)
        }),

      // Deletes sequentially within each batch to avoid hitting KV rate limits.
      // KV does not support batch delete, so each key is deleted individually.
      clear:
        Effect.tryPromise({
          try: async () => {
            let cursor: string | undefined
            do {
              const result = await namespace.list({ limit: 1000, cursor })
              for (const k of result.keys) {
                await namespace.delete(k.name)
              }
              cursor = !result.list_complete ? result.cursor : undefined
            } while (cursor)
          },
          catch: (cause) => storageError("clear", "KV clear failed", cause)
        })
    })
  )
```

### 5.3 StorageLayers Integration

**File:** `src/Storage/StorageLayers.ts` -- modifications

Extend `StorageBackend` type and `layers()` function:

```typescript
// Line 19: extend type
export type StorageBackend = "filesystem" | "bun" | "r2" | "kv"

// New: Cloudflare binding options
export type CloudflareStorageBindings = {
  readonly r2Bucket?: import("./StorageR2.js").R2Bucket
  readonly kvNamespace?: import("./StorageKV.js").KVNamespace
}

// Extend StorageLayerBundleOptions
export type StorageLayerBundleOptions<R = never> = StorageLayerOptions & {
  readonly backend?: StorageBackend
  readonly mode?: StorageMode
  readonly sync?: StorageSyncOptions<R>
  readonly bindings?: CloudflareStorageBindings  // NEW
}
```

Add new branches in the `layers()` function (after line 286):

```typescript
if (backend === "r2") {
  if (!options.bindings?.r2Bucket) {
    throw new Error("StorageLayers: backend 'r2' requires bindings.r2Bucket")
  }
  // Sync is not yet supported with R2/KV backends. The sync WebSocket
  // layer (buildJournaledSyncLayers) is tightly coupled to the filesystem
  // KeyValueStore. R2/KV sync support is deferred to a follow-up.
  if (options.sync) {
    throw new Error(
      "StorageLayers: 'sync' is not yet supported with backend 'r2'. " +
      "Use backend 'bun' or 'filesystem' for sync-enabled storage."
    )
  }
  const kvsLayer = layerR2(options.bindings.r2Bucket)
  return resolveLayersFromKvs(kvsLayer, mode, options)
}

if (backend === "kv") {
  if (!options.bindings?.kvNamespace) {
    throw new Error("StorageLayers: backend 'kv' requires bindings.kvNamespace")
  }
  if (options.sync) {
    throw new Error(
      "StorageLayers: 'sync' is not yet supported with backend 'kv'. " +
      "Use backend 'bun' or 'filesystem' for sync-enabled storage."
    )
  }
  // SAFETY: Block KV + journaled combination at config validation time.
  // KV has a 1 write/sec/key limit. Journaled mode's EventLog performs
  // frequent writes to the event-journal key, which will hit this limit
  // and cause silent data loss or throttling errors.
  if (mode === "journaled") {
    throw new Error(
      "StorageLayers: backend 'kv' cannot be used with mode 'journaled'. " +
      "KV's 1 write/sec/key limit is incompatible with EventLog's write patterns. " +
      "Use backend 'r2' or 'bun' for journaled mode, or use mode 'standard' with KV."
    )
  }
  const kvsLayer = layerKV(options.bindings.kvNamespace)
  return resolveLayersFromKvs(kvsLayer, mode, options)
}
```

**Function overload signatures** must be added for the new backends:

```typescript
// Existing overloads (unchanged)
export function layers(
  options?: StorageLayerBundleOptions & { readonly backend?: "bun" }
): StorageLayersWithSync<unknown, never>
export function layers(
  options: StorageLayerBundleOptions & { readonly backend: "filesystem" }
): StorageLayersWithSync<unknown, FileSystem | Path>
// NEW overloads for R2 and KV
export function layers(
  options: StorageLayerBundleOptions & { readonly backend: "r2" }
): StorageLayersWithSync<unknown, never>
export function layers(
  options: StorageLayerBundleOptions & { readonly backend: "kv" }
): StorageLayersWithSync<unknown, never>
```

Where `resolveLayersFromKvs` builds the four store layers from a generic `KeyValueStore` layer:

```typescript
const resolveLayersFromKvs = <E, R>(
  kvsLayer: Layer.Layer<KeyValueStore.KeyValueStore, E, R>,
  mode: StorageMode,
  _options?: StorageLayerBundleOptions
): StorageLayers<E, R> => ({
  chatHistory: mode === "journaled"
    ? ChatHistoryStore.layerJournaled().pipe(Layer.provide(kvsLayer))
    : ChatHistoryStore.layerKeyValueStore().pipe(Layer.provide(kvsLayer)),
  artifacts: mode === "journaled"
    ? ArtifactStore.layerJournaled().pipe(Layer.provide(kvsLayer))
    : ArtifactStore.layerKeyValueStore().pipe(Layer.provide(kvsLayer)),
  auditLog: AuditEventStore.layerKeyValueStore().pipe(Layer.provide(kvsLayer)),
  sessionIndex: SessionIndexStore.layerKeyValueStore().pipe(Layer.provide(kvsLayer))
})
```

> **Note:** Return type is `StorageLayers<E, R>` (not `E | unknown`, which collapses to `unknown` and loses error type information).

This works because all stores already accept a `KeyValueStore.KeyValueStore` dependency. The R2 and KV layers implement that interface. No store code changes needed.

---

## 6. Wrangler Configuration

### 6.1 Sandbox Worker

When deploying with Cloudflare Sandbox, the user's `wrangler.toml` needs:

```toml
name = "my-agent-worker"
main = "src/worker.ts"
compatibility_date = "2026-02-01"
compatibility_flags = ["nodejs_compat"]

# Sandbox container
[[containers]]
class_name = "Sandbox"
image = "./Dockerfile"
instance_type = "basic"     # 1/4 vCPU, 1 GiB RAM, 4 GB disk
max_instances = 5

[durable_objects]
bindings = [
  { name = "Sandbox", class_name = "Sandbox" },
  { name = "SYNC_DO", class_name = "SyncDurableObject" }
]

[[migrations]]
tag = "v1"
new_sqlite_classes = ["Sandbox", "SyncDurableObject"]

# Optional: R2 bucket for artifact storage
[[r2_buckets]]
binding = "BUCKET"
bucket_name = "agent-artifacts"

# Optional: KV namespace for session index
[[kv_namespaces]]
binding = "KV"
id = "REPLACE_WITH_KV_NAMESPACE_ID"
```

Reference: https://developers.cloudflare.com/sandbox/configuration/wrangler/

### 6.2 Worker Entry Point

```typescript
// src/worker.ts
export { Sandbox } from "@cloudflare/sandbox"
export { SyncDurableObject } from "effect-claude-agent-sdk/cloudflare"

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // ... agent orchestration using effect-claude-agent-sdk
  }
}
```

---

## 7. New Dependencies

### 7.1 package.json Changes

```jsonc
{
  "peerDependencies": {
    // NEW: optional peer deps (v0.7.0+ for parseSSEStream, ExecEvent types)
    "@cloudflare/sandbox": ">=0.7.0"
  },
  "peerDependenciesMeta": {
    "@cloudflare/sandbox": {
      "optional": true
    }
  },
  "devDependencies": {
    // UPDATE: bump workers types
    "@cloudflare/workers-types": "^4.20260205.0"
  }
}
```

### 7.2 Installation

For local-only usage (no changes):
```bash
bun install
```

For Cloudflare Sandbox usage:
```bash
bun add @cloudflare/sandbox
```

---

## 8. File Manifest

### New Files (8)

| File | Lines (est.) | Purpose |
|------|-------------|---------|
| `src/Sandbox/index.ts` | 10 | Public exports |
| `src/Sandbox/SandboxService.ts` | 60 | Service interface + types |
| `src/Sandbox/SandboxError.ts` | 15 | Tagged error |
| `src/Sandbox/SandboxLocal.ts` | 70 | Local passthrough layer |
| `src/Sandbox/SandboxCloudflare.ts` | 150 | Cloudflare Sandbox layer |
| `src/Storage/StorageR2.ts` | 100 | R2 KeyValueStore |
| `src/Storage/StorageKV.ts` | 100 | KV KeyValueStore |
| `test/Sandbox.test.ts` | 80 | Unit tests for sandbox layers |

### Modified Files (7)

| File | Change |
|------|--------|
| `src/Errors.ts` | Add `SandboxError` to `AgentSdkError` union |
| `src/QuerySupervisor.ts` | Add sandbox-aware dispatch in `startQuery()` + `stripNonSerializableOptions()` (~30 lines) |
| `src/AgentSdkConfig.ts` | Parse new env vars (~30 lines) |
| `src/QuickConfig.ts` | Extend type + layer selection (~40 lines) |
| `src/Storage/StorageLayers.ts` | Add `"r2"` and `"kv"` backends + overloads (~40 lines) |
| `src/index.ts` | Add `export * as Sandbox from "./Sandbox/index.js"` |
| `package.json` | Add `@cloudflare/sandbox` as optional peer dep |

### Unchanged

All existing tests, examples, hooks, tools, MCP, sync, session management, and the cloudflare/ directory remain untouched. The existing test suite must pass without modification.

---

## 9. Testing Strategy

### 9.1 Unit Tests

**SandboxService:**
- `layerLocal`: verify `exec`, `writeFile`, `readFile` delegate to Bun APIs
- `layerLocal`: verify `exec` uses array-form spawn (no shell interpretation)
- `layerLocal`: verify `runAgent` delegates to `QuerySupervisor.submit()`
- `SandboxError`: verify tagged error construction and union membership

**QueryHandle contract parity:**
- Verify sandbox QueryHandle satisfies the full `QueryHandle` interface (all 17 methods)
- Verify `send`, `sendAll`, `sendForked` fail with `SandboxError` (not silent stubs)
- Verify `closeInput` returns `Effect.void` (noop)
- Verify `share` returns `Effect.Effect<Stream.Stream<SDKMessage, AgentSdkError>, never, Scope.Scope>`
- Verify `broadcast` returns `Effect.Effect<TupleOf<N, Stream.Stream<...>>, never, Scope.Scope>`
- Verify `interrupt` cancels the underlying readable stream
- Verify `accountInfo` fails with `SandboxError`
- Verify `setMcpServers` fails with `SandboxError`

**SSE-to-NDJSON parsing pipeline:**
- Test: SSE stdout events containing complete NDJSON lines
- Test: NDJSON line split across two SSE stdout events (partial line in first event)
- Test: SSE stderr events are filtered out (not parsed as SDKMessage)
- Test: SSE "error" event surfaces as stream failure
- Test: SSE "complete" event with exitCode signals stream end
- Test: empty lines between valid JSON lines (handled by `ignoreEmptyLines: true`)
- Test: rapid succession of small SSE events (1 byte data each)

**Storage Backends:**
- `StorageR2.layerR2`: mock `R2Bucket`, verify `get`/`set`/`remove`/`has`/`clear`
- `StorageKV.layerKV`: mock `KVNamespace`, verify `get`/`set`/`remove`/`has`/`clear`
- `StorageLayers.layers({ backend: "r2" })`: verify correct wiring
- `StorageLayers.layers({ backend: "kv" })`: verify correct wiring
- `StorageLayers.layers({ backend: "kv", mode: "journaled" })`: verify throws with clear error message
- `StorageLayers.layers({ backend: "r2", sync: { url: "..." } })`: verify throws (sync not yet supported with R2)
- `StorageLayers.layers({ backend: "kv", sync: { url: "..." } })`: verify throws (sync not yet supported with KV)

**Config:**
- `AgentSdkConfig`: verify new env vars are parsed correctly
- `QuickConfig`: verify `runtimeLayer({ sandbox: "local" })` produces no `SandboxService`
- `QuickConfig`: verify `sandbox: "cloudflare"` is a compile error (not in the type)
- `QuickConfig`: verify `runtimeLayer({ storageBackend: "r2" })` produces R2-backed stores
- Verify `QuickConfig` does NOT read from environment variables

**Supervisor integration:**
- Verify sandbox queries flow through `QuerySupervisor.submit()` (not bypassed)
- Verify concurrency semaphore applies to sandbox queries
- Verify sandbox queries appear in `supervisor.stats()` active count
- Verify `supervisor.interruptAll()` cancels sandbox queries
- Verify all 5 non-serializable fields are stripped before sandbox
- Verify non-string prompts (AsyncIterable) fail with `SandboxError` when sandbox is isolated (not silently bypassed)

### 9.2 Integration Tests

- Existing test suite passes unchanged (backwards compatibility)
- New: end-to-end test with `layerLocal` sandbox + memory storage
- New: sandbox process death / stream cancellation test (verify cleanup runs)
- New: hook stripping test (verify hooks are removed before sandbox, applied after)
- Cloudflare integration tests require `wrangler dev` and are manual/CI-only

### 9.3 Regression Safety

- All 52 existing tests must pass without modification: verify with `bun test`
- One intentional breaking change: `SandboxError` added to `AgentSdkError` union (see Section 2, Design Principles)
- `QueryHandle` interface is unchanged (new implementations must satisfy the full contract)

### 9.4 Implementation Ordering

The following ordering constraints must be respected:

1. `src/Sandbox/SandboxError.ts` **first** -- `SandboxError` must exist before it can be added to `AgentSdkError` union
2. `src/Errors.ts` modification **second** -- add `SandboxError` to union so `QueryHandle` methods can use it
3. `src/Sandbox/SandboxService.ts` **third** -- depends on `SandboxError`
4. `src/Sandbox/SandboxLocal.ts` and `src/Sandbox/SandboxCloudflare.ts` -- depend on service + error
5. `src/Storage/StorageR2.ts` and `src/Storage/StorageKV.ts` -- independent, can be parallel with (4)
6. `src/Storage/StorageLayers.ts` modification -- depends on (5)
7. `src/AgentSdkConfig.ts` modification -- independent of sandbox
8. `src/QuerySupervisor.ts` modification -- depends on (4) for `SandboxService` import (sandbox dispatch + options stripping)
9. `src/QuickConfig.ts` modification -- depends on (4) + (6)
10. `src/index.ts` modification -- last

> Note: `src/AgentRuntime.ts` does NOT need modification. The sandbox dispatch happens in `QuerySupervisor`, which `AgentRuntime` already depends on.

---

## 10. Migration Guide

### For existing users

No changes required. All new features are opt-in.

### To enable Cloudflare Sandbox

1. `bun add @cloudflare/sandbox`
2. Add container config to `wrangler.toml` (see Section 6.1)
3. In your Worker's `fetch` handler, construct the sandbox layer with env bindings:
   ```typescript
   import { runtimeLayer } from "effect-claude-agent-sdk"

   export default {
     async fetch(request: Request, env: Env) {
       const runtime = runtimeLayer({
         sandbox: {
           provider: "cloudflare",
           sandboxId: "my-agent",
           env: { Sandbox: env.Sandbox }
         }
       })
       // ...
     }
   }
   ```
4. Optionally set `SANDBOX_PROVIDER=cloudflare` as a hint for application code to know
   which layer to construct. This env var does NOT activate the sandbox on its own --
   Worker bindings must be passed programmatically.

### To use R2/KV storage

1. Add R2/KV bindings to `wrangler.toml`
2. Pass bindings programmatically via `layers()`:
   ```typescript
   import { Storage } from "effect-claude-agent-sdk"

   const storage = Storage.StorageLayers.layers({
     backend: "r2",
     bindings: { r2Bucket: env.BUCKET }
   })
   ```
3. Optionally set `STORAGE_BACKEND=r2` or `STORAGE_BACKEND=kv` for application code hints.
4. **Important:** KV cannot be used with `mode: "journaled"` (blocked at validation).

---

## 11. Open Questions

1. **Sandbox MCP bridge.** When the agent runs in a Cloudflare Sandbox, custom MCP tools defined in the orchestrator need to be reachable from inside the sandbox. The Sandbox SDK supports exposing ports via `sandbox.exposePort()`. We may need an MCP-over-HTTP bridge where the orchestrator's MCP server listens on a port and the sandboxed agent connects to it. This is deferred to a follow-up.

2. **Multi-turn in sandbox.** The current `runAgent` implementation sends a single prompt. For multi-turn conversations inside a sandbox, we'd need to keep the Claude Code process alive and pipe messages via stdin/stdout through `sandbox.exec`. This may require `sandbox.createSession()` and a persistent shell. Deferred.

3. ~~**R2/KV in journaled mode.**~~ **RESOLVED:** KV + journaled is blocked at config validation time with a clear error message (KV's 1 write/sec/key limit is incompatible with EventLog). R2 + journaled is allowed (R2 has no per-key rate limit and is strongly consistent).

4. **R2/KV + sync.** The WebSocket sync layer (`buildJournaledSyncLayers`) is currently tightly coupled to the filesystem `KeyValueStore` and `layersFileSystem*` families. R2 and KV backends cannot use sync until this coupling is refactored. Both backends validate and throw at runtime if `sync` is requested. Deferred to a follow-up.

---

## 12. Review Corrections (v1.0 -> v1.1)

Summary of corrections applied from the post-v1.0 code review:

| ID | Severity | Issue | Resolution |
|----|----------|-------|------------|
| P0-1 | Critical | QueryHandle contract: missing `closeInput`, wrong `share`/`broadcast` types, silent stubs | Full 17-method QueryHandle with explicit `SandboxError` for unsupported input methods, correct types for `share`/`broadcast` |
| P0-2 | Critical | NDJSON parsing: `text.split("\n")` breaks on chunk boundaries | Replaced with `@effect/platform/Ndjson.unpack({ ignoreEmptyLines: true })` |
| P0-3 | Critical | Command injection: `sh -c` with concatenated args | Array-form `Bun.spawnSync({ cmd: [command, ...args] })`, matching `src/Diagnose.ts:93` |
| P1-4 | High | Resource lifecycle: no `Effect.acquireRelease` | Nested acquireRelease for sandbox stream; cleanup on scope close |
| P1-5 | High | Config architecture: spec implied env vars in QuickConfig | Clarified: env vars in `AgentSdkConfig` only, `QuickConfig` is programmatic-only |
| P1-6 | High | Hook execution model: under-documented | Documented: hooks are JS callbacks, stripped from Options before sandbox, applied post-stream |
| P1-7 | High | KV + journaled safety | Blocked at config validation with clear error message |
| P2-10 | Medium | Test plan gaps | Added chunk-boundary, process death, handle parity, hook stripping tests |
| P3-11 | Low | Service pattern: `Effect.Service` vs `Context.Tag` | Confirmed `Context.Tag` is correct for SandboxService (pluggable impl pattern) |

## 12b. Review Corrections (v1.1 -> v1.2)

Summary of corrections applied from the post-v1.1 code review:

| ID | Severity | Issue | Resolution |
|----|----------|-------|------------|
| IMPORTANT-1 | Must Fix | `Ndjson.unpack()` returns a Channel, not a Stream operator | Changed to `Stream.pipeThroughChannelOrFail(Ndjson.unpack(...))` |
| IMPORTANT-2 | Should Fix | Cloudflare `exec` silently ignored `args` parameter | Now constructs full command with shell-escaped args |
| IMPORTANT-3 | Should Fix | `runAgent` prompt via `args.join(" ")` reintroduced injection risk | Writes prompt to temp file in sandbox, passes `--prompt-file` |
| IMPORTANT-4 | Should Fix | Missing `layers()` overload signatures for `"r2"` and `"kv"` | Added overload signatures |
| IMPORTANT-5 | Should Fix | `resolveLayersFromKvs` return type `E \| unknown` collapses to `unknown` | Fixed to `StorageLayers<E, R>` |
| IMPORTANT-6 | Should Document | `Scope.Scope` propagation from `runAgent` not documented | Added comment explaining scope is provided by `Stream.unwrapScoped` |
| SUGGESTION-2 | Should Fix | Cloudflare sandbox `destroy` not auto-called on scope close | Changed to `Layer.scoped` + `Effect.acquireRelease` for sandbox lifecycle |
| SUGGESTION-3 | Nice to have | R2 `has` performed full GET | Changed to `bucket.head(key)` for metadata-only check |
| SUGGESTION-4 | Nice to have | KV `clear` had unbounded delete parallelism | Changed to sequential deletes to respect rate limits |
| SUGGESTION-5 | Nice to have | Test command not specified | Added `bun test` as verification command |

## 12c. Review Corrections (v1.2 -> v1.3)

Summary of corrections applied from the post-v1.2 code review:

| ID | Severity | Issue | Resolution |
|----|----------|-------|------------|
| P0-R3-1 | Critical | R2/KV use `KeyValueStore.make()` which requires `getUint8Array`; implementations only provide string methods | Changed to `KeyValueStore.makeStringOnly()` which auto-derives binary methods via base64 |
| P0-R3-2 | Critical | Sandbox queries bypass `QuerySupervisor`, losing concurrency, tracking, metrics, retry, interruptAll | Moved sandbox dispatch into `QuerySupervisor.startQuery()` via `dispatchQuery` helper so all supervisor guarantees apply |
| P0-R3-3 | Critical | Config activation path inconsistent: `sandbox: "cloudflare"` silently falls back to local | Fail fast with descriptive error; removed bare `"cloudflare"` from QuickConfig type; clarified env var is a hint |
| P1-R3-4 | High | "Sandbox transparent to hook/tool layer" overstated; MCP bridge deferred, subset of options mapped | Weakened claim; documented MCP limitation explicitly |
| P1-R3-5 | High | `NdjsonError` not mapped into `AgentSdkError` union | Added `Stream.mapError` to convert `NdjsonError` to `SandboxError` |
| P1-R3-6 | High | `rewindFiles` returns `{ rewound: false }` but contract requires `{ canRewind: boolean }` | Fixed to `{ canRewind: false }` |
| P2-R3-7 | Medium | Only `hooks` stripped; 4 other non-serializable fields remain (canUseTool, stderr, spawnClaudeCodeProcess, abortController) | `stripNonSerializableOptions()` now strips all 5 fields |
| P3-R3-8 | Low | Temp prompt file: `Date.now()` collision risk, no cleanup | Uses `crypto.randomUUID()`, adds `Effect.addFinalizer` for cleanup |

## 12d. Review Corrections (v1.3 -> v1.4)

Summary of corrections applied from the post-v1.3 code review:

| ID | Severity | Issue | Resolution |
|----|----------|-------|------------|
| NEW-1 | Critical | `KeyValueStore.KeyValueStoreError` doesn't exist in `@effect/platform` | Replaced all 14 error constructions with `PlatformError.SystemError` using `storageError` helper |
| NEW-2 | Important | `QuerySupervisor.runQuery()` doesn't exist; integration point is inside `startQuery` | Rewrote to `dispatchQuery` helper replacing `sdk.query()` call inside `startQuery`, preserving `Scope.extend` |
| NEW-3 | Important | `resolveSandboxLayer` checks `"cloudflare"` string not in `QuickConfig.sandbox` type | Removed dead branch; type system prevents misconfiguration at compile time |
| NEW-4 | Important | `SandboxError` in `AgentSdkError` union is a breaking change for exhaustive matches | Acknowledged in Design Principles as intentional minor breaking change |
| NEW-5 | Suggestion | `SandboxLocal.isolated: false` is a fragile recursion guard | Added invariant comment explaining the guard and warning against changes |

## 12e. Review Corrections (v1.4 -> v1.5)

Summary of corrections applied from the post-v1.4 code review:

| ID | Severity | Issue | Resolution |
|----|----------|-------|------------|
| P0-R5-1 | Critical | `reason: "UnknownError"` invalid; `SystemErrorReason` requires `"Unknown"` | Fixed both R2 and KV `storageError` helpers to use `reason: "Unknown"` |
| P0-R5-2 | Critical | Non-string prompts silently bypass sandbox isolation (fall through to `sdk.query()` on host) | Non-string prompts now fail with `SandboxError` when `isolated === true` instead of silently falling back |
| P1-R5-3 | High | Hook enforcement vs observability: hooks include permission enforcement (`wrapPermissionHooks`) not just observation | Documented that sandboxed queries run WITHOUT orchestrator permission enforcement; hooks serve both enforcement and observability roles |
| P1-R5-4 | High | Env var story inconsistent: says "consumed by AgentRuntime.layer" but env vars are hints | Clarified: env vars are exposed as `Option` values on `AgentSdkConfig`; application code reads them to decide which layers to construct |
| P1-R5-5 | High | `resolveDirectory(config)` referenced but never defined in QuickConfig | Replaced with inline directory extraction from `config.persistence` |
| P2-R5-6 | Medium | `runQuery` naming inconsistency in file manifest and review table | Standardized to `startQuery` / `dispatchQuery` throughout |
| P2-R5-7 | Medium | Tests reference `sandbox: "cloudflare"` (removed from type); migration snippets use wrong import paths | Test updated to verify compile error; imports fixed to match `src/index.ts` export patterns (`Storage.StorageLayers`, `runtimeLayer`) |
| P3-R5-8 | Low | "No changes to existing public API types" contradicts acknowledged `SandboxError` breaking change | Replaced with explicit acknowledgment of the one intentional breaking change |
| P3-R5-9 | Low | Copy/paste: KV section says "R2 get failed" instead of "KV get failed" | Fixed to "KV get failed" |

## 12f. Review Corrections (v1.5 in-cycle)

Corrections applied immediately after v1.5 review (same cycle):

| ID | Severity | Issue | Resolution |
|----|----------|-------|------------|
| C1 | Critical | `Stream.broadcast` default `maximumLag: "unbounded"` is not a valid type; needs `{ capacity: "unbounded" }` | Fixed to `{ capacity: "unbounded" }` |
| C2 | Critical | `SandboxLocal.runAgent` error type `AgentSdkError \| QuerySupervisorError` doesn't match declared `SandboxError` | Added `Effect.mapError` to convert to `SandboxError` |
| I1 | Important | `QuickConfig.sandbox` naming collision with `Options.sandbox` (SandboxSettings) undocumented | Added disambiguation comment in QuickConfig type |
| I2 | Important | Migration guide import `{ Sandbox, runtimeLayer }` includes unused `Sandbox` | Removed unused import |
| I3 | Important | R2/KV backends don't handle `sync` option; silently produce broken layers | Added validation: `sync` + R2/KV throws with clear error; deferred to Open Questions |
| I4 | Important | Error descriptions inconsistently prefixed: some "R2 ..." / "KV ...", others generic "storage ..." | Standardized all to backend-specific prefixes |

## 12g. Type Research Corrections (v1.5)

Corrections from verifying spec types against actual installed packages (`@cloudflare/sandbox` v0.7.0, `@cloudflare/workers-types` v4.20260203.0):

| ID | Severity | Issue | Resolution |
|----|----------|-------|------------|
| T1 | Critical | `execStream()` returns SSE events (not raw bytes); spec's NDJSON pipeline assumed raw `Uint8Array` chunks | Rewrote `runAgent` to use `parseSSEStream<ExecEvent>()` from `@cloudflare/sandbox`, extract stdout data, then feed through `Ndjson.unpack()` |
| T2 | Important | `R2Objects` is a discriminated union (`cursor` only on `truncated: true`); `KVListResult` similar (`cursor` only on `list_complete: false`) | Updated `R2Bucket` and `KVNamespace` local types to use discriminated unions; added type narrowing comments |
| T3 | Important | `CloudflareSandboxHandle` type did not match actual SDK: missing fields on `ExecResult`, wrong `writeFile`/`readFile` return types | Updated to match actual `.d.ts` types from v0.7.0; added `ExecEvent` type for SSE pipeline |
| T4 | Important | `getSandbox()` returns synchronously (lazy container start), not `Promise` | Added comment; `Effect.sync()` usage was already correct |
| T5 | Minor | `SandboxOptions.sleepAfter` accepts `string \| number`, spec only had `string` | Updated `CloudflareSandboxOptions.sleepAfter` to `string \| number` |
| T6 | Minor | Peer dep version `>=0.6.0` predates `parseSSEStream` export | Bumped to `>=0.7.0` |
| T7 | Minor | `KVNamespacePutOptions.metadata` was `Record<string, unknown>`, actual is `any \| null` | Updated to match; `expiration` field was also missing |
| T8 | Info | `@cloudflare/workers-types` v4.20260203.0 has full `R2Bucket`, `KVNamespace`, `DurableObjectNamespace` types | Added note suggesting `import type` from workers-types at implementation time |

## 12h. Implementation Verification (v1.5 -> v1.6)

Type corrections from 12g implemented and verified on branch `fix/v050-type-corrections` (5 commits, 168 tests pass, 0 new typecheck errors):

| ID | Change | Commit | Verified |
|----|--------|--------|----------|
| T1 | SSE pipeline rewrite: `parseSSEStream<ExecEvent>()` + `filterMap` stdout + `Ndjson.unpackString` | `03a7009` | Tests pass |
| T2 | R2/KV discriminated union types for list results | `a309a2f`, `9b127ac` | 7 new tests |
| T3 | `CloudflareSandboxHandle` type matches v0.7.0 `.d.ts` | `e89e18c` | Typecheck pass |
| T5 | `sleepAfter: string \| number` | `e89e18c` | Typecheck pass |
| T6 | Peer dep bumped to `>=0.7.0` | `404d59e` | package.json |

---

## 13. References

### Effect APIs
- `Context.Tag` -- service tag definition: `src/Storage/ArtifactStore.ts:674`
- `Schema.TaggedError` -- error definition: `src/Errors.ts:6`
- `Effect.serviceOption` -- optional dependency: `src/Storage/ArtifactStore.ts:124`
- `Effect.fn` -- named effect constructor: `src/AgentRuntime.ts:212`
- `Layer.effect` / `Layer.succeed` / `Layer.scoped` -- layer construction: `src/Storage/ArtifactStore.ts:688`
- `Stream.pipeThroughChannelOrFail` -- Channel-to-Stream composition: `effect/Stream`
- `Effect.acquireRelease` -- scoped resource lifecycle: `effect/Effect`
- `KeyValueStore.make` / `KeyValueStore.makeStringOnly` -- KVS implementation: `@effect/platform/KeyValueStore`
- `Ndjson.unpack` -- chunk-safe NDJSON parsing: `@effect/platform/Ndjson`
- `Config.option` / `Schema.Config` -- config parsing: `src/AgentSdkConfig.ts:62-82`
- `ConfigProvider.orElse` -- config provider composition: `src/AgentSdkConfig.ts:286`

### Installed Package Versions
- `@cloudflare/sandbox`: v0.7.0 (types: `dist/sandbox-CEsJ1edi.d.ts`, `dist/index.d.ts`)
- `@cloudflare/workers-types`: v4.20260203.0 (types: `latest/index.d.ts`)

### Cloudflare APIs
- Sandbox SDK: https://developers.cloudflare.com/sandbox/api/
- Sandbox wrangler config: https://developers.cloudflare.com/sandbox/configuration/wrangler/
- Sandbox lifecycle: https://developers.cloudflare.com/sandbox/api/lifecycle/
- Sandbox commands: https://developers.cloudflare.com/sandbox/api/commands/
- Sandbox files: https://developers.cloudflare.com/sandbox/api/files/
- R2 Workers API: https://developers.cloudflare.com/r2/api/workers/workers-api-reference/
- KV API: https://developers.cloudflare.com/kv/api/
- Claude Code in Sandbox tutorial: https://developers.cloudflare.com/sandbox/tutorials/claude-code/

### Codebase References
- Storage layer factory: `src/Storage/StorageLayers.ts`
- Store service pattern: `src/Storage/ArtifactStore.ts`
- Config parsing: `src/AgentSdkConfig.ts`
- Runtime layer composition: `src/QuickConfig.ts`
- Agent runtime: `src/AgentRuntime.ts`
- Error types: `src/Errors.ts`
- Sandbox schema: `src/Schema/Sandbox.ts`
- Cloudflare sync worker: `cloudflare/wrangler.toml`
