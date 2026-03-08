import { ScheduleValidationError } from "@template/domain/errors"
import { DateTime, Effect, Layer, Option, Schema, ServiceMap } from "effect"
import * as SqlClient from "effect/unstable/sql/SqlClient"
import type { SqlError } from "effect/unstable/sql/SqlError"
import * as SqlSchema from "effect/unstable/sql/SqlSchema"
import type { ScheduledExecutionId, ScheduleId } from "../../domain/src/ids.js"
import {
  type DueScheduleRecord,
  type BackgroundAction,
  type ScheduleClaim,
  type ScheduledExecutionRecord,
  type SchedulePort,
  type ScheduleRecord,
  ScheduleSkipReason,
  type Trigger,
  TriggerSource
} from "../../domain/src/ports.js"
import { ConcurrencyPolicy, ExecutionOutcome, ScheduleStatus } from "../../domain/src/status.js"
import {
  dueWindows,
  validateRecurrencePattern,
  executionFinishedAt,
  nextExecutionAfterRecord,
  triggerSourceFromTrigger
} from "./scheduler/ScheduleDue.js"
import {
  decodeBackgroundActionPayloadJson,
  encodeBackgroundActionPayloadJson
} from "./scheduler/ScheduleActionCodec.js"

const ScheduleRowSchema = Schema.Struct({
  schedule_id: Schema.String,
  owner_agent_id: Schema.String,
  recurrence_label: Schema.String,
  cron_expression: Schema.Union([Schema.String, Schema.Null]),
  interval_seconds: Schema.Union([Schema.Number, Schema.Null]),
  trigger_tag: Schema.Literals(["CronTrigger", "IntervalTrigger", "EventTrigger"]),
  action_kind: Schema.String,
  action_payload_json: Schema.String,
  schedule_status: ScheduleStatus,
  concurrency_policy: ConcurrencyPolicy,
  allows_catch_up: Schema.Number,
  auto_disable_after_run: Schema.Number,
  catch_up_window_seconds: Schema.Number,
  max_catch_up_runs_per_tick: Schema.Number,
  last_execution_at: Schema.Union([Schema.String, Schema.Null]),
  next_execution_at: Schema.Union([Schema.String, Schema.Null])
})
type ScheduleRow = typeof ScheduleRowSchema.Type

const ExecutionRowSchema = Schema.Struct({
  execution_id: Schema.String,
  schedule_id: Schema.String,
  due_at: Schema.String,
  trigger_source: TriggerSource,
  outcome: ExecutionOutcome,
  started_at: Schema.String,
  ended_at: Schema.Union([Schema.String, Schema.Null]),
  skip_reason: Schema.Union([ScheduleSkipReason, Schema.Null])
})
type ExecutionRow = typeof ExecutionRowSchema.Type

const ClaimRowSchema = Schema.Struct({
  execution_id: Schema.String,
  schedule_id: Schema.String,
  owner_agent_id: Schema.String,
  due_at: Schema.String,
  trigger_source: TriggerSource,
  action_payload_json: Schema.String,
  started_at: Schema.String,
  lease_owner: Schema.String,
  lease_expires_at: Schema.String
})
type ClaimRow = typeof ClaimRowSchema.Type

const ScheduleIdRequest = Schema.Struct({ scheduleId: Schema.String })
const DueAtRequest = Schema.Struct({ dueAtIso: Schema.String })
const EmptyRequest = Schema.Struct({})
import { sqlInstant, sqlInstantNullable } from "./persistence/SqlCodecs.js"

