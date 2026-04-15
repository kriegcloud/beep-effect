# 00 - Event-Sourced Graph Architecture

## Core Principle

The event log is the source of truth for the knowledge graph, not the computed current state. Every mutation to the graph (node creation, edge creation, removal, updates) is recorded as an immutable event via Effect's `unstable/eventlog` module. The graph index that queries actually hit is a **materialized view** projected from replaying the event log through registered handlers.

This design yields several natural consequences:

- **Replay**: any materialized view can be rebuilt from scratch by replaying all journal entries through `EventLog.group` handlers.
- **Streaming**: live subscribers receive events via `EventJournal.changes` PubSub, enabling real-time UI updates without polling.
- **Audit trail**: every mutation is permanently recorded as an `Entry` with UUID v7 id (encodes creation timestamp), event tag, primary key, and msgpack-encoded payload.
- **Time travel**: the graph state at any point in history can be reconstructed by replaying entries up to a given id.
- **Multi-view projection**: the same event stream can project into multiple materialized views (graph index, backlink index, Cytoscape elements, statistics) via independent handler registrations.
- **Compaction**: `EventLog.groupCompaction` reduces event history during remote sync backlog processing without losing semantic intent.
- **Reactivity**: `EventLog.groupReactivity` maps event tags to invalidation keys that the UI subscribes to via the `Reactivity` service.
- **Remote sync**: `EventLogRemote` provides bidirectional encrypted or unencrypted sync out of the box.

The graph index is always derivable. If it becomes corrupted or the schema changes, drop the materialized view tables and replay from the journal. The journal is the only thing that must be preserved.

---

## Effect EventLog Module Inventory

All imports from `effect/unstable/eventlog`:

| Module | Purpose | Used by Knowledge Graph |
|--------|---------|:-----------------------:|
| `Event` | Define events with `Event.make({ tag, primaryKey, payload, success, error })` | Yes |
| `EventGroup` | Group events: `EventGroup.empty.add(...)` fluent builder | Yes |
| `EventLog` | Orchestration: `schema`, `group`, `groupReactivity`, `groupCompaction`, `makeClient`, `layer` | Yes |
| `EventJournal` | Storage abstraction: `Entry`, `EventJournalError`, memory/IndexedDB backends | Yes |
| `SqlEventJournal` | SQL-backed journal: auto-creates `effect_event_journal` + `effect_event_remotes` tables | Yes |
| `EventLogMessage` | Protocol: `StoreId`, `EventLogProtocolError`, RPC definitions | Yes (StoreId) |
| `EventLogRemote` | Client-side remote sync: `makeEncrypted`, `makeUnencrypted` | Future |
| `EventLogEncryption` | AES-GCM encryption: `EventLogEncryption` service, `layerSubtle` | Future |
| `EventLogSessionAuth` | Ed25519 challenge-response: `verifySessionAuthenticateRequest` | Future |
| `EventLogServer` | Common RPC handler: `layerRpcHandlers`, `layerAuthMiddleware` | Future |
| `EventLogServerUnencrypted` | Plaintext server: `Storage`, `StoreMapping`, `EventLogServerAuthorization` | Future |
| `EventLogServerEncrypted` | Encrypted server: `Storage`, `PersistedEntry` | Future |
| `SqlEventLogServerUnencrypted` | SQL unencrypted storage: `layerStorage` | Future |
| `SqlEventLogServerEncrypted` | SQL encrypted storage: `layerStorage`, `layerStorageSubtle` | Future |

The "Yes" modules form the minimum viable stack. The "Future" modules are needed only when multi-device sync is added.

---

## GraphEvent Definition via EventGroup

Events are defined using `EventGroup.empty.add()`. Each event specifies a `tag` (discriminant), `primaryKey` (conflict detection key), and `payload` (Effect Schema). Events are append-only -- they use `S.TaggedClass` for their payload schemas, not `Model.Class` (which is reserved for CRUD entities).

### Identity Setup

```ts
import { $SharedDomainId } from "@beep/identity/packages"

/**
 * File-scoped identity composer for all knowledge graph event schemas.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 *
 * // Produces: "@beep/shared-domain/event-sourced-graph/NodeCreated"
 * const id = $I`NodeCreated`
 * void id
 * ```
 *
 * @category configuration
 * @since 0.0.0
 */
const $I = $SharedDomainId.create("event-sourced-graph")
```

### Supporting Schemas

```ts
import * as S from "effect/Schema"
import { LiteralKit, SchemaUtils } from "@beep/schema"

/**
 * Kinds of knowledge graph nodes.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 *
 * // NodeKind.Enum.page === "page"
 * // NodeKind.is.page("page") === true
 * // NodeKind.$match(value, { page: ..., "code-symbol": ..., ... })
 * ```
 *
 * @category models
 * @since 0.0.0
 */
