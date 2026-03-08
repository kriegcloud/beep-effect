import { describe, expect, it } from "@effect/vitest"
import type { AgentId, ScheduledExecutionId, ScheduleId } from "@template/domain/ids"
import type { Instant, ScheduledExecutionRecord, ScheduleRecord } from "@template/domain/ports"
import { DateTime, Effect } from "effect"
import { SchedulePortMemory } from "../src/SchedulePortMemory.js"

describe("SchedulePortMemory", () => {
  it.effect("caps catch-up windows with catch-up policy", () =>
    Effect.gen(function*() {
      const schedulePort = yield* SchedulePortMemory
      const now = instant("2026-02-24T12:00:00.000Z")
      const schedule = makeIntervalSchedule({
        scheduleId: "schedule:catch-up" as ScheduleId,
        nextExecutionAt: DateTime.add(now, { minutes: -5 }),
        allowsCatchUp: true,
        catchUpWindowSeconds: 180,
        maxCatchUpRunsPerTick: 2
      })

      yield* schedulePort.upsertSchedule(schedule)
      const due = yield* schedulePort.listDue(now)

      expect(due).toHaveLength(2)
      expect(due.map((record) => record.triggerSource)).toEqual([
        "IntervalTick",
        "IntervalTick"
      ])
      expect(due.map((record) => DateTime.toEpochMillis(record.dueAt))).toEqual([
        DateTime.toEpochMillis(DateTime.add(now, { minutes: -3 })),
        DateTime.toEpochMillis(DateTime.add(now, { minutes: -2 }))
      ])
    }).pipe(Effect.provide(SchedulePortMemory.layer)))

  it.effect("returns only the latest due window when catch-up is disabled", () =>
    Effect.gen(function*() {
      const schedulePort = yield* SchedulePortMemory
      const now = instant("2026-02-24T12:00:00.000Z")
      const schedule = makeIntervalSchedule({
        scheduleId: "schedule:no-catch-up" as ScheduleId,
        nextExecutionAt: DateTime.add(now, { minutes: -5 }),
        allowsCatchUp: false
      })

      yield* schedulePort.upsertSchedule(schedule)
      const due = yield* schedulePort.listDue(now)

      expect(due).toHaveLength(1)
      expect(due[0].triggerSource).toBe("IntervalTick")
      expect(DateTime.toEpochMillis(due[0].dueAt)).toBe(DateTime.toEpochMillis(now))
    }).pipe(Effect.provide(SchedulePortMemory.layer)))

  it.effect("advances interval schedules after recording an execution", () =>
    Effect.gen(function*() {
      const schedulePort = yield* SchedulePortMemory
      const now = instant("2026-02-24T12:00:00.000Z")
      const schedule = makeIntervalSchedule({
        scheduleId: "schedule:advance" as ScheduleId,
        nextExecutionAt: now
      })

      yield* schedulePort.upsertSchedule(schedule)
      const dueNow = yield* schedulePort.listDue(now)
      expect(dueNow).toHaveLength(1)

      yield* schedulePort.recordExecution(
        makeExecutionRecord({
          executionId: "execution:advance" as ScheduledExecutionId,
          scheduleId: schedule.scheduleId,
          dueAt: dueNow[0].dueAt,
          startedAt: now,
          endedAt: DateTime.add(now, { seconds: 5 })
        })
      )

      const beforeNextWindow = yield* schedulePort.listDue(
        DateTime.add(now, { seconds: 30 })
      )
      expect(beforeNextWindow).toHaveLength(0)

      const atNextWindow = yield* schedulePort.listDue(
        DateTime.add(now, { seconds: 60 })
      )
      expect(atNextWindow).toHaveLength(1)
      expect(DateTime.toEpochMillis(atNextWindow[0].dueAt)).toBe(
        DateTime.toEpochMillis(DateTime.add(now, { seconds: 60 }))
      )
    }).pipe(Effect.provide(SchedulePortMemory.layer)))

  it.effect("auto-disables one-shot schedules after first execution", () =>
    Effect.gen(function*() {
      const schedulePort = yield* SchedulePortMemory
      const now = instant("2026-02-24T12:00:00.000Z")
      const schedule = makeIntervalSchedule({
        scheduleId: "schedule:one-shot" as ScheduleId,
        nextExecutionAt: now,
        autoDisableAfterRun: true
      })

      yield* schedulePort.upsertSchedule(schedule)
      const dueNow = yield* schedulePort.listDue(now)
      expect(dueNow).toHaveLength(1)

      yield* schedulePort.recordExecution(
        makeExecutionRecord({
          executionId: "execution:one-shot" as ScheduledExecutionId,
          scheduleId: schedule.scheduleId,
          dueAt: dueNow[0].dueAt,
          startedAt: now,
          endedAt: now
        })
      )

      const afterExecution = yield* schedulePort.listDue(
        DateTime.add(now, { minutes: 5 })
      )
      expect(afterExecution).toHaveLength(0)
    }).pipe(Effect.provide(SchedulePortMemory.layer)))
})

const instant = (input: string): Instant => DateTime.fromDateUnsafe(new Date(input))

const makeIntervalSchedule = (
  overrides: Partial<ScheduleRecord>
): ScheduleRecord => ({
  scheduleId: "schedule:default" as ScheduleId,
  ownerAgentId: "agent:default" as AgentId,
  recurrencePattern: {
    label: "Every minute",
    cronExpression: null,
    intervalSeconds: 60
  },
  trigger: { _tag: "IntervalTrigger" },
  action: { kind: "Log" },
  scheduleStatus: "ScheduleActive",
  concurrencyPolicy: "ConcurrencyAllow",
  allowsCatchUp: true,
  autoDisableAfterRun: false,
  catchUpWindowSeconds: 3600,
  maxCatchUpRunsPerTick: 10,
  lastExecutionAt: null,
  nextExecutionAt: instant("2026-02-24T12:00:00.000Z"),
  ...overrides
})

const makeExecutionRecord = (
  input:
    & Pick<ScheduledExecutionRecord, "executionId" | "scheduleId" | "dueAt" | "startedAt">
    & Partial<Omit<ScheduledExecutionRecord, "executionId" | "scheduleId" | "dueAt" | "startedAt">>
): ScheduledExecutionRecord => ({
  executionId: input.executionId,
  scheduleId: input.scheduleId,
  dueAt: input.dueAt,
  triggerSource: input.triggerSource ?? "IntervalTick",
  outcome: input.outcome ?? "ExecutionSucceeded",
  startedAt: input.startedAt,
  endedAt: input.endedAt ?? input.startedAt,
  skipReason: input.skipReason ?? null
})
