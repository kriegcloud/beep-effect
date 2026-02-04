# Phase 11 Persistence + Storage - Engineering Spec

Status: Implemented
Last updated: 2026-02-02

## Summary
This spec defines an Effect-native persistence layer for chat history, artifacts, and audit events.
It adds configuration, retention policies, filesystem convenience layers (including Bun-first),
automatic recording helpers, and ergonomic runtime composition. All new behavior is opt-in.

## Goals
- Provide a centralized `StorageConfig` service with typed defaults and environment overrides.
- Add filesystem-backed persistence layers for all three stores with a simple default directory.
- Provide opt-in helpers to record chat history and emit audit events automatically.
- Offer a one-line `AgentRuntime.layerWithPersistence` composition for the full stack.
- Ship runnable examples and README documentation for storage usage.

## Non-Goals
- No breaking changes to existing store APIs.
- No new storage backends beyond `KeyValueStore` memory/filesystem.
- No implicit persistence unless the user opts in via layers/helpers.
- No platform-specific filesystem dependencies in the core layers.

## Inputs and References
- Plan: `docs/plan/phase-11-persistence-storage.md`
- Issues: #4, #5, #6, #7, #8, #9
- Effect guidance: `effect-solutions` (services-and-layers, config, testing, basics)
- Schema types: `src/Schema/Storage.ts`, `src/Schema/Message.ts`, `src/Schema/Hooks.ts`

## Decisions
1) **Default filesystem directory**: `storage` (relative to cwd).
   - Reason: works out of the box in local/dev environments.
   - Users can pass an absolute path (including `/storage`) for container mounts.
2) **Bun filesystem convenience**: add `layerFileSystemBun` for each store, in addition to
   the portable `layerFileSystem`.
3) **Audit logging error policy**: fail-open by default (audit failures do not block hooks);
   add `strict` option to fail closed in regulated environments.
4) **Recorder error policy**: fail-open by default; allow `strict` option if desired.

## Architecture Overview

### Services and Layers
- `ChatHistoryStore`, `ArtifactStore`, `AuditEventStore`: existing Context.Tag services.
- New `StorageConfig` Context.Tag providing defaults and overrides.
- Optional `StorageCleanup` service to enforce retention.
- Helper layers:
  - `layerFileSystem` (portable; uses `KeyValueStore.layerFileSystem`).
  - `layerFileSystemBun` (Bun-only; uses `@effect/platform-bun`).

### Persistence Pipeline
- **Chat history**: `QueryHandle.stream` -> `Stream.tap` -> `ChatHistoryStore.appendMessage`.
- **Artifacts**: `SDKMessage` events (e.g. user messages with `tool_use_result`) ->
  `ArtifactStore.put` after mapping to `ArtifactRecord`.
- **Audit events**: hook events and tool lifecycle -> `AuditEventStore.write`.

### Effect Patterns (requirements)
- Services are `Context.Tag` classes with dependency-free method signatures.
- Implementations use `Layer.effect` or `Layer.scoped` and `Effect.fn` for methods.
- Config uses `effect/Config` (with `Schema.Config` for validation).
- Cleanup fibers are scoped with `Effect.repeat(Schedule.spaced(...))`.

## API Surface (Proposed)

### 1) StorageConfig
**File**: `src/Storage/StorageConfig.ts` (or `src/Config/StorageConfig.ts`)

```ts
export type StorageConfigData = {
  readonly enabled: {
    readonly chatHistory: boolean
    readonly artifacts: boolean
    readonly auditLog: boolean
  }
  readonly retention: {
    readonly chat: { readonly maxEvents: number; readonly maxAge: Duration }
    readonly artifacts: {
      readonly maxArtifacts: number
      readonly maxArtifactBytes: number
      readonly maxAge: Duration
    }
    readonly audit: { readonly maxEntries: number; readonly maxAge: Duration }
  }
  readonly pagination: {
    readonly chatPageSize: number
    readonly artifactPageSize: number
  }
  readonly kv: {
    readonly indexPageSize: number
  }
  readonly cleanup: {
    readonly enabled: boolean
    readonly interval: Duration
    readonly runOnStart: boolean
  }
}

export class StorageConfig extends Context.Tag("@effect/claude-agent-sdk/StorageConfig")<
  StorageConfig,
  { readonly settings: StorageConfigData }
>() {
  static readonly layer: Layer.Layer<StorageConfig>
  static readonly layerFromEnv: (prefix?: string) => Layer.Layer<StorageConfig>
}
```