const NodeKind = LiteralKit([
  "page",
  "code-symbol",
  "code-file",
  "code-module",
  "concept",
] as const)

/**
 * Kinds of knowledge graph edges.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 *
 * // EdgeRelation.Enum["wiki-link"] === "wiki-link"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
const EdgeRelation = LiteralKit([
  "wiki-link",
  "code-import",
  "code-export",
  "code-dependency",
  "semantic",
] as const)

/**
 * Branded string identifier for graph nodes. URI-shaped, deterministic.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 *
 * // "beep:page/design-decisions"
 * // "beep:symbol/repo-memory/RepoSymbolRecord"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
const KnowledgeNodeId = S.NonEmptyTrimmedString.pipe(
  S.brand("KnowledgeNodeId"),
  $I.annoteSchema("KnowledgeNodeId", {
    description: "URI-shaped identifier for knowledge graph nodes.",
  })
)
type KnowledgeNodeId = typeof KnowledgeNodeId.Type

/**
 * Branded string identifier for graph edges.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 *
 * // "beep:edge/{sourceId}/{targetId}/{relation}"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
const KnowledgeEdgeId = S.NonEmptyTrimmedString.pipe(
  S.brand("KnowledgeEdgeId"),
  $I.annoteSchema("KnowledgeEdgeId", {
    description: "Branded identifier for knowledge graph edges.",
  })
)
type KnowledgeEdgeId = typeof KnowledgeEdgeId.Type

/**
 * Certainty score between 0.0 and 1.0 indicating confidence in a fact.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 *
 * // 1.0  = procedural / human-authored
 * // 0.85 = high-confidence LLM inference
 * // 0.6  = medium-confidence, subject to review
 * // <0.6 = low-confidence, subject to TTL expiry
 * ```
 *
 * @category models
 * @since 0.0.0
 */
const Certainty = S.Number.pipe(
  S.greaterThanOrEqualTo(0),
  S.lessThanOrEqualTo(1),
  S.brand("Certainty"),
  $I.annoteSchema("Certainty", {
    description: "Confidence score in the range [0, 1].",
  })
)
type Certainty = typeof Certainty.Type

/**
 * Metadata attached to a node for display and filtering.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 *
 * // { domain: "code", source: "repo-memory", tags: ["effect", "schema"] }
 * ```
 *
 * @category models
 * @since 0.0.0
 */
class NodeMetadata extends S.Class<NodeMetadata>($I`NodeMetadata`)(
  {
    domain: S.optionalKey(S.String).pipe(SchemaUtils.withKeyDefaults("general")),
    source: S.NonEmptyTrimmedString,
    tags: S.optionalKey(S.Array(S.NonEmptyTrimmedString)).pipe(
      SchemaUtils.withKeyDefaults([])
    ),
    aliases: S.optionalKey(S.Array(S.NonEmptyTrimmedString)).pipe(
      SchemaUtils.withKeyDefaults([])
    ),
    certainty: S.optionalKey(Certainty).pipe(SchemaUtils.withKeyDefaults(1.0)),
  },
  $I.annote("NodeMetadata", {
    description: "Display and filtering metadata for a knowledge graph node.",
  })
) {}
```

### Event Payload Classes

Each event payload is an `S.TaggedClass` carrying the data for one mutation type. The `_tag` discriminant is set automatically by `S.TaggedClass`.

```ts
/**
 * Payload for creating a new node in the knowledge graph.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 *
 * const payload = new NodeCreatedPayload({
 *   nodeId: "beep:page/design-decisions" as KnowledgeNodeId,
 *   kind: "page",
 *   label: "Design Decisions",
 *   content: S.OptionFromNullishOr(S.String).make("..."),
 *   metadata: new NodeMetadata({ source: "vault" }),
 * })
 * void payload
 * ```
 *
 * @category events
 * @since 0.0.0
 */
class NodeCreatedPayload extends S.TaggedClass<NodeCreatedPayload>()(
  "NodeCreatedPayload",
  {
    nodeId: KnowledgeNodeId,
    kind: NodeKind.Schema,
    label: S.NonEmptyTrimmedString,
    content: S.OptionFromNullishOr(S.String),
    metadata: NodeMetadata,
  },
  $I.annote("NodeCreatedPayload", {
    description: "Emitted when a new node enters the graph.",
  })
) {}

/**
 * Payload for updating an existing node.
 *
 * All fields except `nodeId` are optional -- only changed fields are included.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 *
 * const payload = new NodeUpdatedPayload({
 *   nodeId: "beep:page/design-decisions" as KnowledgeNodeId,
 *   label: "Design Decisions (revised)",
 * })
 * void payload
 * ```
 *
 * @category events
 * @since 0.0.0
 */
