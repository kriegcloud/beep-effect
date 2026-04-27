---
name: eventlog-graph-specialist
description: >
  Effect EventLog + Knowledge Graph architecture specialist. Trigger on: event sourcing,
  event log, knowledge graph, graph nodes, graph edges, event journal, event projection,
  materialized views, graph database, Cytoscape integration, event compaction, event
  reactivity, conflict resolution, graph replay, graph streaming, and EventGroup usage.
version: 0.1.0
status: active
---

# EventLog + Knowledge Graph Specialist

Use this skill when building event-sourced knowledge graph features. Effect v4 ships a
complete event sourcing system in `effect/unstable/eventlog/`. All graph state mutations
flow through this system. Never build custom event log infrastructure.

## Zero-Fail Checklist

Before writing EventLog or graph code, verify:

1. Am I defining domain events? Use `Event.make` with explicit `tag`, `primaryKey`, and typed `payload` / `success` / `error` schemas.
2. Am I grouping related events? Use `EventGroup.empty.add(...)` fluent builder. One group per bounded context.
3. Am I handling events (projecting state)? Use `EventLog.group(MyGroup, handlers => ...)` to register handlers per event tag. Each handler receives `{ storeId, payload, entry, conflicts }`.
4. Am I writing events? Use `EventLog.makeClient(schema)` to get a typed writer. Never write to the journal directly.
5. Am I persisting events? Use `SqlEventJournal.layer` for SQLite/PostgreSQL. Never write custom `CREATE TABLE` for event storage.
6. Am I subscribing to live events? Use `EventJournal.changes` (yields a `PubSub.Subscription`). Never build custom NDJSON streams.
7. Am I invalidating UI? Use `EventLog.groupReactivity(MyGroup, { EventTag: ["key1", "key2"] })`.
8. Am I compacting old events? Use `EventLog.groupCompaction(MyGroup, compactFn)`.
9. Am I building the top-level EventLog? Use `EventLog.layer(schema, handlerLayers)` or `EventLog.layerEventLog`.
10. Am I defining a facade service? Keep it thin. Writes delegate to EventLog client. Reads hit materialized SQL tables.
11. Am I handling conflicts? Every handler MUST acknowledge the `conflicts` parameter explicitly.
12. Am I creating materialized view tables? Keep them in the generated slice table package and mirror the golden fixture table shape until the topology factory extracts the helper.
13. Am I inside the graph style layer? Extend `graph-styles.tsx` for new node/edge types.

## Module Inventory

All imports from `effect/unstable/eventlog/`:

| Module | Purpose |
|--------|---------|
| `Event` | Define events with `Event.make({ tag, primaryKey, payload, success, error })` |
| `EventGroup` | Group events: `EventGroup.empty.add(...)` fluent builder |
| `EventLog` | Orchestration: `schema`, `group`, `groupReactivity`, `groupCompaction`, `makeClient`, `layer` |
| `EventJournal` | Storage abstraction: `Entry`, `EventJournalError`, memory/IndexedDB backends |
| `SqlEventJournal` | SQL-backed journal: auto-creates `effect_event_journal` + `effect_event_remotes` tables |
| `EventLogMessage` | Protocol: `StoreId`, `EventLogProtocolError`, RPC definitions |
| `EventLogRemote` | Client-side remote sync: `makeEncrypted`, `makeUnencrypted` |
| `EventLogEncryption` | AES-GCM encryption: `EventLogEncryption` service, `layerSubtle` |
| `EventLogSessionAuth` | Ed25519 challenge-response: `verifySessionAuthenticateRequest` |
| `EventLogServer` | Common RPC handler: `layerRpcHandlers`, `layerAuthMiddleware` |
| `EventLogServerUnencrypted` | Plaintext server: `Storage`, `StoreMapping`, `EventLogServerAuthorization` |
| `EventLogServerEncrypted` | Encrypted server: `Storage`, `PersistedEntry` |
| `SqlEventLogServerUnencrypted` | SQL unencrypted storage: `layerStorage` |
| `SqlEventLogServerEncrypted` | SQL encrypted storage: `layerStorage`, `layerStorageSubtle` |

