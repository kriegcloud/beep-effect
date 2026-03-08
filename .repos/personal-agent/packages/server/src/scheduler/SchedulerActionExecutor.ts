import type { AgentId, ConversationId, SessionId } from "@template/domain/ids"
import type {
  BackgroundActionMemorySubroutine,
  ChannelSummaryRecord,
  SessionState
} from "@template/domain/ports"
import type { ExecutionOutcome } from "@template/domain/status"
import { DateTime, Effect, Layer, ServiceMap } from "effect"
import {
  ChannelPortTag,
  GovernancePortTag,
  SessionTurnPortTag
} from "../PortTags.js"
import {
  SubroutineControlPlane,
  type SubroutineControlPlaneService
} from "../memory/SubroutineControlPlane.js"
import type { ExecutionTicket } from "../SchedulerRuntime.js"
import {
  CommandRuntime,
  type CommandRuntimeService
} from "../tools/command/CommandRuntime.js"

export class SchedulerActionExecutor extends ServiceMap.Service<SchedulerActionExecutor>()(
  "server/SchedulerActionExecutor",
  {
    make: Effect.gen(function*() {
      const governance = yield* GovernancePortTag
      const channelPort = yield* ChannelPortTag
      const sessionTurnPort = yield* SessionTurnPortTag
      const commandRuntime = yield* CommandRuntime
      const subroutineControlPlane = yield* SubroutineControlPlane

      const execute = (ticket: ExecutionTicket): Effect.Effect<ExecutionOutcome> =>
        Effect.gen(function*() {
          const policy = yield* governance.evaluatePolicy({
            agentId: ticket.ownerAgentId,
            sessionId: null,
            action: "ExecuteSchedule"
          })

          if (policy.decision === "Deny") {
            yield* Effect.log("Scheduled action denied by governance", {
              scheduleId: ticket.scheduleId,
              actionKind: ticket.action.kind,
              decision: policy.decision,
              reason: policy.reason
            })
            return "ExecutionSkipped" as const
          }

          if (policy.decision === "RequireApproval") {
            yield* Effect.log("Scheduled action requires approval; skipping", {
              scheduleId: ticket.scheduleId,
              actionKind: ticket.action.kind,
              decision: policy.decision,
              reason: policy.reason
            })
            return "ExecutionSkipped" as const
          }

          return yield* dispatchAction({
            ticket,
            channelPort,
            sessionTurnPort,
            commandRuntime,
            subroutineControlPlane
          }).pipe(
            (effect) => governance.enforceSandbox(ticket.ownerAgentId, effect),
            Effect.catchCause((cause) =>
              Effect.gen(function*() {
                yield* Effect.log("Scheduled action failed", {
                  scheduleId: ticket.scheduleId,
                  actionKind: ticket.action.kind,
                  cause: String(cause)
                })
                return "ExecutionFailed" as const
              })
            )
          )
        })

      return { execute } as const
    })
  }
) {
  static layer = Layer.effect(this, this.make)
}

