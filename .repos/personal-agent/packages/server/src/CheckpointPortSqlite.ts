import {
  CheckpointAlreadyDecided,
  CheckpointExpired,
  CheckpointNotFound
} from "@template/domain/errors"
import type { AgentId, ChannelId, CheckpointId, PolicyId, SessionId } from "@template/domain/ids"
import type { CheckpointPort, CheckpointRecord } from "@template/domain/ports"
import { CheckpointAction, CheckpointStatus } from "@template/domain/status"
import { DateTime, Effect, Layer, Option, Schema, ServiceMap } from "effect"
import * as SqlClient from "effect/unstable/sql/SqlClient"
import * as SqlSchema from "effect/unstable/sql/SqlSchema"

const CheckpointRowSchema = Schema.Struct({
  checkpoint_id: Schema.String,
  agent_id: Schema.String,
  session_id: Schema.String,
  channel_id: Schema.String,
  turn_id: Schema.String,
  action: CheckpointAction,
  policy_id: Schema.Union([Schema.String, Schema.Null]),
  reason: Schema.String,
  payload_json: Schema.String,
  payload_hash: Schema.String,
  status: CheckpointStatus,
  requested_at: Schema.String,
  decided_at: Schema.Union([Schema.String, Schema.Null]),
  decided_by: Schema.Union([Schema.String, Schema.Null]),
  consumed_at: Schema.Union([Schema.String, Schema.Null]),
  consumed_by: Schema.Union([Schema.String, Schema.Null]),
  expires_at: Schema.Union([Schema.String, Schema.Null])
})
type CheckpointRow = typeof CheckpointRowSchema.Type

const CheckpointIdRequest = Schema.Struct({ checkpointId: Schema.String })
import { sqlInstant, sqlInstantNullable } from "./persistence/SqlCodecs.js"

const decodeCheckpointRow = (row: CheckpointRow): CheckpointRecord => ({
  checkpointId: row.checkpoint_id as CheckpointId,
  agentId: row.agent_id as AgentId,
  sessionId: row.session_id as SessionId,
  channelId: row.channel_id as ChannelId,
  turnId: row.turn_id,
  action: row.action,
  policyId: row.policy_id as PolicyId | null,
  reason: row.reason,
  payloadJson: row.payload_json,
  payloadHash: row.payload_hash,
  status: row.status,
  requestedAt: sqlInstant.decode(row.requested_at),
  decidedAt: sqlInstantNullable.decode(row.decided_at),
  decidedBy: row.decided_by,
  consumedAt: sqlInstantNullable.decode(row.consumed_at),
  consumedBy: row.consumed_by,
  expiresAt: sqlInstantNullable.decode(row.expires_at)
})

