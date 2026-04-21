# 02 - Real-Time Streaming and Temporal Replay

## Thesis

The event-sourced graph architecture makes real-time streaming and temporal replay natural consequences rather than separate features. Every graph mutation is an immutable `Entry` in the `EventJournal` from `effect/unstable/eventlog`. Connected UI clients subscribe to the journal's `changes` PubSub. The same journal that drives live updates also powers a scrubber that projects the graph to any point in time by querying the `effect_event_journal` table up to a given timestamp.

This document specifies the live streaming mechanism, reactivity integration, animation strategy, event batching during indexing, and the temporal replay engine.

---

## Live Graph Streaming via EventJournal PubSub

### Event flow

When an indexer runs or a user saves a page, the mutation pipeline is:

1. The actor (indexer, editor save, manual link) produces one or more graph events via the `KnowledgeGraph` facade.
2. The facade delegates to `EventLog.write`, which appends an `Entry` to the `EventJournal` with a UUID, event tag, primary key, msgpack payload, and timestamp.
3. The `EventJournal` publishes the new `Entry` to its `changes` PubSub.
4. All subscribers (graph projector, UI atoms, analytics) receive the entry independently.

### PubSub subscription

The `EventJournal` exposes a `changes` field that returns a `PubSub.Subscription<Entry>` scoped to the caller's `Scope`. This is the live streaming primitive -- no custom NDJSON transport is needed.

```ts
/**
 * Subscribe to live journal entries as they are appended.
 *
 * @example
 * ```ts
 * import { EventJournal } from "effect/unstable/eventlog"
 * import { Effect, PubSub, Stream } from "effect"
 *
 * const liveEntries = Effect.gen(function*() {
 *   const journal = yield* EventJournal
 *   const sub = yield* journal.changes
 *   return Stream.fromSubscription(sub)
 * })
 * ```
 *
 * @category streaming
 * @since 0.0.0
 */
```

Each `Entry` carries:

| Field        | Type         | Description                                  |
|--------------|--------------|----------------------------------------------|
| `id`         | `EntryId`    | UUID, globally unique                        |
| `event`      | `string`     | Event tag (`"NodeCreated"`, `"EdgeCreated"`, etc.) |
| `primaryKey` | `string`     | Domain-specific primary key (node ID, edge ID) |
| `payload`    | `Uint8Array` | Msgpack-encoded event payload                |
| `timestamp`  | `bigint`     | Unix milliseconds                            |

### Reconnection and catch-up

On disconnect, the client retains its last seen `Entry.id`. On reconnect it queries the `SqlEventJournal` table (`effect_event_journal`) for all entries after that ID's timestamp, then switches to the live PubSub. This guarantees no missed events without full graph reload.

---

## Reactivity Integration

### EventLog reactivity keys

The `EventLog.Registry` supports `registerReactivity`, which maps event tags to reactivity keys. When an event is written, the `Reactivity` service automatically invalidates the matching keys.

```ts
/**
 * Register reactivity keys so atoms auto-refresh on graph mutations.
 *
 * @example
 * ```ts
 * import { EventLog } from "effect/unstable/eventlog"
 * import { Effect } from "effect"
 *
 * const registerKeys = Effect.gen(function*() {
 *   const registry = yield* EventLog.Registry
 *   yield* registry.registerReactivity({
 *     NodeCreated: ["graph:nodes", "graph:stats"],
 *     EdgeCreated: ["graph:edges", "graph:stats"],
 *     NodeUpdated: ["graph:nodes"],
 *     NodeRemoved: ["graph:nodes", "graph:edges", "graph:stats"],
 *     EdgeRemoved: ["graph:edges", "graph:stats"],
 *     SnapshotReset: ["graph:nodes", "graph:edges", "graph:stats"],
 *   })
 * })
 * ```
 *
 * @category reactivity
 * @since 0.0.0
 */
```

### Frontend atoms with reactivity

Graph state atoms use `Reactivity.stream` to automatically re-query when their keys are invalidated. Mutations use `Reactivity.mutation` to invalidate after writes.