class NodeUpdatedPayload extends S.TaggedClass<NodeUpdatedPayload>()(
  "NodeUpdatedPayload",
  {
    nodeId: KnowledgeNodeId,
    label: S.optional(S.NonEmptyTrimmedString),
    content: S.optional(S.OptionFromNullishOr(S.String)),
    metadata: S.optional(NodeMetadata),
  },
  $I.annote("NodeUpdatedPayload", {
    description: "Emitted when an existing node is mutated.",
  })
) {}

/**
 * Payload for removing a node from the graph.
 *
 * Cascading edge removal is handled by the projection handler, not the
 * event emitter.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 *
 * const payload = new NodeRemovedPayload({
 *   nodeId: "beep:page/old-page" as KnowledgeNodeId,
 *   reason: "page deleted",
 * })
 * void payload
 * ```
 *
 * @category events
 * @since 0.0.0
 */
class NodeRemovedPayload extends S.TaggedClass<NodeRemovedPayload>()(
  "NodeRemovedPayload",
  {
    nodeId: KnowledgeNodeId,
    reason: S.NonEmptyTrimmedString,
  },
  $I.annote("NodeRemovedPayload", {
    description: "Emitted when a node is removed. Cascade is handled by the handler.",
  })
) {}

/**
 * Payload for creating a new edge between two nodes.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 *
 * const payload = new EdgeCreatedPayload({
 *   edgeId: "beep:edge/src/tgt/wiki-link" as KnowledgeEdgeId,
 *   sourceId: "beep:page/a" as KnowledgeNodeId,
 *   targetId: "beep:page/b" as KnowledgeNodeId,
 *   relation: "wiki-link",
 *   weight: S.OptionFromNullishOr(S.Number).make(1.0),
 * })
 * void payload
 * ```
 *
 * @category events
 * @since 0.0.0
 */
class EdgeCreatedPayload extends S.TaggedClass<EdgeCreatedPayload>()(
  "EdgeCreatedPayload",
  {
    edgeId: KnowledgeEdgeId,
    sourceId: KnowledgeNodeId,
    targetId: KnowledgeNodeId,
    relation: EdgeRelation.Schema,
    weight: S.OptionFromNullishOr(S.Number),
  },
  $I.annote("EdgeCreatedPayload", {
    description: "Emitted when a new edge connects two nodes.",
  })
) {}

/**
 * Payload for removing an edge from the graph.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 *
 * const payload = new EdgeRemovedPayload({
 *   edgeId: "beep:edge/src/tgt/wiki-link" as KnowledgeEdgeId,
 *   reason: "source node deleted",
 * })
 * void payload
 * ```
 *
 * @category events
 * @since 0.0.0
 */
class EdgeRemovedPayload extends S.TaggedClass<EdgeRemovedPayload>()(
  "EdgeRemovedPayload",
  {
    edgeId: KnowledgeEdgeId,
    reason: S.NonEmptyTrimmedString,
  },
  $I.annote("EdgeRemovedPayload", {
    description: "Emitted when an edge is removed.",
  })
) {}

/**
 * Payload for a bulk snapshot reset scoped to a source.
 *
 * When processed, the handler deletes all nodes and edges where `source`
 * matches, then subsequent events rebuild state. Prevents stale entities
 * lingering after a re-index.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 *
 * const payload = new SnapshotResetPayload({
 *   source: "repo-memory",
 *   reason: "full re-index",
 * })
 * void payload
 * ```
 *
 * @category events
 * @since 0.0.0
 */
class SnapshotResetPayload extends S.TaggedClass<SnapshotResetPayload>()(
  "SnapshotResetPayload",
  {
    source: S.NonEmptyTrimmedString,
    reason: S.NonEmptyTrimmedString,
  },
  $I.annote("SnapshotResetPayload", {
    description: "Emitted for bulk source-scoped resets (re-index, vault re-scan).",
  })
) {}
```

---

## KnowledgeGraphEvents EventGroup

The `EventGroup` is the single source of event definitions for the knowledge graph bounded context. One group per bounded context -- multiple groups compose via `EventLog.schema(group1, group2, ...)`.

```ts
import { EventGroup } from "effect/unstable/eventlog"

/**
 * Event group for the knowledge graph bounded context.
 *
 * Contains all six event types: NodeCreated, NodeUpdated, NodeRemoved,
 * EdgeCreated, EdgeRemoved, SnapshotReset. Handlers registered via
 * `EventLog.group` must handle every event in this group -- TypeScript
 * will emit `"Event not handled: ..."` for any missing tag.
 *
 * @example
 * ```ts
 * import { EventGroup, EventLog } from "effect/unstable/eventlog"
 *
 * // Build the schema from one or more groups
 * const graphSchema = EventLog.schema(KnowledgeGraphEvents)
 * void graphSchema
 * ```
 *
 * @category events
 * @since 0.0.0
 */