export class CheckpointPortSqlite extends ServiceMap.Service<CheckpointPortSqlite>()(
  "server/CheckpointPortSqlite",
  {
    make: Effect.gen(function*() {
      const sql = yield* SqlClient.SqlClient

      const findCheckpointById = SqlSchema.findOneOption({
        Request: CheckpointIdRequest,
        Result: CheckpointRowSchema,
        execute: ({ checkpointId }) =>
          sql`
            SELECT
              checkpoint_id, agent_id, session_id, channel_id, turn_id,
              action, policy_id, reason, payload_json, payload_hash,
              status, requested_at, decided_at, decided_by, consumed_at, consumed_by, expires_at
            FROM checkpoints
            WHERE checkpoint_id = ${checkpointId}
            LIMIT 1
          `.withoutTransform
      })

      const create: CheckpointPort["create"] = (record) =>
        sql`
          INSERT INTO checkpoints (
            checkpoint_id, agent_id, session_id, channel_id, turn_id,
            action, policy_id, reason, payload_json, payload_hash,
            status, requested_at, decided_at, decided_by, consumed_at, consumed_by, expires_at
          ) VALUES (
            ${record.checkpointId},
            ${record.agentId},
            ${record.sessionId},
            ${record.channelId},
            ${record.turnId},
            ${record.action},
            ${record.policyId},
            ${record.reason},
            ${record.payloadJson},
            ${record.payloadHash},
            ${record.status},
            ${sqlInstant.encode(record.requestedAt)},
            ${sqlInstantNullable.encode(record.decidedAt)},
            ${record.decidedBy},
            ${sqlInstantNullable.encode(record.consumedAt)},
            ${record.consumedBy},
            ${sqlInstantNullable.encode(record.expiresAt)}
          )
        `.unprepared.pipe(
          Effect.asVoid,
          Effect.tapDefect(Effect.logError),
          Effect.orDie
        )

      const deleteByChannel: CheckpointPort["deleteByChannel"] = (channelId) =>
        sql`
          DELETE FROM checkpoints
          WHERE channel_id = ${channelId}
        `.unprepared.pipe(
          Effect.asVoid,
          Effect.tapDefect(Effect.logError),
          Effect.orDie
        )

      const get: CheckpointPort["get"] = (checkpointId) =>
        findCheckpointById({ checkpointId }).pipe(
          Effect.flatMap(
            Option.match({
              onNone: () => Effect.succeed(null),
              onSome: (row) => {
                const record = decodeCheckpointRow(row)
                // Lazily mark expired pending checkpoints
                if (
                  record.status === "Pending" &&
                  record.expiresAt !== null
                ) {
                  return DateTime.now.pipe(
                    Effect.flatMap((now) => {
                      if (DateTime.isGreaterThan(now, record.expiresAt!)) {
                        return sql`
                          UPDATE checkpoints
                          SET status = 'Expired'
                          WHERE checkpoint_id = ${checkpointId}
                            AND status = 'Pending'
                        `.unprepared.pipe(
                          Effect.as({ ...record, status: "Expired" as CheckpointStatus })
                        )
                      }
                      return Effect.succeed(record)
                    })
                  )
                }
                return Effect.succeed(record)
              }
            })
          ),
          Effect.tapDefect(Effect.logError),
          Effect.orDie
        )

      const decidePending: CheckpointPort["decidePending"] = (
        checkpointId,
        decision,
        decidedBy,
        decidedAt
      ) =>
        Effect.gen(function*() {
          const atStr = sqlInstant.encode(decidedAt)
          const updatedRows = yield* sql`
            UPDATE checkpoints
            SET status = ${decision},
                decided_at = ${atStr},
                decided_by = ${decidedBy}
            WHERE checkpoint_id = ${checkpointId}
              AND status = 'Pending'
              AND (expires_at IS NULL OR expires_at > ${atStr})
            RETURNING checkpoint_id
          `.withoutTransform.pipe(Effect.orDie)

          if (updatedRows.length > 0) {
            return
          }

          const after = yield* get(checkpointId)
          if (after === null) {
            return yield* new CheckpointNotFound({ checkpointId })
          }
          if (after.status === "Pending") {
            if (after.expiresAt !== null && DateTime.isLessThanOrEqualTo(after.expiresAt, decidedAt)) {
              yield* sql`
                UPDATE checkpoints
                SET status = 'Expired'
                WHERE checkpoint_id = ${checkpointId}
                  AND status = 'Pending'
              `.unprepared.pipe(Effect.orDie)
              return yield* new CheckpointExpired({ checkpointId })
            }
            // Lost race to another transition that has not been observed yet.
            return yield* new CheckpointAlreadyDecided({
              checkpointId,
              currentStatus: "Pending"
            })
          }
          if (after.status === "Expired") {
            return yield* new CheckpointExpired({ checkpointId })
          }
          return yield* new CheckpointAlreadyDecided({
            checkpointId,
            currentStatus: after.status
          })
        }).pipe(
          Effect.asVoid,
          Effect.tapDefect(Effect.logError)
        )

      const consumeApproved: CheckpointPort["consumeApproved"] = (
        checkpointId,
        consumedBy,
        consumedAt
      ) =>
        Effect.gen(function*() {
          const atStr = sqlInstant.encode(consumedAt)
          const updatedRows = yield* sql`
            UPDATE checkpoints
            SET status = 'Consumed',
                consumed_at = ${atStr},
                consumed_by = ${consumedBy}
            WHERE checkpoint_id = ${checkpointId}
              AND status = 'Approved'
            RETURNING checkpoint_id
          `.withoutTransform.pipe(Effect.orDie)

          if (updatedRows.length > 0) {
            return
          }

          const after = yield* get(checkpointId)
          if (after === null) {
            return yield* new CheckpointNotFound({ checkpointId })
          }
          if (after.status === "Expired") {
            return yield* new CheckpointExpired({ checkpointId })
          }
          return yield* new CheckpointAlreadyDecided({
            checkpointId,
            currentStatus: after.status
          })
        }).pipe(
          Effect.asVoid,
          Effect.tapDefect(Effect.logError)
        )

      const transition: CheckpointPort["transition"] = (
        checkpointId,
        toStatus,
        decidedBy,
        decidedAt
      ) => {
        switch (toStatus) {
          case "Approved":
          case "Rejected":
          case "Deferred":
            return decidePending(checkpointId, toStatus, decidedBy, decidedAt)
          case "Consumed":
            return consumeApproved(checkpointId, decidedBy, decidedAt)
          default:
            return Effect.die(new Error(`unsupported_checkpoint_transition:${toStatus}`))
        }
      }

      const listPending: CheckpointPort["listPending"] = (agentId) =>
        Effect.gen(function*() {
          const now = yield* DateTime.now
          const nowStr = sqlInstant.encode(now)
          const rows = agentId
            ? yield* sql`
                SELECT
                  checkpoint_id, agent_id, session_id, channel_id, turn_id,
                  action, policy_id, reason, payload_json, payload_hash,
                  status, requested_at, decided_at, decided_by, consumed_at, consumed_by, expires_at
                FROM checkpoints
                WHERE status = 'Pending'
                  AND agent_id = ${agentId}
                  AND (expires_at IS NULL OR expires_at > ${nowStr})
                ORDER BY requested_at ASC
              `.withoutTransform
            : yield* sql`
                SELECT
                  checkpoint_id, agent_id, session_id, channel_id, turn_id,
                  action, policy_id, reason, payload_json, payload_hash,
                  status, requested_at, decided_at, decided_by, consumed_at, consumed_by, expires_at
                FROM checkpoints
                WHERE status = 'Pending'
                  AND (expires_at IS NULL OR expires_at > ${nowStr})
                ORDER BY requested_at ASC
              `.withoutTransform

          return rows.map((row: any) => {
            const decoded = Schema.decodeUnknownSync(CheckpointRowSchema)(row)
            return decodeCheckpointRow(decoded)
          })
        }).pipe(
          Effect.tapDefect(Effect.logError),
          Effect.orDie
        )

      return {
        create,
        get,
        deleteByChannel,
        decidePending,
        consumeApproved,
        transition,
        listPending
      } as const
    })
  }
) {
  static layer = Layer.effect(this, this.make)
}
