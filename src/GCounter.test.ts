/**
 * Unit tests for G-Counter CRDT.
 *
 * @since 0.1.0
 */

import { describe, it, expect } from "vitest"
import * as Effect from "effect/Effect"
import * as GCounter from "./GCounter"
import { ReplicaId } from "./CRDT"
import * as STM from "effect/STM"

describe("GCounter", () => {
  it("should start with value 0", async () => {
    const program = Effect.gen(function* () {
      const counter = yield* GCounter.make(ReplicaId("replica-1"))
      return yield* GCounter.value(counter)
    })

    const result = await Effect.runPromise(program)
    expect(result).toBe(0)
  })

  it("should increment correctly", async () => {
    const program = Effect.gen(function* () {
      const counter = yield* GCounter.make(ReplicaId("replica-1"))

      yield* GCounter.increment(counter, 5)
      const val1 = yield* GCounter.value(counter)

      yield* GCounter.increment(counter, 3)
      const val2 = yield* GCounter.value(counter)

      return { val1, val2 }
    })

    const result = await Effect.runPromise(program)
    expect(result.val1).toBe(5)
    expect(result.val2).toBe(8)
  })

  it("should merge states correctly", async () => {
    const program = Effect.gen(function* () {
      const counter1 = yield* GCounter.make(ReplicaId("replica-1"))
      const counter2 = yield* GCounter.make(ReplicaId("replica-2"))

      yield* GCounter.increment(counter1, 10)
      yield* GCounter.increment(counter2, 20)

      const state2 = yield* GCounter.query(counter2)
      yield* GCounter.merge(counter1, state2)

      return yield* GCounter.value(counter1)
    })

    const result = await Effect.runPromise(program)
    expect(result).toBe(30)
  })

  it("should handle multiple merges", async () => {
    const program = Effect.gen(function* () {
      const counter1 = yield* GCounter.make(ReplicaId("replica-1"))
      const counter2 = yield* GCounter.make(ReplicaId("replica-2"))
      const counter3 = yield* GCounter.make(ReplicaId("replica-3"))

      yield* GCounter.increment(counter1, 5)
      yield* GCounter.increment(counter2, 10)
      yield* GCounter.increment(counter3, 15)

      const state1 = yield* GCounter.query(counter1)
      const state2 = yield* GCounter.query(counter2)
      const state3 = yield* GCounter.query(counter3)

      const merged = yield* GCounter.make(ReplicaId("merged"))
      yield* GCounter.merge(merged, state1)
      yield* GCounter.merge(merged, state2)
      yield* GCounter.merge(merged, state3)

      return yield* GCounter.value(merged)
    })

    const result = await Effect.runPromise(program)
    expect(result).toBe(30)
  })

  it("should not support negative increment", async () => {
    const program = Effect.gen(function* () {
      const counter = yield* GCounter.make(ReplicaId("replica-1"))
      yield* GCounter.increment(counter, 10)

      return yield* GCounter.increment(counter, -5)
    })

    await expect(Effect.runPromise(program)).rejects.toThrow()
  })

  it("should handle increment by zero", async () => {
    const program = Effect.gen(function* () {
      const counter = yield* GCounter.make(ReplicaId("replica-1"))
      yield* GCounter.increment(counter, 0)
      return yield* GCounter.value(counter)
    })

    const result = await Effect.runPromise(program)
    expect(result).toBe(0)
  })

  it("should use Layer for dependency injection", async () => {
    const program = Effect.gen(function* () {
      const counter = yield* GCounter.Tag

      yield* GCounter.increment(counter, 42)
      return yield* GCounter.value(counter)
    })

    const result = await Effect.runPromise(
      program.pipe(Effect.provide(GCounter.Live(ReplicaId("replica-1"))))
    )

    expect(result).toBe(42)
  })

  it("should handle concurrent increments from same replica", async () => {
    const program = Effect.gen(function* () {
      const counter = yield* GCounter.make(ReplicaId("replica-1"))

      // Batch increments in single transaction using dual's curried form
      yield* GCounter.increment(counter, 1).pipe(
        STM.flatMap(GCounter.increment(2)),  // Curried! No lambda needed
        STM.flatMap(GCounter.increment(3))
      )

      return yield* GCounter.value(counter)
    })

    const result = await Effect.runPromise(program)
    expect(result).toBe(6)
  })

  it("should support fluent chaining with dual currying", async () => {
    const program = Effect.gen(function* () {
      const counter = yield* GCounter.make(ReplicaId("replica-1"))

      // Demonstrate the power of dual - operations return the counter for chaining
      const finalCounter = yield* GCounter.increment(counter, 10).pipe(
        STM.flatMap(GCounter.increment(5)),
        STM.flatMap(GCounter.increment(3))
      )

      // finalCounter is the same reference as counter
      const value = yield* GCounter.value(finalCounter)
      expect(value).toBe(18)

      return value
    })

    const result = await Effect.runPromise(program)
    expect(result).toBe(18)
  })

  it("should preserve state after multiple merges", async () => {
    const program = Effect.gen(function* () {
      const counter1 = yield* GCounter.make(ReplicaId("replica-1"))
      const counter2 = yield* GCounter.make(ReplicaId("replica-2"))

      yield* GCounter.increment(counter1, 5)

      // Merge counter2 with counter1
      const state1 = yield* GCounter.query(counter1)
      yield* GCounter.merge(counter2, state1)

      // Both should now have same value
      const val1 = yield* GCounter.value(counter1)
      const val2 = yield* GCounter.value(counter2)

      // Increment on counter2
      yield* GCounter.increment(counter2, 10)

      // Merge back to counter1
      const state2 = yield* GCounter.query(counter2)
      yield* GCounter.merge(counter1, state2)

      const finalVal = yield* GCounter.value(counter1)

      return { val1, val2, finalVal }
    })

    const result = await Effect.runPromise(program)
    expect(result.val1).toBe(5)
    expect(result.val2).toBe(5)
    expect(result.finalVal).toBe(15)
  })
})