```ts
/**
 * Graph elements atom that auto-refreshes on graph mutations.
 *
 * @example
 * ```ts
 * import { Atom } from "effect/unstable/reactivity"
 * import { Reactivity } from "effect/unstable/reactivity"
 * import { Effect } from "effect"
 *
 * // Server state: auto-refreshes when "graph:nodes" or "graph:edges" are invalidated
 * const graphElements$ = Atom.family((storeId: string) =>
 *   Atom.query({
 *     key: `graph:elements:${storeId}`,
 *     effect: Effect.gen(function*() {
 *       const reactivity = yield* Reactivity
 *       return yield* reactivity.stream(
 *         ["graph:nodes", "graph:edges"],
 *         loadCytoscapeElements,
 *       )
 *     }),
 *   })
 * )
 * ```
 *
 * @category atoms
 * @since 0.0.0
 */
```

---

## Cytoscape Animation for Live Mutations

Each graph event kind maps to a specific Cytoscape animation:

### `NodeCreated`

- Node is added to the Cytoscape instance via `cy.add()`.
- Initial style: `opacity: 0`, `width: 0`, `height: 0`.
- Animate to: `opacity: 1`, full computed size.
- Duration: 300ms, easing: `ease-out-cubic`.
- Glow pulse: temporary `.entering` class applied for 600ms then removed.
- Position: computed by the active layout algorithm (incremental, not full re-layout).

### `EdgeCreated`

- Edge is added with initial style: `opacity: 0`, `line-color` matching edge type.
- Animate to: `opacity: 1` over 400ms.
- Particle animation along the edge path following the TrustGraph workbench pattern: 2 particles per link, speed 0.004.
- Particles fade after 2 seconds.

### `NodeUpdated`

- Property change applied immediately.
- Brief highlight flash: `.highlighting` class applied for 400ms.
- `.highlighting` applies a brighter border color and subtle scale bump (`transform: scale(1.05)`).

### `NodeRemoved`

- Animate to: `opacity: 0`, `width: 0`, `height: 0` over 300ms, easing `ease-in-cubic`.
- After animation completes: `cy.remove()` the element.
- Connected edges animate out simultaneously with matching opacity fade.

### `SnapshotReset`

- Full graph rebuild triggered by a bulk operation (e.g., re-index from scratch).
- Fade out all current elements over 200ms.
- Replace elements with new snapshot.
- Run full layout.
- Fade in all elements over 300ms.
- This is the only event kind that triggers a full re-layout.

### Animation API

All transitions use Cytoscape's `ele.animate()` API:

```ts
node.animate({
  style: { opacity: 1, width: 40, height: 40 },
  duration: 300,
  easing: "ease-out-cubic",
  complete: () => node.removeClass("entering")
})
```

Temporary classes (`.entering`, `.exiting`, `.highlighting`) are defined in the extended `graph-styles.tsx` stylesheet and removed after animation completes.

---

## Event Batching Strategy During Indexing

### The problem

An index run can produce thousands of events in rapid succession -- one per symbol discovered, one per import edge resolved. Applying each event individually to Cytoscape would cause layout thrashing and frame drops.

### Batching rules

| Parameter              | Value  | Rationale                                      |
|------------------------|--------|-------------------------------------------------|
| Buffer window          | 100ms  | Collects events arriving in bursts              |
| Max batch size         | 500    | Prevents single batch from blocking main thread |
| Layout trigger         | batch  | Incremental layout after each batch, not each event |
| Animation              | batch  | Single `cy.add()` call per batch                |

### Batch application sequence

1. Events arrive on the PubSub subscription and accumulate in a buffer array.
2. Every 100ms (or when the buffer hits 500 events), the buffer is flushed.
3. All `NodeCreated` events in the batch are collected into a single `cy.add(nodes)` call.
4. All `EdgeCreated` events are collected into a single `cy.add(edges)` call.
5. `NodeUpdated` events are applied as batch style/data updates.
6. `NodeRemoved` events are applied as batch removals (after fade-out animation).
7. Incremental layout runs on only the affected region, not the full graph.
8. Animation is simplified during batching: nodes fade in as a group, no individual glow pulses.

### Batch state atom

