import { SCHEDULER_TICK_SECONDS } from "@template/domain/system-defaults"
import type { Instant } from "@template/domain/ports"
import { DateTime, Duration, Effect, Layer, Ref, Schedule, ServiceMap } from "effect"
import { RuntimeSupervisor } from "../runtime/RuntimeSupervisor.js"
import { SchedulerDispatchLoop } from "./SchedulerDispatchLoop.js"

export interface SchedulerTickResult {
  readonly tickedAt: Instant
  readonly claimed: number
  readonly dispatched: number
  readonly accepted: number
  readonly outcome: "ok" | "error"
  readonly errorMessage: string | null
}

export interface SchedulerTickServiceApi {
  readonly getLastTickResult: () => Effect.Effect<SchedulerTickResult | null>
}

export class SchedulerTickService extends ServiceMap.Service<SchedulerTickServiceApi>()(
  "server/SchedulerTickService",
  {
    make: Effect.gen(function*() {
      const dispatchLoop = yield* SchedulerDispatchLoop
      const runtimeSupervisor = yield* RuntimeSupervisor
      const lastTickRef = yield* Ref.make<SchedulerTickResult | null>(null)

      const tick = Effect.gen(function*() {
        const now = yield* DateTime.now
        const summary = yield* dispatchLoop.dispatchDue(now)
        yield* Ref.set(lastTickRef, {
          tickedAt: now,
          claimed: summary.claimed,
          dispatched: summary.dispatched,
          accepted: summary.accepted,
          outcome: "ok",
          errorMessage: null
        })
        yield* Effect.log("Scheduler tick", {
          claimed: summary.claimed,
          dispatched: summary.dispatched,
          accepted: summary.accepted
        })
      }).pipe(
        Effect.catchCause((cause) =>
          Effect.gen(function*() {
            const now = yield* DateTime.now
            yield* Ref.set(lastTickRef, {
              tickedAt: now,
              claimed: 0,
              dispatched: 0,
              accepted: 0,
              outcome: "error",
              errorMessage: String(cause)
            })
            yield* Effect.log("Scheduler tick failed", { cause }).pipe(
              Effect.annotateLogs("level", "error")
            )
          })
        )
      )

      const loop = Effect.repeat(tick, Schedule.spaced(Duration.seconds(SCHEDULER_TICK_SECONDS)))
      const started = yield* runtimeSupervisor.start("runtime.scheduler.tick", loop, { required: true })
      if (!started) {
        return yield* Effect.die(
          new Error("required runtime loop already registered: runtime.scheduler.tick")
        )
      }

      return {
        getLastTickResult: () => Ref.get(lastTickRef)
      } satisfies SchedulerTickServiceApi
    })
  }
) {
  static layer = Layer.effect(this, this.make)
}
