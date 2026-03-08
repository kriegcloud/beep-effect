import type { AgentId, ScheduledExecutionId, ScheduleId } from "@template/domain/ids"
import {
  DEFAULT_SCHEDULER_LEASE_DURATION_SECONDS,
  DEFAULT_SCHEDULER_MAX_CLAIMS_PER_TICK
} from "@template/domain/system-defaults"
import type {
  BackgroundAction,
  Instant,
  ScheduleClaim,
  ScheduleRecord,
  TriggerSource
} from "@template/domain/ports"
import type { ExecutionOutcome } from "@template/domain/status"
import { Effect, Layer, ServiceMap } from "effect"
import { SchedulePortTag } from "./PortTags.js"

export interface ExecutionTicket {
  readonly executionId: ScheduledExecutionId
  readonly scheduleId: ScheduleId
  readonly ownerAgentId: AgentId
  readonly dueAt: Instant
  readonly triggerSource: TriggerSource
  readonly startedAt: Instant
  readonly action: BackgroundAction
}

export class SchedulerRuntime extends ServiceMap.Service<SchedulerRuntime>()(
  "server/SchedulerRuntime",
  {
    make: Effect.gen(function*() {
      const schedulePort = yield* SchedulePortTag
      const leaseOwner = "scheduler.dispatch.loop"
      const leaseDurationSeconds = DEFAULT_SCHEDULER_LEASE_DURATION_SECONDS
      const maxClaimsPerTick = DEFAULT_SCHEDULER_MAX_CLAIMS_PER_TICK

      const claimDue = (now: Instant) =>
        schedulePort.claimDue({
          now,
          leaseOwner,
          leaseDurationSeconds,
          maxClaims: maxClaimsPerTick
        }).pipe(
          Effect.map((claims) => claims.map(toExecutionTicket))
        )

      const renewExecutionLease = (ticket: ExecutionTicket, now: Instant) =>
        schedulePort.renewClaim({
          executionId: ticket.executionId,
          leaseOwner,
          now,
          leaseDurationSeconds
        })

      const triggerNow = (schedule: ScheduleRecord, now: Instant) =>
        Effect.gen(function*() {
          if (schedule.scheduleStatus !== "ScheduleActive") {
            yield* schedulePort.recordExecution({
              executionId: makeExecutionId(),
              scheduleId: schedule.scheduleId,
              dueAt: now,
              triggerSource: "Manual",
              outcome: "ExecutionSkipped",
              startedAt: now,
              endedAt: now,
              skipReason: "ManualTriggerInactive"
            })
            return null
          }

          return {
            executionId: makeExecutionId(),
            scheduleId: schedule.scheduleId,
            ownerAgentId: schedule.ownerAgentId,
            dueAt: now,
            triggerSource: "Manual",
            startedAt: now,
            action: schedule.action
          } satisfies ExecutionTicket
        })

      const completeExecution = (
        ticket: ExecutionTicket,
        outcome: ExecutionOutcome,
        endedAt: Instant
      ) =>
        Effect.gen(function*() {
          const completed = yield* schedulePort.completeClaim({
            executionId: ticket.executionId,
            leaseOwner,
            outcome,
            endedAt
          })
          if (completed) {
            return true
          }

          if (ticket.triggerSource === "Manual") {
            const alreadyRecorded = yield* schedulePort.hasExecution(ticket.executionId)
            if (alreadyRecorded) {
              return false
            }
            yield* schedulePort.recordExecution({
              executionId: ticket.executionId,
              scheduleId: ticket.scheduleId,
              dueAt: ticket.dueAt,
              triggerSource: ticket.triggerSource,
              outcome,
              startedAt: ticket.startedAt,
              endedAt,
              skipReason: null
            })
            return true
          }

          return false
        })

      return {
        claimDue,
        renewExecutionLease,
        triggerNow,
        completeExecution
      } as const
    })
  }
) {
  static layer = Layer.effect(this, this.make)
}

const toExecutionTicket = (claim: ScheduleClaim): ExecutionTicket => ({
  executionId: claim.executionId,
  scheduleId: claim.scheduleId,
  ownerAgentId: claim.ownerAgentId,
  dueAt: claim.dueAt,
  triggerSource: claim.triggerSource,
  startedAt: claim.startedAt,
  action: claim.action
})

const makeExecutionId = (): ScheduledExecutionId => crypto.randomUUID() as ScheduledExecutionId