export class SchedulePortSqlite extends ServiceMap.Service<SchedulePortSqlite>()(
  "server/SchedulePortSqlite",
  {
    make: Effect.gen(function*() {
      const sql = yield* SqlClient.SqlClient

      const findScheduleById = SqlSchema.findOneOption({
        Request: ScheduleIdRequest,
        Result: ScheduleRowSchema,
        execute: ({ scheduleId }) =>
          sql`
            SELECT
              schedule_id,
              owner_agent_id,
              recurrence_label,
              cron_expression,
              interval_seconds,
              trigger_tag,
              action_kind,
              action_payload_json,
              schedule_status,
              concurrency_policy,
              allows_catch_up,
              auto_disable_after_run,
              catch_up_window_seconds,
              max_catch_up_runs_per_tick,
              last_execution_at,
              next_execution_at
            FROM schedules
            WHERE schedule_id = ${scheduleId}
            LIMIT 1
          `.withoutTransform
      })

      const findDueSchedules = SqlSchema.findAll({
        Request: DueAtRequest,
        Result: ScheduleRowSchema,
        execute: ({ dueAtIso }) =>
          sql`
            SELECT
              schedule_id,
              owner_agent_id,
              recurrence_label,
              cron_expression,
              interval_seconds,
              trigger_tag,
              action_kind,
              action_payload_json,
              schedule_status,
              concurrency_policy,
              allows_catch_up,
              auto_disable_after_run,
              catch_up_window_seconds,
              max_catch_up_runs_per_tick,
              last_execution_at,
              next_execution_at
            FROM schedules
            WHERE schedule_status = 'ScheduleActive'
              AND next_execution_at IS NOT NULL
              AND next_execution_at <= ${dueAtIso}
              AND (cron_expression IS NOT NULL OR interval_seconds IS NOT NULL)
          `.withoutTransform
      })

      const findAllExecutions = SqlSchema.findAll({
        Request: EmptyRequest,
        Result: ExecutionRowSchema,
        execute: () =>
          sql`
            SELECT
              execution_id,
              schedule_id,
              due_at,
              trigger_source,
              outcome,
              started_at,
              ended_at,
              skip_reason
            FROM scheduled_executions
            ORDER BY created_at ASC, execution_id ASC
          `.withoutTransform
      })

      const findExecutionById = SqlSchema.findOneOption({
        Request: Schema.Struct({ executionId: Schema.String }),
        Result: ExecutionRowSchema,
        execute: ({ executionId }) =>
          sql`
            SELECT
              execution_id,
              schedule_id,
              due_at,
              trigger_source,
              outcome,
              started_at,
              ended_at,
              skip_reason
            FROM scheduled_executions
            WHERE execution_id = ${executionId}
            LIMIT 1
          `.withoutTransform
      })

      const findClaimByExecutionId = SqlSchema.findOneOption({
        Request: Schema.Struct({ executionId: Schema.String }),
        Result: ClaimRowSchema,
        execute: ({ executionId }) =>
          sql`
            SELECT
              execution_id,
              schedule_id,
              owner_agent_id,
              due_at,
              trigger_source,
              action_payload_json,
              started_at,
              lease_owner,
              lease_expires_at
            FROM schedule_execution_claims
            WHERE execution_id = ${executionId}
            LIMIT 1
          `.withoutTransform
      })

      const getScheduleRow = (
        scheduleId: ScheduleId
      ): Effect.Effect<ScheduleRecord | null, SqlError | Schema.SchemaError> =>
        findScheduleById({ scheduleId }).pipe(
          Effect.map(
            Option.match({
              onNone: () => null,
              onSome: decodeScheduleRow
            })
          )
        )

      const upsertSchedule: SchedulePort["upsertSchedule"] = (schedule) =>
        Effect.gen(function*() {
          const validationError = validateRecurrencePattern(schedule)
          if (validationError !== null) {
            return yield* new ScheduleValidationError({
              scheduleId: schedule.scheduleId,
              reason: validationError
            })
          }

          yield* sql`
            INSERT INTO schedules (
              schedule_id,
              owner_agent_id,
              recurrence_label,
              cron_expression,
              interval_seconds,
              trigger_tag,
              action_kind,
              action_payload_json,
              schedule_status,
              concurrency_policy,
              allows_catch_up,
              auto_disable_after_run,
              catch_up_window_seconds,
              max_catch_up_runs_per_tick,
              last_execution_at,
              next_execution_at
            ) VALUES (
              ${schedule.scheduleId},
              ${schedule.ownerAgentId},
              ${schedule.recurrencePattern.label},
              ${schedule.recurrencePattern.cronExpression},
              ${schedule.recurrencePattern.intervalSeconds},
              ${schedule.trigger._tag},
              ${schedule.action.kind},
              ${encodeBackgroundActionPayloadJson(schedule.action)},
              ${schedule.scheduleStatus},
              ${schedule.concurrencyPolicy},
              ${toSqlBoolean(schedule.allowsCatchUp)},
              ${toSqlBoolean(schedule.autoDisableAfterRun)},
              ${schedule.catchUpWindowSeconds},
              ${schedule.maxCatchUpRunsPerTick},
              ${sqlInstantNullable.encode(schedule.lastExecutionAt)},
              ${sqlInstantNullable.encode(schedule.nextExecutionAt)}
            )
            ON CONFLICT(schedule_id) DO UPDATE SET
              owner_agent_id = excluded.owner_agent_id,
              recurrence_label = excluded.recurrence_label,
              cron_expression = excluded.cron_expression,
              interval_seconds = excluded.interval_seconds,
              trigger_tag = excluded.trigger_tag,
              action_kind = excluded.action_kind,
              action_payload_json = excluded.action_payload_json,
              schedule_status = excluded.schedule_status,
              concurrency_policy = excluded.concurrency_policy,
              allows_catch_up = excluded.allows_catch_up,
              auto_disable_after_run = excluded.auto_disable_after_run,
              catch_up_window_seconds = excluded.catch_up_window_seconds,
              max_catch_up_runs_per_tick = excluded.max_catch_up_runs_per_tick,
              last_execution_at = excluded.last_execution_at,
              next_execution_at = excluded.next_execution_at
          `.unprepared
        }).pipe(
          Effect.asVoid,
          Effect.catch((error) =>
            error instanceof ScheduleValidationError
              ? Effect.fail(error)
              : Effect.die(error)
          )
        )

      const listDue: SchedulePort["listDue"] = (now) =>
        findDueSchedules({ dueAtIso: sqlInstant.encode(now) }).pipe(
          Effect.map((rows) =>
            rows.flatMap((row) => {
              const schedule = decodeScheduleRow(row)
              return dueWindows(schedule, now).map(
                (dueAt): DueScheduleRecord => ({
                  schedule,
                  dueAt,
                  triggerSource: triggerSourceFromTrigger(schedule.trigger)
                })
              )
            })
          ),
          Effect.orDie
        )

      const applyScheduleExecutionUpdate = (record: ScheduledExecutionRecord) =>
        Effect.gen(function*() {
          const current = yield* getScheduleRow(record.scheduleId)
          if (current === null) {
            return
          }

          if (current.autoDisableAfterRun) {
            yield* sql`
              UPDATE schedules
              SET
                last_execution_at = ${sqlInstantNullable.encode(executionFinishedAt(record))},
                schedule_status = 'ScheduleDisabled',
                next_execution_at = NULL
              WHERE schedule_id = ${record.scheduleId}
            `.unprepared
            return
          }

          yield* sql`
            UPDATE schedules
            SET
              last_execution_at = ${sqlInstantNullable.encode(executionFinishedAt(record))},
              next_execution_at = ${sqlInstantNullable.encode(nextExecutionAfterRecord(current, record))}
            WHERE schedule_id = ${record.scheduleId}
          `.unprepared
        })

      const insertExecutionRecord = (record: ScheduledExecutionRecord) =>
        sql`
          INSERT OR REPLACE INTO scheduled_executions (
            execution_id,
            schedule_id,
            due_at,
            trigger_source,
            outcome,
            started_at,
            ended_at,
            skip_reason
          ) VALUES (
            ${record.executionId},
            ${record.scheduleId},
            ${sqlInstant.encode(record.dueAt)},
            ${record.triggerSource},
            ${record.outcome},
            ${sqlInstant.encode(record.startedAt)},
            ${sqlInstantNullable.encode(record.endedAt)},
            ${record.skipReason}
          )
        `.unprepared

      const recordExecution: SchedulePort["recordExecution"] = (record) =>
        sql.withTransaction(
          Effect.gen(function*() {
            yield* insertExecutionRecord(record)
            yield* applyScheduleExecutionUpdate(record)
          })
        ).pipe(
          Effect.asVoid,
          Effect.orDie
        )

      const claimDue: SchedulePort["claimDue"] = ({
        leaseDurationSeconds,
        leaseOwner,
        now,
        maxClaims
      }) =>
        sql.withTransaction(
          Effect.gen(function*() {
            const due = yield* listDue(now)
            const sorted = [...due].sort((left, right) => compareDueCandidates(left, right))
            const claimed: Array<ScheduleClaim> = []
            const boundedMaxClaims = maxClaims === undefined
              ? Number.POSITIVE_INFINITY
              : Math.max(0, Math.floor(maxClaims))

            for (const candidate of sorted) {
              if (claimed.length >= boundedMaxClaims) {
                break
              }

              const activeRows: Array<ClaimRow> = yield* sql`
                SELECT
                  execution_id,
                  schedule_id,
                  owner_agent_id,
                  due_at,
                  trigger_source,
                  action_payload_json,
                  started_at,
                  lease_owner,
                  lease_expires_at
                FROM schedule_execution_claims
                WHERE schedule_id = ${candidate.schedule.scheduleId}
                  AND lease_expires_at > ${sqlInstant.encode(now)}
                ORDER BY started_at ASC, execution_id ASC
              `.withoutTransform.pipe(
                Effect.map((rows) => rows.map((row: any) => Schema.decodeUnknownSync(ClaimRowSchema)(row)))
              )

              const activeClaims = activeRows.map(decodeClaimRow)

              if (candidate.schedule.concurrencyPolicy === "ConcurrencyForbid" && activeClaims.length > 0) {
                const skippedRecord: ScheduledExecutionRecord = {
                  executionId: crypto.randomUUID() as ScheduledExecutionId,
                  scheduleId: candidate.schedule.scheduleId,
                  dueAt: candidate.dueAt,
                  triggerSource: candidate.triggerSource,
                  outcome: "ExecutionSkipped",
                  startedAt: now,
                  endedAt: now,
                  skipReason: "ConcurrencyForbid"
                }
                yield* insertExecutionRecord(skippedRecord)
                yield* applyScheduleExecutionUpdate(skippedRecord)
                continue
              }

              if (candidate.schedule.concurrencyPolicy === "ConcurrencyReplace" && activeClaims.length > 0) {
                for (const active of activeClaims) {
                  yield* sql`
                    DELETE FROM schedule_execution_claims
                    WHERE execution_id = ${active.executionId}
                  `.unprepared
                  const replacedRecord: ScheduledExecutionRecord = {
                    executionId: active.executionId,
                    scheduleId: active.scheduleId,
                    dueAt: active.dueAt,
                    triggerSource: active.triggerSource,
                    outcome: "ExecutionSkipped",
                    startedAt: active.startedAt,
                    endedAt: now,
                    skipReason: "ConcurrencyReplace"
                  }
                  yield* insertExecutionRecord(replacedRecord)
                  yield* applyScheduleExecutionUpdate(replacedRecord)
                }
              }

              const executionId = crypto.randomUUID() as ScheduledExecutionId
              const leaseExpiresAt = DateTime.add(now, {
                seconds: Math.max(leaseDurationSeconds, 1)
              })
              const claim: ScheduleClaim = {
                executionId,
                scheduleId: candidate.schedule.scheduleId,
                ownerAgentId: candidate.schedule.ownerAgentId,
                dueAt: candidate.dueAt,
                triggerSource: candidate.triggerSource,
                startedAt: now,
                action: candidate.schedule.action,
                leaseOwner,
                leaseExpiresAt
              }

              yield* sql`
                INSERT OR REPLACE INTO schedule_execution_claims (
                  execution_id,
                  schedule_id,
                  owner_agent_id,
                  due_at,
                  trigger_source,
                  action_payload_json,
                  started_at,
                  lease_owner,
                  lease_expires_at
                ) VALUES (
                  ${claim.executionId},
                  ${claim.scheduleId},
                  ${claim.ownerAgentId},
                  ${sqlInstant.encode(claim.dueAt)},
                  ${claim.triggerSource},
                  ${encodeBackgroundActionPayloadJson(claim.action)},
                  ${sqlInstant.encode(claim.startedAt)},
                  ${claim.leaseOwner},
                  ${sqlInstant.encode(claim.leaseExpiresAt)}
                )
              `.unprepared

              claimed.push(claim)
            }

            return claimed as ReadonlyArray<ScheduleClaim>
          })
        ).pipe(Effect.orDie)

      const completeClaim: SchedulePort["completeClaim"] = ({
        endedAt,
        executionId,
        leaseOwner,
        outcome
      }) =>
        sql.withTransaction(
          Effect.gen(function*() {
            const claimOption = yield* findClaimByExecutionId({ executionId }).pipe(
              Effect.orDie
            )
            if (Option.isNone(claimOption)) {
              return false
            }

            const claim = decodeClaimRow(claimOption.value)
            if (claim.leaseOwner !== leaseOwner) {
              return false
            }
            if (DateTime.toEpochMillis(claim.leaseExpiresAt) <= DateTime.toEpochMillis(endedAt)) {
              return false
            }

            yield* sql`
              DELETE FROM schedule_execution_claims
              WHERE execution_id = ${executionId}
            `.unprepared

            const record: ScheduledExecutionRecord = {
              executionId: claim.executionId,
              scheduleId: claim.scheduleId,
              dueAt: claim.dueAt,
              triggerSource: claim.triggerSource,
              outcome,
              startedAt: claim.startedAt,
              endedAt,
              skipReason: null
            }

            yield* insertExecutionRecord(record)
            yield* applyScheduleExecutionUpdate(record)
            return true
          })
        ).pipe(Effect.orDie)

      const renewClaim: SchedulePort["renewClaim"] = ({
        executionId,
        leaseOwner,
        now,
        leaseDurationSeconds
      }) =>
        sql.withTransaction(
          Effect.gen(function*() {
            const claimOption = yield* findClaimByExecutionId({ executionId }).pipe(
              Effect.orDie
            )
            if (Option.isNone(claimOption)) {
              return false
            }

            const claim = decodeClaimRow(claimOption.value)
            if (claim.leaseOwner !== leaseOwner) {
              return false
            }
            if (DateTime.toEpochMillis(claim.leaseExpiresAt) <= DateTime.toEpochMillis(now)) {
              return false
            }

            const renewedLeaseExpiresAt = DateTime.add(now, {
              seconds: Math.max(leaseDurationSeconds, 1)
            })
            yield* sql`
              UPDATE schedule_execution_claims
              SET lease_expires_at = ${sqlInstant.encode(renewedLeaseExpiresAt)}
              WHERE execution_id = ${executionId}
                AND lease_owner = ${leaseOwner}
                AND lease_expires_at > ${sqlInstant.encode(now)}
            `.unprepared
            return true
          })
        ).pipe(Effect.orDie)

      const hasExecution: SchedulePort["hasExecution"] = (executionId) =>
        findExecutionById({ executionId }).pipe(
          Effect.map(Option.isSome),
          Effect.orDie
        )

      const getSchedule = (scheduleId: ScheduleId) =>
        getScheduleRow(scheduleId).pipe(
          Effect.map((row) => row === null ? null : row),
          Effect.orDie
        )

      const listExecutions = () =>
        findAllExecutions({}).pipe(
          Effect.map((rows) => rows.map(decodeExecutionRow)),
          Effect.orDie
        )

      return {
        upsertSchedule,
        listDue,
        recordExecution,
        claimDue,
        completeClaim,
        renewClaim,
        hasExecution,
        getSchedule,
        listExecutions
      } as const
    })
  }
) {
  static layer = Layer.effect(this, this.make)
}

