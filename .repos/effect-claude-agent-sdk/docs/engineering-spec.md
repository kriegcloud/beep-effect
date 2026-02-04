# Effect Claude Agent SDK Wrapper - Engineering Spec

Status: Draft

## Summary
Build a Bun-first, Effect-native wrapper around `@anthropic-ai/claude-agent-sdk` that exposes fully typed, schema-backed, service- and layer-driven APIs. The wrapper will model SDK types with `effect/Schema`, stream messages via `Stream`, manage lifecycle with `Scope`, and provide structured concurrency and error handling consistent with Effect best practices.

## Goals
- Provide a fully effect-native API surface for all SDK entry points (`query`, tool + MCP helpers, and v2 session APIs).
- Model every SDK type and tool input with `Schema` for decode/encode and runtime validation.
- Expose streaming output as `Stream<SDKMessage, ...>` and streaming input via Effect-driven queues.
- Provide layered configuration and resource management, with Bun-first defaults.
- Avoid Zod in the public API; prefer `Schema` for all user-facing definitions.
- Enable pluggable concurrency and observability (timeouts, retries, spans, logging, metrics).

## Non-Goals
- Re-implement the Claude Agent SDK transport or protocol.
- Replace Claude Code or its CLI behaviors.
- Provide a GUI or CLI; this is a library wrapper.

## Inputs and References
- SDK Types: `node_modules/@anthropic-ai/claude-agent-sdk/sdk.d.ts`
- Tool Inputs: `node_modules/@anthropic-ai/claude-agent-sdk/sdk-tools.d.ts`
- Effect best practices: `effect-solutions` (services, data modeling, error handling, config).
- Effect docs (MCP):
  - Stream: `Stream.fromAsyncIterable`, `Stream.asyncScoped`, `Stream` introduction
  - Queue: bounded/dropping/sliding queues
  - Deferred: coordination primitive
  - Resource management: `Effect.acquireUseRelease`, `Effect.ensuring`
- JSON Schema: `JSONSchema.make` (outputFormat), `JSONSchema.fromAST` (tool parameters)
  - Execution planning: `ExecutionPlan`
  - AI integration: `@effect/ai` Tool + Toolkit
  - Platform/Bun: `@effect/platform` `CommandExecutor` + `@effect/platform-bun` layers

## Constraints and Defaults
- Bun-first runtime; default to the SDK's spawn path with `executable: "bun"`.
- No Zod in the public API. Internals may adapt if required by SDK.
- Default `settingSources` is empty (`[]`) for isolation; provide an opt-in preset for `["project", "local"]`.
- Use `Schema` for all runtime validation and decoding.
- Use `Layer` and `Context.Tag` for services; no hidden dependencies.
- Preserve SDK behavior and semantics, avoid silent changes.
- When applying config providers, compose with `Layer.provide` so the provider is scoped to the layer build.

## Architecture Overview

### Service Model
- `AgentSdk` is the primary service (`Context.Tag`) that exposes all SDK entry points as Effects.
- `AgentSdkConfig` is a configuration service with a `layer` using `Schema.Config`.
- `AgentSdk.layerDefault` composes `AgentSdkConfig.layer` for production wiring.
- `AgentSdk.layerDefaultFromEnv(prefix)` installs a scoped config provider and then builds `AgentSdkConfig`.
- `QueryHandle` is a scoped resource providing:
  - `stream: Stream<SDKMessage, AgentSdkError, never>`
  - Control methods: `interrupt`, `setPermissionMode`, `setModel`, `setMaxThinkingTokens`, `rewindFiles`, `setMcpServers`, `supportedCommands`, `supportedModels`, `mcpServerStatus`, `accountInfo`.
- `SessionHandle` wraps v2 APIs with proper scope finalization.

### Module Layout (Proposed)
- `src/index.ts` (public exports)
- `src/AgentSdk.ts` (service interface and layer)
- `src/AgentSdkConfig.ts` (config schema + layer)
- `src/Query.ts` (QueryHandle wrapper)
- `src/Session.ts` (v2 session wrapper)
- `src/Schema/*` (SDK type schemas)
- `src/Tools/*` (Schema-first tool definitions and adapters)
- `src/Mcp/*` (MCP config and server helpers)
- `src/Hooks/*` (hook types + handlers)
- `src/Permissions/*` (permission model, results, helpers)
- `src/Errors.ts` (Tagged errors)
- `src/internal/*` (SDK interop, conversions)
- `src/experimental/*` (RateLimiter, PersistedQueue adapters)
- `src/ai/*` (optional `@effect/ai` adapters)

