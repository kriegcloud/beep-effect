import { describe, expect, it } from "@effect/vitest"
import { Deferred, Effect } from "effect"
import { RuntimeSupervisor } from "../src/runtime/RuntimeSupervisor.js"

describe("RuntimeSupervisor", () => {
  it.effect("start is idempotent by key and snapshot exposes active worker", () =>
    Effect.gen(function*() {
      const supervisor = yield* RuntimeSupervisor

      const first = yield* supervisor.start("runtime.test.worker", Effect.never)
      const second = yield* supervisor.start("runtime.test.worker", Effect.never)
      const snapshot = yield* supervisor.snapshot()

      expect(first).toBe(true)
      expect(second).toBe(false)
      expect(snapshot.activeWorkerCount).toBe(1)
      expect(snapshot.workers.some((worker) => worker.key === "runtime.test.worker")).toBe(true)
    }).pipe(
      Effect.provide(RuntimeSupervisor.layer)
    ))

  it.effect("stop interrupts keyed worker and returns false for unknown key", () =>
    Effect.gen(function*() {
      const supervisor = yield* RuntimeSupervisor

      yield* supervisor.start("runtime.test.stop", Effect.never)
      const stopped = yield* supervisor.stop("runtime.test.stop")
      const missing = yield* supervisor.stop("runtime.test.missing")
      const snapshot = yield* supervisor.snapshot()

      expect(stopped).toBe(true)
      expect(missing).toBe(false)
      expect(snapshot.activeWorkerCount).toBe(0)
      expect(snapshot.workers).toHaveLength(0)
    }).pipe(
      Effect.provide(RuntimeSupervisor.layer)
    ))

  it.effect("required worker is reported as missing after unexpected completion", () =>
    Effect.gen(function*() {
      const supervisor = yield* RuntimeSupervisor
      const release = yield* Deferred.make<void, never>()

      const started = yield* supervisor.start(
        "runtime.test.required",
        Deferred.await(release),
        { required: true }
      )
      expect(started).toBe(true)

      const runningSnapshot = yield* supervisor.snapshot()
      expect(runningSnapshot.requiredKeys).toContain("runtime.test.required")
      expect(runningSnapshot.missingRequiredKeys).toHaveLength(0)

      yield* Deferred.succeed(release, undefined)
      yield* Effect.yieldNow

      const degradedSnapshot = yield* supervisor.snapshot()
      expect(degradedSnapshot.requiredKeys).toContain("runtime.test.required")
      expect(degradedSnapshot.missingRequiredKeys).toContain("runtime.test.required")
    }).pipe(
      Effect.provide(RuntimeSupervisor.layer)
    ))
})
