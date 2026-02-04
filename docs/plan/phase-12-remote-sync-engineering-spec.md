# Phase 12 Remote Sync + Event Log Architecture - Engineering Spec

Status: Draft
Last updated: 2026-02-02

## Summary
This spec defines a remote sync architecture for EventLog-backed data in the SDK, plus the supporting server, conflict policies, and compaction strategies. It extends the existing audit event journal to support multi-replica syncing and introduces optional journaled variants for chat history and artifacts. All behavior is opt-in and configurable via StorageConfig.

## Goals
- Provide a remote sync orchestration layer that connects EventLog instances to remotes using EventLogRemote.
- Ship a Bun-native EventLogRemote server that multiple SDK instances can connect to.
- Add built-in conflict resolution policies and compaction strategies for EventJournal.
- Extend ChatHistoryStore and ArtifactStore with optional journaled variants that can sync remotely.
- Integrate sync, compaction, and conflict handling with StorageConfig and the existing cleanup scheduler.
- Add deterministic tests and examples for two-replica convergence.

## Non-Goals
- Building a full CRDT system or automatic semantic merges for all events.
- Replacing or breaking current KV-backed ChatHistoryStore or ArtifactStore behavior.
- Providing SQL-backed journals in this phase (leave as a follow-on).
- Enabling remote sync by default without explicit configuration.

## Inputs and References
- Issues: #12, #13, #14, #15, #16
- `docs/plan/phase-11-persistence-engineering-spec.md`
- `docs/plan/phase-6-experimental.md`
- `docs/workflow-engine-cluster-architecture.md`
- `src/Storage/EventJournalKeyValueStore.ts`
- `src/Storage/AuditEventStore.ts`
- `src/Storage/ChatHistoryStore.ts`
- `src/Storage/ArtifactStore.ts`
- `src/experimental/EventLog.ts`
- `@effect/experimental` EventLog, EventJournal, EventLogRemote, EventLogServer

## Current State (Baseline)
- EventLog + EventJournal are available via `@effect/experimental`. EventLog includes:
  - `registerRemote` (runs bidirectional sync with a remote)
  - `registerCompaction` (injects compaction per event)
- `EventJournalKeyValueStore` already tracks per-remote state:
  - `withRemoteUncommited`, `nextRemoteSequence`, conflict detection, and a compaction hook.
- `AuditEventStore` uses EventLog and EventJournal with KV/FS layers.
- `ChatHistoryStore` and `ArtifactStore` are KV-based only (no journaling or remote sync).

## Architecture Overview
Remote sync is EventLog-centric. Each EventLog instance:
- Streams local entries to remotes using `withRemoteUncommited`.
- Pulls remote changes via `EventLogRemote.changes`.
- Applies conflict policy and compaction in `writeFromRemote`.

We provide:
1) A SyncService that manages remote connections and status.
2) A Bun-native EventLogRemoteServer for shared remote state.
3) Journaled store variants (ChatHistoryStore, ArtifactStore) that can opt into EventLog-backed sync.
4) ConflictPolicy + Compaction strategies tied to StorageConfig and cleanup.

## Proposed Services and Modules

### 1) SyncService (or EventLogSync)
Effect service responsible for connecting EventLog to remote(s) and reporting status.

API (proposed):
```ts
export type RemoteStatus = {
  readonly key: string
  readonly kind: "remoteId" | "url"
  readonly remoteId: string
  readonly url?: string
  readonly connected: boolean
  readonly lastSyncAt?: number
  readonly lastError?: string
}

export class SyncService extends Context.Tag("@effect/claude-agent-sdk/SyncService")<
  SyncService,
  {
    readonly connect: (remote: EventLogRemote.EventLogRemote) => Effect.Effect<void>
    readonly disconnect: (remoteId: string) => Effect.Effect<void>
    readonly disconnectRemoteId: (remoteId: string) => Effect.Effect<void>
    readonly disconnectWebSocket: (url: string) => Effect.Effect<void>
    readonly syncNow: () => Effect.Effect<void>
    readonly status: () => Effect.Effect<ReadonlyArray<RemoteStatus>>
    readonly statusStream: () => Stream.Stream<ReadonlyArray<RemoteStatus>>
  }
>() {
  static readonly layerWebSocket: (url: string, options?: {
    disablePing?: boolean
    syncInterval?: DurationInput
  }) => Layer.Layer<SyncService>
  static readonly layerSocket: (host: string, port: number, options?: { disablePing?: boolean }) => Layer.Layer<SyncService>
  static readonly layerMemory: Layer.Layer<SyncService>
}
```