## Event Definition

```ts
import * as Event from "effect/unstable/eventlog/Event"
import * as S from "effect/Schema"

// Every event needs: tag, primaryKey, payload (optional: success, error)
const NodeCreated = Event.make({
  tag: "NodeCreated",
  primaryKey: (payload) => payload.nodeId,
  payload: S.Struct({
    nodeId: KnowledgeNodeId.Schema,
    kind: NodeKind.Schema,
    label: S.String,
    content: S.OptionFromNullishOr(S.String),
    metadata: NodeMetadata,
  }),
  success: S.Void,
})

const EdgeCreated = Event.make({
  tag: "EdgeCreated",
  primaryKey: (payload) => payload.edgeId,
  payload: S.Struct({
    edgeId: KnowledgeEdgeId.Schema,
    sourceId: KnowledgeNodeId.Schema,
    targetId: KnowledgeNodeId.Schema,
    relation: EdgeRelation.Schema,
    weight: S.OptionFromNullishOr(S.Number),
  }),
  success: S.Void,
})

const NodeRemoved = Event.make({
  tag: "NodeRemoved",
  primaryKey: (payload) => payload.nodeId,
  payload: S.Struct({
    nodeId: KnowledgeNodeId.Schema,
    reason: S.String,
  }),
  success: S.Void,
})
```

Key rules for `Event.make`:
- `tag` is the unique event discriminator string.
- `primaryKey` returns a string used for conflict detection. Two events conflict when they share the same `(event tag, primaryKey)` pair and arrive with different timestamps.
- `payload` defaults to `S.Void` and can be any Schema type (not just `S.Struct`). It is encoded via msgpack internally (`event.payloadMsgPack`). Use Effect Schema types.
- `success` defaults to `S.Void`. Use a typed schema when the handler returns domain data.
- `error` defaults to `S.Never`. Use a typed schema when the handler can fail with domain errors.

## EventGroup Builder

```ts
import * as EventGroup from "effect/unstable/eventlog/EventGroup"

const KnowledgeGraphEvents = EventGroup.empty
  .add({
    tag: "NodeCreated",
    primaryKey: (p) => p.nodeId,
    payload: NodeCreatedPayload,
  })
  .add({
    tag: "NodeUpdated",
    primaryKey: (p) => p.nodeId,
    payload: NodeUpdatedPayload,
  })
  .add({
    tag: "NodeRemoved",
    primaryKey: (p) => p.nodeId,
    payload: NodeRemovedPayload,
  })
  .add({
    tag: "EdgeCreated",
    primaryKey: (p) => p.edgeId,
    payload: EdgeCreatedPayload,
  })
  .add({
    tag: "EdgeRemoved",
    primaryKey: (p) => p.edgeId,
    payload: EdgeRemovedPayload,
  })
```

- `EventGroup.empty` starts with zero events.
- `.add(...)` accepts the same options as `Event.make` and returns a new group with the event added.
- `.addError(errorSchema)` adds an error schema to ALL events in the group.
- One group per bounded context. Multiple groups compose via `EventLog.schema(group1, group2, ...)`.

## EventLog Schema

```ts
import * as EventLog from "effect/unstable/eventlog/EventLog"

// Combine one or more groups into a schema
const graphSchema = EventLog.schema(KnowledgeGraphEvents)
```

The schema is passed to `EventLog.layer`, `EventLog.makeClient`, and server-side `makeWrite`.

## Handler Registration

Handlers project events into materialized state. Use `EventLog.group`:

