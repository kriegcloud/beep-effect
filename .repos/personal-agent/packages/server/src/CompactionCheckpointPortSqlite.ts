import type { AgentId, CompactionCheckpointId, MessageId, SessionId, TurnId } from "@template/domain/ids"
import type { CompactionCheckpointPort, CompactionCheckpointRecord } from "@template/domain/ports"
import { Effect, Layer, Option, Schema, ServiceMap } from "effect"
import * as SqlClient from "effect/unstable/sql/SqlClient"
import * as SqlSchema from "effect/unstable/sql/SqlSchema"

const CompactionCheckpointRowSchema = Schema.Struct({
  checkpoint_id: Schema.String,
  agent_id: Schema.String,
  session_id: Schema.String,
  subroutine_id: Schema.String,
  created_at: Schema.String,
  summary: Schema.String,
  first_kept_turn_id: Schema.Union([Schema.String, Schema.Null]),
  first_kept_message_id: Schema.Union([Schema.String, Schema.Null]),
  tokens_before: Schema.Union([Schema.Number, Schema.Null]),
  tokens_after: Schema.Union([Schema.Number, Schema.Null]),
  details_json: Schema.Union([Schema.String, Schema.Null])
})
type CompactionCheckpointRow = typeof CompactionCheckpointRowSchema.Type

import { sqlInstant } from "./persistence/SqlCodecs.js"

const decodeRow = (row: CompactionCheckpointRow): CompactionCheckpointRecord => ({
  checkpointId: row.checkpoint_id as CompactionCheckpointId,
  agentId: row.agent_id as AgentId,
  sessionId: row.session_id as SessionId,
  subroutineId: row.subroutine_id,
  createdAt: sqlInstant.decode(row.created_at),
  summary: row.summary,
  firstKeptTurnId: row.first_kept_turn_id as TurnId | null,
  firstKeptMessageId: row.first_kept_message_id as MessageId | null,
  tokensBefore: row.tokens_before,
  tokensAfter: row.tokens_after,
  detailsJson: row.details_json
})

const LatestBySubroutineRequest = Schema.Struct({
  agentId: Schema.String,
  sessionId: Schema.String,
  subroutineId: Schema.String
})

const SessionRequest = Schema.Struct({
  sessionId: Schema.String
})

export class CompactionCheckpointPortSqlite extends ServiceMap.Service<CompactionCheckpointPortSqlite>()(
  "server/CompactionCheckpointPortSqlite",
  {
    make: Effect.gen(function*() {
      const sql = yield* SqlClient.SqlClient

      const findLatest = SqlSchema.findOneOption({
        Request: LatestBySubroutineRequest,
        Result: CompactionCheckpointRowSchema,
        execute: ({ agentId, sessionId, subroutineId }) =>
          sql`
            SELECT
              checkpoint_id, agent_id, session_id, subroutine_id,
              created_at, summary, first_kept_turn_id, first_kept_message_id,
              tokens_before, tokens_after, details_json
            FROM compaction_checkpoints
            WHERE agent_id = ${agentId}
              AND session_id = ${sessionId}
              AND subroutine_id = ${subroutineId}
            ORDER BY created_at DESC
            LIMIT 1
          `.withoutTransform
      })

      const findBySession = SqlSchema.findAll({
        Request: SessionRequest,
        Result: CompactionCheckpointRowSchema,
        execute: ({ sessionId }) =>
          sql`
            SELECT
              checkpoint_id, agent_id, session_id, subroutine_id,
              created_at, summary, first_kept_turn_id, first_kept_message_id,
              tokens_before, tokens_after, details_json
            FROM compaction_checkpoints
            WHERE session_id = ${sessionId}
            ORDER BY created_at ASC
          `.withoutTransform
      })

      const create: CompactionCheckpointPort["create"] = (record) =>
        sql`
          INSERT INTO compaction_checkpoints (
            checkpoint_id, agent_id, session_id, subroutine_id,
            created_at, summary, first_kept_turn_id, first_kept_message_id,
            tokens_before, tokens_after, details_json
          ) VALUES (
            ${record.checkpointId},
            ${record.agentId},
            ${record.sessionId},
            ${record.subroutineId},
            ${sqlInstant.encode(record.createdAt)},
            ${record.summary},
            ${record.firstKeptTurnId},
            ${record.firstKeptMessageId},
            ${record.tokensBefore},
            ${record.tokensAfter},
            ${record.detailsJson}
          )
        `.unprepared.pipe(
          Effect.asVoid,
          Effect.tapDefect(Effect.logError),
          Effect.orDie
        )

      const getLatestForSubroutine: CompactionCheckpointPort["getLatestForSubroutine"] = (
        agentId,
        sessionId,
        subroutineId
      ) =>
        findLatest({ agentId, sessionId, subroutineId }).pipe(
          Effect.flatMap(
            Option.match({
              onNone: () => Effect.succeed(null),
              onSome: (row) => Effect.succeed(decodeRow(row))
            })
          ),
          Effect.tapDefect(Effect.logError),
          Effect.orDie
        )

      const listBySession: CompactionCheckpointPort["listBySession"] = (sessionId) =>
        findBySession({ sessionId }).pipe(
          Effect.map((rows) => rows.map(decodeRow)),
          Effect.tapDefect(Effect.logError),
          Effect.orDie
        )

      return { create, getLatestForSubroutine, listBySession } as const
    })
  }
) {
  static layer = Layer.effect(this, this.make)
}
