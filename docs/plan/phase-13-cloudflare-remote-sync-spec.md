# Phase 13 Cloudflare Remote Sync + Observability (DX/UX) Spec

Status: Draft  
Last updated: 2026-02-03

## Summary
Deliver a Cloudflare-native remote sync backend (Worker + Durable Object) with durable storage and clean DX for Bun-based SDK clients. Provide an observability-only browser viewer (read-only) that can follow live session updates from the Cloudflare backend. Browser replica storage (IndexedDB) and offline authoring are deferred.

This phase builds on Phase 12’s EventLog-backed sync system, but makes it deployable on Cloudflare with clear configuration and a one‑liner client experience.

## Goals
- Cloudflare-native remote sync server package (Worker + Durable Object) that implements the EventLogRemote protocol.
- Durable storage options suitable for production (DO storage and/or D1).
- Simple DX for connecting SDK clients to Cloudflare (`AgentRuntime.layerWithRemoteSync(...)` or equivalent).
- Observability browser viewer (read-only) with clear sync status indicators.
- Documented semantics and constraints, especially around WebSocket and streaming differences.

## Non-Goals
- Browser replica storage (IndexedDB) or offline authoring in the browser.
- Full multi-tenant auth or ACL policy framework (optional token gate only).
- SQL-based event journals outside Cloudflare’s native stack.
- Replacing the Bun-native EventLogRemoteServer.

## Inputs / References
- `docs/plan/phase-12-remote-sync-engineering-spec.md`
- `src/Sync/SyncService.ts`
- `src/Sync/EventLogRemoteServer.ts` (Bun implementation)
- `.reference/effect/packages/experimental/src/EventLogServer/Cloudflare.ts`
- `.reference/effect/packages/experimental/src/EventLogServer.ts`
- `.reference/effect/packages/sql-d1/README.md`
- `.reference/effect/packages/sql-sqlite-do/README.md`

## Current State (Baseline)
- SyncService orchestrates remote connections, status, and periodic sync in Bun.
- Bun-native EventLogRemoteServer exists and fans out changes via EventLogServer.makeHandlerHttp.
- ChatHistoryStore and ArtifactStore have journaled variants that can sync remotely.
- Integration test validates two-replica convergence in Bun.
- Effect provides `EventLogDurableObject` (Cloudflare) but no Worker entrypoint or storage adapter.

## Architectural Constraints (from Effect source)
### Cloudflare Durable Object behavior
`EventLogDurableObject`:
- Accepts a WebSocket in `fetch()` and sends a `Hello` (remoteId).
- Handles `WriteEntries`, `RequestChanges`, and `ChunkedMessage`.
- Broadcasts changes to all connected sockets on `WriteEntries`.
- **Does not** implement Ping/Pong or StopChanges.
- Requires a `Layer<EventLogServer.Storage>` at construction time.

### Bun server behavior
`EventLogServer.makeHandlerHttp` (used by our Bun server):
- Supports Ping/Pong and StopChanges.
- Uses `storage.changes()` to stream continuous updates.

## Scope Decisions
- **Browser = observability only.** The browser does not create events. It only reads and renders live updates.
- **Cloudflare DO is the authoritative remote.** Bun server remains for local/dev, but Cloudflare is the production target.
- **Client Ping must be handled.** We either disable Ping for Cloudflare connections or extend DO handling to support Ping/Pong.

## Layer Composition & Runtime Boundaries (Effect-native)
Recommended layering pattern for clean composition:
1) **StorageConfig** (config + retention + pagination)  
2) **Journaled stores** (ChatHistory/Artifact/Audit)  
3) **EventLog + EventJournal** (handlers + identity + compaction)  
4) **SyncService** (connects EventLog to remotes)  
5) **AgentRuntime** (session/runtime edges)

Guidelines:
- **Keep SyncService decoupled from WebSocket constructors** unless the caller explicitly uses `connectWebSocket`. This avoids pulling Bun dependencies into non‑Bun runtimes.
- **Offer runtime-safe WebSocket layers** for Bun, Worker, and Browser (e.g., `SyncService.layerWebSocketBun` / `layerWebSocketWorker` / `layerWebSocketBrowser`).
- **Expose SyncService when needed.** Provide a variant that returns both the store and SyncService so callers can access `statusStream()` without re-wiring.
- **One-liner DX** should return a merged layer (not just a map) for the “provide once” pattern.

Runtime boundary alignment:
- **AgentRuntime** runs as the authoritative event producer (Bun).  
- **Browser runtime** is read-only and should not require EventLog write privileges.  
- **Cloudflare DO** uses its own ManagedRuntime (see below) and is the authoritative remote hub.

