import type { ScheduleId } from "@template/domain/ids"
import { ScheduleValidationError } from "@template/domain/errors"
import type { ScheduledExecutionId } from "@template/domain/ids"
import type {
  DueScheduleRecord,
  ScheduleClaim,
  ScheduledExecutionRecord,
  SchedulePort,
  ScheduleRecord
} from "@template/domain/ports"
import { DateTime, Effect, HashMap, Layer, Option, Ref, ServiceMap } from "effect"
import {
  dueWindows,
  validateRecurrencePattern,
  executionFinishedAt,
  nextExecutionAfterRecord,
  triggerSourceFromTrigger
} from "./scheduler/ScheduleDue.js"

export class SchedulePortMemory extends ServiceMap.Service<SchedulePortMemory>()("server/SchedulePortMemory", {
  make: Effect.gen(function*() {
    const schedules = yield* Ref.make(HashMap.empty<ScheduleId, ScheduleRecord>())
    const executions = yield* Ref.make(Array<ScheduledExecutionRecord>())
    const claims = yield* Ref.make(HashMap.empty<ScheduledExecutionId, ScheduleClaim>())

    const upsertSchedule: SchedulePort["upsertSchedule"] = (schedule) =>
      Effect.gen(function*() {
        const validationError = validateRecurrencePattern(schedule)
        if (validationError !== null) {
          return yield* new ScheduleValidationError({
            scheduleId: schedule.scheduleId,
            reason: validationError
          })
        }

        yield* Ref.update(schedules, HashMap.set(schedule.scheduleId, schedule))
      })

    const listDue: SchedulePort["listDue"] = (now) =>
      Ref.get(schedules).pipe(
        Effect.map((map) =>
          Array.from(HashMap.values(map)).flatMap((schedule) =>
            dueWindows(schedule, now).map(
              (dueAt): DueScheduleRecord => ({
                schedule,
                dueAt,
                triggerSource: triggerSourceFromTrigger(schedule.trigger)
              })
            )
          )
        )
      )

    const claimDue: SchedulePort["claimDue"] = ({ now, leaseDurationSeconds, leaseOwner, maxClaims }) =>
      Effect.gen(function*() {
        const due = yield* listDue(now)
        const sorted = [...due].sort((left, right) =>
          DateTime.toEpochMillis(left.dueAt) - DateTime.toEpochMillis(right.dueAt)
        )
        const boundedMaxClaims = maxClaims === undefined
          ? Number.POSITIVE_INFINITY
          : Math.max(0, Math.floor(maxClaims))
        const currentClaims = yield* Ref.get(claims)
        const activeClaims = new Map<ScheduleId, ReadonlyArray<ScheduleClaim>>()
        for (const claim of HashMap.values(currentClaims)) {
          if (DateTime.toEpochMillis(claim.leaseExpiresAt) <= DateTime.toEpochMillis(now)) {
            continue
          }
          const existing = activeClaims.get(claim.scheduleId) ?? []
          activeClaims.set(claim.scheduleId, [...existing, claim])
        }

        const claimed: Array<ScheduleClaim> = []

        for (const candidate of sorted) {
          if (claimed.length >= boundedMaxClaims) {
            break
          }

          const schedule = candidate.schedule
          const existingForSchedule = activeClaims.get(schedule.scheduleId) ?? []

          if (schedule.concurrencyPolicy === "ConcurrencyForbid" && existingForSchedule.length > 0) {
            yield* recordExecution({
              executionId: crypto.randomUUID() as ScheduledExecutionId,
              scheduleId: schedule.scheduleId,
              dueAt: candidate.dueAt,
              triggerSource: candidate.triggerSource,
              outcome: "ExecutionSkipped",
              startedAt: now,
              endedAt: now,
              skipReason: "ConcurrencyForbid"
            })
            continue
          }

          if (schedule.concurrencyPolicy === "ConcurrencyReplace" && existingForSchedule.length > 0) {
            for (const existingClaim of existingForSchedule) {
              yield* recordExecution({
                executionId: existingClaim.executionId,
                scheduleId: existingClaim.scheduleId,
                dueAt: existingClaim.dueAt,
                triggerSource: existingClaim.triggerSource,
                outcome: "ExecutionSkipped",
                startedAt: existingClaim.startedAt,
                endedAt: now,
                skipReason: "ConcurrencyReplace"
              })
              yield* Ref.update(claims, HashMap.remove(existingClaim.executionId))
            }
            activeClaims.set(schedule.scheduleId, [])
          }

          const executionId = crypto.randomUUID() as ScheduledExecutionId
          const leaseExpiresAt = DateTime.add(now, {
            seconds: Math.max(leaseDurationSeconds, 1)
          })
          const claim: ScheduleClaim = {
            executionId,
            scheduleId: schedule.scheduleId,
            ownerAgentId: schedule.ownerAgentId,
            dueAt: candidate.dueAt,
            triggerSource: candidate.triggerSource,
            startedAt: now,
            action: schedule.action,
            leaseOwner,
            leaseExpiresAt
          }
          yield* Ref.update(claims, HashMap.set(executionId, claim))
          activeClaims.set(schedule.scheduleId, [...(activeClaims.get(schedule.scheduleId) ?? []), claim])
          claimed.push(claim)
        }

        return claimed as ReadonlyArray<ScheduleClaim>
      })

    const completeClaim: SchedulePort["completeClaim"] = ({
      endedAt,
      executionId,
      leaseOwner,
      outcome
    }) =>
      Effect.gen(function*() {
        const claim = yield* Ref.get(claims).pipe(
          Effect.map((all) => Option.getOrNull(HashMap.get(all, executionId)))
        )
        if (claim === null) {
          return false
        }
        if (claim.leaseOwner !== leaseOwner) {
          return false
        }
        if (DateTime.toEpochMillis(claim.leaseExpiresAt) <= DateTime.toEpochMillis(endedAt)) {
          return false
        }

        yield* Ref.update(claims, HashMap.remove(executionId))
        yield* recordExecution({
          executionId: claim.executionId,
          scheduleId: claim.scheduleId,
          dueAt: claim.dueAt,
          triggerSource: claim.triggerSource,
          outcome,
          startedAt: claim.startedAt,
          endedAt,
          skipReason: outcome === "ExecutionSkipped" ? "ConcurrencyForbid" : null
        })
        return true
      })

    const renewClaim: SchedulePort["renewClaim"] = ({
      executionId,
      leaseOwner,
      now,
      leaseDurationSeconds
    }) =>
      Effect.gen(function*() {
        const claim = yield* Ref.get(claims).pipe(
          Effect.map((all) => Option.getOrNull(HashMap.get(all, executionId)))
        )
        if (claim === null) {
          return false
        }
        if (claim.leaseOwner !== leaseOwner) {
          return false
        }
        if (DateTime.toEpochMillis(claim.leaseExpiresAt) <= DateTime.toEpochMillis(now)) {
          return false
        }

        const nextClaim: ScheduleClaim = {
          ...claim,
          leaseExpiresAt: DateTime.add(now, {
            seconds: Math.max(leaseDurationSeconds, 1)
          })
        }
        yield* Ref.update(claims, HashMap.set(executionId, nextClaim))
        return true
      })

    const hasExecution: SchedulePort["hasExecution"] = (executionId) =>
      Ref.get(executions).pipe(
        Effect.map((records) => records.some((record) => record.executionId === executionId))
      )

    const recordExecution: SchedulePort["recordExecution"] = (record) =>
      Effect.all([
        Ref.update(executions, (all) => {
          const filtered = all.filter((existing) => existing.executionId !== record.executionId)
          return [...filtered, record]
        }),
        Ref.update(schedules, (map) => {
          const current = HashMap.get(map, record.scheduleId)
          if (Option.isNone(current)) {
            return map
          }

          if (current.value.autoDisableAfterRun) {
            return HashMap.set(map, record.scheduleId, {
              ...current.value,
              lastExecutionAt: executionFinishedAt(record),
              scheduleStatus: "ScheduleDisabled",
              nextExecutionAt: null
            })
          }

          return HashMap.set(map, record.scheduleId, {
            ...current.value,
            lastExecutionAt: executionFinishedAt(record),
            nextExecutionAt: nextExecutionAfterRecord(current.value, record)
          })
        })
      ]).pipe(Effect.asVoid)

    const getSchedule = (scheduleId: ScheduleId) =>
      Ref.get(schedules).pipe(
        Effect.map((map) => Option.getOrNull(HashMap.get(map, scheduleId)))
      )

    const listExecutions = () => Ref.get(executions)

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
}) {
  static layer = Layer.effect(this, this.make)
}