const KnowledgeGraphEvents = EventGroup.empty
  .add({
    tag: "NodeCreated",
    primaryKey: (p: NodeCreatedPayload) => p.nodeId,
    payload: NodeCreatedPayload,
    success: S.Void,
  })
  .add({
    tag: "NodeUpdated",
    primaryKey: (p: NodeUpdatedPayload) => p.nodeId,
    payload: NodeUpdatedPayload,
    success: S.Void,
  })
  .add({
    tag: "NodeRemoved",
    primaryKey: (p: NodeRemovedPayload) => p.nodeId,
    payload: NodeRemovedPayload,
    success: S.Void,
  })
  .add({
    tag: "EdgeCreated",
    primaryKey: (p: EdgeCreatedPayload) => p.edgeId,
    payload: EdgeCreatedPayload,
    success: S.Void,
  })
  .add({
    tag: "EdgeRemoved",
    primaryKey: (p: EdgeRemovedPayload) => p.edgeId,
    payload: EdgeRemovedPayload,
    success: S.Void,
  })
  .add({
    tag: "SnapshotReset",
    primaryKey: (p: SnapshotResetPayload) => p.source,
    payload: SnapshotResetPayload,
    success: S.Void,
  })
```

Key design notes:

- **`primaryKey`** returns a string used for conflict detection. Two events conflict when they share the same `(event tag, primaryKey)` pair and arrive with different timestamps (concurrent writes from remote sync).
- **`payload`** is encoded via msgpack internally (`event.payloadMsgPack`). Use Effect Schema types -- never raw JSON.
- **`success`** defaults to `S.Void`. Use a typed schema when the handler returns domain data.
- **`SnapshotReset`** uses `source` as its primary key since it scopes the reset to a single event source.

---

## Handler Registration via EventLog.group()

Handlers project events into materialized state. `EventLog.group` takes the `EventGroup` and a builder function that chains `.handle(tag, fn)` calls. Every event in the group **must** be handled -- TypeScript enforces exhaustive handling via `"Event not handled: ..."` errors.

```ts
import { Effect } from "effect"
import { EventLog } from "effect/unstable/eventlog"

/**
 * Projection handlers for the knowledge graph.
 *
 * Each handler receives `{ storeId, payload, entry, conflicts }` and
 * writes to the materialized view tables. The `conflicts` array contains
 * entries with the same (tag, primaryKey) pair that arrived with different
 * timestamps. Strategy: last-write-wins by ignoring conflicts.
 *
 * Return type: `Layer.Layer<Event.ToService<Events>, E, R | Registry>`.
 *
 * @category handlers
 * @since 0.0.0
 */
