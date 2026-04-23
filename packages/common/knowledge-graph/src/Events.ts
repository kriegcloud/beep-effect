/**
 * Event payload schemas, EventGroup, and EventLog configuration for the
 * knowledge graph.
 *
 * All graph mutations flow through these events. The module exports:
 *
 * - Six {@link S.TaggedClass | TaggedClass} payload schemas
 * - A {@link KnowledgeGraphEvents | KnowledgeGraphEvents} EventGroup
 * - {@link KnowledgeGraphSchema | KnowledgeGraphSchema} for the EventLog
 * - {@link KnowledgeGraphReactivity | KnowledgeGraphReactivity} reactivity keys
 * - {@link KnowledgeGraphCompaction | KnowledgeGraphCompaction} compaction layer
 * - {@link GraphEvent | GraphEvent} discriminated union
 *
 * @example
 * ```typescript
 * import {
 *
 *
 *
 *
 * } from "@beep/knowledge-graph/Events"
 * ```
 *
 * @module
 * @since 0.0.0
 */
import { $SharedDomainId } from "@beep/identity/packages";
import { NonEmptyTrimmedStr } from "@beep/schema";
import { A, O, thunkEffectVoid } from "@beep/utils";
import { Effect } from "effect";
import * as S from "effect/Schema";

import { EventGroup, EventLog } from "effect/unstable/eventlog";
import { KnowledgeEdgeId, KnowledgeEdgeKind, KnowledgeNodeId, KnowledgeNodeKind, NodeMetadata } from "./Schemas.ts";

const $I = $SharedDomainId.create("knowledge-graph/Events");

// ---------------------------------------------------------------------------
// 1. Event Payloads
// ---------------------------------------------------------------------------

/**
 * Emitted when a new node enters the graph.
 *
 * @example
 * ```typescript
 * import * as S from "effect/Schema"
 * import { NodeCreatedPayload } from "@beep/knowledge-graph/Events"
 *
 * const payload = S.decodeUnknownSync(NodeCreatedPayload)({})
 * ```
 *
 * @category events
 * @since 0.0.0
 */
export class NodeCreatedPayload extends S.TaggedClass<NodeCreatedPayload>($I`NodeCreatedPayload`)(
  "NodeCreatedPayload",
  {
    nodeId: KnowledgeNodeId,
    kind: KnowledgeNodeKind,
    displayLabel: NonEmptyTrimmedStr,
    content: S.OptionFromNullishOr(S.String),
    metadata: NodeMetadata,
  },
  $I.annote("NodeCreatedPayload", {
    description: "Emitted when a new node enters the graph.",
  })
) {}

/**
 * Emitted when an existing node is updated with new field values.
 *
 * Only the fields being changed need to be supplied; absent optional fields
 * are left unchanged by the downstream handler.
 *
 * @example
 * ```typescript
 * import * as S from "effect/Schema"
 * import { NodeUpdatedPayload } from "@beep/knowledge-graph/Events"
 *
 * const payload = S.decodeUnknownSync(NodeUpdatedPayload)({})
 * ```
 *
 * @category events
 * @since 0.0.0
 */
export class NodeUpdatedPayload extends S.TaggedClass<NodeUpdatedPayload>($I`NodeUpdatedPayload`)(
  "NodeUpdatedPayload",
  {
    nodeId: KnowledgeNodeId,
    displayLabel: S.optionalKey(NonEmptyTrimmedStr),
    content: S.optionalKey(S.String),
    metadata: S.optionalKey(NodeMetadata),
  },
  $I.annote("NodeUpdatedPayload", {
    description: "Emitted when an existing node is updated.",
  })
) {}

/**
 * Emitted when a node is removed from the graph.
 *
 * @example
 * ```typescript
 * import * as S from "effect/Schema"
 * import { NodeRemovedPayload } from "@beep/knowledge-graph/Events"
 *
 * const payload = S.decodeUnknownSync(NodeRemovedPayload)({})
 * ```
 *
 * @category events
 * @since 0.0.0
 */
export class NodeRemovedPayload extends S.TaggedClass<NodeRemovedPayload>($I`NodeRemovedPayload`)(
  "NodeRemovedPayload",
  {
    nodeId: KnowledgeNodeId,
    reason: NonEmptyTrimmedStr,
  },
  $I.annote("NodeRemovedPayload", {
    description: "Emitted when a node is removed from the graph.",
  })
) {}

/**
 * Emitted when a new edge is created between two nodes.
 *
 * @example
 * ```typescript
 * import * as S from "effect/Schema"
 * import { EdgeCreatedPayload } from "@beep/knowledge-graph/Events"
 *
 * const payload = S.decodeUnknownSync(EdgeCreatedPayload)({})
 * ```
 *
 * @category events
 * @since 0.0.0
 */
export class EdgeCreatedPayload extends S.TaggedClass<EdgeCreatedPayload>($I`EdgeCreatedPayload`)(
  "EdgeCreatedPayload",
  {
    edgeId: KnowledgeEdgeId,
    sourceNodeId: KnowledgeNodeId,
    targetNodeId: KnowledgeNodeId,
    kind: KnowledgeEdgeKind,
    weight: S.OptionFromNullishOr(S.Number),
  },
  $I.annote("EdgeCreatedPayload", {
    description: "Emitted when a new edge is created between two nodes.",
  })
) {}

/**
 * Emitted when an edge is removed from the graph.
 *
 * @example
 * ```typescript
 * import * as S from "effect/Schema"
 * import { EdgeRemovedPayload } from "@beep/knowledge-graph/Events"
 *
 * const payload = S.decodeUnknownSync(EdgeRemovedPayload)({})
 * ```
 *
 * @category events
 * @since 0.0.0
 */
