import { describe, expect, it } from "@effect/vitest"
import type { AgentId, ScheduledExecutionId, ScheduleId } from "@template/domain/ids"
import type {
  BackgroundAction,
  ChannelPort,
  GovernancePort,
  Instant,
  PolicyDecision,
  PolicyInput,
  SessionTurnPort
} from "@template/domain/ports"
import { DateTime, Effect, Layer } from "effect"
import {
  ChannelPortTag,
  GovernancePortTag,
  SessionTurnPortTag
} from "../src/PortTags.js"
import {
  SubroutineControlPlane,
  type DispatchRequest,
  type SubroutineControlPlaneService,
  type SubroutineExecutionOutcome
} from "../src/memory/SubroutineControlPlane.js"
import { SchedulerActionExecutor } from "../src/scheduler/SchedulerActionExecutor.js"
import type { ExecutionTicket } from "../src/SchedulerRuntime.js"
import { CommandRuntime } from "../src/tools/command/CommandRuntime.js"
import type {
  CommandExecutionError
} from "../src/tools/command/CommandErrors.js"
import type {
  CommandPlan,
  CommandInvocationContext,
  CommandRequest,
  CommandResult
} from "../src/tools/command/CommandTypes.js"

describe("SchedulerActionExecutor", () => {
  it.effect("action:log returns ExecutionSucceeded when governance allows", () =>
    Effect.gen(function*() {
      const executor = yield* SchedulerActionExecutor
      const ticket = makeTicket({ action: { kind: "Log" } })

      const outcome = yield* executor.execute(ticket)

      expect(outcome).toBe("ExecutionSucceeded")
    }).pipe(Effect.provide(makeTestLayer({ decision: "Allow" }))))

  it.effect("action:health_check returns ExecutionSucceeded when governance allows", () =>
    Effect.gen(function*() {
      const executor = yield* SchedulerActionExecutor
      const ticket = makeTicket({ action: { kind: "HealthCheck" } })

      const outcome = yield* executor.execute(ticket)

      expect(outcome).toBe("ExecutionSucceeded")
    }).pipe(Effect.provide(makeTestLayer({ decision: "Allow" }))))

  it.effect("governance deny returns ExecutionSkipped", () =>
    Effect.gen(function*() {
      const executor = yield* SchedulerActionExecutor
      const ticket = makeTicket({ action: { kind: "Log" } })

      const outcome = yield* executor.execute(ticket)

      expect(outcome).toBe("ExecutionSkipped")
    }).pipe(Effect.provide(makeTestLayer({ decision: "Deny", reason: "policy_test_deny" }))))

  it.effect("governance require approval returns ExecutionSkipped", () =>
    Effect.gen(function*() {
      const executor = yield* SchedulerActionExecutor
      const ticket = makeTicket({ action: { kind: "Log" } })

      const outcome = yield* executor.execute(ticket)

      expect(outcome).toBe("ExecutionSkipped")
    }).pipe(Effect.provide(makeTestLayer({
      decision: "RequireApproval",
      reason: "policy_requires_approval"
    }))))

  it.effect("command action succeeds when command runtime exits with code 0", () =>
    Effect.gen(function*() {
      const executor = yield* SchedulerActionExecutor
      const ticket = makeTicket({
        action: toCommandAction("echo scheduled-command")
      })

      const outcome = yield* executor.execute(ticket)

      expect(outcome).toBe("ExecutionSucceeded")
    }).pipe(Effect.provide(makeTestLayer({ decision: "Allow" }))))

  it.effect("command action forwards schedule context to command runtime", () => {
    const captured: Array<{
      readonly context: CommandInvocationContext
      readonly request: CommandRequest
    }> = []

    return Effect.gen(function*() {
      const executor = yield* SchedulerActionExecutor
      const ticket = makeTicket({
        ownerAgentId: "agent:schedule-owner" as AgentId,
        action: toCommandAction("echo context")
      })

      const outcome = yield* executor.execute(ticket)

      expect(outcome).toBe("ExecutionSucceeded")
      expect(captured).toHaveLength(1)
      expect(captured[0].context.source).toBe("schedule")
      expect(captured[0].context.agentId).toBe("agent:schedule-owner")
      expect(captured[0].request.mode).toBe("Shell")
      expect(
        captured[0].request.mode === "Shell"
          ? captured[0].request.command
          : null
      ).toBe("echo context")
    }).pipe(
      Effect.provide(makeTestLayer(
        { decision: "Allow" },
        {
          executeCommand: ({ context, request }) =>
            Effect.sync(() => {
              captured.push({ context, request })
              return makeCommandResult()
            })
        }
      ))
    )
  })

  it.effect("command action is wrapped by governance enforceSandbox", () => {
    const sandboxCalls: Array<AgentId> = []

    return Effect.gen(function*() {
      const executor = yield* SchedulerActionExecutor
      const ownerAgentId = "agent:sandbox-owner" as AgentId
      const ticket = makeTicket({
        ownerAgentId,
        action: toCommandAction("echo sandbox")
      })

      const outcome = yield* executor.execute(ticket)

      expect(outcome).toBe("ExecutionSucceeded")
      expect(sandboxCalls).toEqual([ownerAgentId])
    }).pipe(Effect.provide(makeTestLayer(
      { decision: "Allow" },
      {
        enforceSandbox: (agentId, effect) =>
          Effect.sync(() => {
            sandboxCalls.push(agentId)
          }).pipe(Effect.andThen(effect))
      }
    )))
  })

  it.effect("command action fails when command runtime exits non-zero", () =>
    Effect.gen(function*() {
      const executor = yield* SchedulerActionExecutor
      const ticket = makeTicket({
        action: toCommandAction("echo failing-command")
      })

      const outcome = yield* executor.execute(ticket)

      expect(outcome).toBe("ExecutionFailed")
    }).pipe(Effect.provide(makeTestLayer(
      { decision: "Allow" },
      {
        executeCommand: () => Effect.succeed(makeCommandResult(2))
      }
    ))))

  it.effect("unknown action returns ExecutionSkipped", () =>
    Effect.gen(function*() {
      const executor = yield* SchedulerActionExecutor
      const ticket = makeTicket({ action: { kind: "Unknown", actionRef: "action:unknown-future-action" } })

      const outcome = yield* executor.execute(ticket)

      expect(outcome).toBe("ExecutionSkipped")
    }).pipe(Effect.provide(makeTestLayer({ decision: "Allow" }))))

  it.effect("action:memory_subroutine:valid_id returns ExecutionSucceeded", () =>
    Effect.gen(function*() {
      const executor = yield* SchedulerActionExecutor
      const ticket = makeTicket({
        action: toMemorySubroutineAction("memory_consolidation")
      })

      const outcome = yield* executor.execute(ticket)

      expect(outcome).toBe("ExecutionSucceeded")
    }).pipe(Effect.provide(makeTestLayer({ decision: "Allow" }))))

  it.effect("action:memory_subroutine:unknown_id returns ExecutionFailed", () =>
    Effect.gen(function*() {
      const executor = yield* SchedulerActionExecutor
      const ticket = makeTicket({
        action: toMemorySubroutineAction("nonexistent")
      })

      const outcome = yield* executor.execute(ticket)

      expect(outcome).toBe("ExecutionFailed")
    }).pipe(Effect.provide(makeTestLayer(
      { decision: "Allow" },
      {
        executeSubroutine: (request) =>
          Effect.succeed(makeSubroutineExecutionOutcome(request, {
            accepted: false,
            success: false,
            reason: "unknown_subroutine"
          }))
      }
    ))))

  it.effect("memory subroutine with empty id is skipped", () =>
    Effect.gen(function*() {
      const executor = yield* SchedulerActionExecutor
      const ticket = makeTicket({
        action: toMemorySubroutineAction("")
      })

      const outcome = yield* executor.execute(ticket)

      expect(outcome).toBe("ExecutionFailed")
    }).pipe(Effect.provide(makeTestLayer(
      { decision: "Allow" },
      {
        executeSubroutine: (request) =>
          Effect.succeed(makeSubroutineExecutionOutcome(request, {
            accepted: false,
            success: false,
            reason: "unknown_subroutine"
          }))
      }
    ))))

  it.effect("governance deny still skips memory subroutine actions", () =>
    Effect.gen(function*() {
      const executor = yield* SchedulerActionExecutor
      const ticket = makeTicket({
        action: toMemorySubroutineAction("memory_consolidation")
      })

      const outcome = yield* executor.execute(ticket)

      expect(outcome).toBe("ExecutionSkipped")
    }).pipe(Effect.provide(makeTestLayer({ decision: "Deny" }))))

  it.effect("subroutine dispatch receives correct synthetic IDs and trigger metadata", () => {
    const captured: Array<DispatchRequest> = []

    return Effect.gen(function*() {
      const executor = yield* SchedulerActionExecutor
      const ticket = makeTicket({
        scheduleId: "schedule:daily-consolidation" as ScheduleId,
        ownerAgentId: "agent:context-test" as AgentId,
        action: toMemorySubroutineAction("memory_consolidation"),
        triggerSource: "CronTick"
      })

      yield* executor.execute(ticket)

      expect(captured).toHaveLength(1)
      const dispatch = captured[0]
      expect(dispatch.agentId).toBe("agent:context-test")
      expect(dispatch.sessionId).toBe("session:scheduled:schedule:daily-consolidation")
      expect(dispatch.conversationId).toContain("conversation:scheduled:")
      expect(dispatch.turnId).toBeNull()
      expect(dispatch.triggerType).toBe("Scheduled")
      expect(dispatch.triggerReason).toContain("schedule:daily-consolidation")
      expect(dispatch.triggerReason).toContain("CronTick")
    }).pipe(Effect.provide(makeTestLayer(
      { decision: "Allow" },
      {
        executeSubroutine: (request) =>
          Effect.sync(() => {
            captured.push(request)
            return makeSubroutineExecutionOutcome(request, { accepted: true, success: true })
          })
      }
    )))
  })

  it.effect("subroutine execution failure maps to ExecutionFailed", () =>
    Effect.gen(function*() {
      const executor = yield* SchedulerActionExecutor
      const ticket = makeTicket({
        action: toMemorySubroutineAction("memory_consolidation")
      })

      const outcome = yield* executor.execute(ticket)

      expect(outcome).toBe("ExecutionFailed")
    }).pipe(Effect.provide(makeTestLayer(
      { decision: "Allow" },
      {
        executeSubroutine: (request) =>
          Effect.succeed(makeSubroutineExecutionOutcome(request, {
            accepted: true,
            success: false,
            errorTag: "model_error"
          }))
      }
    ))))

  it.effect("passes ownerAgentId and ExecuteSchedule action to governance", () => {
    const captured: Array<PolicyInput> = []
    const capturingGovernanceLayer = Layer.succeed(GovernancePortTag, {
      evaluatePolicy: (input) => {
        captured.push(input)
        return Effect.succeed<PolicyDecision>({
          decision: "Allow",
          policyId: null,
          toolDefinitionId: null,
          reason: "test_capture"
        })
      },
      checkToolQuota: () => Effect.void,
      writeAudit: () => Effect.void,
      recordToolInvocation: () => Effect.void,
      recordToolInvocationWithAudit: () => Effect.void,
      findToolInvocationByIdempotencyKey: () => Effect.succeed(null),
      listToolInvocationsBySession: () => Effect.succeed({ items: [], totalCount: 0 }),
      listPoliciesForAgent: () => Effect.succeed([]),
      listAuditEntries: () => Effect.succeed([]),
      enforceSandbox: (_agentId, effect) => effect
    } as GovernancePort)

    const commandRuntimeLayer = Layer.succeed(CommandRuntime, {
      prepare: ({ request }) => Effect.succeed(makePreparedPlan(request)),
      execute: () => Effect.succeed(makeCommandResult())
    })

    const subroutineControlPlaneLayer = Layer.succeed(
      SubroutineControlPlane,
      {
        enqueue: (request) =>
          Effect.succeed({
            accepted: true,
            reason: "dispatched",
            runId: `queued:${request.subroutineId}`
          }),
        execute: (request) =>
          Effect.succeed(makeSubroutineExecutionOutcome(request, { accepted: true, success: true })),
        dispatchByTrigger: () => Effect.succeed([]),
        snapshot: () =>
          Effect.succeed({
            queueDepth: 0,
            inFlightCount: 0,
            dedupeEntries: 0,
            lastWorkerError: null
          })
      } satisfies SubroutineControlPlaneService
    )
    const channelLayer = Layer.succeed(ChannelPortTag, {
      create: () => Effect.void,
      get: () => Effect.succeed(null),
      delete: () => Effect.void,
      release: () => Effect.succeed(null),
      list: () => Effect.succeed([]),
      updateModelPreference: () => Effect.void
    } as ChannelPort)
    const sessionTurnLayer = Layer.succeed(SessionTurnPortTag, {
      startSession: () => Effect.void,
      appendTurn: () => Effect.void,
      deleteSession: () => Effect.void,
      updateContextWindow: () => Effect.void,
      getSession: () => Effect.succeed(null),
      listTurns: () => Effect.succeed([])
    } as SessionTurnPort)

    const layer = SchedulerActionExecutor.layer.pipe(
      Layer.provide(Layer.mergeAll(
        capturingGovernanceLayer,
        commandRuntimeLayer,
        channelLayer,
        sessionTurnLayer,
        subroutineControlPlaneLayer
      ))
    )

    return Effect.gen(function*() {
      const executor = yield* SchedulerActionExecutor
      const ticket = makeTicket({
        ownerAgentId: "agent:owner-123" as AgentId,
        action: { kind: "Log" }
      })

      yield* executor.execute(ticket)

      expect(captured).toHaveLength(1)
      expect(captured[0].agentId).toBe("agent:owner-123")
      expect(captured[0].sessionId).toBeNull()
      expect(captured[0].action).toBe("ExecuteSchedule")
    }).pipe(Effect.provide(layer))
  })
})