const graphHandlers = EventLog.group(
  KnowledgeGraphEvents,
  (handlers) =>
    handlers
      .handle("NodeCreated", ({ payload, entry, conflicts }) =>
        Effect.gen(function* () {
          // conflicts: concurrent writes for the same nodeId.
          // Strategy: last-write-wins -- apply unconditionally.
          void conflicts
          yield* insertGraphNode({
            nodeId: payload.nodeId,
            kind: payload.kind,
            label: payload.label,
            content: payload.content,
            metadata: payload.metadata,
            createdAt: entry.createdAtMillis,
            updatedAt: entry.createdAtMillis,
          })
        })
      )
      .handle("NodeUpdated", ({ payload, entry, conflicts }) =>
        Effect.gen(function* () {
          void conflicts
          yield* updateGraphNode(payload.nodeId, {
            label: payload.label,
            content: payload.content,
            metadata: payload.metadata,
            updatedAt: entry.createdAtMillis,
          })
        })
      )
      .handle("NodeRemoved", ({ payload, conflicts }) =>
        Effect.gen(function* () {
          void conflicts
          // Cascade: remove edges touching this node, then the node
          yield* removeEdgesForNode(payload.nodeId)
          yield* removeGraphNode(payload.nodeId)
        })
      )
      .handle("EdgeCreated", ({ payload, entry, conflicts }) =>
        Effect.gen(function* () {
          void conflicts
          yield* insertGraphEdge({
            edgeId: payload.edgeId,
            sourceId: payload.sourceId,
            targetId: payload.targetId,
            relation: payload.relation,
            weight: payload.weight,
            createdAt: entry.createdAtMillis,
          })
        })
      )
      .handle("EdgeRemoved", ({ payload, conflicts }) =>
        Effect.gen(function* () {
          void conflicts
          yield* removeGraphEdge(payload.edgeId)
        })
      )
      .handle("SnapshotReset", ({ payload, conflicts }) =>
        Effect.gen(function* () {
          void conflicts
          // Delete all nodes and edges for this source, then let
          // subsequent events rebuild them
          yield* removeAllForSource(payload.source)
        })
      )
)
```

### Handler Signature

Each handler receives:

```ts
(options: {
  readonly storeId: StoreId
  readonly payload: PayloadType     // decoded from msgpack
  readonly entry: Entry             // journal entry with id, createdAt, etc.
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

### Conflict Strategies

**Last-write-wins** (default for knowledge graph): ignore `conflicts`, apply payload unconditionally.

```ts
.handle("NodeUpdated", ({ payload }) =>
  updateGraphNode(payload.nodeId, payload)
)
```

**Merge**: combine fields from conflicting payloads.

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

**Reject**: fail when conflicts exist.

```ts
.handle("NodeCreated", ({ payload, conflicts }) =>
  A.isNonEmptyReadonlyArray(conflicts)
    ? Effect.fail(new ConflictError({ nodeId: payload.nodeId }))
    : insertGraphNode(payload)
)
```

---

## Reactivity via EventLog.groupReactivity()

`groupReactivity` maps event tags to invalidation key arrays. When an event is processed, all keys for that tag are invalidated via the `Reactivity` service. The UI subscribes to these keys and re-fetches affected queries.

```ts
import { EventLog } from "effect/unstable/eventlog"

/**
 * Reactivity key mapping for UI invalidation.
 *
 * When `NodeRemoved` fires, both `"graph-nodes"` and `"graph-edges"` are
 * invalidated because the handler cascades edge removal.
 *
 * @category reactivity
 * @since 0.0.0
 */
const graphReactivity = EventLog.groupReactivity(
  KnowledgeGraphEvents,
  {
    NodeCreated:   ["graph-nodes"],
    NodeUpdated:   ["graph-nodes"],
    NodeRemoved:   ["graph-nodes", "graph-edges"],
    EdgeCreated:   ["graph-edges"],
    EdgeRemoved:   ["graph-edges"],
    SnapshotReset: ["graph-nodes", "graph-edges"],
  }
)
```

Alternative: pass a flat array to invalidate the same keys for ALL events in the group:

```ts
const graphReactivity = EventLog.groupReactivity(
  KnowledgeGraphEvents,
  ["graph-nodes", "graph-edges"]
)
```

The `Reactivity` service is provided automatically by `EventLog.layerEventLog` -- no manual wiring needed.

---

## Compaction via EventLog.groupCompaction()

Compaction reduces event history by aggregating old events per primary key. It runs during remote sync backlog processing (not on every local write).

```ts
import { EventLog } from "effect/unstable/eventlog"

/**
 * Compaction strategy for the knowledge graph.
 *
 * For each primary key, keep only the last event. This means a node that was
 * created, updated 5 times, then removed collapses to just the removal event.
 *
 * @category compaction
 * @since 0.0.0
 */
const graphCompaction = EventLog.groupCompaction(
  KnowledgeGraphEvents,
  ({ primaryKey, entries, events, write }) =>
    Effect.gen(function* () {
      void primaryKey
      void entries
      // Keep only the latest event for each primary key
      const last = events[events.length - 1]
      if (!last) return
      yield* write(last._tag, last.payload)
    })
)
```

The `write` callback emits a replacement event with the timestamp of the first entry in the group. The compacted journal is semantically equivalent to the original -- replaying produces the same materialized state.

---

## KnowledgeGraph Facade Service

The `KnowledgeGraph` service is a **thin facade**. Writes delegate to `EventLog` via `makeClient`. Reads hit the materialized SQLite index directly. It never contains business logic beyond dispatch.

```ts
import { Context, Effect, Stream } from "effect"
import { EventJournal, EventLog } from "effect/unstable/eventlog"
import * as SqlClient from "effect/unstable/sql/SqlClient"

/**
 * Thin facade over the event-sourced knowledge graph.
 *
 * Writes delegate to the EventLog client. Reads hit materialized SQL tables.
 * Live streaming wraps the EventJournal changes PubSub.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 *
 * // Write path: delegates to EventLog
 * const addNode = (kg: KnowledgeGraph["Service"]) =>
 *   kg.addNode(new NodeCreatedPayload({ ... }))
 *
 * // Read path: hits materialized view
 * const nodes = (kg: KnowledgeGraph["Service"]) =>
 *   kg.queryNodes({ kind: "page" })
 * ```
 *
 * @category services
 * @since 0.0.0
 */
class KnowledgeGraph extends Context.Service<KnowledgeGraph, {
  readonly addNode: (payload: NodeCreatedPayload) => Effect.Effect<void>
  readonly updateNode: (payload: NodeUpdatedPayload) => Effect.Effect<void>
  readonly removeNode: (nodeId: KnowledgeNodeId, reason: string) => Effect.Effect<void>
  readonly addEdge: (payload: EdgeCreatedPayload) => Effect.Effect<void>
  readonly removeEdge: (edgeId: KnowledgeEdgeId, reason: string) => Effect.Effect<void>
  readonly resetSource: (source: string, reason: string) => Effect.Effect<void>
  readonly queryNodes: (filter: NodeFilter) => Effect.Effect<ReadonlyArray<GraphNode>>
  readonly queryEdges: (filter: EdgeFilter) => Effect.Effect<ReadonlyArray<GraphEdge>>
  readonly subscribe: Stream.Stream<EventJournal.Entry>
}>()($I`KnowledgeGraph`) {}
```

### Implementation

```ts
import { Effect, Layer, Stream } from "effect"
import { EventJournal, EventLog } from "effect/unstable/eventlog"
import * as SqlClient from "effect/unstable/sql/SqlClient"
import * as S from "effect/Schema"

const graphSchema = EventLog.schema(KnowledgeGraphEvents)

const make = Effect.gen(function* () {
  const write = yield* EventLog.makeClient(graphSchema)
  const journal = yield* EventJournal.EventJournal
  const sql = yield* SqlClient.SqlClient

  return KnowledgeGraph.of({
    // --- Write path: delegate to EventLog ---
    addNode: (payload) => write("NodeCreated", payload),
    updateNode: (payload) => write("NodeUpdated", payload),
    removeNode: (nodeId, reason) =>
      write("NodeRemoved", new NodeRemovedPayload({ nodeId, reason })),
    addEdge: (payload) => write("EdgeCreated", payload),
    removeEdge: (edgeId, reason) =>
      write("EdgeRemoved", new EdgeRemovedPayload({ edgeId, reason })),
    resetSource: (source, reason) =>
      write("SnapshotReset", new SnapshotResetPayload({ source, reason })),

    // --- Read path: hit materialized view tables ---
    queryNodes: (filter) =>
      sql`SELECT * FROM graph_nodes WHERE kind = ${filter.kind}`.pipe(
        Effect.flatMap(S.decodeUnknownEffect(S.Array(GraphNodeRow)))
      ),
    queryEdges: (filter) =>
      sql`SELECT * FROM graph_edges WHERE source_id = ${filter.sourceId}`.pipe(
        Effect.flatMap(S.decodeUnknownEffect(S.Array(GraphEdgeRow)))
      ),

    // --- Live stream: wraps journal.changes PubSub ---
    subscribe: Stream.unwrap(
      Effect.map(journal.changes, Stream.fromSubscription)
    ),
  })
})

const KnowledgeGraphLive = Layer.effect(KnowledgeGraph, make)
```

---

## Persistence: Single SQLite Database

All data lives in a single database file: `.beep/graph/graph.db`. Two table owners coexist.

### SqlEventJournal (owned by Effect runtime)

`SqlEventJournal.layer()` auto-creates these tables. Never create them manually.

| Table | Columns | Purpose |
|-------|---------|---------|
| `effect_event_journal` | `id` (BLOB PK), `event` (TEXT), `primary_key` (TEXT), `payload` (BLOB), `timestamp` (INTEGER) | Append-only event entries |
| `effect_event_remotes` | `remote_id` (BLOB), `entry_id` (BLOB), `sequence` (INT) | Remote sync tracking |

### Materialized Views (owned by application)

These tables are ALWAYS rebuildable: drop them, then replay all events from the journal through handlers.

| Table | Factory | Purpose |
|-------|---------|---------|
| `graph_nodes` | `Table.make(KnowledgeNodeId)(...)` | Projected node state |
| `graph_edges` | `Table.make(KnowledgeEdgeId)(...)` | Projected edge state |

---

## Materialized View Projection

Materialized view tables use `Table.make(entityId)(columns)` from `@beep/shared-tables`. The factory auto-injects audit columns (`createdAt`, `updatedAt`, `deletedAt`, `createdBy`, `updatedBy`, `deletedBy`, `version`, `source`).

```ts
import { Table } from "@beep/shared-tables"
import * as sqlite from "drizzle-orm/sqlite-core"

/**
 * Materialized view table for projected graph nodes.
 *
 * Rebuilt by replaying all events through the `NodeCreated` / `NodeUpdated` /
 * `NodeRemoved` handlers.
 *
 * @example
 * ```ts
 * import { Table } from "@beep/shared-tables"
 *
 * // Auto-injected columns: id, createdAt, updatedAt, deletedAt,
 * // createdBy, updatedBy, deletedBy, version, source
 * ```
 *
 * @category tables
 * @since 0.0.0
 */
export const graphNodes = Table.make(KnowledgeNodeId)({
  nodeId: sqlite.text("node_id").notNull().unique(),
  kind: sqlite.text("kind").notNull(),
  domain: sqlite.text("domain").notNull(),
  label: sqlite.text("label").notNull(),
  content: sqlite.text("content"),
  certainty: sqlite.real("certainty").notNull().default(1.0),
  tags: sqlite.text("tags"),       // JSON-encoded array
  aliases: sqlite.text("aliases"), // JSON-encoded array
  lastSequence: sqlite.integer("last_sequence"),
}, (t) => [
  sqlite.index("graph_nodes_kind_idx").on(t.kind),
  sqlite.index("graph_nodes_domain_idx").on(t.domain),
  sqlite.index("graph_nodes_certainty_idx").on(t.certainty),
])

/**
 * Materialized view table for projected graph edges.
 *
 * Rebuilt by replaying all events through the `EdgeCreated` / `EdgeRemoved`
 * handlers.
 *
 * @example
 * ```ts
 * import { Table } from "@beep/shared-tables"
 *
 * // Foreign keys reference graphNodes.nodeId
 * ```
 *
 * @category tables
 * @since 0.0.0
 */
export const graphEdges = Table.make(KnowledgeEdgeId)({
  edgeId: sqlite.text("edge_id").notNull().unique(),
  sourceId: sqlite.text("source_id").notNull(),
  targetId: sqlite.text("target_id").notNull(),
  relation: sqlite.text("relation").notNull(),
  weight: sqlite.real("weight"),
  certainty: sqlite.real("certainty").notNull().default(1.0),
  lastSequence: sqlite.integer("last_sequence"),
}, (t) => [
  sqlite.index("graph_edges_source_idx").on(t.sourceId),
  sqlite.index("graph_edges_target_idx").on(t.targetId),
  sqlite.index("graph_edges_relation_idx").on(t.relation),
])
```

### Projection Rules

| Event | Handler Action |
|-------|---------------|
| `NodeCreated` | INSERT into `graph_nodes` |
| `NodeUpdated` | UPDATE `graph_nodes` where `nodeId` matches, apply patch fields |
| `NodeRemoved` | DELETE from `graph_nodes`, DELETE all edges referencing `nodeId` |
| `EdgeCreated` | INSERT into `graph_edges` |
| `EdgeRemoved` | DELETE from `graph_edges` |
| `SnapshotReset` | DELETE all `graph_nodes` and `graph_edges` where `source` matches |

---

## Composing the Full Layer Stack

The complete layer stack composes journal storage, handler registration, reactivity, compaction, and the facade service.

```ts
import { Effect, Layer } from "effect"
import { EventLog, SqlEventJournal } from "effect/unstable/eventlog"

// 1. Define schema from the event group
const graphSchema = EventLog.schema(KnowledgeGraphEvents)

// 2. Compose handler + reactivity + compaction layers
const graphLayers = Layer.mergeAll(
  graphHandlers,
  graphReactivity,
  graphCompaction,
)

// 3. Compose into EventLog layer
const eventLogLayer = EventLog.layer(graphSchema, graphLayers)

// 4. Provide journal storage + identity
const fullLayer = eventLogLayer.pipe(
  Layer.provide(SqlEventJournal.layer()),  // auto-creates journal tables
  Layer.provide(sqlClientLayer),           // SqlClient for .beep/graph/graph.db
  Layer.provide(identityLayer),            // EventLog.Identity
)

// 5. Provide the facade on top
const knowledgeGraphLayer = KnowledgeGraphLive.pipe(
  Layer.provide(fullLayer),
)
```

`EventLog.layer` internally composes:
- `EventLog.layerEventLog` (core orchestration, Registry, Reactivity service)
- Your handler layers (from `EventLog.group`)

Requirements: `EventJournal` + `EventLog.Identity` in the context.

---

## Event Sources Diagram

```
Event Sources                    Effect EventLog              Materialized Views
                                 (append-only journal)
                                                            ┌── graph_nodes (SQLite)
repo-memory indexer  ──┐                                    │
                       ├──>  EventLog.write()  ──handler──> ├── graph_edges (SQLite)
editor page saves    ──┤     (Entry: UUID v7,               │
                       │      event tag,                    ├── Cytoscape elements (UI)
future domain stores ──┘      primaryKey,                   │
                              msgpack payload)              └── Statistics / metrics
                                    │
                                    ├── Reactivity.invalidate(keys)
                                    │
                                    └── EventJournal.changes PubSub
```

### Flow detail

1. **repo-memory indexer**: when a `RunEvent` completes, the indexer reads new/changed/removed symbols and calls `write("NodeCreated", ...)`, `write("EdgeCreated", ...)` etc. via the `KnowledgeGraph` facade. Events carry `metadata.source = "repo-memory"`, `metadata.certainty = 1.0`.

2. **editor page saves**: when a vault page is saved, the page processor parses frontmatter and body, diffs against previous state, and emits node/edge events via the facade with `metadata.source = "vault"`, `metadata.certainty = 1.0`.

3. **future domain stores**: legal, compliance, or other domain indexers follow the same facade pattern. Each uses its own `metadata.source` value for `SnapshotReset` scoping.

4. **Materialized views**: each view is an independent consumer of the event stream via handlers. The graph index (SQLite tables) is the primary view. Others (Cytoscape elements for the UI, backlink index for fast reverse lookups, statistics) can be added as additional `EventLog.group` registrations without modifying the event log or other views.

5. **Reactivity**: every processed event triggers `Reactivity.invalidate` for the keys registered in `graphReactivity`. The UI subscribes to `"graph-nodes"` and `"graph-edges"` keys and re-fetches affected queries automatically.

6. **Remote sync**: when enabled, `EventLogRemote` handles bidirectional sync. The `graphCompaction` function reduces backlog during sync processing. Encryption is optional via `EventLogEncryption`.

---

## Verification Checklist

Run these grep patterns to validate compliance:

```bash
# No custom event log table definitions (should find ZERO hits outside eventlog/)
rg "CREATE TABLE.*event" packages/ --glob '!*.d.ts' -l

# EventGroup usage (should find hits in graph domain)
rg "EventGroup\.empty" packages/ --glob '*.ts'

# EventLog.group handler registration (should find hits)
rg "EventLog\.group\(" packages/ --glob '*.ts'

# SqlEventJournal usage (should find hits)
rg "SqlEventJournal\.layer" packages/ --glob '*.ts'

# KnowledgeGraph facade delegates to EventLog.makeClient
rg "EventLog\.makeClient" packages/ --glob '*.ts'

# No raw journal.write outside infrastructure
rg "journal\.write\(" packages/ --glob '*.ts' -l

# Conflict parameter acknowledged in ALL handlers
rg "conflicts" packages/ --glob '*.ts' -C 2

# Reactivity keys registered
rg "groupReactivity" packages/ --glob '*.ts'

# Compaction registered
rg "groupCompaction" packages/ --glob '*.ts'

# No custom NDJSON or polling streams
rg "ndjson|polling|setInterval" packages/ --glob '*.ts' -l

# All event payloads use $I identity annotations
rg "\\\$I\.annote\|\\$I\.annoteSchema" packages/ --glob '*.ts'

# LiteralKit used for string unions (no raw S.Literal for domains)
rg "LiteralKit\(" packages/ --glob '*.ts'

# Table.make for materialized views
rg "Table\.make\(" packages/ --glob '*.ts'
```

---

## Enforcement Rules

1. **MUST** use Effect's `EventGroup` / `EventLog` / `EventJournal` -- never build custom event log infrastructure.
2. **MUST** use `SqlEventJournal.layer()` for SQL journal storage -- never write custom `CREATE TABLE` for event tables.
3. **MUST** use `EventLog.group(group, handlersBuilder)` for handler registration -- the projection IS the handler.
4. **MUST** use `EventLog.groupReactivity(group, keys)` for UI invalidation keys.
5. **MUST** use `EventLog.groupCompaction(group, compactFn)` for event history reduction.
6. **MUST** use `EventLog.makeClient(schema)` for typed event writing.
7. **KnowledgeGraph** service is a thin facade -- delegates writes to EventLog client, reads to materialized SQL index.
8. **Single database**: `.beep/graph/graph.db` -- Effect journal tables and application materialized views coexist.
9. **Materialized view tables** use `Table.make(entityId)(columns)` from `@beep/shared-tables`.
10. **Conflict handling** must be explicit in every handler -- acknowledge the `conflicts` parameter.
11. **Live streaming** uses `EventJournal.changes` PubSub -- never build custom NDJSON streams or polling.
12. **Event payloads** are msgpack-encoded internally -- use Effect Schema types, never raw JSON.
13. **All handler events must be handled** -- TypeScript enforces exhaustive handling via `"Event not handled: ..."` errors.
14. **Remote sync** uses the built-in `EventLogRemote` client/server -- never build custom sync protocols.
15. **Identity** must be provided via `EventLog.Identity` layer -- never skip authentication.
16. **Encryption** uses `EventLogEncryption` with AES-GCM -- never implement custom encryption.
17. **$I identity** on all schemas -- `$I.annote` for class schemas, `$I.annoteSchema` for non-class schemas.
18. **LiteralKit** for all literal string unions -- never use raw `S.Literal` or `S.Literals` for domain literals.
19. **S.TaggedClass** for event payloads -- never `Model.Class` (events are append-only, not CRUD).
20. **JSDoc** on all schema definitions with `@example`, `@category`, `@since 0.0.0`.
