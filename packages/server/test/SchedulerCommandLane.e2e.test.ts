import { describe, expect, it } from "@effect/vitest"
import { NodeServices } from "@effect/platform-node"
import type { AgentId, ScheduleId } from "@template/domain/ids"
import type {
  ChannelPort,
  GovernancePort,
  Instant,
  SchedulePort,
  ScheduleRecord,
  SessionTurnPort
} from "@template/domain/ports"
import { DateTime, Effect, Layer } from "effect"
import { SingleRunner } from "effect/unstable/cluster"
import { rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { GovernancePortSqlite } from "../src/GovernancePortSqlite.js"
import * as DomainMigrator from "../src/persistence/DomainMigrator.js"
import * as SqliteRuntime from "../src/persistence/SqliteRuntime.js"
import { SandboxRuntime } from "../src/safety/SandboxRuntime.js"
import {
  ChannelPortTag,
  GovernancePortTag,
  SchedulePortTag,
  SessionTurnPortTag
} from "../src/PortTags.js"
import { SchedulePortSqlite } from "../src/SchedulePortSqlite.js"
import { SCHEDULER_COMMAND_LANE_ID } from "../src/CommandLanes.js"
import { SchedulerActionExecutor } from "../src/scheduler/SchedulerActionExecutor.js"
import { layer as CliRuntimeLocalLayer } from "../src/tools/cli/CliRuntimeLocal.js"
import { layer as CommandBackendLocalLayer } from "../src/tools/command/CommandBackendLocal.js"
import { CommandRuntime } from "../src/tools/command/CommandRuntime.js"
import { CommandHooksDefaultLayer } from "../src/tools/command/hooks/CommandHooksDefault.js"
import {
  layer as SchedulerCommandLayer,
  SchedulerCommandEntity,
  type SchedulerExecutePayload
} from "../src/scheduler/SchedulerCommandEntity.js"
import { SchedulerDispatchLoop } from "../src/scheduler/SchedulerDispatchLoop.js"
import {
  SubroutineControlPlane,
  type DispatchRequest
} from "../src/memory/SubroutineControlPlane.js"
import { SchedulerRuntime } from "../src/SchedulerRuntime.js"

describe("Scheduler command lane E2E", () => {
  it.effect("dispatches due schedules through persisted cluster command lane", () => {
    const dbPath = testDatabasePath("lane-dispatch")
    const layer = makeSchedulerLaneLayer(dbPath)
    const now = instant("2026-02-24T12:00:00.000Z")
    const schedule = makeSchedule({
      scheduleId: "schedule:lane-dispatch" as ScheduleId,
      nextExecutionAt: now
    })

    return Effect.gen(function*() {
      const schedulePort = yield* SchedulePortSqlite
      const governance = yield* GovernancePortSqlite
      const dispatchLoop = yield* SchedulerDispatchLoop

      yield* schedulePort.upsertSchedule(schedule)
      const summary = yield* dispatchLoop.dispatchDue(now)
      const executions = yield* schedulePort.listExecutions()
      const audits = yield* governance.listAuditEntries()

      expect(summary.claimed).toBe(1)
      expect(summary.dispatched).toBe(1)
      expect(summary.accepted).toBe(1)
      expect(executions).toHaveLength(1)
      expect(executions[0].executionId).toBeDefined()
      expect(executions[0].outcome).toBe("ExecutionSucceeded")
      expect(executions[0].skipReason).toBeNull()
      expect(audits.some((entry) => entry.reason === "scheduler_command_completed")).toBe(true)
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("deduplicates repeated commands by execution id", () => {
    const dbPath = testDatabasePath("lane-dedupe")
    const layer = makeSchedulerLaneLayer(dbPath)
    const now = instant("2026-02-24T12:00:00.000Z")
    const schedule = makeSchedule({
      scheduleId: "schedule:lane-dedupe" as ScheduleId,
      nextExecutionAt: now
    })

    return Effect.gen(function*() {
      const schedulePort = yield* SchedulePortSqlite
      const runtime = yield* SchedulerRuntime
      const makeClient = yield* SchedulerCommandEntity.client
      const client = makeClient(SCHEDULER_COMMAND_LANE_ID)

      yield* schedulePort.upsertSchedule(schedule)
      const ticket = yield* runtime.triggerNow(schedule, now)
      expect(ticket).not.toBeNull()

      const payload: SchedulerExecutePayload = {
        executionId: ticket!.executionId,
        scheduleId: ticket!.scheduleId,
        dueAt: ticket!.dueAt,
        triggerSource: ticket!.triggerSource,
        startedAt: ticket!.startedAt,
        endedAt: DateTime.add(now, { seconds: 5 }),
        action: ticket!.action,
        ownerAgentId: ticket!.ownerAgentId,
        outcome: "ExecutionSucceeded",
        agentId: ticket!.ownerAgentId
      }

      const first = yield* client.execute(payload)
      const second = yield* client.execute(payload)
      const executions = yield* schedulePort.listExecutions()

      expect(first.accepted).toBe(true)
      expect(second.accepted).toBe(true)
      expect(executions.filter((record) => record.executionId === ticket!.executionId)).toHaveLength(1)
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("retains schedules, executions, and audit entries across cold restart", () => {
    const dbPath = testDatabasePath("lane-restart")
    const firstLayer = makeSchedulerLaneLayer(dbPath)
    const secondLayer = makeSchedulerLaneLayer(dbPath)
    const now = instant("2026-02-24T12:00:00.000Z")
    const scheduleId = "schedule:lane-restart" as ScheduleId
    const schedule = makeSchedule({
      scheduleId,
      nextExecutionAt: now
    })

    return Effect.gen(function*() {
      yield* Effect.gen(function*() {
        const schedulePort = yield* SchedulePortSqlite
        const dispatchLoop = yield* SchedulerDispatchLoop

        yield* schedulePort.upsertSchedule(schedule)
        yield* dispatchLoop.dispatchDue(now)
      }).pipe(Effect.provide(firstLayer))

      const stateAfterRestart = yield* Effect.gen(function*() {
        const schedulePort = yield* SchedulePortSqlite
        const governance = yield* GovernancePortSqlite
        const persistedSchedule = yield* schedulePort.getSchedule(scheduleId)
        const executions = yield* schedulePort.listExecutions()
        const audits = yield* governance.listAuditEntries()

        return {
          persistedSchedule,
          executions,
          audits
        } as const
      }).pipe(Effect.provide(secondLayer))

      expect(stateAfterRestart.persistedSchedule).not.toBeNull()
      expect(stateAfterRestart.executions.length).toBeGreaterThan(0)
      expect(stateAfterRestart.audits.length).toBeGreaterThan(0)
    }).pipe(
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })
})

const makeSchedulerLaneLayer = (dbPath: string) => {
  const sqliteLayer = SqliteRuntime.layer({ filename: dbPath })
  const migrationLayer = DomainMigrator.layer.pipe(
    Layer.provide(sqliteLayer),
    Layer.orDie
  )
  const sqlInfrastructureLayer = Layer.mergeAll(sqliteLayer, migrationLayer)
  const sandboxRuntimeLayer = SandboxRuntime.layer

  const schedulePortSqliteLayer = SchedulePortSqlite.layer.pipe(
    Layer.provide(sqlInfrastructureLayer)
  )
  const governancePortSqliteLayer = GovernancePortSqlite.layer.pipe(
    Layer.provide(sqlInfrastructureLayer),
    Layer.provide(sandboxRuntimeLayer)
  )

  const schedulePortTagLayer = Layer.effect(
    SchedulePortTag,
    Effect.gen(function*() {
      return (yield* SchedulePortSqlite) as SchedulePort
    })
  ).pipe(Layer.provide(schedulePortSqliteLayer))

  const governancePortTagLayer = Layer.effect(
    GovernancePortTag,
    Effect.gen(function*() {
      const governance = yield* GovernancePortSqlite
      return {
        ...governance,
        evaluatePolicy: (_input) =>
          Effect.succeed({
            decision: "Allow" as const,
            policyId: null,
            toolDefinitionId: null,
            reason: "forced_allow"
          })
      } as GovernancePort
    })
  ).pipe(Layer.provide(governancePortSqliteLayer))

  const cliRuntimeLayer = CliRuntimeLocalLayer.pipe(
    Layer.provide(NodeServices.layer)
  )

  const commandBackendLayer = CommandBackendLocalLayer.pipe(
    Layer.provide(cliRuntimeLayer)
  )

  const commandRuntimeLayer = CommandRuntime.layer.pipe(
    Layer.provide(CommandHooksDefaultLayer),
    Layer.provide(commandBackendLayer),
    Layer.provide(sandboxRuntimeLayer),
    Layer.provide(NodeServices.layer)
  )

  const schedulerRuntimeLayer = SchedulerRuntime.layer.pipe(
    Layer.provide(schedulePortTagLayer)
  )

  const clusterLayer = SingleRunner.layer().pipe(
    Layer.provide(sqlInfrastructureLayer),
    Layer.orDie
  )

  const schedulerCommandLayer = SchedulerCommandLayer.pipe(
    Layer.provide(clusterLayer),
    Layer.provide(schedulerRuntimeLayer),
    Layer.provide(governancePortTagLayer)
  )

  const controlPlaneLayer = Layer.succeed(SubroutineControlPlane, {
    enqueue: () => Effect.succeed({ accepted: true, reason: "dispatched", runId: "noop-run" }),
    execute: (request: DispatchRequest) =>
      Effect.succeed({
        accepted: false,
        subroutineId: request.subroutineId,
        runId: null,
        success: false,
        errorTag: null,
        reason: "unknown_subroutine"
      }),
    dispatchByTrigger: () => Effect.succeed([]),
    snapshot: () =>
      Effect.succeed({
        queueDepth: 0,
        inFlightCount: 0,
        dedupeEntries: 0,
        lastWorkerError: null
      })
  } as any)

  const schedulerActionExecutorLayer = SchedulerActionExecutor.layer.pipe(
    Layer.provide(Layer.mergeAll(
      commandRuntimeLayer,
      Layer.succeed(ChannelPortTag, {
        create: () => Effect.void,
        get: () => Effect.succeed(null),
        delete: () => Effect.void,
        release: () => Effect.succeed(null),
        list: () => Effect.succeed([]),
        updateModelPreference: () => Effect.void
      } as ChannelPort),
      Layer.succeed(SessionTurnPortTag, {
        startSession: () => Effect.void,
        appendTurn: () => Effect.void,
        deleteSession: () => Effect.void,
        updateContextWindow: () => Effect.void,
        getSession: () => Effect.succeed(null),
        listTurns: () => Effect.succeed([])
      } as SessionTurnPort),
      governancePortTagLayer,
      controlPlaneLayer
    ))
  )

  const schedulerDispatchLayer = SchedulerDispatchLoop.layer.pipe(
    Layer.provide(clusterLayer),
    Layer.provide(schedulerRuntimeLayer),
    Layer.provide(schedulerCommandLayer),
    Layer.provide(schedulerActionExecutorLayer)
  )

  return Layer.mergeAll(
    sqlInfrastructureLayer,
    schedulePortSqliteLayer,
    governancePortSqliteLayer,
    schedulePortTagLayer,
    governancePortTagLayer,
    schedulerRuntimeLayer
  ).pipe(
    Layer.provideMerge(clusterLayer),
    Layer.provideMerge(schedulerCommandLayer),
    Layer.provideMerge(schedulerDispatchLayer)
  )
}

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

const testDatabasePath = (name: string): string =>
  join(tmpdir(), `personal-agent-${name}-${crypto.randomUUID()}.sqlite`)

const cleanupDatabase = (path: string) =>
  Effect.sync(() => {
    rmSync(path, { force: true })
  })