```ts
/**
 * Indexing progress atom driven by event stream.
 *
 * @example
 * ```ts
 * import { Atom } from "effect/unstable/reactivity"
 *
 * interface IndexProgress {
 *   readonly current: number
 *   readonly estimated: number
 *   readonly active: boolean
 * }
 *
 * const indexProgress$ = Atom.make<IndexProgress>({
 *   current: 0,
 *   estimated: 0,
 *   active: false,
 * })
 * ```
 *
 * @category atoms
 * @since 0.0.0
 */
```

### Progress indicator

During active indexing, the UI shows a progress bar:

```
Indexing: 1,247 / 3,500 symbols...
[________________] 35%
```

The denominator comes from the indexer's initial file scan count (estimated). The numerator increments with each `NodeCreated` event for symbol-type nodes. The progress bar is approximate -- it communicates activity, not a precise contract.

### Frame budget

Batch application targets 16ms per frame (60fps). If a batch takes longer than 8ms to apply (measured via `performance.now()`), the remaining events are deferred to the next animation frame via `requestAnimationFrame`. This prevents the graph canvas from blocking user interaction during heavy indexing.

---

## Temporal Replay (Graph Timelapse)

### Concept

The `SqlEventJournal` stores every entry in the `effect_event_journal` table with a `timestamp` column. This enables a scrubber that projects the graph to any historical state by querying entries up to a given timestamp. This is the graph equivalent of "git log" -- users can watch their knowledge graph grow over time, see when connections formed, and trace the evolution of their codebase understanding.

### Replay data source

Temporal queries hit the `SqlEventJournal` table directly rather than the live PubSub:

```ts
/**
 * Query journal entries up to a timestamp for temporal replay.
 *
 * @example
 * ```ts
 * import * as SqlClient from "effect/unstable/sql/SqlClient"
 * import { Effect } from "effect"
 *
 * const entriesUpTo = (timestampMs: bigint) =>
 *   Effect.gen(function*() {
 *     const sql = yield* SqlClient.SqlClient
 *     return yield* sql`
 *       SELECT id, event, primary_key, payload, timestamp
 *       FROM effect_event_journal
 *       WHERE timestamp <= ${timestampMs}
 *       ORDER BY timestamp ASC
 *     `
 *   })
 * ```
 *
 * @category replay
 * @since 0.0.0
 */
```

### Scrubber UI

```
[|<<<] [<<] [>] [>>] [>>>|]    Apr 12 ─────●──────── Apr 15    [1x] [2x] [4x]
                                          ^ cursor
```

| Control    | Action                                           | Shortcut     |
|------------|--------------------------------------------------|--------------|
| `\|<<<\|`  | Jump to first event                              | `Home`       |
| `<<`       | Step backward one event (or one batch in batch mode) | `Left`   |
| `>`        | Play forward at selected speed                   | `Space`      |
| `>>`       | Step forward one event (or one batch)            | `Right`      |
| `>>>\|`    | Jump to latest event (return to live mode)       | `End`        |
| `1x`       | Real-time playback speed                         |              |
| `2x`       | Double speed                                     |              |
| `4x`       | Quadruple speed                                  |              |
| `8x`       | Eight times speed (for long histories)           |              |

### Scrubber slider

- Range: first entry timestamp to latest entry timestamp.
- Dragging projects the graph at that point in time.
- The slider snaps to entry boundaries -- there are no "in between" states.
- Date labels at slider endpoints. Cursor position shows exact timestamp and entry count.

### Replay state atoms

```ts
/**
 * Replay mode state managed via local atoms.
 *
 * @example
 * ```ts
 * import { Atom } from "effect/unstable/reactivity"
 *
 * type ReplaySpeed = 1 | 2 | 4 | 8
 * type ReplayMode = "live" | "paused" | "playing" | "scrubbing"
 *
 * const replayMode$ = Atom.make<ReplayMode>("live")
 * const replaySpeed$ = Atom.make<ReplaySpeed>(1)
 * const replayCursor$ = Atom.make<bigint>(0n)
 * const replayRange$ = Atom.make<{
 *   readonly first: bigint
 *   readonly latest: bigint
 * }>({ first: 0n, latest: 0n })
 * ```
 *
 * @category atoms
 * @since 0.0.0
 */
```