```ts
const graphHandlers = EventLog.group(
  KnowledgeGraphEvents,
  (handlers) =>
    handlers
      .handle("NodeCreated", ({ payload, entry, conflicts }) =>
        Effect.gen(function* () {
          // conflicts array contains entries with same (tag, primaryKey)
          // that arrived with different timestamps (concurrent writes).
          // Strategy: last-write-wins by ignoring conflicts.
          yield* insertGraphNode({
            id: payload.nodeId,
            kind: payload.kind,
            label: payload.label,
            content: payload.content,
            createdAt: entry.createdAt,
          })
        })
      )
      .handle("NodeUpdated", ({ payload, conflicts }) =>
        Effect.gen(function* () {
          yield* updateGraphNode(payload.nodeId, {
            label: payload.label,
            content: payload.content,
          })
        })
      )
      .handle("NodeRemoved", ({ payload }) =>
        Effect.gen(function* () {
          // Cascade: remove edges touching this node, then the node
          yield* removeEdgesForNode(payload.nodeId)
          yield* removeGraphNode(payload.nodeId)
        })
      )
      .handle("EdgeCreated", ({ payload }) =>
        Effect.gen(function* () {
          yield* insertGraphEdge({
            id: payload.edgeId,
            sourceId: payload.sourceId,
            targetId: payload.targetId,
            relation: payload.relation,
            weight: payload.weight,
          })
        })
      )
      .handle("EdgeRemoved", ({ payload }) =>
        Effect.gen(function* () {
          yield* removeGraphEdge(payload.edgeId)
        })
      )
)
```

Return type: `Layer.Layer<Event.ToService<Events>, E, Exclude<R, Scope.Scope | Identity> | Registry>`. `Scope.Scope` and `Identity` are excluded from requirements because `Identity` is automatically provided to handlers by the EventLog runtime. All events in the group MUST be handled -- TypeScript will error on `"Event not handled: ..."` if any tag is missing.

Handler signature per event:

```ts
(options: {
  readonly storeId: StoreId
  readonly payload: PayloadType
  readonly entry: Entry
  readonly conflicts: ReadonlyArray<{
    readonly entry: Entry
    readonly payload: PayloadType
  }>
}) => Effect.Effect<SuccessType, ErrorType, R>
```

### Entry Fields

Each stored event is an `Entry` (from `EventJournal`):

| Field | Type | Description |
|-------|------|-------------|
| `id` | `EntryId` (UUID v7 bytes) | Deterministic ordering by creation time |
| `event` | `string` | Event tag (`"NodeCreated"`, etc.) |
| `primaryKey` | `string` | Conflict detection key |
| `payload` | `Uint8Array` | Msgpack-encoded event data |
| `idString` | `string` (getter) | UUID string representation |
| `createdAtMillis` | `number` (getter) | Wall-clock ms extracted from UUID v7 |
| `createdAt` | `DateTime.Utc` (getter) | Parsed datetime |

## Reactivity (UI Invalidation)

```ts
const graphReactivity = EventLog.groupReactivity(
  KnowledgeGraphEvents,
  {
    NodeCreated: ["graph-nodes"],
    NodeUpdated: ["graph-nodes"],
    NodeRemoved: ["graph-nodes", "graph-edges"],
    EdgeCreated: ["graph-edges"],
    EdgeRemoved: ["graph-edges"],
  }
)
```

- Keys are strings that the UI subscribes to via `Reactivity` service.
- When an event is processed, all keys for that tag are invalidated.
- Alternative: pass a flat array to invalidate the same keys for ALL events in the group:
  ```ts
  const graphReactivity = EventLog.groupReactivity(
    KnowledgeGraphEvents,
    ["graph-nodes", "graph-edges"]
  )
  ```

## Compaction

Compaction reduces event history by aggregating old events:

```ts
const graphCompaction = EventLog.groupCompaction(
  KnowledgeGraphEvents,
  ({ primaryKey, entries, events, write }) =>
    Effect.gen(function* () {
      // events is ReadonlyArray<{ _tag: string; payload: PayloadType }>
      // Keep only the latest state for each primaryKey
      const last = events[events.length - 1]
      if (!last) return
      yield* write(last._tag, last.payload)
    })
)
```