Notes:
- Use `EventLogRemote.fromWebSocket`/`fromSocket` to establish the connection.
- Each connection scopes `EventLog.registerRemote` for the EventLog in context.
- `syncNow` triggers a manual push by re-running the `withRemoteUncommited` flow or re-registering.
- `status` is in-memory (per process). No remote persistence requirement.
- `syncInterval` can be configured directly on `SyncService.layerWebSocket` (fallback to StorageConfig when omitted).

### 2) EventLogRemoteServer
Service wrapping `EventLogServer` with Bun WebSocket support.

API (proposed):
```ts
export class EventLogRemoteServer extends Context.Tag("@effect/claude-agent-sdk/EventLogRemoteServer")<
  EventLogRemoteServer,
  { readonly address: HttpServer.Address; readonly url: string }
>() {
  static readonly layerBunWebSocket: (options: ServerOptions) => Layer.Layer<EventLogRemoteServer>
  static readonly layerBunWebSocketTest: (options: ServerOptions) => Layer.Layer<EventLogRemoteServer>
  static readonly layerSocket: (options: ServerOptions) => Layer.Layer<EventLogRemoteServer>
}
```

Storage backends:
- `layerMemory` (tests)
- `layerKeyValueStore` (pluggable KV, incl. filesystem)
- `layerFileSystem` / `layerFileSystemBun`

Behavior:
- Accept multiple clients and fan out changes.
- Use `EventLogEncryption` if configured (server generates or loads keys).
- Partition streams by `publicKey` (matches EventLogRemote protocol design).
- Server lifecycle is managed by the layer scope; address is exposed for diagnostics.

### 3) ConflictPolicy
Injectable policy for resolving conflicts in `writeFromRemote`.

Built-ins:
- `lastWriteWins` (default, current behavior)
- `firstWriteWins`
- `merge(fn)`
- `reject`

Policy is applied inside the EventLog remote handler path and can emit audit events.

### 4) Compaction Strategies
Built-in compaction strategies for EventJournal entries:
- `byAge(maxAge)`
- `byCount(maxEntries)`
- `bySize(maxBytes)`
- `composite(...strategies)`

Integration:
- Hook into `EventLog.registerCompaction` for event-specific compaction.
- Use StorageConfig retention values as defaults for audit log compaction.
- Optionally run compaction in the existing `StorageCleanup` scheduler.

### 5) Journaled Store Variants
Optional remote-syncable versions of ChatHistoryStore and ArtifactStore.

Proposed:
- `ChatHistoryStore.layerJournaled(options?)`
- `ArtifactStore.layerJournaled(options?)`

Implementation sketch:
- Define `ChatEventGroup` and `ArtifactEventGroup` with EventLog schemas.
- Each journaled layer uses EventLog + EventJournal under the hood.
- Provide a migration utility to import existing KV data into the journal (opt-in).

## Detailed API Surface (Draft)
This section enumerates intended modules and draft signatures to reduce ambiguity during implementation.

### Files / Modules
- `src/Sync/SyncService.ts` (new)
- `src/Sync/ConflictPolicy.ts` (new)
- `src/Sync/Compaction.ts` (new)
- `src/Sync/EventLogRemoteServer.ts` (new)
- `src/Storage/StorageConfig.ts` (extend)
- `src/Storage/ChatHistoryStore.ts` (add `layerJournaled`)
- `src/Storage/ArtifactStore.ts` (add `layerJournaled`)
- `src/experimental/EventLog.ts` (add Chat/Artifact event groups and schema exports)
- `src/examples/remote-sync.ts` (new example)

### ConflictPolicy (draft)
```ts
export type ConflictResolution =
  | { readonly _tag: "accept"; readonly entry: EventJournal.Entry }
  | { readonly _tag: "reject"; readonly reason?: string }
  | { readonly _tag: "merge"; readonly entry: EventJournal.Entry }

export class ConflictPolicy extends Context.Tag("@effect/claude-agent-sdk/ConflictPolicy")<
  ConflictPolicy,
  {
    readonly resolve: (options: {
      readonly entry: EventJournal.Entry
      readonly conflicts: ReadonlyArray<EventJournal.Entry>
    }) => Effect.Effect<ConflictResolution>
  }
>() {
  static readonly layerLastWriteWins: Layer.Layer<ConflictPolicy>
  static readonly layerFirstWriteWins: Layer.Layer<ConflictPolicy>
  static readonly layerReject: Layer.Layer<ConflictPolicy>
  static readonly layerMerge: (
    merge: (entry: EventJournal.Entry, conflicts: ReadonlyArray<EventJournal.Entry>) => EventJournal.Entry
  ) => Layer.Layer<ConflictPolicy>
}
```