## Target Architecture

### 1) Cloudflare Package
Create a Cloudflare‑native package under `cloudflare/` or `packages/cloudflare-sync/`:

```
cloudflare/
├── src/
│   ├── worker.ts           # Worker fetch entrypoint
│   ├── do/SyncDurableObject.ts
│   └── storage/StorageD1.ts (optional)
├── wrangler.toml
└── package.json
```

#### Worker entrypoint
- Routes WebSocket upgrade requests to a DO instance.
- DO instance is derived from tenant/session id (see partitioning below).
- Returns DO’s `fetch()` response.

#### Durable Object class
- `class SyncDurableObject extends EventLogDurableObject` **or** a custom implementation derived from the same logic.
- Must be wired with `storageLayer: Layer<EventLogServer.Storage>`.
- **Ping/StopChanges:**
  - Phase 1 default: disable Ping in client helpers.
  - Optional: implement Ping/Pong and StopChanges by copying handler logic from `EventLogServer.makeHandler` (if we want parity with Bun).

#### Partitioning strategy
EventLogRemote protocol is scoped by `publicKey`. The DO’s broadcast behavior only works safely if each DO instance is scoped to a single tenant/scope.

- **Default partition:** `tenantId` derived from URL path or header.
- Single‑tenant fallback: hard‑coded `default` id for local demo.

### 2) Storage Backends
We need a `Layer<EventLogServer.Storage>` for Cloudflare.

**Phase 1 (dev):**
- In‑memory storage for `wrangler dev`.

**Phase 2 (prod):**
- **Durable Object storage** (simple, low‑ops)
- **D1** (durable log with SQL, more operational complexity)

Decision criteria:
- If we need long‑term history or retention policies, D1 wins.
- If we only need “live + short history,” DO storage is sufficient.

### 2a) Effect-native storage strategy (recommended)
Use the existing SQL-backed EventLogServer implementation and swap in the Cloudflare SQL client:

- **DO storage (preferred v1):**  
  `SqlEventLogServer.layerStorageSubtle(...)` + `@effect/sql-sqlite-do`  
  Simple durability inside a single DO instance.

- **D1 storage (optional):**  
  `SqlEventLogServer.layerStorageSubtle(...)` + `@effect/sql-d1`  
  Durable shared storage, but **no transactions** and **changes stream is process-local** (PubSub only).

Constraints to document:
- **D1 has no transactions.** Any storage code must be transaction‑agnostic.
- **PubSub-based `changes()` does not cross instances.** For multi‑instance D1 deployments, live updates require polling or a secondary channel.
- **Per‑publicKey tables** may explode if tenant cardinality is high. If needed, implement a single shared table keyed by `publicKey` and sequence.

### 3) Client DX
Add a DX‑first API for Cloudflare:

```ts
AgentRuntime.layerWithRemoteSync({
  url: "wss://sync.example.workers.dev",
  provider: "cloudflare",
  disablePing: true,
  syncInterval: "5 seconds"
}).pipe(
  Layer.provide(ConflictPolicy.layerLastWriteWins),
  Layer.provide(Compaction.layerByCount(1000))
)
```

Key behavior:
- Sets `disablePing` by default for Cloudflare (unless DO implements Ping).
- Provides config presets (dev/prod).
- Exposes `statusStream()` for UI indicators.

### 4) Observability Browser Viewer (Read‑Only)
The browser viewer connects to the Cloudflare backend to render live updates.

Constraints:
- EventLogRemote data is encrypted per identity.
- A viewer can only decrypt entries if it has the same identity key as the writer.

Options:
- **Option A (demo):** disable encryption for observability or share identity key via env/URL.
- **Option B (secure):** add a read‑only server endpoint that decrypts and streams view models.

Phase 13 target: implement Option A for a minimal demo, keep Option B as a follow‑up.

## Protocol Semantics & Streaming
- **Hello handshake:** server sends `Hello` (remoteId), client registers remote.
- **RequestChanges:** client requests entries from a sequence; DO replies once with `Changes`.
- **Streaming:** live updates are broadcast on `WriteEntries`.
- **Ping/Pong:** supported by Bun server but not in DO. Client defaults must match.
- **StopChanges:** ignored by DO; acceptable for now, but may leak subscriptions in custom impl.