const decodeScheduleRow = (row: ScheduleRow): ScheduleRecord => ({
  scheduleId: row.schedule_id as ScheduleId,
  ownerAgentId: row.owner_agent_id as ScheduleRecord["ownerAgentId"],
  recurrencePattern: {
    label: row.recurrence_label,
    cronExpression: row.cron_expression,
    intervalSeconds: row.interval_seconds
  },
  trigger: decodeTrigger(row.trigger_tag),
  action: decodeScheduleAction(row),
  scheduleStatus: row.schedule_status,
  concurrencyPolicy: row.concurrency_policy,
  allowsCatchUp: row.allows_catch_up === 1,
  autoDisableAfterRun: row.auto_disable_after_run === 1,
  catchUpWindowSeconds: row.catch_up_window_seconds,
  maxCatchUpRunsPerTick: row.max_catch_up_runs_per_tick,
  lastExecutionAt: sqlInstantNullable.decode(row.last_execution_at),
  nextExecutionAt: sqlInstantNullable.decode(row.next_execution_at)
})

const decodeExecutionRow = (row: ExecutionRow): ScheduledExecutionRecord => ({
  executionId: row.execution_id as ScheduledExecutionId,
  scheduleId: row.schedule_id as ScheduleId,
  dueAt: sqlInstant.decode(row.due_at),
  triggerSource: row.trigger_source,
  outcome: row.outcome,
  startedAt: sqlInstant.decode(row.started_at),
  endedAt: sqlInstantNullable.decode(row.ended_at),
  skipReason: row.skip_reason
})