const dispatchAction = (params: {
  readonly ticket: ExecutionTicket
  readonly channelPort: {
    readonly list: (query?: {
      readonly agentId?: AgentId
    }) => Effect.Effect<ReadonlyArray<ChannelSummaryRecord>>
  }
  readonly sessionTurnPort: {
    readonly getSession: (sessionId: SessionId) => Effect.Effect<SessionState | null>
  }
  readonly commandRuntime: CommandRuntimeService
  readonly subroutineControlPlane: SubroutineControlPlaneService
}): Effect.Effect<ExecutionOutcome> =>
  Effect.gen(function*() {
    switch (params.ticket.action.kind) {
      case "MemorySubroutine": {
        const runId = `schedrun:${params.ticket.executionId}`
        const resolvedSession = yield* resolveScheduledSession({
          scheduleId: params.ticket.scheduleId,
          ownerAgentId: params.ticket.ownerAgentId,
          action: params.ticket.action,
          runId,
          channelPort: params.channelPort,
          sessionTurnPort: params.sessionTurnPort
        })
        if (resolvedSession === null) {
          return "ExecutionFailed" as const
        }

        const controlPlaneResult = yield* params.subroutineControlPlane.execute({
          agentId: params.ticket.ownerAgentId,
          sessionId: resolvedSession.sessionId,
          conversationId: resolvedSession.conversationId,
          subroutineId: params.ticket.action.subroutineId,
          turnId: null,
          triggerType: "Scheduled",
          triggerReason: `Schedule: ${params.ticket.scheduleId} (${params.ticket.triggerSource}, sessionMode=${params.ticket.action.sessionMode})`,
          enqueuedAt: params.ticket.startedAt,
          idempotencyKey: `schedule:${params.ticket.scheduleId}:execution:${params.ticket.executionId}`
        })
        yield* Effect.log("SchedulerActionExecutor subroutine result", controlPlaneResult)

        if (!controlPlaneResult.accepted) {
          return (
            controlPlaneResult.reason === "deduped"
            || controlPlaneResult.reason === "already_in_flight"
          )
            ? "ExecutionSkipped" as const
            : "ExecutionFailed" as const
        }

        return controlPlaneResult.success
          ? "ExecutionSucceeded" as const
          : "ExecutionFailed" as const
      }
      case "Command": {
        const command = params.ticket.action.command.trim()
        if (command.length === 0) {
          yield* Effect.log("Invalid scheduled command action", {
            scheduleId: params.ticket.scheduleId
          })
          return "ExecutionFailed" as const
        }

        const execution = yield* params.commandRuntime.execute({
          context: {
            source: "schedule",
            agentId: params.ticket.ownerAgentId
          },
          request: {
            mode: "Shell",
            command
          }
        }).pipe(
          Effect.matchEffect({
            onFailure: (error) =>
              Effect.gen(function*() {
                yield* Effect.log("Scheduled command execution failed", {
                  scheduleId: params.ticket.scheduleId,
                  command,
                  errorTag: error._tag
                })
                return "ExecutionFailed" as const
              }),
            onSuccess: (result) =>
              Effect.succeed(
                result.exitCode === 0
                  ? "ExecutionSucceeded" as const
                  : "ExecutionFailed" as const
              )
          })
        )

        return execution
      }
      case "Log":
        return yield* Effect.log("Scheduled action executed", {
          scheduleId: params.ticket.scheduleId,
          actionKind: params.ticket.action.kind
        }).pipe(Effect.as("ExecutionSucceeded" as const))
      case "HealthCheck":
        return yield* Effect.log("Health check", {
          scheduleId: params.ticket.scheduleId
        }).pipe(Effect.as("ExecutionSucceeded" as const))
      case "Unknown":
        return yield* Effect.log("Unknown schedule action, skipping", {
          scheduleId: params.ticket.scheduleId,
          actionRef: params.ticket.action.actionRef
        }).pipe(Effect.as("ExecutionSkipped" as const))
    }
  })

const resolveScheduledSession = (params: {
  readonly scheduleId: ExecutionTicket["scheduleId"]
  readonly ownerAgentId: ExecutionTicket["ownerAgentId"]
  readonly action: BackgroundActionMemorySubroutine
  readonly runId: string
  readonly channelPort: {
    readonly list: (query?: {
      readonly agentId?: AgentId
    }) => Effect.Effect<ReadonlyArray<ChannelSummaryRecord>>
  }
  readonly sessionTurnPort: {
    readonly getSession: (sessionId: SessionId) => Effect.Effect<SessionState | null>
  }
}): Effect.Effect<{ readonly sessionId: SessionId; readonly conversationId: ConversationId } | null> =>
  Effect.gen(function*() {
    switch (params.action.sessionMode) {
      case "synthetic":
        return {
          sessionId: `session:scheduled:${params.scheduleId}` as SessionId,
          conversationId: `conversation:scheduled:${params.runId}` as ConversationId
        }
      case "session_id": {
        if (params.action.sessionId === undefined) {
          yield* Effect.log("Scheduled MemorySubroutine missing sessionId", {
            scheduleId: params.scheduleId,
            subroutineId: params.action.subroutineId
          })
          return null
        }
        const session = yield* params.sessionTurnPort.getSession(params.action.sessionId)
        if (session === null) {
          yield* Effect.log("Scheduled MemorySubroutine session not found", {
            scheduleId: params.scheduleId,
            sessionId: params.action.sessionId
          })
          return null
        }
        return {
          sessionId: params.action.sessionId,
          conversationId: session.conversationId
        }
      }
      case "active_agent_session": {
        const channels = yield* params.channelPort.list({
          agentId: params.ownerAgentId
        })
        if (channels.length === 0) {
          yield* Effect.log("No active session available for scheduled MemorySubroutine", {
            scheduleId: params.scheduleId,
            ownerAgentId: params.ownerAgentId
          })
          return null
        }

        const sorted = [...channels].sort((left, right) => {
          const leftEpoch = left.lastTurnAt === null
            ? Number.NEGATIVE_INFINITY
            : DateTime.toEpochMillis(left.lastTurnAt)
          const rightEpoch = right.lastTurnAt === null
            ? Number.NEGATIVE_INFINITY
            : DateTime.toEpochMillis(right.lastTurnAt)
          return rightEpoch - leftEpoch
        })
        const selected = sorted[0]
        return {
          sessionId: selected.activeSessionId,
          conversationId: selected.activeConversationId
        }
      }
    }
  })