The `write` callback emits a replacement event with the timestamp of the first entry in the group. Compaction runs during remote sync backlog processing.

## Typed Client (Writing Events)

```ts
const writeGraphEvent = EventLog.makeClient(graphSchema)

// Usage inside an Effect:
const addNode = Effect.gen(function* () {
  const write = yield* writeGraphEvent
  yield* write("NodeCreated", {
    nodeId: KnowledgeNodeId.make(),
    kind: "document",
    label: "My Document",
    content: O.some("Content here"),
    metadata: defaultMetadata,
  })
})
```

`makeClient` returns `Effect.Effect<WriteFn, never, EventLog>`. The returned write function is fully typed per event tag: autocomplete on event names and type-checked payloads. Note that writes can fail with `EventJournalError` in addition to the event's declared error type (from the `error` schema on the event definition).

## EventJournal Storage

### Memory (dev/test)

```ts
import * as EventJournal from "effect/unstable/eventlog/EventJournal"

const journalLayer = EventJournal.layerMemory
```

### SQLite / PostgreSQL (production)

```ts
import * as SqlEventJournal from "effect/unstable/eventlog/SqlEventJournal"

// Auto-creates tables: effect_event_journal, effect_event_remotes
const journalLayer = SqlEventJournal.layer()

// Custom table names:
const journalLayer = SqlEventJournal.layer({
  entryTable: "kg_event_journal",
  remotesTable: "kg_event_remotes",
})
```

`SqlEventJournal` supports PostgreSQL, MySQL, MSSQL, and SQLite via `sql.onDialectOrElse`. Schema for the journal table:

| Column | PG | SQLite | Purpose |
|--------|-----|--------|---------|
| `id` | `UUID PRIMARY KEY` | `BLOB PRIMARY KEY` | EntryId (UUID v7) |
| `event` | `TEXT NOT NULL` | `TEXT NOT NULL` | Event tag |
| `primary_key` | `TEXT NOT NULL` | `TEXT NOT NULL` | Conflict detection key |
| `payload` | `BYTEA NOT NULL` | `BLOB NOT NULL` | Msgpack-encoded payload |
| `timestamp` | `BIGINT NOT NULL` | `INTEGER NOT NULL` | Wall-clock ms |

### IndexedDB (browser)

```ts
const journalLayer = EventJournal.layerIndexedDb({ database: "my-graph" })
```

Uses browser `navigator.locks` for cross-tab concurrency.

## Composing the Full Layer Stack

```ts
// 1. Define schema
const graphSchema = EventLog.schema(KnowledgeGraphEvents)

// 2. Compose handler + reactivity + compaction layers
const graphLayers = Layer.mergeAll(
  graphHandlers,
  graphReactivity,
  graphCompaction,
)

// 3. Compose into EventLog layer
const eventLogLayer = EventLog.layer(graphSchema, graphLayers)

// 4. Provide journal storage
const fullLayer = eventLogLayer.pipe(
  Layer.provide(SqlEventJournal.layer()),
  Layer.provide(sqlClientLayer), // your SqlClient
  Layer.provide(identityLayer),  // EventLog.Identity
)
```

`EventLog.layer` combines:
- `EventLog.layerEventLog` (core orchestration, Registry, Reactivity)
- Your handler layers (from `EventLog.group`)

Requires: `EventJournal` + `EventLog.Identity` in the context.

## Conflict Detection

Two events conflict when:
1. They share the same `event` tag.
2. They share the same `primaryKey`.
3. Their timestamps (derived from UUID v7 `id`) differ.

The `conflicts` array in each handler contains all conflicting entries that arrived AFTER the current entry's timestamp.

### Strategies

**Last-write-wins**: Ignore `conflicts`, apply payload unconditionally.

