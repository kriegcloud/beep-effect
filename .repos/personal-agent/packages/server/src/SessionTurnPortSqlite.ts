import { Effect, Layer, Option, Schema, ServiceMap } from "effect"
import * as SqlClient from "effect/unstable/sql/SqlClient"
import * as SqlSchema from "effect/unstable/sql/SqlSchema"
import { ContextWindowExceeded, SessionNotFound } from "../../domain/src/errors.js"
import type { SessionId, TurnId } from "../../domain/src/ids.js"
import {
  ContentBlock as ContentBlockSchema,
  type SessionState,
  type SessionTurnPort,
  type TurnRecord
} from "../../domain/src/ports.js"
import { AgentRole, ModelFinishReason } from "../../domain/src/status.js"
import { sqlInstant, sqlJsonColumn } from "./persistence/SqlCodecs.js"

const SessionRowSchema = Schema.Struct({
  session_id: Schema.String,
  conversation_id: Schema.String,
  token_capacity: Schema.Number,
  tokens_used: Schema.Number
})
type SessionRow = typeof SessionRowSchema.Type

const TurnRowSchema = Schema.Struct({
  turn_id: Schema.String,
  session_id: Schema.String,
  conversation_id: Schema.String,
  turn_index: Schema.Number,
  participant_role: AgentRole,
  participant_agent_id: Schema.Union([Schema.String, Schema.Null]),
  message_id: Schema.String,
  message_content: Schema.String,
  content_blocks_json: Schema.String,
  model_finish_reason: Schema.Union([ModelFinishReason, Schema.Null]),
  model_usage_json: Schema.Union([Schema.String, Schema.Null]),
  created_at: Schema.String
})
type TurnRow = typeof TurnRowSchema.Type

const SessionIdRequest = Schema.Struct({ sessionId: Schema.String })
const TurnIdRequest = Schema.Struct({ turnId: Schema.String })

const contentBlocksJson = sqlJsonColumn(Schema.Array(ContentBlockSchema))
const decodeSessionRowSchema = Schema.decodeUnknownSync(SessionRowSchema)
const decodeTurnRowSchema = Schema.decodeUnknownSync(TurnRowSchema)