**Defaults (initial)**
- `enabled`: chatHistory=true, artifacts=true, auditLog=false
- `retention.chat.maxEvents=10_000`, `retention.chat.maxAge=30 days`
- `retention.artifacts.maxArtifacts=5_000`, `maxArtifactBytes=500_000_000`, `maxAge=90 days`
- `retention.audit.maxEntries=100_000`, `maxAge=180 days`
- `pagination.chatPageSize=100`, `pagination.artifactPageSize=100`
- `kv.indexPageSize=500`
- `cleanup.enabled=true`, `cleanup.interval=1 hour`, `cleanup.runOnStart=false`

### 2) StorageCleanup (optional)
**File**: `src/Storage/StorageCleanup.ts`

Responsibilities:
- Trim chat history by count/age.
- Trim artifacts by count/age/bytes.
- Trim audit events by count/age.

Design:
- `StorageCleanup.run` performs one cleanup pass.
- `StorageCleanup.layer` runs cleanup on a schedule in a scoped fiber when enabled.

### 3) Filesystem Layers
**Files**: `src/Storage/*.ts` per store

Add:
- `layerFileSystem(options?: { directory?: string; prefix?: string })`
- `layerFileSystemBun(options?: { directory?: string; prefix?: string })`

Defaults:
- `directory`: `storage`
- `prefix` (per store): `claude-agent-sdk/chat-history`, `claude-agent-sdk/artifacts`,
  `claude-agent-sdk/session-index`, `claude-agent-sdk/event-journal`

Notes:
- `layerFileSystem` composes `KeyValueStore.layerFileSystem(directory)` with
  each store’s `layerKeyValueStore`.
- `layerFileSystemBun` composes `@effect/platform-bun` `BunKeyValueStore.layerFileSystem`.

### 4) Chat History Recording
**File**: `src/Storage/ChatHistoryStore.ts` or `src/Storage/ChatHistory.ts`

```ts
export type RecorderOptions = {
  readonly sessionId?: string
  readonly source?: ChatEventSource
  readonly inputSource?: ChatEventSource
  readonly recordInput?: boolean
  readonly recordOutput?: boolean
  readonly strict?: boolean
}

export const withRecorder: (
  handle: QueryHandle,
  options: RecorderOptions
) => Effect.Effect<QueryHandle, StorageError, ChatHistoryStore>
```

Behavior:
- Wraps `handle.stream` with `Stream.tap` to append messages.
- When `recordInput` is true, `send` and `sendAll` append input messages before forwarding.
- Fail-open by default; `strict` toggles failure propagation.

### 5) Session/Runtime History Layer
**File**: `src/SessionService.ts` and `src/AgentRuntime.ts`

```ts
export const SessionService.layerWithHistory: (
  options: SDKSessionOptions,
  history?: SessionHistoryOptions
) => Layer.Layer<SessionService, SessionError, SessionManager | ChatHistoryStore>
```

Behavior:
- `SessionService.layerWithHistory` records output and (optionally) input for a scoped session.
- `AgentRuntime.layerWithPersistence({ history })` decorates query handles to record history.

### 6) Audit Logging Middleware
**File**: `src/Hooks/Hook.ts`

```ts
export type AuditLoggingOptions = {
  readonly strict?: boolean
  readonly logHookOutcomes?: boolean
  readonly logPermissionDecisions?: boolean
  readonly matcher?: string
  readonly timeout?: Duration.DurationInput
}

export const withAuditLogging: (
  sessionId: string,
  options?: AuditLoggingOptions
) => Effect.Effect<HookMap, never, AuditEventStore>
```

Behavior:
- `PreToolUse` -> `tool_use` event with `status: "start"`.
- `PostToolUse` -> `tool_use` event with `status: "success"` and `durationMs`.
- `PostToolUseFailure` -> `tool_use` event with `status: "failure"` and `durationMs`.
- Emit `permission_decision` from hook output when available.
- Emit `hook_event` for hook outcomes if enabled.
- Fail-open by default; `strict` toggles fail-closed.

### 7) AgentRuntime.layerWithPersistence
**File**: `src/AgentRuntime.ts`

