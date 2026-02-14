# Phase 11 - Persistence: Chat History, Artifacts, Audit Log

Status: Implemented
Date: 2026-01-23

## Objective
Provide first-class, Effect-native persistence for:
- Chat/session history (SDK message stream + metadata).
- Artifacts and tool results (files, outputs, summaries, tool metadata).
- Audit/event log with durable storage.

All persistence should be optional and injectable via Layers, with memory defaults
and KeyValueStore-backed implementations for durability.

## Source Review (Effect Persistence + Event Log)
- `@effect/platform/KeyValueStore` provides `layerMemory`, `layerFileSystem`, and
  `forSchema` to build typed stores via `SchemaStore`.
- `@effect/experimental/Persistence` provides `layerResultKeyValueStore` and a
  `ResultPersistence` abstraction used by `PersistedCache`.
- `@effect/experimental/EventLog` composes `EventJournal` + `Identity` via
  `EventLog.layerEventLog`. `EventLog.layerIdentityKvs` persists identity in
  a KeyValueStore.
- `@effect/experimental/EventJournal` ships `layerMemory` and `layerIndexedDb`.
  A KeyValueStore-backed EventJournal implementation is not present by default
  and should be implemented in-repo for server-side persistence.

## Proposed Architecture
### 1) Storage Services (Context + Layer)
Add a `Storage` module group with the following services:

- `ChatHistoryStore`
  - API (example):
    - `append(message: SDKMessage): Effect<void>`
    - `appendAll(messages: ReadonlyArray<SDKMessage>): Effect<void>`
    - `list(sessionId, options?): Effect<ReadonlyArray<SDKMessage>>`
    - `stream(sessionId, options?): Stream<SDKMessage>`
    - `purge(sessionId): Effect<void>`
  - Data model:
    - `ChatEvent` = `SDKMessage` + metadata (`sessionId`, `sequence`, `timestamp`, `source`).

- `ArtifactStore`
  - API (example):
    - `put(record: ArtifactRecord): Effect<void>`
    - `get(id): Effect<Option<ArtifactRecord>>`
    - `list(sessionId, options?): Effect<ReadonlyArray<ArtifactRecord>>`
    - `delete(id): Effect<void>`
  - Data model:
    - `ArtifactRecord` includes `sessionId`, `toolUseId`, `kind`, `path`,
      `summary`, `size`, `createdAt`, optional `contentRef`.

- `AuditEventStore`
  - Wrapper for `@effect/experimental/EventLog` using our audit schema.
  - Uses durable `EventJournal` + persisted `Identity`.

Each service exposes:
- `layerMemory` for local/dev/test.
- `layerKeyValueStore` for durable storage (KV-backed).
- Convenience `layerFileSystem` using KeyValueStore file-system layer.

### 2) KV-backed Implementations
KeyValueStore is the initial backend. Use `forSchema` to build typed stores
and prefix keys by session:

- Chat history
  - `sessions/{sessionId}/messages/{uuid}` -> `ChatEvent`
  - `sessions/{sessionId}/index` -> list of message ids (chunked)
  - `sessions/{sessionId}/meta` -> counters, lastSequence, lastUpdated

- Artifacts
  - `sessions/{sessionId}/artifacts/{artifactId}` -> `ArtifactRecord`
  - `sessions/{sessionId}/artifacts/index` -> list of ids (chunked)

Chunking strategy:
- Store index pages in fixed-size chunks (e.g., 500 ids) to avoid large payloads.
- Keep a small `meta` record with `lastSequence`, `pageCount`, and paging hints.

### 3) Persistent Event Log
Promote audit logging to a first-class module:
- Use `EventLog.layerEventLog` with a persistent `EventJournal` implementation.
- Persist the EventLog identity using `EventLog.layerIdentityKvs` and KeyValueStore.
- Provide a default audit schema compatible with existing `Experimental.EventLog`.

Implementation choice:
- Implement `EventJournal.layerKeyValueStore` in-repo, using the journal API
  from `@effect/experimental/EventJournal` and KeyValueStore for storage.
- Keep `EventJournal.layerMemory` for tests and development.

### 4) Runtime Integration (Opt-in)
Offer opt-in helpers rather than changing default behavior:
- `ChatHistory.withRecorder(handle)` wraps `QueryHandle.stream` and persists
  `SDKMessage` events.
- `SessionService.layerWithHistory(...)` returns a scoped session service with
  background persistence fiber.
- `AgentRuntime.layerWithPersistence(...)` composes runtime + store layers and
  taps `QueryHandle.stream` and `runtime.events`.
- `AuditEventStore` integration: emit audit records from stream + hook inputs.

### 5) Config + Policy
Add a `StorageConfig` (Context.Tag) with defaults:
- `enabled: boolean` per store
- retention policies: `maxEvents`, `maxAge`, `maxArtifactBytes`
- chunk size and pagination defaults

## Phased Implementation Plan
### Phase 11.1 - API + Schema Foundation
- Define `ChatEvent` and `ArtifactRecord` schemas in `src/Schema/Storage`.
- Add `ChatHistoryStore`, `ArtifactStore`, `AuditEventStore` service tags.
- Provide `layerMemory` implementations for each store.
- Add basic tests for memory layers.
- Add `persistSession` to wrapper `Options` and config, so SDK disk persistence
  can be controlled explicitly.

### Phase 11.2 - KV-backed Persistence
- Implement KeyValueStore-backed layers for chat history + artifacts.
- Implement index paging + meta record design.
- Add `layerFileSystem` convenience via KeyValueStore file store.
- Document Bun-specific KVS layers (`@effect/platform-bun`) in examples.

### Phase 11.3 - Persistent Audit Event Log
- Implement `EventJournal.layerKeyValueStore` in-repo.
- Add `AuditEventStore.layerKeyValueStore` combining:
  - `EventLog.layerEventLog`
  - `EventLog.layerIdentityKvs`
  - `EventJournal.layerKeyValueStore`
- Provide a small helper to emit `tool_use`, `permission_decision`, and `hook_event`.

### Phase 11.4 - Runtime Integration + Docs
- Add opt-in wrappers (`withRecorder`, `layerWithHistory`).
- Update README + examples (chat history, artifacts, audit log).
- Add tests for:
  - chat history persistence and paging
  - artifact persistence (metadata)
  - audit log persistence (identity + entries)

## Test Plan
- Unit tests for store APIs using `layerMemory` and `layerKeyValueStore`.
- Round-trip schema tests (encode/decode) for `ChatEvent` and `ArtifactRecord`.
- Integration test: `AgentRuntime` with history recorder persists SDK messages.
- Audit log test: persisted identity + entries survive process restart.

## Exit Criteria
- Users can provide a `Layer` to persist history, artifacts, and audit events.
- Durable KV-backed layers exist with memory defaults.
- Event log persistence is first-class and documented.
- Examples and tests cover common usage in Bun.
