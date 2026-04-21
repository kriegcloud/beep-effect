/**
 * Layer composition for the knowledge graph event log and facade service.
 *
 * Exports:
 *
 * - {@link KnowledgeGraphEventLogLayer} -- EventLog layer with handlers,
 *
 *
 * - {@link KnowledgeGraphLive} -- Full layer providing the
 *
 *
 *
 * The consumer is responsible for providing the SQL driver and journal
 * storage -- this module never binds to a specific database.
 *
 * @example
 * ```typescript
 * import { KnowledgeGraphLive } from "@beep/knowledge-graph/Layer"
 *
 * void KnowledgeGraphLive
 * ```
 *
 * @module
 * @since 0.0.0
 */
import { Layer } from "effect";
import { EventLog } from "effect/unstable/eventlog";

import { KnowledgeGraphCompaction, KnowledgeGraphReactivity, KnowledgeGraphSchema } from "./Events.ts";
import { graphHandlers } from "./Handlers.ts";
import { KnowledgeGraph, makeKnowledgeGraph } from "./KnowledgeGraph.ts";

// ---------------------------------------------------------------------------
// Event log layer (handlers + reactivity + compaction)
// ---------------------------------------------------------------------------

/**
 * Combined handler, reactivity, and compaction layers for the knowledge
 * graph event group.
 *
 * @category layers
 * @since 0.0.0
 */
const graphLayers = Layer.mergeAll(graphHandlers, KnowledgeGraphReactivity, KnowledgeGraphCompaction);

/**
 * EventLog layer scoped to the knowledge graph schema.
 *
 * Provides {@link EventLog} and {@link EventLog.Registry} with
 * all knowledge graph handlers registered. The caller must supply
 * `EventJournal` and `EventLog.Identity` in the environment.
 *
 * @example
 * ```typescript
 * import { KnowledgeGraphEventLogLayer } from "@beep/knowledge-graph/Layer"
 *
 * void KnowledgeGraphEventLogLayer
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const KnowledgeGraphEventLogLayer = EventLog.layer(KnowledgeGraphSchema, graphLayers);

// ---------------------------------------------------------------------------
// Full facade layer
// ---------------------------------------------------------------------------

/**
 * Live layer providing the {@link KnowledgeGraph} facade service.
 *
 * Composes the event log layer with the facade constructor. The caller
 * must supply `EventJournal`, `EventLog.Identity`, and `SqlClient` in
 * the environment.
 *
 * @example
 * ```typescript
 * import { KnowledgeGraphLive } from "@beep/knowledge-graph/Layer"
 *
 * void KnowledgeGraphLive
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const KnowledgeGraphLive = Layer.effect(KnowledgeGraph, makeKnowledgeGraph).pipe(
  Layer.provide(KnowledgeGraphEventLogLayer)
);
