import type { Instant } from "@template/domain/ports"
import { DEFAULT_SCHEDULER_LEASE_RENEW_INTERVAL_SECONDS } from "@template/domain/system-defaults"
import { DateTime, Duration, Effect, Fiber, Layer, Schedule, ServiceMap } from "effect"
import { SCHEDULER_COMMAND_LANE_ID } from "../CommandLanes.js"
import { SchedulerRuntime } from "../SchedulerRuntime.js"
import { SchedulerActionExecutor } from "./SchedulerActionExecutor.js"
import { SchedulerCommandEntity, type SchedulerExecutePayload } from "./SchedulerCommandEntity.js"

export interface SchedulerDispatchSummary {
  readonly claimed: number
  readonly dispatched: number
  readonly accepted: number
}

export class SchedulerDispatchLoop extends ServiceMap.Service<SchedulerDispatchLoop>()(
  "server/SchedulerDispatchLoop",
  {
    make: Effect.gen(function*() {
      const runtime = yield* SchedulerRuntime
      const executor = yield* SchedulerActionExecutor
      const makeClient = yield* SchedulerCommandEntity.client
      const client = makeClient(SCHEDULER_COMMAND_LANE_ID)

      const dispatchDue = (now: Instant): Effect.Effect<SchedulerDispatchSummary> =>
        Effect.gen(function*() {
          const tickets = yield* runtime.claimDue(now)
          let accepted = 0

          for (const ticket of tickets) {
            const renewLeaseLoop = Effect.repeat(
              Effect.gen(function*() {
                const leaseNow = yield* DateTime.now
                const renewed = yield* runtime.renewExecutionLease(ticket, leaseNow)
                if (!renewed) {
                  return yield* Effect.fail("lease-renewal-stopped")
                }
              }),
              Schedule.spaced(Duration.seconds(DEFAULT_SCHEDULER_LEASE_RENEW_INTERVAL_SECONDS))
            ).pipe(
              Effect.catchCause(() => Effect.void)
            )
            const renewLeaseFiber = yield* renewLeaseLoop.pipe(Effect.forkDetach)

            const outcome = yield* executor.execute(ticket).pipe(
              Effect.ensuring(Fiber.interrupt(renewLeaseFiber))
            )
            const endedAt = yield* DateTime.now

            const payload: SchedulerExecutePayload = {
              executionId: ticket.executionId,
              scheduleId: ticket.scheduleId,
              ownerAgentId: ticket.ownerAgentId,
              dueAt: ticket.dueAt,
              triggerSource: ticket.triggerSource,
              startedAt: ticket.startedAt,
              endedAt,
              action: ticket.action,
              outcome,
              agentId: ticket.ownerAgentId
            }

            const result = yield* client.execute(payload).pipe(Effect.orDie)
            if (result.accepted) {
              accepted += 1
            }
          }

          return {
            claimed: tickets.length,
            dispatched: tickets.length,
            accepted
          } as const
        })

      return {
        dispatchDue
      } as const
    })
  }
) {
  static layer = Layer.effect(this, this.make)
}
