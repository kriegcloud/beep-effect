# Effect Claude Agent SDK: DX/UX Improvement Plan

> Comprehensive analysis of developer and user experience improvements for the Effect-native Claude Agent SDK wrapper.

## Executive Summary

This document consolidates findings from a multi-agent deep review of the codebase, identifying friction points and opportunities to make the SDK intuitive, powerful, and delightful to use. The goal is to enable developers to go from zero to a working Claude agent in minutes, while providing the full power of Effect for advanced use cases.

---

## Table of Contents

1. [Quick Start Experience](#1-quick-start-experience)
2. [Configuration & Layers](#2-configuration--layers)
3. [Hooks System](#3-hooks-system)
4. [Tools & MCP](#4-tools--mcp)
5. [Storage & Persistence](#5-storage--persistence)
6. [Sync & Remote Replication](#6-sync--remote-replication)
7. [Session & Service Layer](#7-session--service-layer)
8. [Effect Patterns & Idioms](#8-effect-patterns--idioms)
9. [Documentation & Examples](#9-documentation--examples)
10. [Implementation Priorities](#10-implementation-priorities)

---

## 1. Quick Start Experience

### Current State

Getting started requires understanding Effect's service pattern, scoping, and stream consumption:

```typescript
// Current: 10+ lines for "hello world"
import * as Effect from "effect/Effect"
import * as Stream from "effect/Stream"
import { AgentSdk } from "@effect/claude-agent-sdk"

const program = Effect.scoped(
  Effect.gen(function*() {
    const sdk = yield* AgentSdk
    const handle = yield* sdk.query("Hello, Claude!")
    yield* handle.stream.pipe(Stream.runDrain)
  }).pipe(Effect.provide(AgentSdk.layerDefaultFromEnv()))
)

Effect.runPromise(program)
```

### Recommendations

#### 1.1 Zero-config entry point

```typescript
// Proposed: 2 lines for "hello world"
import { run } from "effect-claude-agent-sdk"

const result = await run("Hello, Claude!")
console.log(result.text)
```

#### 1.2 Streaming convenience

```typescript
// Proposed: Simple text streaming
import { streamText } from "effect-claude-agent-sdk"

for await (const chunk of streamText("Tell me a story")) {
  process.stdout.write(chunk)
}
```

#### 1.3 Effect-native quick start

```typescript
// Proposed: Effect-native but simpler
import { AgentRuntime, QueryStream } from "effect-claude-agent-sdk"

const program = AgentRuntime.query("Hello").pipe(
  QueryStream.text,
  Stream.runForEach(Console.log),
  Effect.provide(AgentRuntime.layerDefault)
)
```

### Implementation

Add to `src/index.ts`:

```typescript
// Quick-start exports
export const run = (prompt: string, options?: Options): Promise<Result> => ...
export const streamText = (prompt: string, options?: Options): AsyncIterable<string> => ...

// Stream operators
export * as QueryStream from "./QueryStream.js"
```

---

## 2. Configuration & Layers

### Current State

5+ configuration services with complex interplay:
- `AgentSdkConfig` → `AgentSdk`
- `AgentRuntimeConfig` → `AgentRuntime`
- `QuerySupervisorConfig` → `QuerySupervisor`
- `StorageConfig` → Storage layers
- `SessionConfig` → `SessionManager`

### Pain Points

1. **Too many config classes** — users must understand the hierarchy
2. **No unified configuration** — can't just pass `{ apiKey, timeout, persistence }`
3. **Env var naming confusion** — `AGENTSDK_*` prefix not obvious
4. **Missing fail-fast** — logs errors but continues, failing later with confusing errors

### Recommendations

#### 2.1 Unified QuickConfig

```typescript
// Proposed: Single configuration object
export type QuickConfig = {
  readonly apiKey?: string              // Default: from env
  readonly model?: string               // Default: claude-sonnet-4-20250514
  readonly timeout?: Duration.DurationInput  // Default: 5 minutes
  readonly concurrency?: number         // Default: 4
  readonly persistence?:
    | "memory"                          // In-memory (default)
    | "filesystem"                      // File-based
    | { directory: string }             // Custom directory
    | { sync: string }                  // With remote sync
}

// Usage
const layer = AgentRuntime.layer({
  timeout: "10 minutes",
  persistence: { sync: "wss://sync.example.com" }
})
```

#### 2.2 Fail-fast on missing credentials

```typescript
// Current: logs and continues
yield* Effect.logError("Missing credentials...")

// Proposed: fail with actionable error
return yield* Effect.fail(
  ConfigError.make({
    message: `Missing API credentials.

To fix this, either:
1. Set ANTHROPIC_API_KEY environment variable
2. Authenticate via: claude login
3. Provide apiKey in configuration

See: https://docs.anthropic.com/en/docs/quickstart`
  })
)
```

#### 2.3 Diagnostic helper

```typescript
// Proposed: Environment validation
export const diagnose = (): Effect.Effect<DiagnosticResult> =>
  Effect.gen(function*() {
    return {
      hasApiKey: !!process.env.ANTHROPIC_API_KEY,
      claudeCodeInstalled: yield* checkClaudeCodeCli(),
      version: packageJson.version,
      issues: [] // List of actionable issues
    }
  })
```

---

## 3. Hooks System

### Current State

Hooks require understanding multiple concepts: callback, matcher, HookMap, HookContext, HookInput, HookJSONOutput. Creating a simple logging hook takes 15+ lines.

### Pain Points

1. **No event-specific typing** — `HookInput` is a union, must narrow manually
2. **Verbose empty returns** — `{} satisfies HookJSONOutput` everywhere
3. **No fluent composition** — must manually call `mergeHookMaps`
4. **Missing common presets** — logging, auto-approve, timing

### Recommendations

#### 3.1 Event-specific constructors

```typescript
// Proposed: Type-safe event handlers
const hook = Hooks.onPreToolUse((input) => {
  // TypeScript knows: input.tool_name, input.tool_input
  console.log(`Tool: ${input.tool_name}`)
  return Effect.succeed({})
})
```

#### 3.2 Simplified hook creation

```typescript
// Proposed: One-liner hooks
const loggingHook = Hooks.tap(
  ["PreToolUse", "PostToolUse"],
  (input) => Effect.log(`[${input.hook_event_name}]`)
)
```

#### 3.3 Builder pattern

```typescript
// Proposed: Fluent composition
const hooks = Hooks.builder()
  .onPreToolUse((input) => Effect.succeed({ continue: true }))
  .onPostToolUse((input) => Effect.log(`Done: ${input.tool_name}`))
  .onSessionEnd((input) => Effect.log(`Session ended`))
  .build()
```

#### 3.4 Built-in presets

```typescript
// Proposed: Common patterns out of the box
Hooks.Presets.consoleLogger({ format: "pretty" })
Hooks.Presets.autoApprove(["Read", "Glob", "Grep"])
Hooks.Presets.autoDeny({ tools: ["Write"], match: "*.env" })
Hooks.Presets.timing((tool, ms) => metrics.record(tool, ms))
```

---

## 4. Tools & MCP

### Current State

Tool definition requires 4 steps: Define tool → Create toolkit → Define handlers → Register with MCP server.

### Pain Points

1. **Three-step process** for simple tools
2. **No single-expression tool creation** with embedded handler
3. **Tool names must be repeated** in query options
4. **`addDependency` is a no-op** — confusing API surface

### Recommendations

#### 4.1 Single-expression tool creation

```typescript
// Proposed: Combined definition + handler
const echo = Tool.define("echo", {
  description: "Echo input text",
  parameters: { text: Schema.String },
  success: Schema.String,
  handler: (params) => Effect.succeed(params.text)
})
```

#### 4.2 Quick tool for MCP

```typescript
// Proposed: Minimal ceremony
const echoTool = Mcp.quickTool(
  "echo",
  "Echo input text",
  { text: Schema.String },
  (params) => Effect.succeed({ content: [{ type: "text", text: params.text }] })
)
```

#### 4.3 Inline tools in query

```typescript
// Proposed: No MCP server boilerplate
const handle = yield* sdk.query("Echo 'hello'", {
  tools: {
    echo: Tool.define("echo", {
      description: "Echo",
      parameters: { text: Schema.String },
      handler: (p) => Effect.succeed(p.text)
    })
  }
})
```

#### 4.4 Toolkit from handlers directly

```typescript
// Proposed: Schema + handler in one
const toolkit = Toolkit.fromHandlers({
  echo: {
    description: "Echo text",
    parameters: { text: Schema.String },
    handler: (params) => Effect.succeed(params.text)
  },
  greet: {
    description: "Greet user",
    parameters: { name: Schema.String },
    handler: (params) => Effect.succeed(`Hello, ${params.name}!`)
  }
})
```

---

## 5. Storage & Persistence

### Current State

25+ layer factory functions across the codebase with names like `layerFileSystemBunJournaledWithSyncWebSocket` (42 characters). Users must understand: journaled vs standard, FileSystem vs Memory, Bun vs Node, with/without sync.

### Pain Points

1. **Combinatorial explosion** — too many layer variants
2. **No zero-config option** — can't just say "persist to disk"
3. **Non-linear complexity** — jump from 1 line (memory) to 8+ lines (file)
4. **No presets** — no `development`, `production`, `synced` shortcuts

### Recommendations

#### 5.1 Single entry point

```typescript
// Proposed: One function to rule them all
Storage.layers({
  backend: "filesystem",     // "memory" | "filesystem"
  directory: "storage",      // optional, default: "storage"
  mode: "journaled",         // "standard" | "journaled"
  sync: { url: "wss://..." } // optional
})
```

#### 5.2 Presets

```typescript
// Proposed: Common scenarios
Storage.presets.development()  // In-memory, fast, no cleanup
Storage.presets.local()        // File-based, sensible defaults
Storage.presets.production()   // Journaled, with retention
Storage.presets.synced(url)    // Full sync support
```

#### 5.3 Simplified runtime integration

```typescript
// Current (verbose)
AgentRuntime.layerWithPersistence({
  layers: {
    runtime: AgentRuntime.layerDefaultFromEnv().pipe(Layer.orDie),
    chatHistory: storageLayers.chatHistory.pipe(Layer.orDie),
    artifacts: storageLayers.artifacts.pipe(Layer.orDie),
    auditLog: storageLayers.auditLog.pipe(Layer.orDie),
    sessionIndex: storageLayers.sessionIndex.pipe(Layer.orDie)
  }
})

// Proposed (concise)
AgentRuntime.layerWithFilePersistence({
  directory: "storage",
  sync: "wss://..."
})
```

#### 5.4 Runtime introspection

```typescript
// Proposed: See what's being persisted
const status = yield* Storage.status()
// {
//   chatHistory: { enabled: true, backend: "filesystem", path: "..." },
//   artifacts: { enabled: true, backend: "filesystem", path: "..." },
//   sync: { connected: true, lastSync: Date, pendingEntries: 5 }
// }
```

---

## 6. Sync & Remote Replication

### Current State

Sync infrastructure is complete (SyncService, EventLogRemoteServer, ConflictPolicy, Compaction) but the DX is poor. The function `layerFileSystemBunJournaledWithSyncWebSocket` is the entry point.

### Critical Issues

1. **ConflictPolicy is defined but never wired** — exists but unused
2. **SyncService not exposed** from convenience layers
3. **`lastSyncAt` timing wrong** — updated when sync starts, not completes
4. **No health check** — can't verify remote is responding
5. **No env var support** — no `SYNC_URL`

### Recommendations

#### 6.1 Simplified Sync API

```typescript
// Proposed: Dream one-liner
const layer = Sync.layer({ url: "ws://localhost:8787" })

// With options
const layer = Sync.layer({
  url: "wss://sync.example.com",
  conflictPolicy: "last-write-wins",
  onSyncComplete: (stats) => console.log(`Synced ${stats.sent}/${stats.received}`)
})

// From environment (SYNC_URL)
const layer = Sync.layerFromEnv()
```

#### 6.2 Wire ConflictPolicy

```typescript
// Fix: Actually use ConflictPolicy in the sync flow
// Currently defined in src/Sync/ConflictPolicy.ts but never applied
```

#### 6.3 Health check

```typescript
// Proposed: Verify remote is responding
const health = yield* sync.health()
// { connected: true, latencyMs: 45 }
```

#### 6.4 Sync metrics

```typescript
// Proposed: Visibility into sync state
const metrics = yield* sync.metrics()
// { pending: 5, synced: 1000, conflicts: 2, lastSync: Date }
```

---

## 7. Session & Service Layer

### Current State

Two parallel APIs (Session and Query) with overlapping concepts. HTTP API lacks streaming endpoint. RPC layer has no session operations.

### Pain Points

1. **Session vs Query confusion** — unclear when to use which
2. **No streaming HTTP endpoint** — only `POST /query` returning complete result
3. **"Probe handle" pattern** — creates dummy query to get metadata
4. **No session pool** — multi-session requires manual management
5. **Missing production features** — no auth, health checks, graceful shutdown

### Recommendations

#### 7.1 Clear naming and documentation

```typescript
// Proposed: Rename for clarity
AgentRuntime  → "Stateless query execution with supervision"
SessionManager → "Stateful conversation management"

// Add decision tree in docs
```

#### 7.2 SSE streaming endpoint

```typescript
// Proposed: Add to AgentHttpApi
GET /stream?prompt=...  // Server-Sent Events
```

#### 7.3 Session HTTP/RPC endpoints

```typescript
// Proposed: Full session API
POST /sessions           // Create session
POST /sessions/:id/send  // Send message
GET  /sessions/:id/stream // Stream events (SSE)
DELETE /sessions/:id     // Close session
```

#### 7.4 One-line server setup

```typescript
// Proposed: Production-ready server
const server = AgentServer.serve({
  port: 3000,
  auth: { type: "bearer", validate: validateToken },
  persistence: { type: "filesystem", path: "./data" },
  sync: { url: "wss://sync.example.com" },
  cors: { origins: ["https://app.example.com"] }
})
```

#### 7.5 Session pool

```typescript
// Proposed: Managed multi-session
const pool = SessionPool.make({
  maxSessions: 100,
  idleTimeout: Duration.minutes(30),
  onSessionCreated: (id) => Effect.log(`Session ${id} created`),
  onSessionClosed: (id) => Effect.log(`Session ${id} closed`)
})

yield* pool.withSession(sessionId, (session) => session.turn("Hello"))
```

---

## 8. Effect Patterns & Idioms

### Areas for Improvement

#### 8.1 Migrate to Effect.Service

```typescript
// Current
export class StorageConfig extends Context.Tag("...")<StorageConfig, Settings>() {}

// Proposed: Use Effect.Service for automatic layer handling
export class StorageConfig extends Effect.Service<StorageConfig>()("...", {
  effect: Effect.gen(function*() { /* config loading */ }),
  dependencies: [ConfigProvider.Tag]
}) {}
```

#### 8.2 Use Context.Reference for optional services

```typescript
// Current (verbose)
Effect.serviceOption(SessionIndexStore).pipe(
  Effect.flatMap((maybe) => Option.isNone(maybe) ? Effect.void : ...)
)

// Proposed
export class SessionIndexStore extends Context.Reference<SessionIndexStore>()(
  "...",
  { defaultValue: () => noopStore }
) {}
```

#### 8.3 Use Schema.Config for configuration

```typescript
// Current: 200+ lines of manual env var parsing
const apiKey = yield* Config.option(Config.redacted("ANTHROPIC_API_KEY"))
// ...

// Proposed: Schema-driven config
const config = yield* Schema.Config("AGENTSDK", AgentSdkConfigSchema)
```

#### 8.4 Add Effect.withSpan for observability

```typescript
// Proposed: OpenTelemetry tracing
const appendMessage = Effect.fn("ChatHistoryStore.appendMessage")(...)
  .pipe(Effect.withSpan("ChatHistoryStore.appendMessage"))
```

#### 8.5 Use Effect.cached for expensive operations

```typescript
// Proposed: Cache retention resolution
const resolveRetention = Effect.cached(Effect.gen(function*() {
  const config = yield* StorageConfig
  // ...
}))
```

---

## 9. Documentation & Examples

### Current State

README is comprehensive for advanced users but no "hello world" that runs. Examples use internal imports (`../src/index.js`) and assume Effect knowledge.

### Pain Points

1. **No runnable hello world** — Quick Start code has issues
2. **Internal imports** — examples don't show real package usage
3. **No run instructions** — how to actually run examples
4. **Steep learning curve** — assumes Effect knowledge

### Recommendations

#### 9.1 Prerequisites section

```markdown
## Prerequisites

- Node 18+ or Bun 1.0+
- `ANTHROPIC_API_KEY` environment variable
- Basic familiarity with Effect ([Effect Documentation](https://effect.website))
```

#### 9.2 Numbered example progression

```
examples/
├── 01-hello-world.ts        # Minimal query
├── 02-streaming-text.ts     # Stream responses
├── 03-custom-tool.ts        # Define a tool
├── 04-multi-turn.ts         # Conversation
├── 05-error-handling.ts     # Handle errors
├── 06-persistence.ts        # Save history
├── 07-hooks.ts              # Add monitoring
├── 08-sync.ts               # Remote sync
└── README.md                # How to run
```

#### 9.3 Examples README

```markdown
# Examples

## Running Examples

```bash
# Set your API key
export ANTHROPIC_API_KEY=your-key

# Run hello world
bun examples/01-hello-world.ts
```

## Learning Path

Start with 01 and progress numerically. Each example builds on the previous.
```

#### 9.4 Fix example imports

```typescript
// Change from:
import { AgentSdk } from "../src/index.js"

// To:
import { AgentSdk } from "effect-claude-agent-sdk"
```

---

## 10. Implementation Priorities

### Critical (P0) — Must fix for usability

| Item | Description | Effort |
|------|-------------|--------|
| Quick-start entry points | `run()` and `streamText()` functions | S |
| Fail-fast credentials | Actionable error on missing API key | S |
| Wire ConflictPolicy | Actually use it in sync flow | M |
| Fix lastSyncAt timing | Update after sync completes | S |
| Hello world example | Runnable 01-hello-world.ts | S |

### High Priority (P1) — Significant DX improvement

| Item | Description | Effort |
|------|-------------|--------|
| Unified QuickConfig | Single config object | M |
| Storage presets | `development()`, `local()`, `synced()` | M |
| Hooks.builder() | Fluent hook composition | M |
| Event-specific hook constructors | `onPreToolUse()`, etc. | M |
| Tool.define() with handler | Single-expression tools | M |
| Sync.layer() simplified | One-liner sync setup | M |
| SSE streaming endpoint | HTTP streaming support | M |
| Fix integration test | sync-remote-integration timeout | M |
| Fix concurrency bug | EventJournalKeyValueStore mutex | M |

### Medium Priority (P2) — Polish and completeness

| Item | Description | Effort |
|------|-------------|--------|
| Storage.layers() consolidation | Single entry point | L |
| Hook presets | consoleLogger, autoApprove, timing | M |
| Toolkit.fromHandlers() | Schema + handler in one | M |
| Session pool | Managed multi-session | L |
| Diagnostic helper | Environment validation | S |
| Numbered examples | 01-08 progression | M |
| Prerequisites docs | Clear requirements | S |

### Lower Priority (P3) — Advanced/future

| Item | Description | Effort |
|------|-------------|--------|
| Effect.Service migration | Modern Effect patterns | L |
| Schema.Config for config | Schema-driven configuration | M |
| OpenTelemetry spans | Observability | M |
| AgentServer one-liner | Production server setup | L |
| Session HTTP/RPC API | Full session endpoints | L |
| Context.Reference for optional services | Cleaner optional deps | M |

### Effort Key
- **S**: Small (< 1 day)
- **M**: Medium (1-3 days)
- **L**: Large (3-5 days)

---

## Appendix: Code Review Findings

### Bugs Found

1. **Critical**: `EventJournalKeyValueStore` has unprotected mutable state (`journal`, `byId`, `remotes`) — concurrent writes will corrupt data
2. **Important**: `SyncService.syncNow` race condition — concurrent calls can lose fibers
3. **Important**: `markConnected` called eagerly after fork — status shows "connected" before connection established
4. **Important**: Integration test `sync-remote-integration.test.ts` times out

### Code Quality Issues

See [GitHub Issue #24](https://github.com/mepuka/effect-claude-agent-sdk/issues/24) for full list including:
- O(n*m) conflict detection
- Date.now() instead of Clock
- Code duplication in StorageLayers
- Typo: `withRemoteUncommited`

---

## Related GitHub Issues

- [#17](https://github.com/mepuka/effect-claude-agent-sdk/issues/17) — Epic: One-command Cloudflare remote sync
- [#18](https://github.com/mepuka/effect-claude-agent-sdk/issues/18) — Bug: Concurrent corruption in EventJournalKeyValueStore
- [#19](https://github.com/mepuka/effect-claude-agent-sdk/issues/19) — Bug: SyncService race conditions
- [#20](https://github.com/mepuka/effect-claude-agent-sdk/issues/20) — Bug: Integration test timeout
- [#21](https://github.com/mepuka/effect-claude-agent-sdk/issues/21) — Feat: Cloudflare Worker sync server
- [#22](https://github.com/mepuka/effect-claude-agent-sdk/issues/22) — Feat: Browser dashboard
- [#23](https://github.com/mepuka/effect-claude-agent-sdk/issues/23) — Feat: One-liner DX
- [#24](https://github.com/mepuka/effect-claude-agent-sdk/issues/24) — Chore: Code quality fixes
- [#25](https://github.com/mepuka/effect-claude-agent-sdk/issues/25) — Feat: Wire IndexedDB for browser replica