```ts
.handle("NodeUpdated", ({ payload }) =>
  updateGraphNode(payload.nodeId, payload)
)
```

**Merge**: Combine fields from conflicting payloads.

```ts
.handle("NodeUpdated", ({ payload, conflicts }) =>
  Effect.gen(function* () {
    const merged = conflicts.reduce(
      (acc, c) => ({ ...acc, ...c.payload }),
      payload
    )
    yield* updateGraphNode(merged.nodeId, merged)
  })
)
```

**Reject**: Fail when conflicts exist.

```ts
.handle("NodeCreated", ({ payload, conflicts }) =>
  A.isNonEmptyReadonlyArray(conflicts)
    ? Effect.fail(new ConflictError({ nodeId: payload.nodeId }))
    : insertGraphNode(payload)
)
```

## Live Streaming

`EventJournal.changes` yields a `PubSub.Subscription` that receives every entry written to the local journal.

```ts
const openLiveGraphEvents = Effect.gen(function* () {
  const journal = yield* EventJournal.EventJournal
  const subscription = yield* journal.changes

  return Stream.fromSubscription(subscription).pipe(
    Stream.filter((entry) => entry.event.startsWith("Node") || entry.event.startsWith("Edge")),
    Stream.mapEffect((entry) =>
      S.decodeUnknownEffect(Msgpack.schema(GraphEventPayload))(entry.payload)
    )
  )
})
```

For UI invalidation, prefer `EventLog.groupReactivity` over raw PubSub subscriptions.

## Remote Sync

### Client Side

```ts
import * as EventLogRemote from "effect/unstable/eventlog/EventLogRemote"

// Unencrypted sync
const remoteLayer = Layer.effect(EventLogRemote.EventLogRemote, EventLogRemote.makeUnencrypted).pipe(
  Layer.provide(EventLogRemote.EventLogRemoteClient.layer),
  Layer.provide(rpcClientProtocolLayer),
)

// Encrypted sync (AES-GCM + Ed25519 auth)
const remoteLayer = EventLogRemote.layerEncrypted.pipe(
  Layer.provide(rpcClientProtocolLayer),
)
```

The remote client handles:
- Hello/Authenticate handshake with Ed25519 challenge-response
- Chunked message splitting for large payloads (512KB chunks)
- Automatic reconnection with exponential backoff
- Bidirectional sync: pushes local uncommitted entries, receives remote changes

### Server Side (Unencrypted with SQL)

```ts
import * as EventLogServerUnencrypted from "effect/unstable/eventlog/EventLogServerUnencrypted"
import * as SqlEventLogServerUnencrypted from "effect/unstable/eventlog/SqlEventLogServerUnencrypted"

const serverLayer = EventLogServerUnencrypted.layer(graphSchema, graphLayers).pipe(
  Layer.provide(SqlEventLogServerUnencrypted.layerStorage()),
  Layer.provide(EventLogServerUnencrypted.layerStoreMappingStatic({ storeId })),
  Layer.provide(authorizationLayer),
  Layer.provide(rpcServerProtocolLayer),
  Layer.provide(sqlClientLayer),
)
```

### Server Side (Encrypted with SQL)

```ts
import * as EventLogServerEncrypted from "effect/unstable/eventlog/EventLogServerEncrypted"
import * as SqlEventLogServerEncrypted from "effect/unstable/eventlog/SqlEventLogServerEncrypted"

const serverLayer = EventLogServerEncrypted.layer.pipe(
  Layer.provide(SqlEventLogServerEncrypted.layerStorageSubtle()),
  Layer.provide(rpcServerProtocolLayer),
  Layer.provide(sqlClientLayer),
)
```

The encrypted server never sees plaintext event data. Each client encrypts with their own AES-GCM key derived from their identity's private key.

## Identity