const makeTestLayer = (
  policyOverrides: Partial<PolicyDecision>,
  options: {
    readonly executeCommand?: (params: {
      readonly context: CommandInvocationContext
      readonly request: CommandRequest
    }) => Effect.Effect<CommandResult, CommandExecutionError>
    readonly executeSubroutine?: (
      request: DispatchRequest
    ) => Effect.Effect<SubroutineExecutionOutcome>
    readonly enforceSandbox?: GovernancePort["enforceSandbox"]
  } = {}
) => {
  const governanceLayer = Layer.succeed(GovernancePortTag, {
    evaluatePolicy: (_input) =>
      Effect.succeed<PolicyDecision>({
        decision: "Allow",
        policyId: null,
        toolDefinitionId: null,
        reason: "test_default_allow",
        ...policyOverrides
      }),
    checkToolQuota: () => Effect.void,
    writeAudit: () => Effect.void,
    recordToolInvocation: () => Effect.void,
    recordToolInvocationWithAudit: () => Effect.void,
    findToolInvocationByIdempotencyKey: () => Effect.succeed(null),
    listToolInvocationsBySession: () => Effect.succeed({ items: [], totalCount: 0 }),
    listPoliciesForAgent: () => Effect.succeed([]),
    listAuditEntries: () => Effect.succeed([]),
    enforceSandbox: options.enforceSandbox ?? ((_agentId, effect) => effect)
  } as GovernancePort)

  const commandRuntimeLayer = Layer.succeed(CommandRuntime, {
    prepare: ({ request }) => Effect.succeed(makePreparedPlan(request)),
    execute: options.executeCommand ?? (() => Effect.succeed(makeCommandResult()))
  })

  const controlPlaneLayer = Layer.succeed(
    SubroutineControlPlane,
    {
      enqueue: (request) =>
        Effect.succeed({
          accepted: true,
          reason: "dispatched",
          runId: `queued:${request.subroutineId}`
        }),
      execute: (request) =>
        options.executeSubroutine
          ? options.executeSubroutine(request)
          : Effect.succeed(makeSubroutineExecutionOutcome(request, {
            accepted: true,
            success: true
          })),
      dispatchByTrigger: () => Effect.succeed([]),
      snapshot: () =>
        Effect.succeed({
          queueDepth: 0,
          inFlightCount: 0,
          dedupeEntries: 0,
          lastWorkerError: null
        })
    } satisfies SubroutineControlPlaneService
  )
  const channelLayer = Layer.succeed(ChannelPortTag, {
    create: () => Effect.void,
    get: () => Effect.succeed(null),
    delete: () => Effect.void,
    release: () => Effect.succeed(null),
    list: () => Effect.succeed([]),
    updateModelPreference: () => Effect.void
  } as ChannelPort)
  const sessionTurnLayer = Layer.succeed(SessionTurnPortTag, {
    startSession: () => Effect.void,
    appendTurn: () => Effect.void,
    deleteSession: () => Effect.void,
    updateContextWindow: () => Effect.void,
    getSession: () => Effect.succeed(null),
    listTurns: () => Effect.succeed([])
  } as SessionTurnPort)

  return SchedulerActionExecutor.layer.pipe(
    Layer.provide(governanceLayer),
    Layer.provide(commandRuntimeLayer),
    Layer.provide(channelLayer),
    Layer.provide(sessionTurnLayer),
    Layer.provide(controlPlaneLayer)
  )
}