const decodeClaimRow = (row: ClaimRow): ScheduleClaim => ({
  executionId: row.execution_id as ScheduledExecutionId,
  scheduleId: row.schedule_id as ScheduleId,
  ownerAgentId: row.owner_agent_id as ScheduleClaim["ownerAgentId"],
  dueAt: sqlInstant.decode(row.due_at),
  triggerSource: row.trigger_source,
  startedAt: sqlInstant.decode(row.started_at),
  action: decodeBackgroundActionPayloadJson(row.action_payload_json) ?? {
    kind: "Unknown",
    actionRef: "decode_error:claim_action_payload"
  },
  leaseOwner: row.lease_owner,
  leaseExpiresAt: sqlInstant.decode(row.lease_expires_at)
})

const decodeScheduleAction = (row: ScheduleRow): BackgroundAction => {
  const decoded = decodeBackgroundActionPayloadJson(row.action_payload_json)
  if (decoded !== null) {
    return decoded
  }
  return {
    kind: "Unknown",
    actionRef: `decode_error:${row.action_kind}`
  }
}

const decodeTrigger = (tag: ScheduleRow["trigger_tag"]): Trigger => {
  switch (tag) {
    case "CronTrigger": {
      return { _tag: "CronTrigger" }
    }
    case "EventTrigger": {
      return { _tag: "EventTrigger" }
    }
    case "IntervalTrigger":
    default: {
      return { _tag: "IntervalTrigger" }
    }
  }
}

const compareDueCandidates = (
  left: DueScheduleRecord,
  right: DueScheduleRecord
): number => {
  const dueDiff = DateTime.toEpochMillis(left.dueAt) - DateTime.toEpochMillis(right.dueAt)
  if (dueDiff !== 0) {
    return dueDiff
  }
  return String(left.schedule.scheduleId).localeCompare(String(right.schedule.scheduleId))
}

const toSqlBoolean = (value: boolean): number => value ? 1 : 0