```ts
import * as EventLog from "effect/unstable/eventlog/EventLog"

// Generate a new identity (requires EventLogEncryption)
const identity = yield* EventLog.makeIdentity

// Or provide directly
const identityLayer = Layer.succeed(EventLog.Identity, {
  publicKey: "user-public-key-string",
  privateKey: Redacted.make(privateKeyBytes),
})

// Encode/decode identity to/from portable string
const encoded = EventLog.encodeIdentityString(identity)
const decoded = EventLog.decodeIdentityString(encoded)
```

Identity is used for:
- Event authorship tracking
- Remote sync authentication (Ed25519 challenge-response)
- Encryption key derivation (AES-GCM)

## Knowledge Graph Facade

The `KnowledgeGraph` service is a THIN facade. It delegates writes to EventLog and reads to materialized SQL tables.

```ts
class KnowledgeGraph extends Context.Service<KnowledgeGraph, {
  readonly addNode: (payload: NodeCreatedPayload) => Effect.Effect<void>
  readonly addEdge: (payload: EdgeCreatedPayload) => Effect.Effect<void>
  readonly removeNode: (nodeId: KnowledgeNodeId, reason: string) => Effect.Effect<void>
  readonly removeEdge: (edgeId: KnowledgeEdgeId) => Effect.Effect<void>
  readonly queryNodes: (filter: NodeFilter) => Effect.Effect<ReadonlyArray<GraphNode>>
  readonly queryEdges: (filter: EdgeFilter) => Effect.Effect<ReadonlyArray<GraphEdge>>
  readonly subscribe: Stream.Stream<StoredGraphEvent>
}>()($I`KnowledgeGraph`) {}
```

Implementation pattern:

```ts
const make = Effect.gen(function* () {
  const write = yield* EventLog.makeClient(graphSchema)
  const journal = yield* EventJournal.EventJournal
  const sql = yield* SqlClient.SqlClient

  return KnowledgeGraph.of({
    addNode: (payload) => write("NodeCreated", payload),
    addEdge: (payload) => write("EdgeCreated", payload),
    removeNode: (nodeId, reason) => write("NodeRemoved", { nodeId, reason }),
    removeEdge: (edgeId) => write("EdgeRemoved", { edgeId }),

    // Reads hit materialized view tables, NOT the event log
    queryNodes: (filter) =>
      sql`SELECT * FROM graph_nodes WHERE ...`.pipe(
        Effect.flatMap(decodeGraphNodes)
      ),
    queryEdges: (filter) =>
      sql`SELECT * FROM graph_edges WHERE ...`.pipe(
        Effect.flatMap(decodeGraphEdges)
      ),

    // Live stream wraps journal.changes
    subscribe: Stream.unwrap(
      Effect.map(journal.changes, (sub) =>
        Stream.fromSubscription(sub).pipe(
          Stream.mapEffect(decodeGraphEvent)
        )
      )
    ),
  })
})
```

## Database Architecture

Single database file: `.beep/graph/graph.db`

Two table owners coexist:

### SqlEventJournal (owned by Effect runtime)

| Table | Purpose |
|-------|---------|
| `effect_event_journal` | Event entries: id, event, primary_key, payload, timestamp |
| `effect_event_remotes` | Remote sync tracking: remote_id, entry_id, sequence |

These tables are created automatically by `SqlEventJournal.layer()`. Never create them manually.

### Materialized Views (owned by application)

| Table | Owner | Purpose |
|-------|-------|---------|
| `graph_nodes` | Generated slice table package | Projected node state |
| `graph_edges` | Generated slice table package | Projected edge state |
| `graph_build_state` | Application | Projection checkpoint key-value |

The materialized view tables are ALWAYS rebuildable: drop them, then replay all events from the journal through handlers.

### Materialized View Table Definitions

