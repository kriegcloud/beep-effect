import { describe, expect, it } from "@effect/vitest"
import type { AgentId, ScheduledExecutionId, ScheduleId } from "@template/domain/ids"
import type { Instant, ScheduledExecutionRecord, ScheduleRecord } from "@template/domain/ports"
import { DateTime, Effect, Layer } from "effect"
import { rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import * as DomainMigrator from "../src/persistence/DomainMigrator.js"
import * as SqliteRuntime from "../src/persistence/SqliteRuntime.js"
import { SchedulePortSqlite } from "../src/SchedulePortSqlite.js"

describe("SchedulePortSqlite", () => {
  it.effect("caps catch-up windows with catch-up policy", () => {
    const dbPath = testDatabasePath("catch-up")
    const layer = makeSchedulePortLayer(dbPath)

    return Effect.gen(function*() {
      const schedulePort = yield* SchedulePortSqlite
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
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("advances interval schedules after recording an execution", () => {
    const dbPath = testDatabasePath("advance")
    const layer = makeSchedulePortLayer(dbPath)

    return Effect.gen(function*() {
      const schedulePort = yield* SchedulePortSqlite
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
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("auto-disables one-shot schedules after first execution", () => {
    const dbPath = testDatabasePath("one-shot")
    const layer = makeSchedulePortLayer(dbPath)

    return Effect.gen(function*() {
      const schedulePort = yield* SchedulePortSqlite
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

      const scheduleAfter = yield* schedulePort.getSchedule(schedule.scheduleId)
      const afterExecution = yield* schedulePort.listDue(
        DateTime.add(now, { minutes: 5 })
      )

      expect(scheduleAfter?.scheduleStatus).toBe("ScheduleDisabled")
      expect(afterExecution).toHaveLength(0)
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

})

const makeSchedulePortLayer = (dbPath: string) => {
  const sqliteLayer = SqliteRuntime.layer({ filename: dbPath })
  const migrationLayer = DomainMigrator.layer.pipe(
    Layer.provide(sqliteLayer),
    Layer.orDie
  )
  const sqlInfrastructureLayer = Layer.mergeAll(sqliteLayer, migrationLayer)

  return Layer.mergeAll(
    sqlInfrastructureLayer,
    SchedulePortSqlite.layer.pipe(Layer.provide(sqlInfrastructureLayer))
  )
}

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

const testDatabasePath = (name: string): string =>
  join(tmpdir(), `personal-agent-${name}-${crypto.randomUUID()}.sqlite`)

const cleanupDatabase = (path: string) =>
  Effect.sync(() => {
    rmSync(path, { force: true })
  })