const makeSubroutineExecutionOutcome = (
  request: DispatchRequest,
  overrides?: Partial<SubroutineExecutionOutcome>
): SubroutineExecutionOutcome => ({
  accepted: overrides?.accepted ?? true,
  subroutineId: request.subroutineId,
  runId: overrides?.runId ?? `run:${request.subroutineId}`,
  success: overrides?.success ?? true,
  errorTag: overrides?.errorTag ?? null,
  reason: overrides?.reason ?? "completed"
})

const instant = (input: string): Instant => DateTime.fromDateUnsafe(new Date(input))

const makeCommandResult = (exitCode = 0): CommandResult => ({
  exitCode,
  stdout: "",
  stderr: "",
  truncatedStdout: false,
  truncatedStderr: false,
  startedAt: instant("2026-02-24T12:00:00.000Z"),
  completedAt: instant("2026-02-24T12:00:00.000Z")
})

const makePreparedPlan = (request: CommandRequest): CommandPlan =>
  request.mode === "Shell"
    ? {
        mode: "Shell",
        command: request.command,
        cwd: process.cwd(),
        timeoutMs: 15_000,
        outputLimitBytes: 16 * 1024,
        env: {},
        fingerprint: "test-fingerprint"
      }
    : {
        mode: "Argv",
        executable: request.executable,
        args: request.args ?? [],
        cwd: process.cwd(),
        timeoutMs: 15_000,
        outputLimitBytes: 16 * 1024,
        env: {},
        fingerprint: "test-fingerprint"
      }

const toCommandAction = (command: string): BackgroundAction => ({
  kind: "Command",
  command
})

const toMemorySubroutineAction = (subroutineId: string): BackgroundAction => ({
  kind: "MemorySubroutine",
  subroutineId,
  sessionMode: "synthetic"
})

const makeTicket = (overrides: Partial<ExecutionTicket> = {}): ExecutionTicket => ({
  executionId: crypto.randomUUID() as ScheduledExecutionId,
  scheduleId: "schedule:test" as ScheduleId,
  ownerAgentId: "agent:test" as AgentId,
  dueAt: instant("2026-02-24T12:00:00.000Z"),
  triggerSource: "CronTick",
  startedAt: instant("2026-02-24T12:00:00.000Z"),
  action: { kind: "Unknown", actionRef: "action:default" },
  ...overrides
})