### Compaction (draft)
```ts
export type CompactionStrategy = (entries: ReadonlyArray<EventJournal.RemoteEntry>) =>
  Effect.Effect<ReadonlyArray<[ReadonlyArray<EventJournal.Entry>, ReadonlyArray<EventJournal.RemoteEntry>]>>

export const Compaction = {
  byAge: (maxAge: Duration.DurationInput) => CompactionStrategy,
  byCount: (maxEntries: number) => CompactionStrategy,
  bySize: (maxBytes: number) => CompactionStrategy,
  composite: (...strategies: ReadonlyArray<CompactionStrategy>) => CompactionStrategy
}
```

### Journaled Store Variants (draft)
```ts
export type JournaledOptions = {
  readonly journalKey?: string
  readonly identityKey?: string
  readonly prefix?: string
}

// Chat
static readonly layerJournaled: (options?: JournaledOptions) => Layer.Layer<ChatHistoryStore>

// Artifacts
static readonly layerJournaled: (options?: JournaledOptions) => Layer.Layer<ArtifactStore>
```

### EventLogRemoteServer (draft)
```ts
export type ServerOptions = {
  readonly port?: number
  readonly host?: string
  readonly encryption?: { readonly key: string }
}
```

## Layer Wiring (Sketch)
```ts
const journalLayer = EventJournalKeyValueStore.layerKeyValueStore()
const eventLogLayer = EventLog.layerEventLog.pipe(
  Layer.provide(journalLayer),
  Layer.provide(EventLog.layerIdentityKvs({ key: "event-log-identity" }))
)

const syncLayer = SyncService.layerWebSocket("ws://localhost:8787")

const appLayer = eventLogLayer.pipe(
  Layer.provide(syncLayer),
  Layer.provide(ConflictPolicy.layerLastWriteWins),
  Layer.provide(Compaction.layerFromConfig)
)
```

## Configuration Extensions (StorageConfig)
Add `remote`, `conflicts`, and `compaction` to StorageConfig:
```ts
remote: {
  enabled: boolean
  role: "client" | "server" | "both"
  url?: string
  port?: number
  syncInterval: Duration
  connectTimeout: Duration
  encryption?: { key: string }
  sync: {
    auditLog: boolean
    chatHistory: boolean
    artifacts: boolean
  }
}
conflicts: {
  policy: "lastWriteWins" | "firstWriteWins" | "merge" | "reject"
}
compaction: {
  enabled: boolean
  byAge?: Duration
  byCount?: number
  bySizeBytes?: number
}
```

Defaults:
- `remote.enabled = false`
- `remote.syncInterval = 5 seconds`
- `remote.sync.auditLog = true`, `chatHistory = false`, `artifacts = false`
- `conflicts.policy = "lastWriteWins"`
- `compaction.enabled = true` (audit only by default, wired to retention)

## Configuration Example
```ts
StorageConfig.layer({
  remote: {
    enabled: true,
    role: "client",
    url: "ws://localhost:8787",
    syncInterval: Duration.seconds(5),
    sync: { auditLog: true, chatHistory: false, artifacts: false }
  },
  conflicts: { policy: "lastWriteWins" },
  compaction: { enabled: true, byCount: 100_000 }
})
```

## Data Model and Event Groups
- AuditEventGroup (existing): tool_use, permission_decision, hook_event.
- ChatEventGroup (new): one event per chat message append.
- ArtifactEventGroup (new): one event per artifact write.
- Conflict events (new audit type or separate group): include both entries and metadata.

Primary keys:
- Audit: `${sessionId}:${toolName}:${status}` (existing)
- Chat: `${sessionId}:${sequence}`
- Artifact: `${sessionId}:${artifactId}`

## Sync Flow (Sequence)
1) `SyncService.connect` establishes a remote connection via EventLogRemote.
2) EventLog registers the remote and begins:
   - Push local uncommitted entries (`withRemoteUncommited` -> remote.write).
   - Subscribe to remote changes (`remote.changes`).
3) For each remote entry:
   - Apply compaction (if configured).
   - Run conflict policy (with audit logging).
   - Persist to EventJournal.
4) Local changes trigger outbound sync through EventLog’s change loop.