### Compatibility notes (Bun vs Cloudflare DO)
- **Ping/Pong:** Bun supports; DO does not. Cloudflare clients must use `disablePing: true` unless we extend DO handling.
- **StopChanges:** Bun supports; DO ignores.
- **Streaming changes:** Bun streams via `storage.changes(...)` forever; DO only sends a snapshot from `storage.entries(...)`.
- **Broadcast semantics:** DO broadcasts to all connected sockets (except the sender) on write. This assumes one tenant/publicKey per DO instance.

## End-to-End Data Flow (CLI → Remote → Storage → Listeners)
1) **Event production (CLI / AgentRuntime):**  
   Local events are written to EventLog via journaled stores (ChatHistory/Artifact/Audit).
2) **Local persistence:**  
   EventJournal writes entries to the configured storage (KV/FS/SQL), keyed by identity + sequence.
3) **Sync push (CLI → remote):**  
   SyncService registers the remote and sends `WriteEntries` for uncommitted entries.
4) **Remote persistence:**  
   Cloudflare DO writes entries via `EventLogServer.Storage` (DO SQLite or D1).
5) **Remote broadcast:**  
   DO sends `Changes` to all other connected sockets (not the sender).
6) **Replica apply (other CLI / Browser viewer):**  
   Clients decrypt entries, apply handlers, and update local stores; UI listens via `statusStream` and store APIs.

Notes:
- The sender still receives an `Ack` which is translated into remote entries in its own mailbox.
- The browser viewer is read-only and only renders entries it can decrypt (requires shared identity or server-side decrypt).

## ManagedRuntime & Lifecycle
Effect’s Cloudflare DO uses `ManagedRuntime.make(storageLayer)` internally, and we should align runtime lifecycle with the DO’s lifetime.

Guidelines:
- **One ManagedRuntime per DO instance.** Create it in the DO constructor and reuse for all socket events.
- **Use `runPromise` for request-bound work** (e.g., `handleRequest`) and `runFork` for fire‑and‑forget logging or background tasks.
- **Avoid per‑request layer rebuilds.** The runtime already encapsulates the storage layer; don’t reconstruct layers inside handlers.
- **Consider memoization for shared infra.** If we introduce shared cross‑DO resources, use a module‑level `Layer.MemoMap` and pass it into `ManagedRuntime.make(layer, memoMap)` to reuse caches safely.
- **Disposal:** The DO runtime should be treated as long‑lived; if we add explicit shutdown hooks, call `runtime.dispose()` to release resources.

CLI/Bun alignment:
- For CLI services and long‑lived runtimes, prefer `ManagedRuntime` at the program edge to centralize cleanup and keep effect boundaries clear.
- Keep all business logic in pure `Effect` and use `ManagedRuntime` only at I/O edges.

Browser alignment:
- Use a browser‑safe runtime edge that only depends on read-only services (no write paths).
- Share identity only when explicitly configured for observability; otherwise the viewer cannot decrypt entries.

## Configuration Surface (proposed)
Extend StorageConfig (or new SyncConfig) to include:

```ts
remote: {
  enabled: boolean
  url?: string
  provider?: "bun" | "cloudflare"
  tenant?: string
  syncInterval: Duration
  disablePing?: boolean
  encryption?: {
    enabled: boolean
    identityKey?: string
  }
  auth?: {
    token?: string
  }
}
```

## Security & Auth (minimal)
- Add optional bearer token verification in Worker.
- Bindings: `SYNC_AUTH_TOKEN` in env.
- No multi‑tenant ACL in v1.

## Testing Strategy
- Unit tests for Storage adapter (DO storage or D1) in isolation.
- Integration test using `wrangler dev` or Miniflare:
  - Bun client connects to Worker DO
  - Writes to EventLog
  - Second client receives broadcast
- Browser viewer smoke test (manual) against dev Worker.

## Implementation Plan
### Phase 13.1 – Cloudflare package skeleton
- Create Worker entrypoint and DO binding
- Memory storage layer
- Tenant routing
- Docs + example config

### Phase 13.2 – Durable storage
- DO storage adapter or D1 adapter
- Migration and retention strategy

### Phase 13.3 – DX helpers
- `AgentRuntime.layerWithRemoteSync` one‑liner
- Config parsing + defaults

### Phase 13.4 – Observability viewer
- Read‑only viewer connecting to Cloudflare
- Status indicators via `SyncService.statusStream`
- Basic event rendering (chat, artifacts, audit)

## Open Questions
- D1 vs DO storage: which durability guarantees do we need for v1?
- Do we want to implement Ping/Pong in the DO, or default to disablePing for Cloudflare clients?
- How do we distribute identity keys for the observability viewer (demo vs secure)?
- Tenant selection: URL path vs header vs query param?
- Should the Cloudflare package live inside this repo or a separate package?