## SDK Element to Effect Module Mapping

| SDK Element | Effect Modules | Notes |
| --- | --- | --- |
| `query()` | `Effect`, `Stream.fromAsyncIterable`, `Stream.asyncScoped`, `Scope`, `Queue`, `Deferred` | Convert async generator to `Stream`; manage lifecycle with `Scope`; stream input via `Queue`.
| `Query` control methods | `Effect.fn`, `Effect.timeout`, `Effect.onInterrupt`, `Deferred` | Wrap SDK promises; map cancel/interrupt to Effect interrupts.
| `Options` | `Schema`, `Config`, `Schema.Config` | Provide config layer and runtime validation; mark non-serializable fields via `Schema.declare`.
| `SDKMessage` union | `Schema.TaggedClass`, `Schema.Union`, `Schema.UUID` | Full type coverage for all message variants, incl. system/stream events.
| Tool inputs (sdk-tools) | `Schema.Struct`, `Schema.NonEmptyArray`, `Schema.Record` | Schema-first modeling for every tool input type.
| Hooks & callbacks | `Effect`, `Stream`, `Queue`, `Deferred`, `Fiber`, `Scope` | Run hook callbacks in fibers with timeout control; collect outputs via queues.
| Permission flow | `Schema.TaggedError`, `Effect`, `Match` | Typed permission decision results and denials.
| MCP config & servers | `Layer`, `Scope`, `Effect.acquireUseRelease` | Scoped lifecycle; expose `createSdkMcpServer` wrappers.
| Output JSON schema | `JSONSchema.make`, `JSONSchema.fromAST` | Use `JSONSchema.make` for `outputFormat` and a `ToolJsonSchema` helper (fromAST) for tool parameters.
| v2 sessions | `Scope`, `Stream`, `Effect.acquireRelease` | Wrap session lifecycle with cleanup on scope exit.
| Spawn/transport | SDK default spawn (bun) + `spawnClaudeCodeProcess` pass-through | Use SDK process spawn to keep Node streams; defer CommandExecutor bridge.
| Retry/fallback | `Schedule`, `ExecutionPlan` | Model fallback models and retries declaratively.
| Rate limiting | `@effect/experimental/RateLimiter` | Optional budget/token throttling.
| Persistence | `@effect/experimental/PersistedQueue`, `PersistedCache` | Optional session/message persistence.
| Observability | `Effect.withSpan`, `Effect.log`, `@effect/opentelemetry` | Trace and log query lifecycle and tool calls.

## Schema Coverage Plan
- Implement `Schema` models for all SDK types in `sdk.d.ts` and tool inputs in `sdk-tools.d.ts`.
- Use `Schema.TaggedClass` or `Schema.Struct` with literal tags for discriminated unions.
- Use `Schema.UUID` for `uuid` fields.
- Use `Schema.Record` for dynamic maps (e.g., `modelUsage`, `mcpServers`).
- Use `Schema.Unknown` or `Schema.declare` for external SDK types that are not modeled (e.g., `BetaRawMessageStreamEvent`), with an explicit TODO to refine later.
- Provide `Schema` for serialized variants and a parallel `Runtime` type for non-serializable fields (callbacks, `AbortController`, `McpServer`).

## Tooling and Schema-First APIs

### Tool Definition Strategy
- Primary API: `Tool.fromSchema` and `Toolkit.fromSchema` using `effect/Schema`.
- Handlers accept decoded `Schema` types and return Effect-based results.
- If the SDK requires Zod internally (MCP in-process tools), adapt behind the scenes by converting Effect schema when possible or accept an explicit Zod schema override.
- Provide `Tool.toJsonSchema` via a `ToolJsonSchema` helper (fromAST) for tool parameter metadata and `JSONSchema.make` for `outputFormat`.

### Optional @effect/ai Adapters
- Provide adapters to map `@effect/ai` `Tool` and `Toolkit` definitions into SDK MCP tools.
- `Toolkit.toLayer` can be used to provide tool handlers as layers, aligning with the SDK tool registry.
- Keep adapters optional so the core wrapper does not require `@effect/ai` at runtime.

