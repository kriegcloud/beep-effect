/**
 * Context.Service facade for the knowledge graph.
 *
 * Writes go through {@link EventLog.makeClient} to emit typed events.
 * Reads query materialized SQL tables via {@link SqlClient.SqlClient}.
 * Live change subscriptions are exposed as a {@link Stream.Stream} backed
 * by the journal's {@link EventJournal.EventJournal.changes | changes} PubSub.
 *
 * @example
 * ```typescript
 * import { Effect } from "effect"
 * import { KnowledgeGraph } from "@beep/knowledge-graph/KnowledgeGraph"
 *
 * // Obtain the service from the context
 * const program = Effect.gen(function* () {
 *
 *
 *
 * })
 * ```
 *
 * @module
 * @since 0.0.0
 */
import { $SharedDomainId } from "@beep/identity/packages";
import type { NonEmptyTrimmedStr } from "@beep/schema";
import { Context, Effect, Stream } from "effect";
import * as A from "effect/Array";
import * as S from "effect/Schema";
import * as EventJournal from "effect/unstable/eventlog/EventJournal";
import * as EventLog from "effect/unstable/eventlog/EventLog";
import * as SqlClient from "effect/unstable/sql/SqlClient";
import type { SqlError } from "effect/unstable/sql/SqlError";
import type { Fragment } from "effect/unstable/sql/Statement";

import {
  type EdgeCreatedPayload,
  EdgeRemovedPayload,
  KnowledgeGraphSchema,
  type NodeCreatedPayload,
  NodeRemovedPayload,
  type NodeUpdatedPayload,
  SnapshotResetPayload,
} from "./Events.ts";
import type { GraphEdge, GraphNode } from "./Models.ts";
import {
  KnowledgeDomain,
  type KnowledgeEdgeId,
  KnowledgeEdgeKind,
  KnowledgeNodeId,
  KnowledgeNodeKind,
} from "./Schemas.ts";

const $I = $SharedDomainId.create("knowledge-graph/KnowledgeGraph");

// ---------------------------------------------------------------------------
// Filter types
// ---------------------------------------------------------------------------

/**
 * Optional filter for querying materialized graph nodes.
 *
 * @example
 * ```typescript
 * import { NodeFilter } from "@beep/knowledge-graph/KnowledgeGraph"
 *
 * const filter = new NodeFilter({ kind: "page" })
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class NodeFilter extends S.Class<NodeFilter>($I`NodeFilter`)({
  domain: S.optionalKey(KnowledgeDomain),
  kind: S.optionalKey(KnowledgeNodeKind),
}) {}

/**
 * Optional filter for querying materialized graph edges.
 *
 * @example
 * ```typescript
 * import { EdgeFilter } from "@beep/knowledge-graph/KnowledgeGraph"
 *
 * const filter = new EdgeFilter({ kind: "wiki_link" })
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class EdgeFilter extends S.Class<EdgeFilter>($I`EdgeFilter`)({
  kind: S.optionalKey(KnowledgeEdgeKind),
  sourceNodeId: S.optionalKey(KnowledgeNodeId),
  targetNodeId: S.optionalKey(KnowledgeNodeId),
}) {}

// ---------------------------------------------------------------------------
// Service shape
// ---------------------------------------------------------------------------

/**
 * @since 0.0.0
 * @category models
 */
type KnowledgeGraphShape = {
  /** Emit a {@link NodeCreatedPayload} event into the event log. */
  readonly addNode: (payload: NodeCreatedPayload) => Effect.Effect<void, EventJournal.EventJournalError>;

  /** Emit a {@link NodeUpdatedPayload} event into the event log. */
  readonly updateNode: (payload: NodeUpdatedPayload) => Effect.Effect<void, EventJournal.EventJournalError>;

  /** Emit a {@link NodeRemovedPayload} event into the event log. */
  readonly removeNode: (
    nodeId: KnowledgeNodeId,
    reason: NonEmptyTrimmedStr
  ) => Effect.Effect<void, EventJournal.EventJournalError>;

  /** Emit an {@link EdgeCreatedPayload} event into the event log. */
  readonly addEdge: (payload: EdgeCreatedPayload) => Effect.Effect<void, EventJournal.EventJournalError>;

  /** Emit an {@link EdgeRemovedPayload} event into the event log. */
  readonly removeEdge: (
    edgeId: KnowledgeEdgeId,
    reason: NonEmptyTrimmedStr
  ) => Effect.Effect<void, EventJournal.EventJournalError>;

  /** Emit a {@link SnapshotResetPayload} event to replace the entire graph. */
  readonly resetSource: (
    source: NonEmptyTrimmedStr,
    reason: NonEmptyTrimmedStr
  ) => Effect.Effect<void, EventJournal.EventJournalError>;

  /** Query materialized `graph_nodes` rows with optional filters. */
  readonly queryNodes: (filter?: NodeFilter | undefined) => Effect.Effect<ReadonlyArray<GraphNode>, SqlError>;

  /** Query materialized `graph_edges` rows with optional filters. */
  readonly queryEdges: (filter?: EdgeFilter | undefined) => Effect.Effect<ReadonlyArray<GraphEdge>, SqlError>;

  /** Live stream of journal entries for graph mutations. */
  readonly subscribe: Stream.Stream<EventJournal.Entry>;
};