```ts
import * as sqlite from "drizzle-orm/sqlite-core"

export const graphNodes = sqlite.sqliteTable("graph_nodes", {
  id: sqlite.text("id").primaryKey(),
  kind: sqlite.text("kind").notNull(),
  label: sqlite.text("label").notNull(),
  content: sqlite.text("content"),
  createdAt: sqlite.integer("created_at").notNull(),
  updatedAt: sqlite.integer("updated_at"),
})

export const graphEdges = sqlite.sqliteTable("graph_edges", {
  id: sqlite.text("id").primaryKey(),
  sourceId: sqlite.text("source_id").notNull().references(() => graphNodes.id),
  targetId: sqlite.text("target_id").notNull().references(() => graphNodes.id),
  relation: sqlite.text("relation").notNull(),
  weight: sqlite.real("weight"),
  createdAt: sqlite.integer("created_at").notNull(),
})
```

## Cytoscape Integration

The existing codebase has a 948-line stylesheet in `graph-styles.tsx` with:
- 18 node types: File, Function, Class, Route, Variable, Event, etc.
- 10+ edge types with distinct colors
- `graphStylesFast` variant for 300+ node performance
- `animate()` API for temporal replay transitions

To extend for the knowledge graph:

```ts
// New node type: Document
{
  selector: 'node[label="Document"]',
  style: {
    "background-color": "#1e1b4b",
    "border-color": "#818cf8",
    "border-width": 2,
    color: "#a5b4fc",
    shape: "round-rectangle",
    width: 40,
    height: 28,
  },
},

// New edge type: wiki_link
{
  selector: 'edge[label="wiki_link"]',
  style: {
    "line-color": "#818cf8",
    "target-arrow-color": "#818cf8",
    "line-style": "dashed",
    width: 1.5,
  },
},

// Certainty-based edge styling
{
  selector: "edge[weight < 0.5]",
  style: {
    opacity: 0.4,
    "line-style": "dotted",
  },
},
```

## Existing Codebase Patterns

### Golden Slice Table Pattern

The checked automation fixture demonstrates where generated materialized-view
tables should live:

- `tooling/cli/test/fixtures/repo-architecture-automation/expected/fixture-lab/Specimen/packages/tables/src/Specimen.table.ts`
- `tooling/cli/test/fixtures/repo-architecture-automation/expected/fixture-lab/Specimen/packages/server/src/SpecimenServer.ts`

Use that fixture as the current topology reference: table/read-model code stays
inside the slice table/server packages, and the eventual generator should
produce the same structure idempotently.

## Enforcement Rules

1. **MUST** use Effect's `EventGroup` / `EventLog` / `EventJournal` -- never build custom event log infrastructure.
2. **MUST** use `SqlEventJournal.layer()` for SQL journal storage -- never write custom `CREATE TABLE` for event tables.
3. **MUST** use `EventLog.group(group, handlersBuilder)` for handler registration -- the projection IS the handler.
4. **MUST** use `EventLog.groupReactivity(group, keys)` for UI invalidation keys.
5. **MUST** use `EventLog.makeClient(schema)` for typed event writing.
6. **KnowledgeGraph** service is a thin facade -- delegates writes to EventLog client, reads to materialized SQL index.
7. **Single database**: `.beep/graph/graph.db` -- Effect journal tables and application materialized views coexist.
8. **Materialized view tables** live in the generated slice table package and follow the golden fixture shape.
9. **Conflict handling** must be explicit in every handler -- acknowledge the `conflicts` parameter.
10. **Live streaming** uses `EventJournal.changes` (yields a `PubSub.Subscription`) -- never build custom NDJSON streams or polling.
11. **Event payloads** are msgpack-encoded internally -- use Effect Schema types, never raw JSON.
12. **All handler events must be handled** -- TypeScript enforces exhaustive handling via `"Event not handled: ..."` errors.
13. **Remote sync** uses the built-in `EventLogRemote` client/server -- never build custom sync protocols.
14. **Identity** must be provided via `EventLog.Identity` layer -- never skip authentication.
15. **Encryption** uses `EventLogEncryption` with AES-GCM -- never implement custom encryption.