### Play mode

- Animates forward from cursor position.
- At 1x speed, events are applied at the rate they originally occurred (using timestamp deltas).
- At 2x/4x/8x, timestamp deltas are divided by the speed multiplier.
- Events with less than 50ms delta at current speed are batched together (prevents animation jank for burst events).
- Play stops at the end of the log or when the user pauses.

### Rewind mode

- Reverse event application: `NodeCreated` becomes removal, `EdgeCreated` becomes removal, `NodeRemoved` becomes creation.
- Same speed controls as forward play.
- Stepping backward (`<<`) applies the inverse of the most recent event.

### Jump to start / end

- Jump to start: project empty graph, then animate first batch of events.
- Jump to end: project full current graph (equivalent to leaving replay mode). Returns to live streaming.

---

## Replay Projection Engine

### State projection

Given a cursor position (timestamp), the engine projects the graph state:

1. Query `effect_event_journal` for all entries where `timestamp <= cursor`.
2. Decode each entry's msgpack payload and apply events in timestamp order to build the element set (nodes + edges).
3. Render the projected element set into Cytoscape.

### Projection modes

| Mode            | Animation | Use case                           |
|-----------------|-----------|------------------------------------|
| **Scrub**       | None      | Fast dragging -- just project final state |
| **Step**        | Per-event | Single step forward/backward       |
| **Play**        | Per-event or batched | Continuous playback at speed |
| **Jump**        | Transition| Jump to start or end               |

### Scrub optimization

For fast scrubbing (user dragging the slider rapidly), animation is skipped entirely:

1. Compute the target element set from entries up to the cursor timestamp.
2. Diff against current Cytoscape elements.
3. Apply diff as a single batch: add missing, remove extra, update changed.
4. No animation, no layout transition -- just instant projection.

This ensures scrubbing feels responsive even for graphs with thousands of events.

### Play optimization

For continuous playback:

1. Pre-fetch the next N entries (lookahead buffer of 100 entries).
2. Apply events one-by-one (or in batches for burst periods) with animation.
3. Replenish the lookahead buffer as events are consumed.
4. If the user scrubs during playback, cancel the play loop, project to the new position, then resume if still in play mode.

### Transition between live and replay

- Entering replay: pause PubSub subscription processing, snapshot current latest timestamp, show scrubber.
- Exiting replay (jump to end): fast-forward from cursor to latest timestamp, apply any entries that arrived during replay, resume PubSub consumption, hide scrubber.
- Entries that arrive while in replay mode are buffered. On exit, the buffer is applied as a batch.

---

## Filters During Replay

Filters apply in both live mode and replay mode. They control which events are projected into the visible graph.

### Filter dimensions

| Dimension     | Options                                              | Default    |
|---------------|------------------------------------------------------|------------|
| **Source**    | repo-memory, vault (user pages), semantic (derived)  | All        |
| **Domain**    | code nodes, document nodes, mixed                    | All        |
| **Certainty** | Threshold slider 0.0 to 1.0                         | 0.0 (show all) |
| **Actor**     | indexer, user, link-resolver                         | All        |

### Filter behavior

- Filters are applied at projection time, not at the event log level. The full event journal is always preserved.
- When a filter is toggled, the graph is re-projected from the current cursor position with the new filter applied.
- Filtered-out nodes and edges are removed from the Cytoscape instance (not just hidden). This keeps the layout clean.
- Changing filters during playback: pause, re-project, resume.

### Filter state atoms

```ts
/**
 * Filter state persisted in URL search params via `Atom.searchParam`.
 *
 * @example
 * ```ts
 * import { Atom } from "effect/unstable/reactivity"
 * import * as S from "effect/Schema"
 *
 * const sourceFilter$ = Atom.searchParam("source")
 * const certaintyFilter$ = Atom.searchParam("certainty", { schema: S.NumberFromString })
 * const actorFilter$ = Atom.searchParam("actor")
 * ```
 *
 * @category atoms
 * @since 0.0.0
 */
```

### Certainty filter

Certainty applies to edges. Edges carry a `certainty` field (0.0 to 1.0):
- 1.0 = deterministic (e.g., AST import edge, explicit wiki_link).
- < 1.0 = inferred (e.g., semantic similarity, LLM-suggested connection).

