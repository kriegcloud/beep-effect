import type { AgentId, AuditEntryId, ScheduledExecutionId, ScheduleId } from "@template/domain/ids"
import { BackgroundAction, type TriggerSource } from "@template/domain/ports"
import type { ExecutionOutcome } from "@template/domain/status"
import { Effect, Schema } from "effect"
import { ClusterSchema, Entity } from "effect/unstable/cluster"
import { Rpc } from "effect/unstable/rpc"
import { GovernancePortTag } from "../PortTags.js"
import type { ExecutionTicket } from "../SchedulerRuntime.js"
import { SchedulerRuntime } from "../SchedulerRuntime.js"

const SchedulerExecutePayloadFields = {
  executionId: Schema.String,
  scheduleId: Schema.String,
  dueAt: Schema.DateTimeUtc,
  triggerSource: Schema.Literals(["CronTick", "IntervalTick", "Event", "Manual"]),
  startedAt: Schema.DateTimeUtc,
  endedAt: Schema.DateTimeUtc,
  action: BackgroundAction,
  ownerAgentId: Schema.String,
  outcome: Schema.Literals(["ExecutionSucceeded", "ExecutionFailed", "ExecutionSkipped"]),
  agentId: Schema.String
} as const

const SchedulerExecutePayload = Schema.Struct(SchedulerExecutePayloadFields)

const SchedulerExecuteResult = Schema.Struct({
  accepted: Schema.Boolean
})

export type SchedulerExecutePayload = typeof SchedulerExecutePayload.Type
export type SchedulerExecuteResult = typeof SchedulerExecuteResult.Type

const SchedulerExecuteRpc = Rpc.make("execute", {
  payload: SchedulerExecutePayloadFields,
  success: SchedulerExecuteResult,
  primaryKey: ({ executionId }) => String(executionId)
}).annotate(ClusterSchema.Persisted, true)

export const SchedulerCommandEntity = Entity.make("SchedulerCommand", [
  SchedulerExecuteRpc
]).annotate(ClusterSchema.ClientTracingEnabled, false)

export const layer = SchedulerCommandEntity.toLayer(Effect.gen(function*() {
  const runtime = yield* SchedulerRuntime
  const governance = yield* GovernancePortTag

  return {
    execute: ({ payload }) =>
      Effect.gen(function*() {
        const ticket: ExecutionTicket = {
          executionId: payload.executionId as ScheduledExecutionId,
          scheduleId: payload.scheduleId as ScheduleId,
          ownerAgentId: payload.ownerAgentId as AgentId,
          dueAt: payload.dueAt,
          triggerSource: payload.triggerSource as TriggerSource,
          startedAt: payload.startedAt,
          action: payload.action
        }

        const accepted = yield* runtime.completeExecution(
          ticket,
          payload.outcome as ExecutionOutcome,
          payload.endedAt
        )

        yield* governance.writeAudit({
          auditEntryId: crypto.randomUUID() as AuditEntryId,
          agentId: payload.agentId as AgentId,
          sessionId: null,
          decision: "Allow",
          reason: accepted
            ? "scheduler_command_completed"
            : "scheduler_command_ignored",
          createdAt: payload.endedAt
        })

        return { accepted }
      })
  }
}))