## Source References

- `.repos/effect-v4/packages/effect/src/unstable/eventlog/Event.ts` -- Event definition with Tag, Payload, Success, Error
- `.repos/effect-v4/packages/effect/src/unstable/eventlog/EventGroup.ts` -- Fluent group builder
- `.repos/effect-v4/packages/effect/src/unstable/eventlog/EventLog.ts` -- Core orchestration (Registry, handlers, compaction, reactivity, client)
- `.repos/effect-v4/packages/effect/src/unstable/eventlog/EventJournal.ts` -- Storage abstraction (Entry, write, entries, changes PubSub.Subscription, memory + IndexedDB)
- `.repos/effect-v4/packages/effect/src/unstable/eventlog/SqlEventJournal.ts` -- SQL-backed journal (PostgreSQL, MySQL, MSSQL, SQLite)
- `.repos/effect-v4/packages/effect/src/unstable/eventlog/EventLogMessage.ts` -- Protocol definitions, StoreId, RPC types
- `.repos/effect-v4/packages/effect/src/unstable/eventlog/EventLogRemote.ts` -- Client-side remote sync
- `.repos/effect-v4/packages/effect/src/unstable/eventlog/EventLogEncryption.ts` -- AES-GCM encryption service
- `.repos/effect-v4/packages/effect/src/unstable/eventlog/EventLogSessionAuth.ts` -- Ed25519 challenge-response auth
- `.repos/effect-v4/packages/effect/src/unstable/eventlog/EventLogServer.ts` -- Common RPC handler layer
- `.repos/effect-v4/packages/effect/src/unstable/eventlog/EventLogServerUnencrypted.ts` -- Plaintext server with conflict detection
- `.repos/effect-v4/packages/effect/src/unstable/eventlog/EventLogServerEncrypted.ts` -- Encrypted server
- `.repos/effect-v4/packages/effect/src/unstable/eventlog/SqlEventLogServerUnencrypted.ts` -- SQL unencrypted server storage
- `.repos/effect-v4/packages/effect/src/unstable/eventlog/SqlEventLogServerEncrypted.ts` -- SQL encrypted server storage
- `.repos/effect-v4/packages/effect/src/unstable/eventlog/internal/identityRootSecretDerivation.ts` -- Key derivation
- `packages/common/ui/src/components/codegraph/styles/graph-styles.tsx` -- Cytoscape graph styles
- `tooling/cli/test/fixtures/repo-architecture-automation/expected/fixture-lab/Specimen/packages/tables/src/Specimen.table.ts` -- Golden fixture table package shape
- `packages/common/semantic-web/src/prov.ts` -- ProvBundle for provenance tracking

## Verification Checklist

Run these grep patterns to validate compliance:

```bash
# No custom event log implementations (should find ZERO hits outside eventlog/)
rg "CREATE TABLE.*event" packages/ --glob '!*.d.ts' -l

# EventGroup usage (should find hits in graph domain)
rg "EventGroup\.empty" packages/ --glob '*.ts'

# EventLog.group handler registration (should find hits)
rg "EventLog\.group\(" packages/ --glob '*.ts'

# SqlEventJournal usage (should find hits)
rg "SqlEventJournal\.layer" packages/ --glob '*.ts'

# KnowledgeGraph facade pattern (thin, delegates to EventLog)
rg "EventLog\.makeClient" packages/ --glob '*.ts'

# No raw journal.write outside infrastructure (facade delegates)
rg "journal\.write\(" packages/ --glob '*.ts' -l

# Conflict parameter acknowledged in handlers
rg "conflicts" packages/ --glob '*.ts' -C 2

# Reactivity keys registered
rg "groupReactivity" packages/ --glob '*.ts'

# No custom NDJSON or polling streams
rg "ndjson|polling|setInterval" packages/ --glob '*.ts' -l
```