## Error Handling
- Sync failures should not crash application by default (fail-open).
- Provide `strict` flags in config to fail-closed for regulated environments.
- Retry and backoff should be handled by EventLogRemote (ping/timeout + retry).

## Performance Considerations
- Use protocol chunking for large payloads; avoid giant artifact payloads over EventLogRemote.
- Keep compaction event-specific to avoid long pauses in the EventLog write pipeline.
- Favor incremental sync (startSequence) to avoid full log replays.
- Keep journal writes serialized via EventLog’s semaphore; avoid additional locks in store layers.

## Security and Privacy
- Treat encryption keys as secrets: use env + Effect Config or external KMS.
- Do not sync sensitive artifact contents unless explicitly enabled.
- Add optional redaction hooks for audit payloads in regulated environments.

## Observability
- Log structured sync events (connect, disconnect, retry, error).
- Emit audit events for conflicts, compaction runs, and remote sync status changes.
- Include remoteId and publicKey in log annotations.

## Compatibility and Migration
- All remote sync behavior is opt-in. Default remains local-only.
- Existing KV stores remain unchanged; journaled layers are additive.
- Provide a one-off migration helper to import KV data into journaled stores.

## Testing Plan
- Unit tests:
  - Compaction strategies (byAge, byCount, bySize).
  - Conflict policies (last/first/merge/reject).
- Integration:
  - Two replicas with in-memory EventLogRemoteServer converge.
  - Reconnect resumes from last sequence number.
  - Selective sync (audit only) works.
- Use TestClock / deterministic time where applicable.

## Acceptance Criteria (by Issue)
### #12 Implement EventLogRemote sync orchestration
- [x] SyncService connects and manages EventLogRemote connections.
- [x] Bidirectional sync works; reconnect resumes from last sequence.
- [x] Sync interval configurable via StorageConfig.
- [x] Integration test: two replicas converge.

### #13 Add EventLogRemote server for shared state
- [x] Server accepts WebSocket connections (Bun.serve).
- [x] Persists entries to EventJournal backend.
- [x] Broadcasts changes to connected replicas.
- [ ] Optional encryption supported.
- [ ] Example: two SDK instances sync via server.

### #14 Implement compaction strategies for EventJournal
- [x] byAge/byCount (at minimum) implemented and composable.
- [x] Compaction integrated with EventLog.registerCompaction.
- [x] Compacted entries are not re-synced.
- [x] Unit tests for each strategy.

### #15 Add conflict resolution policies for multi-replica sync
- [x] lastWriteWins/firstWriteWins policies implemented.
- [x] Policy is injectable via Layer.
- [x] Conflicts emitted to audit log.
- [x] Unit tests for conflicts.

### #16 Extend ChatHistoryStore and ArtifactStore with remote sync
- [x] Journaled layers for chat history and artifacts.
- [x] Selective sync config works.
- [ ] Migration utility or documented path (skipped for greenfield).
- [x] No breaking changes for existing KV layers.

### UX follow-ups
- [x] Disambiguate remote identifiers (key/kind in status + explicit disconnect helpers).
- [x] Update lastSyncAt on actual sync activity.
- [x] Allow explicit sync interval config at the SyncService layer.
- [x] Add wss scheme support for server URL helpers.
- [x] Provide a one-liner remote-sync storage wiring helper.

## Example Usage (Sketch)
```ts
// Client: connect to remote
const remoteLayer = EventLogRemote.layerWebSocket("ws://localhost:8787")
const appLayer = AuditEventStore.layerFileSystemBun().pipe(
  Layer.provide(remoteLayer),
  Layer.provide(SyncService.layerWebSocket("ws://localhost:8787"))
)
```

```ts
// Server: Bun WebSocket endpoint
Bun.serve({
  port: 8787,
  fetch(req, server) {
    if (server.upgrade(req)) return new Response(null, { status: 101 })
    return new Response("ok")
  },
  websocket: {
    open(ws) {
      // EventLogRemoteServer handles the socket via @effect/platform Socket
    }
  }
})
```

## Rollout Plan
1) Ship SyncService + EventLogRemoteServer with memory storage and example.
2) Add conflict policy + compaction strategies with tests.
3) Add journaled ChatHistoryStore and ArtifactStore with migration helper.
4) Docs + examples for remote sync configuration.

## Risks and Open Questions
- Should chat/artifact events share a single EventLog or separate logs?
- How to handle very large artifact payloads over the remote protocol?
- Should compaction create tombstones to prevent re-sync of compacted entries?
- Where should encryption keys live (env config vs external KMS)?
