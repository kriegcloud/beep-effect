import type { SessionId, TurnId } from "@template/domain/ids"
import type { ExecuteCompactionPayload } from "@template/domain/ports"
import { Effect, Layer, ServiceMap } from "effect"
import * as SqlClient from "effect/unstable/sql/SqlClient"

import { sqlInstant } from "./persistence/SqlCodecs.js"

type SessionCompactionStateRow = {
  readonly session_id: string
  readonly active_turn_id: string | null
  readonly active_agent_id: string | null
  readonly active_conversation_id: string | null
  readonly pending_turn_id: string | null
  readonly pending_agent_id: string | null
  readonly pending_conversation_id: string | null
  readonly pending_triggered_at: string | null
}

export type ClaimOrCoalesceResult =
  | { readonly status: "Claimed" }
  | { readonly status: "Coalesced" }

export interface CompactionRunStatePortService {
  readonly claimOrCoalesce: (
    payload: ExecuteCompactionPayload
  ) => Effect.Effect<ClaimOrCoalesceResult>
  readonly releaseAndTakePending: (
    sessionId: SessionId,
    activeTurnId: TurnId
  ) => Effect.Effect<ExecuteCompactionPayload | null>
}

const readStateRow = (
  sql: SqlClient.SqlClient,
  sessionId: SessionId
) =>
  sql`
    SELECT
      session_id,
      active_turn_id,
      active_agent_id,
      active_conversation_id,
      pending_turn_id,
      pending_agent_id,
      pending_conversation_id,
      pending_triggered_at
    FROM session_compaction_state
    WHERE session_id = ${sessionId}
    LIMIT 1
  `.unprepared.pipe(
    Effect.map((rows) => rows.length > 0 ? rows[0] as SessionCompactionStateRow : null)
  )

const toPendingPayload = (
  sessionId: SessionId,
  row: SessionCompactionStateRow
): ExecuteCompactionPayload | null => {
  if (
    row.pending_turn_id === null
    || row.pending_agent_id === null
    || row.pending_conversation_id === null
    || row.pending_triggered_at === null
  ) {
    return null
  }

  return {
    triggerSource: "PostCommitMetrics",
    agentId: row.pending_agent_id as ExecuteCompactionPayload["agentId"],
    sessionId,
    conversationId: row.pending_conversation_id as ExecuteCompactionPayload["conversationId"],
    turnId: row.pending_turn_id as ExecuteCompactionPayload["turnId"],
    triggeredAt: sqlInstant.decode(row.pending_triggered_at)
  }
}

export class CompactionRunStatePortSqlite extends ServiceMap.Service<CompactionRunStatePortSqlite>()(
  "server/CompactionRunStatePortSqlite",
  {
    make: Effect.gen(function*() {
      const sql = yield* SqlClient.SqlClient

      const claimOrCoalesce: CompactionRunStatePortService["claimOrCoalesce"] = (
        payload
      ) =>
        sql.withTransaction(
          Effect.gen(function*() {
            const existing = yield* readStateRow(sql, payload.sessionId)

            if (existing === null) {
              yield* sql`
                INSERT INTO session_compaction_state (
                  session_id,
                  active_turn_id,
                  active_agent_id,
                  active_conversation_id,
                  pending_turn_id,
                  pending_agent_id,
                  pending_conversation_id,
                  pending_triggered_at,
                  updated_at
                ) VALUES (
                  ${payload.sessionId},
                  ${payload.turnId},
                  ${payload.agentId},
                  ${payload.conversationId},
                  ${null},
                  ${null},
                  ${null},
                  ${null},
                  CURRENT_TIMESTAMP
                )
              `.unprepared
              return { status: "Claimed" } as const
            }

            if (existing.active_turn_id === null) {
              yield* sql`
                UPDATE session_compaction_state
                SET
                  active_turn_id = ${payload.turnId},
                  active_agent_id = ${payload.agentId},
                  active_conversation_id = ${payload.conversationId},
                  pending_turn_id = ${null},
                  pending_agent_id = ${null},
                  pending_conversation_id = ${null},
                  pending_triggered_at = ${null},
                  updated_at = CURRENT_TIMESTAMP
                WHERE session_id = ${payload.sessionId}
              `.unprepared
              return { status: "Claimed" } as const
            }

            if (existing.active_turn_id === payload.turnId) {
              return { status: "Coalesced" } as const
            }

            yield* sql`
              UPDATE session_compaction_state
              SET
                pending_turn_id = ${payload.turnId},
                pending_agent_id = ${payload.agentId},
                pending_conversation_id = ${payload.conversationId},
                pending_triggered_at = ${sqlInstant.encode(payload.triggeredAt)},
                updated_at = CURRENT_TIMESTAMP
              WHERE session_id = ${payload.sessionId}
            `.unprepared

            return { status: "Coalesced" } as const
          })
        ).pipe(
          Effect.tapDefect(Effect.logError),
          Effect.orDie
        )

      const releaseAndTakePending: CompactionRunStatePortService["releaseAndTakePending"] = (
        sessionId,
        activeTurnId
      ) =>
        sql.withTransaction(
          Effect.gen(function*() {
            const row = yield* readStateRow(sql, sessionId)
            if (row === null) {
              return null
            }

            if (row.active_turn_id !== activeTurnId) {
              return null
            }

            const pendingPayload = toPendingPayload(sessionId, row)
            if (pendingPayload === null) {
              yield* sql`
                UPDATE session_compaction_state
                SET
                  active_turn_id = ${null},
                  active_agent_id = ${null},
                  active_conversation_id = ${null},
                  pending_turn_id = ${null},
                  pending_agent_id = ${null},
                  pending_conversation_id = ${null},
                  pending_triggered_at = ${null},
                  updated_at = CURRENT_TIMESTAMP
                WHERE session_id = ${sessionId}
              `.unprepared
              return null
            }

            yield* sql`
              UPDATE session_compaction_state
              SET
                active_turn_id = ${null},
                active_agent_id = ${null},
                active_conversation_id = ${null},
                updated_at = CURRENT_TIMESTAMP
              WHERE session_id = ${sessionId}
            `.unprepared

            return pendingPayload
          })
        ).pipe(
          Effect.tapDefect(Effect.logError),
          Effect.orDie
        )

      return {
        claimOrCoalesce,
        releaseAndTakePending
      } satisfies CompactionRunStatePortService
    })
  }
) {
  static layer = Layer.effect(this, this.make)
}