// ---------------------------------------------------------------------------
// Service class
// ---------------------------------------------------------------------------

/**
 * Thin facade over the event-sourced knowledge graph.
 *
 * Write methods delegate to an {@link EventLog} client scoped to
 * {@link KnowledgeGraphSchema}. Read methods query materialized SQL views.
 * The `subscribe` stream emits journal entries as they are committed.
 *
 * @example
 * ```typescript
 * import { Effect } from "effect"
 * import * as S from "effect/Schema"
 * import { NodeCreatedPayload } from "@beep/knowledge-graph/Events"
 * import { KnowledgeGraph } from "@beep/knowledge-graph/KnowledgeGraph"
 * import { NodeMetadata } from "@beep/knowledge-graph/Schemas"
 *
 * const program = Effect.gen(function* () {
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 * })
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export class KnowledgeGraph extends Context.Service<KnowledgeGraph, KnowledgeGraphShape>()($I`KnowledgeGraph`) {}

// ---------------------------------------------------------------------------
// Constructor
// ---------------------------------------------------------------------------

/**
 * Build a live {@link KnowledgeGraph} service from the environment.
 *
 * Requires {@link EventLog}, {@link EventJournal}, and
 * {@link SqlClient} in the context. The caller is responsible for
 * composing these into a {@link Layer.Layer} — see the separate `Layer.ts`
 * module.
 *
 * @category constructors
 * @since 0.0.0
 */
export const makeKnowledgeGraph = Effect.gen(function* () {
  const write = yield* EventLog.makeClient(KnowledgeGraphSchema);
  const journal = yield* EventJournal.EventJournal;
  const sql = yield* SqlClient.SqlClient;

  const graphNodesTable = sql("graph_nodes");
  const graphEdgesTable = sql("graph_edges");

  const addNode: KnowledgeGraphShape["addNode"] = Effect.fn("KnowledgeGraph.addNode")((payload) =>
    write("NodeCreated", payload)
  );

  const updateNode: KnowledgeGraphShape["updateNode"] = Effect.fn("KnowledgeGraph.updateNode")((payload) =>
    write("NodeUpdated", payload)
  );

  const removeNode: KnowledgeGraphShape["removeNode"] = Effect.fn("KnowledgeGraph.removeNode")((nodeId, reason) =>
    write("NodeRemoved", new NodeRemovedPayload({ nodeId, reason }))
  );

  const addEdge: KnowledgeGraphShape["addEdge"] = Effect.fn("KnowledgeGraph.addEdge")((payload) =>
    write("EdgeCreated", payload)
  );

  const removeEdge: KnowledgeGraphShape["removeEdge"] = Effect.fn("KnowledgeGraph.removeEdge")((edgeId, reason) =>
    write("EdgeRemoved", new EdgeRemovedPayload({ edgeId, reason }))
  );

  const resetSource: KnowledgeGraphShape["resetSource"] = Effect.fn("KnowledgeGraph.resetSource")((source, reason) =>
    write("SnapshotReset", new SnapshotResetPayload({ source, reason }))
  );

  const queryNodes: KnowledgeGraphShape["queryNodes"] = Effect.fn("KnowledgeGraph.queryNodes")((filter) => {
    const conditions = A.empty<Fragment>();
    if (filter?.kind !== undefined) conditions.push(sql`kind = ${filter.kind}`);
    if (filter?.domain !== undefined) conditions.push(sql`domain = ${filter.domain}`);

    return conditions.length === 0
      ? sql<GraphNode>`SELECT * FROM ${graphNodesTable}`
      : sql<GraphNode>`SELECT * FROM ${graphNodesTable} WHERE ${sql.and(conditions)}`;
  });

  const queryEdges: KnowledgeGraphShape["queryEdges"] = Effect.fn("KnowledgeGraph.queryEdges")((filter) => {
    const conditions: Array<Fragment> = [];
    if (filter?.kind !== undefined) conditions.push(sql`kind = ${filter.kind}`);
    if (filter?.sourceNodeId !== undefined) conditions.push(sql`source_node_id = ${filter.sourceNodeId}`);
    if (filter?.targetNodeId !== undefined) conditions.push(sql`target_node_id = ${filter.targetNodeId}`);

    return conditions.length === 0
      ? sql<GraphEdge>`SELECT * FROM ${graphEdgesTable}`
      : sql<GraphEdge>`SELECT * FROM ${graphEdgesTable} WHERE ${sql.and(conditions)}`;
  });

  return KnowledgeGraph.of({
    addNode,
    updateNode,
    removeNode,
    addEdge,
    removeEdge,
    resetSource,
    queryNodes,
    queryEdges,
    subscribe: Stream.unwrap(Effect.map(journal.changes, Stream.fromSubscription)),
  });
}).pipe(Effect.withSpan("KnowledgeGraph.make"), Effect.annotateLogs({ component: "knowledge-graph" }));
