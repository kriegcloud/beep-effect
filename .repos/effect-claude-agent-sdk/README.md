# effect-claude-agent-sdk

Effect-native bindings for the [Claude Agent SDK](https://github.com/anthropics/claude-agent-sdk). Build type-safe AI agents with Effect's powerful service composition, streaming, and error handling.

## Features

- **Effect Services** - `AgentSdk` and `AgentRuntime` as composable Effect services
- **Type-Safe Tools** - Define MCP tools with Effect Schema, automatic Zod conversion
- **Stream-Based I/O** - Query results as Effect Streams with backpressure
- **Lifecycle Hooks** - Effect-based hook handlers for SDK events
- **Query Supervision** - Concurrency limits, timeouts, and automatic cleanup
- **Layered Configuration** - Environment-aware config with sensible defaults
- **Sandbox Execution** - Run agents in isolated Cloudflare Sandbox containers or locally
- **Deployment Profiles** - One-line config for sandbox provider, storage backend, and storage mode
- **Cloudflare Storage** - R2 and KV `KeyValueStore` backends for Cloudflare Workers

## Installation

```bash
bun add effect-claude-agent-sdk effect @effect/platform @effect/platform-bun
```

## Requirements

- [Bun](https://bun.sh) 1.0+ (peer dependency)
- `ANTHROPIC_API_KEY` environment variable

## Quick Start

Zero-config entry points (no Effect knowledge required):

```ts
import { run, streamText } from "effect-claude-agent-sdk"

const result = await run("What is 2 + 2?")
console.log(result.result)

for await (const chunk of streamText("Tell me a short story")) {
  process.stdout.write(chunk)
}
```

Effect-native usage:

```ts
import * as Console from "effect/Console"
import * as Effect from "effect/Effect"
import * as Stream from "effect/Stream"
import { AgentSdk } from "effect-claude-agent-sdk"

const program = Effect.scoped(
  Effect.gen(function* () {
    const sdk = yield* AgentSdk
    const handle = yield* sdk.query("What is 2 + 2?")

    yield* handle.stream.pipe(
      Stream.tap((message) => Console.log(message)),
      Stream.runDrain
    )
  }).pipe(Effect.provide(AgentSdk.layerDefault))
)

Effect.runPromise(program)
```

## Cloudflare Remote Sync

This repo includes a Cloudflare Worker + Durable Object sync server under `cloudflare/`.
It exposes `/event-log` (and `/event-log/:tenant`) and supports optional auth via
`SYNC_AUTH_TOKEN`.

Setup:

```bash
bun install --cwd cloudflare
# update cloudflare/wrangler.toml: name, account_id, compatibility_date
bun run sync:dev
```

Optional: bind a D1 database (`SYNC_DB`) and/or set `SYNC_AUTH_TOKEN` in Wrangler vars.
Deploy with `bun run sync:deploy`.

Client wiring (one-liner):

```ts
import * as Effect from "effect/Effect"
import { AgentRuntime, Sync } from "effect-claude-agent-sdk"

const layer = Sync.withRemoteSync("wss://<your-worker>/event-log", {
  tenant: "demo",
  authToken: process.env.SYNC_AUTH_TOKEN,
  syncInterval: "3 seconds"
})

const program = AgentRuntime.query("Hello").pipe(Effect.provide(layer))
```

Notes:
- Cloudflare Durable Objects do **not** implement Ping/Pong or StopChanges.
  The `cloudflare` provider disables ping by default.

## Sandbox Execution

Run agent queries in isolated Cloudflare Sandbox containers. The `SandboxService` abstracts
the execution backend -- switch between local passthrough and Cloudflare Sandbox via config.

### Local (passthrough)

```ts
import { runtimeLayer } from "effect-claude-agent-sdk"

const layer = runtimeLayer({
  apiKey: "sk-ant-...",
  persistence: "memory",
  sandbox: "local"
})
```

### Cloudflare Sandbox

Requires `@cloudflare/sandbox` (optional peer dependency, `>=0.7.0`):

```ts
import { runtimeLayer } from "effect-claude-agent-sdk"

const layer = runtimeLayer({
  apiKey: "sk-ant-...",
  persistence: "memory",
  sandbox: {
    provider: "cloudflare",
    sandboxId: "my-sandbox",
    env: { Sandbox: env.SANDBOX },
    sleepAfter: "10m",
    apiKey: env.ANTHROPIC_API_KEY
  }
})
```

### Deployment Profiles

Use `storageBackend` and `storageBindings` for Cloudflare R2 or KV storage:

```ts
import { runtimeLayer } from "effect-claude-agent-sdk"

// R2-backed storage
const layer = runtimeLayer({
  apiKey: "sk-ant-...",
  persistence: "filesystem",
  storageBackend: "r2",
  storageBindings: { r2Bucket: env.MY_R2_BUCKET }
})

// KV-backed storage
const layer = runtimeLayer({
  apiKey: "sk-ant-...",
  persistence: "filesystem",
  storageBackend: "kv",
  storageBindings: { kvNamespace: env.MY_KV_NAMESPACE }
})
```

## Core Concepts

### AgentSdk

The low-level service wrapping the Claude Agent SDK. Use this when you need direct control over queries.

```ts
import { AgentSdk, AgentSdkConfig } from "effect-claude-agent-sdk"

// Default layer (uses environment variables)
AgentSdk.layerDefault

// Custom configuration
AgentSdk.layer.pipe(
  Layer.provide(
    AgentSdkConfig.layerFromEnv("MY_PREFIX") // reads MY_PREFIX_API_KEY, etc.
  )
)
```

### AgentRuntime

A higher-level service that adds supervision, retries, and timeouts on top of `AgentSdk`.

```ts
import * as Effect from "effect/Effect"
import * as Stream from "effect/Stream"
import { AgentRuntime } from "effect-claude-agent-sdk"

const program = Effect.gen(function* () {
  const runtime = yield* AgentRuntime

  // Get stats about active queries
  const stats = yield* runtime.stats
  console.log(`Active queries: ${stats.active}`)

  // Stream responses directly
  yield* runtime
    .stream("Explain quantum computing")
    .pipe(Stream.runForEach((msg) => Effect.log(msg)))

  // Interrupt all active queries
  yield* runtime.interruptAll
}).pipe(Effect.provide(AgentRuntime.layerDefault))
```

### QueryHandle

Both services return a `QueryHandle` for controlling the query:

```ts
interface QueryHandle {
  readonly stream: Stream.Stream<SDKMessage, AgentSdkError>
  readonly send: (message: SDKUserMessage) => Effect.Effect<void, AgentSdkError>
  readonly sendAll: (messages: Iterable<SDKUserMessage>) => Effect.Effect<void, AgentSdkError>
  readonly sendForked: (message: SDKUserMessage) => Effect.Effect<void, AgentSdkError, Scope.Scope>
  readonly closeInput: Effect.Effect<void, AgentSdkError>
  readonly interrupt: Effect.Effect<void, AgentSdkError>
}
```

## Defining Tools

Define type-safe MCP tools using Effect Schema:

```ts
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
import { Tools } from "effect-claude-agent-sdk"

// Define a tool with typed parameters and return value
const Calculator = Tools.Tool.make("calculator", {
  description: "Perform arithmetic operations",
  parameters: {
    operation: Schema.Literal("add", "subtract", "multiply", "divide"),
    a: Schema.Number,
    b: Schema.Number
  },
  success: Schema.Number,
  failure: Schema.String
})

// Create a toolkit from multiple tools
const toolkit = Tools.Toolkit.make(Calculator)

// Implement handlers
const handlers = {
  calculator: ({ operation, a, b }) =>
    Effect.gen(function* () {
      switch (operation) {
        case "add":
          return a + b
        case "subtract":
          return a - b
        case "multiply":
          return a * b
        case "divide":
          if (b === 0) return yield* Effect.fail("Division by zero")
          return a / b
      }
    })
}
```

### Tool Annotations

Add metadata to tools for better documentation:

```ts
const ReadFile = Tools.Tool.make("read_file", {
  description: "Read contents of a file",
  parameters: { path: Schema.String },
  success: Schema.String
})
  .annotate(Tools.Tool.Readonly, true)
  .annotate(Tools.Tool.OpenWorld, true)
```

## MCP Servers

Create in-process MCP servers with your tools:

```ts
import * as Effect from "effect/Effect"
import { AgentSdk, Mcp, Tools } from "effect-claude-agent-sdk"

const program = Effect.scoped(
  Effect.gen(function* () {
    const sdk = yield* AgentSdk
    const toolkit = Tools.Toolkit.make(Calculator)
    const tools = yield* Mcp.toolsFromToolkit(toolkit, handlers)

    const server = yield* sdk.createSdkMcpServer({
      name: "my-tools",
      version: "1.0.0",
      tools
    })

    const handle = yield* sdk.query("Calculate 15 * 7", {
      tools: ["calculator"],
      mcpServers: { "my-tools": server }
    })

    // ...
  })
)
```

## Hooks

Handle SDK lifecycle events with Effect:

```ts
import * as Effect from "effect/Effect"
import { Hooks } from "effect-claude-agent-sdk"

const program = Effect.gen(function* () {
  const myHook = yield* Hooks.Hook.callback((input) =>
    Effect.gen(function* () {
      if (input.hook_event_name === "PreToolUse") {
        yield* Effect.log(`Tool ${input.tool_name} about to be called`)
      }
      return {} // Hook output
    })
  )

  // Create a matcher for specific events
  const matcher = Hooks.Hook.matcher({
    matcher: "PreToolUse",
    timeout: "30 seconds",
    hooks: [myHook]
  })

  return matcher
})
```

## Logging & Observability

Match-based logging helpers with Effect-native loggers:

```ts
import * as Effect from "effect/Effect"
import * as Stream from "effect/Stream"
import { AgentRuntime, Logging } from "effect-claude-agent-sdk"

const program = Effect.gen(function* () {
  const runtime = yield* AgentRuntime

  yield* runtime
    .stream("Explain quantum computing")
    .pipe(Logging.tapSdkLogs, Stream.runDrain)

  yield* Logging.logQueryEventStream(runtime.events)
}).pipe(
  Effect.provide(AgentRuntime.layerDefault),
  Effect.provide(Logging.layerDefault)
)
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ANTHROPIC_API_KEY` | API key for Claude | Required |
| `AGENTSDK_MODEL` | Model to use | `claude-sonnet-4-20250514` |
| `AGENTSDK_MAX_TURNS` | Maximum conversation turns | `100` |
| `AGENTSDK_SYSTEM_PROMPT` | System prompt | None |
| `AGENTSDK_LOG_FORMAT` | Logger format (`pretty`, `structured`, `json`, `logfmt`, `string`) | `pretty` |
| `AGENTSDK_LOG_LEVEL` | Minimum log level (`trace`, `debug`, `info`, `warn`, `error`, `fatal`, `none`) | `info` |
| `AGENTSDK_LOG_SPANS` | Include span annotations in logs | `false` |
| `AGENTSDK_LOG_MESSAGES` | Enable SDK message logging | `true` |
| `AGENTSDK_LOG_QUERY_EVENTS` | Enable query event logging | `true` |
| `AGENTSDK_LOG_HOOKS` | Enable hook input logging | `true` |

### Deployment Profile Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SANDBOX_PROVIDER` | Sandbox backend (`local`, `cloudflare`) | None |
| `SANDBOX_ID` | Sandbox instance ID | None |
| `SANDBOX_SLEEP_AFTER` | Idle timeout before sandbox sleeps | `10m` |
| `STORAGE_BACKEND` | Storage backend (`bun`, `filesystem`, `r2`, `kv`) | None |
| `STORAGE_MODE` | Storage mode (`standard`, `journaled`) | `standard` |

### Sandbox Settings

When using `AgentSdkConfig.layerFromEnv`, the following environment variables
populate `options.sandbox`:

- `AGENTSDK_SANDBOX_ENABLED`
- `AGENTSDK_SANDBOX_AUTO_ALLOW_BASH_IF_SANDBOXED`
- `AGENTSDK_SANDBOX_ALLOW_UNSANDBOXED_COMMANDS`
- `AGENTSDK_SANDBOX_ENABLE_WEAKER_NESTED_SANDBOX`
- `AGENTSDK_SANDBOX_EXCLUDED_COMMANDS` (comma-separated)
- `AGENTSDK_SANDBOX_IGNORE_VIOLATIONS` (JSON record of string → string[])
- `AGENTSDK_SANDBOX_NETWORK_ALLOWED_DOMAINS` (comma-separated)
- `AGENTSDK_SANDBOX_NETWORK_ALLOW_UNIX_SOCKETS` (comma-separated)
- `AGENTSDK_SANDBOX_NETWORK_ALLOW_ALL_UNIX_SOCKETS`
- `AGENTSDK_SANDBOX_NETWORK_ALLOW_LOCAL_BINDING`
- `AGENTSDK_SANDBOX_NETWORK_HTTP_PROXY_PORT`
- `AGENTSDK_SANDBOX_NETWORK_SOCKS_PROXY_PORT`
- `AGENTSDK_SANDBOX_RIPGREP_COMMAND`
- `AGENTSDK_SANDBOX_RIPGREP_ARGS` (comma-separated)

### Runtime Configuration

```ts
import { AgentRuntimeConfig } from "effect-claude-agent-sdk"

const config = AgentRuntimeConfig.layer({
  queryTimeout: "5 minutes",
  firstMessageTimeout: "30 seconds",
  retryMaxRetries: 3,
  retryBaseDelay: "1 second",
  maxConcurrentQueries: 10
})
```

## Experimental Features

### Rate-Limited Tool Handlers

```ts
import { Experimental, Tools } from "effect-claude-agent-sdk"

const handlers = {
  echo: ({ text }) => Effect.succeed(text)
}

const limited = Experimental.RateLimiter.rateLimitHandlers(
  handlers,
  { limit: 10, window: "1 minute" },
  { keyPrefix: "tools" }
)

// Provide the rate limiter layer
Effect.provide(Experimental.RateLimiter.layerMemory)
```

### Persisted Input Queue

```ts
import { Experimental, Schema } from "effect-claude-agent-sdk"

const program = Effect.gen(function* () {
  const queue = yield* Experimental.PersistedQueue.makeUserMessageQueue()
  const adapter = yield* Experimental.PersistedQueue.makeInputAdapter(queue)

  const message: Schema.SDKUserMessage = {
    type: "user",
    session_id: "",
    message: { role: "user", content: [{ type: "text", text: "hello" }] },
    parent_tool_use_id: null
  }

  yield* adapter.send(message)
}).pipe(Effect.provide(Experimental.PersistedQueue.layerMemory))
```

### Audit Event Log

```ts
import { Experimental } from "effect-claude-agent-sdk"

const program = Effect.scoped(
  Effect.gen(function* () {
    const log = yield* Experimental.EventLog.EventLog

    yield* log.write({
      schema: Experimental.EventLog.AuditEventSchema,
      event: "hook_event",
      payload: {
        sessionId: "session-1",
        hook: "SessionStart",
        outcome: "success"
      }
    })
  }).pipe(
    Effect.provide([
      Experimental.EventLog.layerMemory,
      Experimental.EventLog.layerAuditHandlers
    ])
  )
)
```

### Sessions (v2)

```ts
import { SessionManager, SessionService } from "effect-claude-agent-sdk"
import * as Effect from "effect/Effect"
import * as Stream from "effect/Stream"

const program = Effect.scoped(
  Effect.gen(function* () {
    const session = yield* SessionService
    yield* session.send("hello")
    return yield* Stream.runCollect(session.stream)
  }).pipe(
    Effect.provide(SessionService.layerDefault({
      model: "claude-sonnet-4-5-20250929"
    }))
  )
)
```

Session configuration (via `SessionManager.layerDefaultFromEnv`) supports:
`EXECUTABLE`, `PATH_TO_CLAUDE_CODE_EXECUTABLE`, `EXECUTABLE_ARGS`,
`PERMISSION_MODE`, `ALLOWED_TOOLS`, `DISALLOWED_TOOLS`,
`ANTHROPIC_API_KEY`/`API_KEY`, `CLAUDE_CODE_SESSION_ACCESS_TOKEN`.

Guidance:
- Use `SessionService` or `SessionManager` for normal app usage (applies
  SessionConfig defaults and validates required `model`).
- Use the low-level `Session` module when you want to manage every option
  explicitly; it does not read SessionConfig defaults.

### Convenience Entry Points

Compose session layers in one line:

```ts
import { EntryPoints, SessionService } from "effect-claude-agent-sdk"
import * as Effect from "effect/Effect"
import * as Stream from "effect/Stream"

const program = Effect.scoped(
  Effect.gen(function* () {
    const session = yield* SessionService
    return yield* session.turn("hello").pipe(Stream.runCollect)
  }).pipe(
    Effect.provide(
      EntryPoints.sessionLayer(
        { model: "claude-sonnet-4-5-20250929" },
        { history: { recordOutput: true } }
      )
    )
  )
)
```

### Storage

```ts
import { AgentSdk, Storage } from "effect-claude-agent-sdk"
import * as Effect from "effect/Effect"
import * as Stream from "effect/Stream"

const program = Effect.scoped(
  Effect.gen(function* () {
    const sdk = yield* AgentSdk
    const handle = yield* sdk.query("Summarize the current repository.")
    const recorded = yield* Storage.ChatHistory.withRecorder(handle, {
      recordOutput: true
    })
    yield* recorded.stream.pipe(Stream.runDrain)
  }).pipe(
    Effect.provide([
      AgentSdk.layerDefaultFromEnv(),
      Storage.ChatHistoryStore.layerMemory
    ])
  )
)
```

Filesystem persistence (Bun):

```ts
import { AgentRuntime, Storage } from "effect-claude-agent-sdk"
import * as Effect from "effect/Effect"
import * as Stream from "effect/Stream"

const program = Effect.scoped(
  Effect.gen(function* () {
    const runtime = yield* AgentRuntime
    const handle = yield* runtime.query("Summarize the current repository.")
    yield* handle.stream.pipe(Stream.runDrain)
  }).pipe(
    Effect.provide(
      AgentRuntime.layerWithPersistence({
        layers: {
          runtime: AgentRuntime.layerDefaultFromEnv(),
          chatHistory: Storage.ChatHistoryStore.layerFileSystemBun({
            directory: "storage"
          }),
          artifacts: Storage.ArtifactStore.layerFileSystemBun({
            directory: "storage"
          }),
          auditLog: Storage.AuditEventStore.layerFileSystemBun({
            directory: "storage"
          })
        }
      })
    )
  )
)
```

Convenience layer maps:

```ts
const storageLayers = Storage.layersFileSystemBun({ directory: "storage" })

AgentRuntime.layerWithPersistence({
  layers: {
    runtime: AgentRuntime.layerDefaultFromEnv(),
    ...storageLayers
  }
})
```

Use a relative `directory` for local development; pass an absolute path (e.g. `/storage`)
when running with a mounted volume.

StorageConfig + cleanup:

```ts
import { Storage } from "effect-claude-agent-sdk"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"

const storageLayers = Layer.mergeAll(
  Storage.layerFileSystemBun({ directory: "storage" }),
  Storage.StorageConfig.layer
)

const program = Effect.scoped(
  Effect.gen(function* () {
    const cleanup = yield* Storage.StorageCleanup
    yield* cleanup.run
  }).pipe(
    Effect.provide(
      Layer.mergeAll(storageLayers, Storage.StorageCleanup.layer)
    )
  )
)
```

`StorageCleanup.layer` runs on the configured schedule; `StorageConfig` supports env overrides
(e.g. `STORAGE_CHAT_ENABLED`, `STORAGE_CHAT_MAX_EVENTS`, `STORAGE_ARTIFACT_MAX_BYTES`,
`STORAGE_AUDIT_ENABLED`, `STORAGE_CLEANUP_INTERVAL`).

`Storage.SessionIndexStore` tracks session IDs for KV-backed cleanup/listing (KeyValueStore has no scan API).
Provide it alongside KV layers if you need session enumeration.

## API Reference

### Services

| Service | Description |
|---------|-------------|
| `AgentSdk` | Low-level SDK wrapper with `query()` and `createSdkMcpServer()` |
| `AgentRuntime` | High-level runtime with supervision, retries, timeouts |
| `QuerySupervisor` | Manages concurrent queries and cleanup |
| `SessionManager` | Session factory that applies SessionConfig defaults |
| `SessionService` | Scoped Session wrapper for single-session usage |
| `SandboxService` | Execution backend abstraction (local or Cloudflare Sandbox) |

### Modules

| Module | Description |
|--------|-------------|
| `Schema` | Effect Schema definitions for SDK types |
| `Tools` | Tool and Toolkit definitions |
| `Hooks` | Hook handlers and matchers |
| `Logging` | Logging config, matchers, and stream helpers |
| `Mcp` | MCP server creation utilities |
| `Sandbox` | Sandbox execution backends and configuration |
| `Storage` | Chat history, artifacts, and audit log persistence |
| `Experimental` | Rate limiting, persisted queues, event logging |

### Layers

| Layer | Description |
|-------|-------------|
| `AgentSdk.layerDefault` | Default SDK configuration |
| `AgentSdk.layerDefaultFromEnv(prefix)` | SDK from environment with custom prefix |
| `AgentRuntime.layerDefault` | Default runtime with supervision |
| `AgentRuntime.layerDefaultFromEnv(prefix)` | Runtime from environment |
| `SessionManager.layerDefault` | Session manager with default SessionConfig |
| `SessionManager.layerDefaultFromEnv(prefix)` | Session manager from environment |
| `SessionService.layerDefault(options)` | Scoped session service with defaults |
| `SessionService.layerDefaultFromEnv(options, prefix)` | Scoped session service from environment |

## Examples

See the [`examples/`](./examples) directory:

- `agent-sdk-mcp-rate-limit.ts` - Rate-limited MCP tools
- `agent-sdk-audit-log.ts` - Event logging integration
- `agent-sdk-chat-history.ts` - Chat history persistence helper
- `agent-sdk-artifact-store.ts` - Artifact store usage
- `agent-sdk-full-persistence.ts` - Runtime persistence composition
- `agent-sdk-filesystem-persistence.ts` - Filesystem-backed persistence (Bun)
- `agent-sdk-persisted-input.ts` - Persisted message queue
- `agent-sdk-metadata-cache.ts` - Result caching
- `agent-service-http-server.ts` / `agent-service-http-client.ts` - HTTP API
- `agent-service-rpc-server.ts` / `agent-service-rpc-client.ts` - RPC API

## License

MIT