```ts
export type PersistenceLayers = {
  readonly runtime?: Layer.Layer<AgentRuntime>
  readonly chatHistory?: Layer.Layer<ChatHistoryStore>
  readonly artifacts?: Layer.Layer<ArtifactStore>
  readonly auditLog?: Layer.Layer<AuditEventStore>
  readonly sessionIndex?: Layer.Layer<SessionIndexStore>
  readonly storageConfig?: Layer.Layer<StorageConfig>
}

export type PersistenceOptions = {
  readonly layers?: PersistenceLayers
  readonly history?: RecorderOptions
  readonly audit?: AuditLoggingOptions
}

class AgentRuntime { 
  static readonly layerWithPersistence: (
    options?: PersistenceOptions
  ) => Layer.Layer<AgentRuntime, StorageError, never>
}
```

Behavior:
- Provides runtime + store layers with sensible defaults (memory if unspecified).
- Enables chat recording and audit middleware by default when `history`/`audit` options are provided.
- Chat history recording runs in a background fiber, so recording does not require
  the caller to drain the stream.
- Should be the recommended entrypoint for full persistence wiring.

## Data Model Impact
- No schema changes required.
- New config data type and optional cleanup service only.

## Error Handling
- Default fail-open for audit logging and recording.
- Provide `strict` options to fail closed in tests or regulated deployments.
- Storage errors remain typed (`StorageError`) and are visible in strict mode.

## Performance and Retention
- Retention cleanup should avoid scanning all keys; prefer per-session trimming and
  index-based policies where possible.
- Defaults are conservative to avoid large KV reads (page size 100, index page 500).
- Cleanup schedule defaults to hourly, not on start.

## Testing Plan

### Unit Tests
- `withRecorder` records stream output in order.
- `recordInput` writes inputs to chat history.
- `Hooks.withAuditLogging` logs tool lifecycle and permission decisions.
- `StorageConfig.layerFromEnv` overrides defaults.

### Integration Tests
- `layerFileSystem` persists data across restarts for all stores.
- `layerFileSystemBun` works under Bun without FileSystem/Path services.
- `AgentRuntime.layerWithPersistence` composes all services and produces persistent behavior.

### Test Utilities
- Use temp directories for filesystem tests.
- Use test layers for storage services; avoid global state.

## Documentation and Examples
- Add examples:
  - `examples/agent-sdk-chat-history.ts`
  - `examples/agent-sdk-artifact-store.ts`
  - `examples/agent-sdk-full-persistence.ts`
  - `examples/agent-sdk-filesystem-persistence.ts`
- README: add a Storage section with memory/KVS/filesystem usage examples.

## Phased Implementation Plan

Phase 0: Alignment (0.5 day)
- Confirm API signatures and defaults in this spec.
- Ensure `StorageConfig` path and naming are final.

Phase 1: StorageConfig + Retention (1-2 days)
- Implement `StorageConfig` with defaults and env overrides.
- Wire enabled flags and pagination defaults into stores.
- Add `StorageCleanup` service and scoped schedule.
- Add tests for config and cleanup.

Phase 2: Filesystem Layers (1 day)
- Add `layerFileSystem` and `layerFileSystemBun` for all stores.
- Add integration tests with temp directories.

Phase 3: Chat History Recording (1-2 days)
- Implement `withRecorder` and `layerWithHistory`.
- Add tests for stream pass-through and input recording.

Phase 4: Audit Middleware (1-2 days)
- Implement `Hooks.withAuditLogging` with duration tracking and permission decisions.
- Add tests for event mapping and error policy.

Phase 5: Runtime Composition (1 day)
- Implement `AgentRuntime.layerWithPersistence`.
- Add tests for composed behavior.

Phase 6: Docs + Examples (1 day)
- Add examples and README storage section.
- Verify examples run with `bun run`.

## Risks and Mitigations
- **Unbounded KV growth**: mitigated by retention policies and cleanup schedule.
- **Performance on large histories**: use pagination defaults + trimming.
- **Audit logging side effects**: fail-open by default to avoid interfering with hooks.
- **Filesystem permissions**: users can override directory to known writable paths.

## Rollout Plan
- Ship as opt-in features in a minor version.
- Announce new APIs and examples in README.
- Provide migration notes for users who want persistence.