The certainty slider hides edges below the threshold. When an edge is hidden, orphaned nodes (nodes with no remaining visible edges) are optionally hidden too (toggle: "Hide orphans").

### Filter persistence

Active filters are persisted in URL search params: `?source=repo-memory&certainty=0.5&actor=indexer`. This makes filtered views shareable and bookmarkable.

---

## Statistics Overlay During Replay

A collapsible statistics panel overlays the bottom-right of the graph canvas. It updates in real time as the scrubber moves.

### Metrics

| Metric                | Description                                      |
|-----------------------|--------------------------------------------------|
| **Nodes by type**     | Count of symbols, files, pages at cursor position |
| **Edges by type**     | Count of imports, wiki_links, semantic at cursor  |
| **Graph density**     | `2 * |E| / (|V| * (|V| - 1))` -- how interconnected the graph is |
| **Total events**      | Entries processed up to cursor                   |
| **Event rate**        | Events per hour/day histogram sparkline          |

### Statistics atom

```ts
/**
 * Derived statistics atom, recomputed on cursor move.
 *
 * @example
 * ```ts
 * import { Atom } from "effect/unstable/reactivity"
 *
 * interface GraphStats {
 *   readonly nodesByKind: Record<string, number>
 *   readonly edgesByKind: Record<string, number>
 *   readonly density: number
 *   readonly totalEntries: number
 * }
 *
 * const graphStats$ = Atom.derived<GraphStats>((get) => {
 *   const elements = get(graphElements$)
 *   const cursor = get(replayCursor$)
 *   return computeStats(elements, cursor)
 * })
 * ```
 *
 * @category atoms
 * @since 0.0.0
 */
```

### Event rate histogram

A small sparkline chart (200px wide) showing event density over time:

```
events/hr
  |  _
  | _| _     __
  | _| |_ __ || _
  |______________|
  Apr 12       Apr 15
       ^ cursor
```

The cursor position is marked on the histogram. This gives users a visual sense of when indexing bursts occurred and when the graph was relatively stable.

### Toggle

The statistics overlay is toggled via a button in the toolbar or `Cmd+Shift+I`. It defaults to collapsed to avoid visual clutter.

---

## Connection to Provenance

Every graph event carries provenance metadata encoded in its payload. This is not decorative metadata -- it is the audit trail that the No-Escape Theorem demands for semantic edges.

### Provenance in replay mode

When the user is in replay mode and clicks an event marker in the timeline:

1. The detail panel shows the event's provenance chain.
2. The chain answers: who caused this mutation, from what source, with what certainty.
3. For indexer events: the provenance traces back to the file, the AST node, and the indexer version.
4. For user events: the provenance traces back to the editor action (page save, link creation).
5. For derived events: the provenance traces back to the inference that produced the edge, including the model, prompt hash, and input evidence.

### Provenance display

```
Entry: NodeCreated (IMPORTS)
  Actor:      indexer:repo-memory
  Source:     packages/auth/src/Login.tsx:14
  Target:     packages/common/ui/src/Button.tsx
  Certainty:  1.0 (deterministic)
  Provenance:
    |-- Activity: ts-morph AST parse
    |   |__ Used: Login.tsx @ commit a3f7b2c
    |__ Agent: repo-memory-indexer v0.3.1
```

For semantic (inferred) edges:

```
Entry: EdgeCreated (RELATED_TO)
  Actor:      agent:semantic-linker
  Source:     pages/auth-patterns.md
  Target:     packages/auth/src/Login.tsx
  Certainty:  0.72
  Provenance:
    |-- Activity: embedding similarity
    |   |-- Used: pages/auth-patterns.md (section 3)
    |   |__ Used: Login.tsx JSDoc + exports
    |-- Agent: semantic-linker v0.1.0
    |__ Model: text-embedding-3-small
        |__ Threshold: cosine > 0.70
```

This provenance chain is what distinguishes "the graph told me" from "I trust the graph because I can verify why it told me." The No-Escape Theorem requires that every semantic edge be traceable to its originating evidence. The replay timeline makes that traceability interactive.