export class SessionTurnPortSqlite extends ServiceMap.Service<SessionTurnPortSqlite>()(
  "server/SessionTurnPortSqlite",
  {
    make: Effect.gen(function*() {
      const sql = yield* SqlClient.SqlClient

      const findSessionRowById = SqlSchema.findOneOption({
        Request: SessionIdRequest,
        Result: SessionRowSchema,
        execute: ({ sessionId }) =>
          sql`
            SELECT
              session_id,
              conversation_id,
              token_capacity,
              tokens_used
            FROM sessions
            WHERE session_id = ${sessionId}
            LIMIT 1
          `.withoutTransform
      })

      const findTurnById = SqlSchema.findOneOption({
        Request: TurnIdRequest,
        Result: Schema.Struct({ turn_id: Schema.String }),
        execute: ({ turnId }) =>
          sql`
            SELECT turn_id
            FROM turns
            WHERE turn_id = ${turnId}
            LIMIT 1
          `.withoutTransform
      })

      const findNextTurnIndex = SqlSchema.findOne({
        Request: SessionIdRequest,
        Result: Schema.Struct({ next_turn_index: Schema.Number }),
        execute: ({ sessionId }) =>
          sql`
            SELECT COALESCE(MAX(turn_index) + 1, 0) AS next_turn_index
            FROM turns
            WHERE session_id = ${sessionId}
          `.withoutTransform
      })

      const findTurnsBySessionId = SqlSchema.findAll({
        Request: SessionIdRequest,
        Result: TurnRowSchema,
        execute: ({ sessionId }) =>
          sql`
            SELECT
              turn_id,
              session_id,
              conversation_id,
              turn_index,
              participant_role,
              participant_agent_id,
              message_id,
              message_content,
              content_blocks_json,
              model_finish_reason,
              model_usage_json,
              created_at
            FROM turns
            WHERE session_id = ${sessionId}
            ORDER BY turn_index ASC, turn_id ASC
          `.withoutTransform
      })

      const readSession = (sessionId: SessionId) =>
        findSessionRowById({ sessionId }).pipe(
          Effect.map(
            Option.match({
              onNone: () => null,
              onSome: decodeSessionRow
            })
          ),
          Effect.tapDefect(Effect.logError),
          Effect.orDie
        )

      const startSession: SessionTurnPort["startSession"] = (state) =>
        sql`
          INSERT INTO sessions (
            session_id,
            conversation_id,
            token_capacity,
            tokens_used,
            updated_at
          ) VALUES (
            ${state.sessionId},
            ${state.conversationId},
            ${state.tokenCapacity},
            ${state.tokensUsed},
            CURRENT_TIMESTAMP
          )
          ON CONFLICT(session_id) DO UPDATE SET
            conversation_id = excluded.conversation_id,
            token_capacity = excluded.token_capacity,
            tokens_used = excluded.tokens_used,
            updated_at = CURRENT_TIMESTAMP
        `.unprepared.pipe(
          Effect.asVoid,
          Effect.tapDefect(Effect.logError),
          Effect.orDie
        )

      const appendTurn: SessionTurnPort["appendTurn"] = (turn) =>
        sql.withTransaction(
          Effect.gen(function*() {
            const existing = yield* findTurnById({ turnId: turn.turnId }).pipe(
              Effect.tapDefect(Effect.logError),
              Effect.orDie
            )
            if (Option.isSome(existing)) {
              return
            }

            const nextTurnIndex = yield* findNextTurnIndex({ sessionId: turn.sessionId }).pipe(
              Effect.map((row) => row.next_turn_index),
              Effect.tapDefect(Effect.logError),
              Effect.orDie
            )

            yield* sql`
              INSERT INTO turns (
                turn_id,
                session_id,
                conversation_id,
                turn_index,
                participant_role,
                participant_agent_id,
                message_id,
                message_content,
                content_blocks_json,
                model_finish_reason,
                model_usage_json,
                created_at
              ) VALUES (
                ${turn.turnId},
                ${turn.sessionId},
                ${turn.conversationId},
                ${nextTurnIndex},
                ${turn.participantRole},
                ${turn.participantAgentId},
                ${turn.message.messageId},
                ${turn.message.content},
                ${contentBlocksJson.encode(turn.message.contentBlocks)},
                ${turn.modelFinishReason},
                ${turn.modelUsageJson},
                ${sqlInstant.encode(turn.createdAt)}
              )
            `.unprepared
          })
        ).pipe(
          Effect.asVoid,
          Effect.tapDefect(Effect.logError),
          Effect.orDie
        )

      const deleteSession: SessionTurnPort["deleteSession"] = (sessionId) =>
        sql.withTransaction(
          Effect.gen(function*() {
            yield* sql`
              DELETE FROM turns
              WHERE session_id = ${sessionId}
            `.unprepared

            yield* sql`
              DELETE FROM sessions
              WHERE session_id = ${sessionId}
            `.unprepared
          })
        ).pipe(
          Effect.asVoid,
          Effect.tapDefect(Effect.logError),
          Effect.orDie
        )

      const updateContextWindow: SessionTurnPort["updateContextWindow"] = (
        sessionId,
        deltaTokens
      ) =>
        sql.withTransaction(
          Effect.gen(function*() {
            const current = yield* readSession(sessionId)
            if (current === null) {
              return yield* new SessionNotFound({ sessionId })
            }

            const attemptedTokensUsed = Math.max(current.tokensUsed + deltaTokens, 0)
            if (attemptedTokensUsed > current.tokenCapacity) {
              return yield* new ContextWindowExceeded({
                sessionId,
                tokenCapacity: current.tokenCapacity,
                attemptedTokensUsed
              })
            }

            yield* sql`
              UPDATE sessions
              SET
                tokens_used = ${attemptedTokensUsed},
                updated_at = CURRENT_TIMESTAMP
              WHERE session_id = ${sessionId}
            `.unprepared
          })
        ).pipe(
          Effect.asVoid,
          Effect.catch((error: unknown) =>
            error instanceof SessionNotFound || error instanceof ContextWindowExceeded
              ? Effect.fail(error)
              : Effect.die(error)
          )
        )

      const getSession = (sessionId: SessionId) =>
        readSession(sessionId).pipe(
          Effect.map((state) => state === null ? null : state),
          Effect.tapDefect(Effect.logError),
          Effect.orDie
        )

      const listTurns = (sessionId: SessionId) =>
        findTurnsBySessionId({ sessionId }).pipe(
          Effect.map((rows) => rows.map(decodeTurnRow)),
          Effect.tapDefect(Effect.logError),
          Effect.orDie
        )

      return {
        startSession,
        appendTurn,
        deleteSession,
        updateContextWindow,
        getSession,
        listTurns
      } as const
    })
  }
) {
  static layer = Layer.effect(this, this.make)
}

const decodeSessionRow = (row: SessionRow): SessionState => {
  const decoded = decodeSessionRowSchema(row)
  return {
    sessionId: decoded.session_id as SessionId,
    conversationId: decoded.conversation_id as SessionState["conversationId"],
    tokenCapacity: decoded.token_capacity,
    tokensUsed: decoded.tokens_used
  }
}

const decodeTurnRow = (row: TurnRow): TurnRecord => {
  const decoded = decodeTurnRowSchema(row)
  return {
    turnId: decoded.turn_id as TurnId,
    sessionId: decoded.session_id as TurnRecord["sessionId"],
    conversationId: decoded.conversation_id as TurnRecord["conversationId"],
    turnIndex: decoded.turn_index,
    participantRole: decoded.participant_role,
    participantAgentId: decoded.participant_agent_id as TurnRecord["participantAgentId"],
    message: {
      messageId: decoded.message_id as TurnRecord["message"]["messageId"],
      role: decoded.participant_role,
      content: decoded.message_content,
      contentBlocks: contentBlocksJson.decode(decoded.content_blocks_json)
    },
    modelFinishReason: decoded.model_finish_reason,
    modelUsageJson: decoded.model_usage_json,
    createdAt: sqlInstant.decode(decoded.created_at)
  }
}
