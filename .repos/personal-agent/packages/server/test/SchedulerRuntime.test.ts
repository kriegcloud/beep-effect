import { describe, expect, it } from "@effect/vitest"
import type { AgentId, ScheduleId } from "@template/domain/ids"
import type { Instant, SchedulePort, ScheduleRecord, ScheduleSkipReason } from "@template/domain/ports"
import { DateTime, Effect, Layer } from "effect"
import { SchedulePortTag } from "../src/PortTags.js"
import { SchedulePortMemory } from "../src/SchedulePortMemory.js"
import { SchedulerRuntime } from "../src/SchedulerRuntime.js"

describe("SchedulerRuntime", () => {
  it.effect("allow policy permits overlapping claims", () =>
    Effect.gen(function*() {
      const schedulePort = yield* SchedulePortMemory
      const runtime = yield* SchedulerRuntime
      const now = instant("2026-02-24T12:00:00.000Z")
      const schedule = makeSchedule({
        scheduleId: "schedule:allow" as ScheduleId,
        concurrencyPolicy: "ConcurrencyAllow",
        nextExecutionAt: now
      })

      yield* schedulePort.upsertSchedule(schedule)

      const first = yield* runtime.claimDue(now)
      const second = yield* runtime.claimDue(now)

      expect(first).toHaveLength(1)
      expect(second).toHaveLength(1)
      expect(first[0].scheduleId).toBe(schedule.scheduleId)
      expect(second[0].scheduleId).toBe(schedule.scheduleId)
    }).pipe(Effect.provide(runtimeTestLayer)))

  it.effect("forbid policy skips when a run is already in flight", () =>
    Effect.gen(function*() {
      const schedulePort = yield* SchedulePortMemory
      const runtime = yield* SchedulerRuntime
      const now = instant("2026-02-24T12:00:00.000Z")
      const schedule = makeSchedule({
        scheduleId: "schedule:forbid" as ScheduleId,
        concurrencyPolicy: "ConcurrencyForbid",
        nextExecutionAt: now
      })

      yield* schedulePort.upsertSchedule(schedule)

      const first = yield* runtime.claimDue(now)
      const second = yield* runtime.claimDue(now)
      const executions = yield* schedulePort.listExecutions()

      expect(first).toHaveLength(1)
      expect(second).toHaveLength(0)
      expect(executions.some((record) =>
        record.scheduleId === schedule.scheduleId &&
        record.outcome === "ExecutionSkipped" &&
        record.skipReason === "ConcurrencyForbid"
      )).toBe(true)
    }).pipe(Effect.provide(runtimeTestLayer)))

  it.effect("serializes concurrent claimDue calls to preserve forbid invariants", () =>
    Effect.gen(function*() {
      const schedulePort = yield* SchedulePortMemory
      const runtime = yield* SchedulerRuntime
      const now = instant("2026-02-24T12:00:00.000Z")
      const schedule = makeSchedule({
        scheduleId: "schedule:forbid-race" as ScheduleId,
        concurrencyPolicy: "ConcurrencyForbid",
        nextExecutionAt: now
      })

      yield* schedulePort.upsertSchedule(schedule)

      const [left, right] = yield* Effect.all(
        [runtime.claimDue(now), runtime.claimDue(now)],
        { concurrency: "unbounded" }
      )

      const totalClaimed = left.length + right.length
      const executions = yield* schedulePort.listExecutions()

      expect(totalClaimed).toBe(1)
      expect(executions.some((record) =>
        record.scheduleId === schedule.scheduleId &&
        record.outcome === "ExecutionSkipped" &&
        record.skipReason === "ConcurrencyForbid"
      )).toBe(true)
    }).pipe(Effect.provide(runtimeTestLayer)))

  it.effect("replace policy marks old run replaced and blocks its completion", () =>
    Effect.gen(function*() {
      const schedulePort = yield* SchedulePortMemory
      const runtime = yield* SchedulerRuntime
      const now = instant("2026-02-24T12:00:00.000Z")
      const schedule = makeSchedule({
        scheduleId: "schedule:replace" as ScheduleId,
        concurrencyPolicy: "ConcurrencyReplace",
        nextExecutionAt: now
      })

      yield* schedulePort.upsertSchedule(schedule)

      const first = yield* runtime.claimDue(now)
      const second = yield* runtime.claimDue(now)
      expect(first).toHaveLength(1)
      expect(second).toHaveLength(1)

      const completedReplaced = yield* runtime.completeExecution(
        first[0],
        "ExecutionSucceeded",
        now
      )
      const executions = yield* schedulePort.listExecutions()

      expect(completedReplaced).toBe(false)
      expect(executions.some((record) =>
        record.executionId === first[0].executionId &&
        record.outcome === "ExecutionSkipped" &&
        record.skipReason === "ConcurrencyReplace"
      )).toBe(true)
    }).pipe(Effect.provide(runtimeTestLayer)))

  it.effect("manual trigger skips inactive schedules", () =>
    Effect.gen(function*() {
      const schedulePort = yield* SchedulePortMemory
      const runtime = yield* SchedulerRuntime
      const now = instant("2026-02-24T12:00:00.000Z")
      const schedule = makeSchedule({
        scheduleId: "schedule:paused" as ScheduleId,
        scheduleStatus: "SchedulePaused",
        nextExecutionAt: now
      })

      yield* schedulePort.upsertSchedule(schedule)
      const ticket = yield* runtime.triggerNow(schedule, now)
      const executions = yield* schedulePort.listExecutions()

      expect(ticket).toBeNull()
      expect(executions.some((record) =>
        record.scheduleId === schedule.scheduleId &&
        record.triggerSource === "Manual" &&
        record.outcome === "ExecutionSkipped" &&
        record.skipReason === "ManualTriggerInactive"
      )).toBe(true)
    }).pipe(Effect.provide(runtimeTestLayer)))

  it.effect("manual trigger claims active schedules", () =>
    Effect.gen(function*() {
      const schedulePort = yield* SchedulePortMemory
      const runtime = yield* SchedulerRuntime
      const now = instant("2026-02-24T12:00:00.000Z")
      const schedule = makeSchedule({
        scheduleId: "schedule:manual-active" as ScheduleId,
        scheduleStatus: "ScheduleActive",
        concurrencyPolicy: "ConcurrencyAllow",
        nextExecutionAt: now
      })

      yield* schedulePort.upsertSchedule(schedule)
      const ticket = yield* runtime.triggerNow(schedule, now)

      expect(ticket).not.toBeNull()
      expect(ticket?.triggerSource).toBe("Manual")
      expect(ticket?.scheduleId).toBe(schedule.scheduleId)
    }).pipe(Effect.provide(runtimeTestLayer)))

  it.effect("completion is idempotent", () =>
    Effect.gen(function*() {
      const schedulePort = yield* SchedulePortMemory
      const runtime = yield* SchedulerRuntime
      const now = instant("2026-02-24T12:00:00.000Z")
      const schedule = makeSchedule({
        scheduleId: "schedule:idempotent" as ScheduleId,
        scheduleStatus: "ScheduleActive",
        concurrencyPolicy: "ConcurrencyAllow",
        nextExecutionAt: now
      })

      yield* schedulePort.upsertSchedule(schedule)
      const ticket = yield* runtime.triggerNow(schedule, now)
      expect(ticket).not.toBeNull()

      const first = yield* runtime.completeExecution(
        ticket!,
        "ExecutionSucceeded",
        DateTime.add(now, { seconds: 5 })
      )
      const second = yield* runtime.completeExecution(
        ticket!,
        "ExecutionSucceeded",
        DateTime.add(now, { seconds: 10 })
      )

      expect(first).toBe(true)
      expect(second).toBe(false)
    }).pipe(Effect.provide(runtimeTestLayer)))

  it("enforces canonical skip reason typing", () => {
    const validSkipReason: ScheduleSkipReason = "ConcurrencyForbid"
    expect(validSkipReason).toBe("ConcurrencyForbid")

    // @ts-expect-error invalid skip reason must fail type-check
    const invalidSkipReason: ScheduleSkipReason = "NotAValidReason"
    void invalidSkipReason
  })
})

const schedulePortLayer = SchedulePortMemory.layer
const schedulePortTagLayer = Layer.effect(
  SchedulePortTag,
  Effect.gen(function*() {
    return (yield* SchedulePortMemory) as SchedulePort
  })
).pipe(Layer.provide(schedulePortLayer))

const runtimeTestLayer = Layer.mergeAll(
  schedulePortLayer,
  schedulePortTagLayer,
  SchedulerRuntime.layer.pipe(
    Layer.provide(schedulePortTagLayer)
  )
)

const instant = (input: string): Instant => DateTime.fromDateUnsafe(new Date(input))

const makeSchedule = (overrides: Partial<ScheduleRecord>): ScheduleRecord => ({
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