## Streaming, Concurrency, and Resource Management

### Streaming Output
- Convert SDK async generator to `Stream` using `Stream.fromAsyncIterable`.
- Use `Stream.asyncScoped` when we need to hook into lifecycle and cleanup.
- Provide `Stream.broadcast` or `Stream.share` for multi-subscriber use cases (scoped).

### Streaming Input
- Use a bounded `Queue` for back-pressure on input messages.
- `QueryHandle.send` offers to queue; `QueryHandle.sendForked` forks within the current `Scope` (interrupted on scope close); `QueryHandle.closeInput` shuts down the queue.

### Synchronization
- Use `Deferred` to coordinate the first message (session ID readiness) and control requests.

### Lifecycle
- Wrap `Query` in `Effect.acquireUseRelease` or `Effect.scoped` with finalizers:
  - Interrupt query and close input on scope exit.
  - Await SDK resource cleanup.

### Retry / Fallback
- Use `Schedule` for backoff and `ExecutionPlan` for multi-model fallbacks (aligned with Effect AI docs).

### Concurrency Primitives Inventory (Deep Usage)
- `Queue` for backpressure-aware input streams and bounded buffering.
- `PubSub` for fan-out of streaming events to multiple subscribers.
- `Deferred` for one-time handshakes (session readiness, control request ack).
- `Effect.makeSemaphore` and `withPermits` for concurrency limits around tool calls and hooks.
- `Fiber` for running background readers and hook execution in parallel.
- `Scope` + `Effect.acquireUseRelease` for lifecycle safety of spawned processes and sessions.
- `Stream.fromAsyncIterable` for bridging the SDK async generator to `Stream`.
- `Stream.asyncScoped`, `Stream.broadcast`, `Stream.share`, and `Stream.buffer` for advanced stream topologies.

## Transport and Spawn Strategy (Bun-First)
- Use the SDK default spawn path with `executable: "bun"` to preserve Node `Readable`/`Writable` stream expectations.
- Pass through user-provided `spawnClaudeCodeProcess` for advanced environments (must return Node streams).
- Defer any `CommandExecutor` bridge until a Node stream adapter exists; keep platform-bun layers optional for future enhancements.

## Error Model
- Use `Schema.TaggedError` for expected failures:
  - `AgentSdkError` (top-level)
  - `TransportError`, `PermissionDenied`, `HookError`, `McpError`, `DecodeError` (subtypes)
- Use `Schema.Defect` for unknown/foreign errors.
- Map SDK `AbortError` to a typed `Interrupted` error when possible.

## Observability
- Wrap major operations with `Effect.withSpan` (query start, tool call, hook callback, MCP interaction).
- Emit structured logs for `SDKResultMessage` and permission denials.
- Optional: provide OpenTelemetry integration via `@effect/opentelemetry`.

## Testing Strategy
- Unit tests for Schema encode/decode round trips.
- Integration tests for streaming queries using test layers.
- Concurrency tests for interrupt + rewind behavior with `TestClock`.
- Tool handler tests via `Toolkit` layers.
- Stream helper tests for `share`, `broadcast`, and `sendForked` to validate scope behavior.

## Experimental Modules (Optional Enhancements)
- `@effect/experimental/RateLimiter` to enforce `maxBudgetUsd` or tool call limits.
- `@effect/experimental/PersistedQueue` for durable streaming input and task queues.
- `@effect/experimental/PersistedCache` for caching supported commands/models and session metadata.
- `@effect/experimental/EventLog` and `EventJournal` for auditable hook/tool execution trails.

## Implementation Plan Documents
- `docs/plan/README.md`
- `docs/plan/phase-1-schema-foundation.md`
- `docs/plan/phase-2-core-service-config.md`
- `docs/plan/phase-3-streaming-concurrency.md`
- `docs/plan/phase-4-tools-hooks-mcp.md`
- `docs/plan/phase-5-v2-sessions.md`
- `docs/plan/phase-6-experimental.md`
- `docs/plan/phase-7-hardening-docs.md`

## Open Questions
- Should v2 APIs be exported under an `Unstable` module or alongside stable APIs?
- Should `Tool.fromSchema` expose JSON Schema annotations directly from `Schema`?

## Follow-up Docs
- Plan index: `docs/plan/README.md`