export class EdgeRemovedPayload extends S.TaggedClass<EdgeRemovedPayload>($I`EdgeRemovedPayload`)(
  "EdgeRemovedPayload",
  {
    edgeId: KnowledgeEdgeId,
    reason: NonEmptyTrimmedStr,
  },
  $I.annote("EdgeRemovedPayload", {
    description: "Emitted when an edge is removed from the graph.",
  })
) {}

/**
 * Emitted when the entire graph is replaced by a new snapshot.
 *
 * @example
 * ```typescript
 * import * as S from "effect/Schema"
 * import { SnapshotResetPayload } from "@beep/knowledge-graph/Events"
 *
 * const payload = S.decodeUnknownSync(SnapshotResetPayload)({})
 * ```
 *
 * @category events
 * @since 0.0.0
 */
export class SnapshotResetPayload extends S.TaggedClass<SnapshotResetPayload>($I`SnapshotResetPayload`)(
  "SnapshotResetPayload",
  {
    source: NonEmptyTrimmedStr,
    reason: NonEmptyTrimmedStr,
  },
  $I.annote("SnapshotResetPayload", {
    description: "Emitted when the entire graph is replaced by a new snapshot.",
  })
) {}

// ---------------------------------------------------------------------------
// 2. KnowledgeGraphEvents (EventGroup)
// ---------------------------------------------------------------------------

/**
 * EventGroup containing all knowledge graph mutation events.
 *
 * Each event carries a typed payload and a `primaryKey` extractor used by the
 * EventLog for conflict resolution and compaction grouping.
 *
 * @example
 * ```typescript
 * import { KnowledgeGraphEvents } from "@beep/knowledge-graph/Events"
 *
 * // Access individual event definitions
 * void KnowledgeGraphEvents.events.NodeCreated
 * void KnowledgeGraphEvents.events.EdgeCreated
 * ```
 *
 * @category event-group
 * @since 0.0.0
 */
export const KnowledgeGraphEvents = EventGroup.empty
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
  });

// ---------------------------------------------------------------------------
// 3. EventLog Schema
// ---------------------------------------------------------------------------

/**
 * EventLog schema for the knowledge graph event group.
 *
 * Pass this to `EventLog.write` and `EventLog.handlers` to obtain a
 * fully-typed event log scoped to graph mutations.
 *
 * @example
 * ```typescript
 * import { KnowledgeGraphSchema } from "@beep/knowledge-graph/Events"
 *
 * void KnowledgeGraphSchema
 * ```
 *
 * @category schema
 * @since 0.0.0
 */
export const KnowledgeGraphSchema = EventLog.schema(KnowledgeGraphEvents);

// ---------------------------------------------------------------------------
// 4. Reactivity Keys
// ---------------------------------------------------------------------------

/**
 * Reactivity key mapping for the knowledge graph events.
 *
 * Registers which downstream reactive keys should be invalidated when each
 * event tag is committed.
 *
 * @example
 * ```typescript
 * import { KnowledgeGraphReactivity } from "@beep/knowledge-graph/Events"
 *
 * void KnowledgeGraphReactivity
 * ```
 *
 * @category reactivity
 * @since 0.0.0
 */
export const KnowledgeGraphReactivity = EventLog.groupReactivity(KnowledgeGraphEvents, {
  NodeCreated: ["graph:nodes", "graph:stats"],
  NodeUpdated: ["graph:nodes"],
  NodeRemoved: ["graph:nodes", "graph:edges", "graph:stats"],
  EdgeCreated: ["graph:edges", "graph:stats"],
  EdgeRemoved: ["graph:edges", "graph:stats"],
  SnapshotReset: ["graph:nodes", "graph:edges", "graph:stats"],
});

// ---------------------------------------------------------------------------
// 5. Compaction
// ---------------------------------------------------------------------------

/**
 * Compaction layer for the knowledge graph events.
 *
 * Keeps only the last event per primary key, discarding intermediate updates
 * during journal compaction.
 *
 * @example
 * ```typescript
 * import { KnowledgeGraphCompaction } from "@beep/knowledge-graph/Events"
 *
 * void KnowledgeGraphCompaction
 * ```
 *
 * @category compaction
 * @since 0.0.0
 */
export const KnowledgeGraphCompaction = EventLog.groupCompaction(
  KnowledgeGraphEvents,
  Effect.fnUntraced(function* ({ events, write }) {
    return yield* O.match(A.get(events.length - 1)(events), {
      onNone: thunkEffectVoid,
      onSome: (last) => write(last._tag, last.payload),
    });
  })
);

// ---------------------------------------------------------------------------
// 6. GraphEvent Union
// ---------------------------------------------------------------------------

/**
 * Discriminated union of all graph mutation event payloads.
 *
 * Useful for type-safe pattern matching on deserialized event streams.
 *
 * @example
 * ```typescript
 * import { Match } from "effect"
 * import { GraphEvent } from "@beep/knowledge-graph/Events"
 *
 * declare const event: GraphEvent
 * Match.value(event).pipe(
 *
 *
 *
 * )
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const GraphEvent = S.Union([
  NodeCreatedPayload,
  NodeUpdatedPayload,
  NodeRemovedPayload,
  EdgeCreatedPayload,
  EdgeRemovedPayload,
  SnapshotResetPayload,
]).pipe(
  S.toTaggedUnion("_tag"),
  $I.annoteSchema("GraphEvent", {
    description: "Discriminated union of all graph mutation events.",
  })
);

/**
 * Runtime type for {@link GraphEvent}.
 *
 * @since 0.0.0
 * @category models
 */
export type GraphEvent = typeof GraphEvent.Type;
