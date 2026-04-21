/**
 * EventLog group projection handler for the knowledge graph.
 *
 * Materializes event payloads into the {@link graphNodes} and
 * {@link graphEdges} SQL tables via `EventLog.group`. Each handler receives
 * `{ storeId, payload, entry, conflicts }` and writes directly to the
 * materialized view using `SqlClient`.
 *
 * Conflict strategy: last-write-wins -- conflicts are acknowledged but
 * applied unconditionally.
 *
 * @example
 * ```typescript
 * import { graphHandlers } from "@beep/knowledge-graph/Handlers"
 *
 * void graphHandlers
 * ```
 *
 * @module
 * @since 0.0.0
 */
import { Effect } from "effect";
import { pipe } from "effect/Function";
import * as O from "effect/Option";
import { EventLog } from "effect/unstable/eventlog";
import * as SqlClient from "effect/unstable/sql/SqlClient";
import type { Fragment } from "effect/unstable/sql/Statement";
import { KnowledgeGraphEvents } from "./Events.ts";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const serializeArray = (arr: ReadonlyArray<string>): string => JSON.stringify(arr);

// ---------------------------------------------------------------------------
// graphHandlers
// ---------------------------------------------------------------------------

/**
 * Projection handlers for the knowledge graph.
 *
 * Each handler receives `{ storeId, payload, entry, conflicts }` and
 * writes to the materialized view tables. The `conflicts` array contains
 * entries with the same (tag, primaryKey) pair that arrived with different
 * timestamps. Strategy: last-write-wins by ignoring conflicts.
 *
 * SQL failures during projection are treated as defects via
 * `Effect.orDie` since they are not recoverable domain errors.
 *
 * @example
 * ```typescript
 * import { graphHandlers } from "@beep/knowledge-graph/Handlers"
 *
 * void graphHandlers
 * ```
 *
 * @category handlers
 * @since 0.0.0
 */
export const graphHandlers = EventLog.group(KnowledgeGraphEvents, (handlers) =>
  handlers
    .handle(
      "NodeCreated",
      Effect.fn(function* ({ payload, entry, conflicts }) {
        void conflicts;
        const sql = yield* SqlClient.SqlClient;
        const graphNodesTable = sql("graph_nodes");

        yield* sql`
            INSERT INTO ${graphNodesTable} (
              node_id,
              kind,
              domain,
              display_label,
              certainty,
              body,
              tags,
              aliases,
              last_sequence
            ) VALUES (
              ${payload.nodeId},
              ${payload.kind},
              ${payload.metadata.domain},
              ${payload.displayLabel},
              ${payload.metadata.certainty},
              ${O.getOrNull(payload.content)},
              ${serializeArray(payload.metadata.tags ?? [])},
              ${serializeArray(payload.metadata.aliases ?? [])},
              ${entry.createdAtMillis}
            )
          `;
      }, Effect.orDie)
    )
    .handle(
      "NodeUpdated",
      Effect.fn(function* ({ payload, entry, conflicts }) {
        void conflicts;
        const sql = yield* SqlClient.SqlClient;
        const graphNodesTable = sql("graph_nodes");

        const setClauses: Array<Fragment> = [sql`last_sequence = ${entry.createdAtMillis}`];
        if (payload.displayLabel !== undefined) {
          setClauses.push(sql`display_label = ${payload.displayLabel}`);
        }
        if (payload.content !== undefined) {
          setClauses.push(sql`body = ${payload.content}`);
        }
        if (payload.metadata !== undefined) {
          const meta = payload.metadata;
          setClauses.push(sql`domain = ${meta.domain}`);
          setClauses.push(sql`certainty = ${meta.certainty}`);
          setClauses.push(sql`tags = ${serializeArray(meta.tags ?? [])}`);
          setClauses.push(sql`aliases = ${serializeArray(meta.aliases ?? [])}`);
        }

        yield* sql`
            UPDATE ${graphNodesTable}
            SET ${sql.csv(setClauses)}
            WHERE node_id = ${payload.nodeId}
          `;
      }, Effect.orDie)
    )
    .handle(
      "NodeRemoved",
      Effect.fn(function* ({ payload, conflicts }) {
        void conflicts;
        const sql = yield* SqlClient.SqlClient;
        const graphEdgesTable = sql("graph_edges");
        const graphNodesTable = sql("graph_nodes");

        yield* sql`DELETE FROM ${graphEdgesTable} WHERE source_node_id = ${payload.nodeId} OR target_node_id = ${payload.nodeId}`;
        yield* sql`DELETE FROM ${graphNodesTable} WHERE node_id = ${payload.nodeId}`;
      }, Effect.orDie)
    )
    .handle("EdgeCreated", ({ payload, entry, conflicts }) =>
      Effect.gen(function* () {
        void conflicts;
        const sql = yield* SqlClient.SqlClient;
        const graphEdgesTable = sql("graph_edges");

        yield* sql`
            INSERT INTO ${graphEdgesTable} (
              edge_id,
              source_node_id,
              target_node_id,
              kind,
              display_label,
              certainty,
              last_sequence
            ) VALUES (
              ${payload.edgeId},
              ${payload.sourceNodeId},
              ${payload.targetNodeId},
              ${payload.kind},
              ${`${payload.sourceNodeId} -> ${payload.targetNodeId}`},
              ${pipe(
                payload.weight,
                O.getOrElse(() => 1.0)
              )},
              ${entry.createdAtMillis}
            )
          `;
      }).pipe(Effect.orDie)
    )
    .handle("EdgeRemoved", ({ payload, conflicts }) =>
      Effect.gen(function* () {
        void conflicts;
        const sql = yield* SqlClient.SqlClient;
        const graphEdgesTable = sql("graph_edges");

        yield* sql`DELETE FROM ${graphEdgesTable} WHERE edge_id = ${payload.edgeId}`;
      }).pipe(Effect.orDie)
    )
    .handle("SnapshotReset", ({ conflicts }) =>
      Effect.gen(function* () {
        void conflicts;
        const sql = yield* SqlClient.SqlClient;
        const graphEdgesTable = sql("graph_edges");
        const graphNodesTable = sql("graph_nodes");

        // Remove all materialized data so subsequent events rebuild cleanly.
        yield* sql`DELETE FROM ${graphEdgesTable}`;
        yield* sql`DELETE FROM ${graphNodesTable}`;
      }).pipe(Effect.orDie)
    )
);
