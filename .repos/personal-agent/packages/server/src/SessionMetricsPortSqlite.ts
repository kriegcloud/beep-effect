import type { SessionId } from "@template/domain/ids"
import type {
  SessionCompactionPolicy,
  SessionMetricsPort,
  SessionMetricsRecord
} from "@template/domain/ports"
import { DateTime, Effect, Layer, Option, Schema, ServiceMap } from "effect"
import * as SqlClient from "effect/unstable/sql/SqlClient"
import * as SqlSchema from "effect/unstable/sql/SqlSchema"

import { sqlInstant } from "./persistence/SqlCodecs.js"

const MetricsRowSchema = Schema.Struct({
  session_id: Schema.String,
  token_count: Schema.Number,
  tool_result_bytes: Schema.Number,
  artifact_bytes: Schema.Number,
  file_touches: Schema.Number,
  last_compaction_at: Schema.Union([Schema.String, Schema.Null]),
  updated_at: Schema.String
})
type MetricsRow = typeof MetricsRowSchema.Type

const SessionIdRequest = Schema.Struct({ sessionId: Schema.String })

const toMetricsRecord = (row: MetricsRow): SessionMetricsRecord => ({
  sessionId: row.session_id as SessionId,
  tokenCount: row.token_count,
  toolResultBytes: row.tool_result_bytes,
  artifactBytes: row.artifact_bytes,
  fileTouches: row.file_touches,
  lastCompactionAt: row.last_compaction_at === null
    ? null
    : sqlInstant.decode(row.last_compaction_at),
  updatedAt: sqlInstant.decode(row.updated_at)
})

const shouldTriggerByThresholds = (
  metrics: SessionMetricsRecord,
  policy: SessionCompactionPolicy
): boolean => {
  const tokenPressure = policy.tokenCapacity > 0
    ? metrics.tokenCount / policy.tokenCapacity
    : 0
  return tokenPressure >= policy.tokenPressureRatio
    || metrics.toolResultBytes >= policy.toolResultBytes
    || metrics.artifactBytes >= policy.artifactBytes
    || metrics.fileTouches >= policy.fileTouches
}

const isWithinCooldown = (
  metrics: SessionMetricsRecord,
  policy: SessionCompactionPolicy
): boolean => {
  if (metrics.lastCompactionAt === null) {
    return false
  }
  const elapsedMillis = DateTime.toEpochMillis(policy.now)
    - DateTime.toEpochMillis(metrics.lastCompactionAt)
  return elapsedMillis < policy.cooldownSeconds * 1_000
}

export class SessionMetricsPortSqlite extends ServiceMap.Service<SessionMetricsPortSqlite>()(
  "server/SessionMetricsPortSqlite",
  {
    make: Effect.gen(function*() {
      const sql = yield* SqlClient.SqlClient

      const findBySession = SqlSchema.findOneOption({
        Request: SessionIdRequest,
        Result: MetricsRowSchema,
        execute: ({ sessionId }) =>
          sql`
            SELECT
              session_id,
              token_count,
              tool_result_bytes,
              artifact_bytes,
              file_touches,
              last_compaction_at,
              updated_at
            FROM session_metrics
            WHERE session_id = ${sessionId}
            LIMIT 1
          `.withoutTransform
      })

      const increment: SessionMetricsPort["increment"] = (sessionId, deltas) =>
        sql`
          INSERT INTO session_metrics (
            session_id,
            token_count,
            tool_result_bytes,
            artifact_bytes,
            file_touches,
            last_compaction_at,
            updated_at
          ) VALUES (
            ${sessionId},
            ${Math.max(0, Math.floor(deltas.tokenCount ?? 0))},
            ${Math.max(0, Math.floor(deltas.toolResultBytes ?? 0))},
            ${Math.max(0, Math.floor(deltas.artifactBytes ?? 0))},
            ${Math.max(0, Math.floor(deltas.fileTouches ?? 0))},
            ${deltas.lastCompactionAt === undefined || deltas.lastCompactionAt === null
              ? null
              : sqlInstant.encode(deltas.lastCompactionAt)},
            CURRENT_TIMESTAMP
          )
          ON CONFLICT(session_id) DO UPDATE SET
            token_count = MAX(0, session_metrics.token_count + excluded.token_count),
            tool_result_bytes = MAX(0, session_metrics.tool_result_bytes + excluded.tool_result_bytes),
            artifact_bytes = MAX(0, session_metrics.artifact_bytes + excluded.artifact_bytes),
            file_touches = MAX(0, session_metrics.file_touches + excluded.file_touches),
            last_compaction_at = CASE
              WHEN excluded.last_compaction_at IS NOT NULL THEN excluded.last_compaction_at
              ELSE session_metrics.last_compaction_at
            END,
            updated_at = CURRENT_TIMESTAMP
        `.unprepared.pipe(
          Effect.asVoid,
          Effect.tapDefect(Effect.logError),
          Effect.orDie
        )

      const get: SessionMetricsPort["get"] = (sessionId) =>
        findBySession({ sessionId }).pipe(
          Effect.map(
            Option.match({
              onNone: () => null,
              onSome: toMetricsRecord
            })
          ),
          Effect.tapDefect(Effect.logError),
          Effect.orDie
        )

      const shouldTriggerCompaction: SessionMetricsPort["shouldTriggerCompaction"] = (
        sessionId,
        policy
      ) =>
        get(sessionId).pipe(
          Effect.map((metrics) => {
            if (metrics === null) {
              return false
            }
            if (!shouldTriggerByThresholds(metrics, policy)) {
              return false
            }
            return !isWithinCooldown(metrics, policy)
          })
        )

      return {
        increment,
        get,
        shouldTriggerCompaction
      } satisfies SessionMetricsPort
    })
  }
) {
  static layer = Layer.effect(this, this.make)
}
