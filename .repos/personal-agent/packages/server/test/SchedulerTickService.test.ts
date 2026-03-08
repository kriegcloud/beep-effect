import { describe, expect, it } from "@effect/vitest"
import { Effect, Exit, Layer, Queue, Ref, Scope } from "effect"
import { TestClock } from "effect/testing"
import { RuntimeSupervisor } from "../src/runtime/RuntimeSupervisor.js"
import { SchedulerDispatchLoop } from "../src/scheduler/SchedulerDispatchLoop.js"
import { SchedulerTickService } from "../src/scheduler/SchedulerTickService.js"

const emptySummary = { claimed: 0, dispatched: 0, accepted: 0 } as const

describe("SchedulerTickService", () => {
  it.effect("tick fires after interval", () =>
    Effect.gen(function*() {
      const queue = yield* Queue.unbounded<void>()

      const mockLayer = Layer.mock(SchedulerDispatchLoop)({
        dispatchDue: () => Queue.offer(queue, undefined).pipe(Effect.as(emptySummary))
      })

      yield* Layer.build(
        SchedulerTickService.layer.pipe(
          Layer.provide(mockLayer),
          Layer.provide(RuntimeSupervisor.layer)
        )
      )

      // First tick fires immediately on construction
      yield* Queue.take(queue)

      // Advance by 10 seconds for second tick
      yield* TestClock.adjust("10 seconds")
      yield* Queue.take(queue)

      const size = yield* Queue.size(queue)
      expect(size).toBe(0)
    }))

  it.effect("error in tick does not kill the loop", () =>
    Effect.gen(function*() {
      const callCount = yield* Ref.make(0)

      const mockLayer = Layer.mock(SchedulerDispatchLoop)({
        dispatchDue: () =>
          Ref.getAndUpdate(callCount, (n) => n + 1).pipe(
            Effect.flatMap((n) =>
              n === 0
                ? Effect.die("boom")
                : Effect.succeed(emptySummary)
            )
          )
      })

      yield* Layer.build(
        SchedulerTickService.layer.pipe(
          Layer.provide(mockLayer),
          Layer.provide(RuntimeSupervisor.layer)
        )
      )

      // First tick fires and dies (caught by catchCause)
      // Advance for second tick
      yield* TestClock.adjust("10 seconds")
      // Advance for third tick
      yield* TestClock.adjust("10 seconds")

      const count = yield* Ref.get(callCount)
      expect(count).toBeGreaterThanOrEqual(2)
    }))

  it.effect("shutdown stops the loop", () =>
    Effect.gen(function*() {
      const queue = yield* Queue.unbounded<void>()

      const mockLayer = Layer.mock(SchedulerDispatchLoop)({
        dispatchDue: () => Queue.offer(queue, undefined).pipe(Effect.as(emptySummary))
      })

      const scope = yield* Scope.make()
      yield* Layer.buildWithScope(scope)(
        SchedulerTickService.layer.pipe(
          Layer.provide(mockLayer),
          Layer.provide(RuntimeSupervisor.layer)
        )
      )

      // First tick fires
      yield* Queue.take(queue)

      // Close the scope — interrupts the tick fiber
      yield* Scope.close(scope, Exit.void)

      // Advance time — no more ticks should fire
      yield* TestClock.adjust("30 seconds")

      const size = yield* Queue.size(queue)
      expect(size).toBe(0)
    }))
})
