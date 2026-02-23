/**
 * Unit tests for Vector Clock CRDT.
 *
 * @since 0.1.0
 */

import { describe, it, expect } from "vitest"
import * as Effect from "effect/Effect"
import * as VectorClock from "./VectorClock"
import { ReplicaId } from "./CRDT"

describe("VectorClock", () => {
  describe("Constructors", () => {
    it("should create a new vector clock with replica ID", async () => {
      const program = Effect.gen(function* () {
        const clock = yield* VectorClock.make(ReplicaId("replica-1"))
        const counter = yield* VectorClock.get(clock, ReplicaId("replica-1"))
        return counter
      })

      const result = await Effect.runPromise(program)
      expect(result).toBe(0)
    })

    it("should create from state", async () => {
      const program = Effect.gen(function* () {
        const state: VectorClock.VectorClockState = {
          type: "VectorClock",
          replicaId: ReplicaId("replica-1"),
          counters: new Map([
            [ReplicaId("replica-1"), 5],
            [ReplicaId("replica-2"), 3]
          ])
        }

        const clock = yield* VectorClock.fromState(state)
        const counter1 = yield* VectorClock.get(clock, ReplicaId("replica-1"))
        const counter2 = yield* VectorClock.get(clock, ReplicaId("replica-2"))

        return { counter1, counter2 }
      })

      const result = await Effect.runPromise(program)
      expect(result.counter1).toBe(5)
      expect(result.counter2).toBe(3)
    })
  })

  describe("Increment", () => {
    it("should increment local replica counter", async () => {
      const program = Effect.gen(function* () {
        const clock = yield* VectorClock.make(ReplicaId("replica-1"))

        yield* VectorClock.increment(clock)
        const count1 = yield* VectorClock.get(clock, ReplicaId("replica-1"))

        yield* VectorClock.increment(clock)
        const count2 = yield* VectorClock.get(clock, ReplicaId("replica-1"))

        yield* VectorClock.increment(clock)
        const count3 = yield* VectorClock.get(clock, ReplicaId("replica-1"))

        return { count1, count2, count3 }
      })

      const result = await Effect.runPromise(program)
      expect(result.count1).toBe(1)
      expect(result.count2).toBe(2)
      expect(result.count3).toBe(3)
    })

    it("should return self for chaining", async () => {
      const program = Effect.gen(function* () {
        const clock = yield* VectorClock.make(ReplicaId("replica-1"))

        const result = yield* VectorClock.increment(clock)

        // Should be able to chain operations
        yield* VectorClock.increment(result)

        const counter = yield* VectorClock.get(result, ReplicaId("replica-1"))
        return counter
      })

      const result = await Effect.runPromise(program)
      expect(result).toBe(2)
    })
  })

  describe("Get", () => {
    it("should return 0 for unknown replica", async () => {
      const program = Effect.gen(function* () {
        const clock = yield* VectorClock.make(ReplicaId("replica-1"))
        return yield* VectorClock.get(clock, ReplicaId("replica-2"))
      })

      const result = await Effect.runPromise(program)
      expect(result).toBe(0)
    })

    it("should return counter for known replica", async () => {
      const program = Effect.gen(function* () {
        const clock = yield* VectorClock.make(ReplicaId("replica-1"))

        yield* VectorClock.increment(clock)
        yield* VectorClock.increment(clock)

        return yield* VectorClock.get(clock, ReplicaId("replica-1"))
      })

      const result = await Effect.runPromise(program)
      expect(result).toBe(2)
    })
  })

  describe("Merge", () => {
    it("should merge states correctly", async () => {
      const program = Effect.gen(function* () {
        const clock1 = yield* VectorClock.make(ReplicaId("replica-1"))
        const clock2 = yield* VectorClock.make(ReplicaId("replica-2"))

        yield* VectorClock.increment(clock1)
        yield* VectorClock.increment(clock1)

        yield* VectorClock.increment(clock2)
        yield* VectorClock.increment(clock2)
        yield* VectorClock.increment(clock2)

        const state2 = yield* VectorClock.query(clock2)
        yield* VectorClock.merge(clock1, state2)

        const counter1 = yield* VectorClock.get(clock1, ReplicaId("replica-1"))
        const counter2 = yield* VectorClock.get(clock1, ReplicaId("replica-2"))

        return { counter1, counter2 }
      })

      const result = await Effect.runPromise(program)
      expect(result.counter1).toBe(2) // max(2, 0) = 2
      expect(result.counter2).toBe(3) // max(0, 3) = 3
    })

    it("should take maximum of each replica counter", async () => {
      const program = Effect.gen(function* () {
        const state1: VectorClock.VectorClockState = {
          type: "VectorClock",
          replicaId: ReplicaId("replica-1"),
          counters: new Map([
            [ReplicaId("replica-1"), 5],
            [ReplicaId("replica-2"), 2],
            [ReplicaId("replica-3"), 8]
          ])
        }

        const state2: VectorClock.VectorClockState = {
          type: "VectorClock",
          replicaId: ReplicaId("replica-2"),
          counters: new Map([
            [ReplicaId("replica-1"), 3],
            [ReplicaId("replica-2"), 7],
            [ReplicaId("replica-3"), 6]
          ])
        }

        const clock = yield* VectorClock.fromState(state1)
        yield* VectorClock.merge(clock, state2)

        const counter1 = yield* VectorClock.get(clock, ReplicaId("replica-1"))
        const counter2 = yield* VectorClock.get(clock, ReplicaId("replica-2"))
        const counter3 = yield* VectorClock.get(clock, ReplicaId("replica-3"))

        return { counter1, counter2, counter3 }
      })

      const result = await Effect.runPromise(program)
      expect(result.counter1).toBe(5) // max(5, 3)
      expect(result.counter2).toBe(7) // max(2, 7)
      expect(result.counter3).toBe(8) // max(8, 6)
    })

    it("should be idempotent", async () => {
      const program = Effect.gen(function* () {
        const clock1 = yield* VectorClock.make(ReplicaId("replica-1"))
        const clock2 = yield* VectorClock.make(ReplicaId("replica-2"))

        yield* VectorClock.increment(clock1)
        yield* VectorClock.increment(clock2)

        const state2 = yield* VectorClock.query(clock2)

        // Merge twice
        yield* VectorClock.merge(clock1, state2)
        const state1After1 = yield* VectorClock.query(clock1)

        yield* VectorClock.merge(clock1, state2)
        const state1After2 = yield* VectorClock.query(clock1)

        return VectorClock.equal(state1After1, state1After2)
      })

      const result = await Effect.runPromise(program)
      expect(result).toBe(true)
    })

    it("should be commutative", async () => {
      const program = Effect.gen(function* () {
        const clock1a = yield* VectorClock.make(ReplicaId("replica-1"))
        const clock1b = yield* VectorClock.make(ReplicaId("replica-1"))
        const clock2 = yield* VectorClock.make(ReplicaId("replica-2"))
        const clock3 = yield* VectorClock.make(ReplicaId("replica-3"))

        yield* VectorClock.increment(clock1a)
        yield* VectorClock.increment(clock1b)
        yield* VectorClock.increment(clock2)
        yield* VectorClock.increment(clock3)

        const state2 = yield* VectorClock.query(clock2)
        const state3 = yield* VectorClock.query(clock3)

        // Merge in order 2, 3
        yield* VectorClock.merge(clock1a, state2)
        yield* VectorClock.merge(clock1a, state3)
        const stateA = yield* VectorClock.query(clock1a)

        // Merge in order 3, 2
        yield* VectorClock.merge(clock1b, state3)
        yield* VectorClock.merge(clock1b, state2)
        const stateB = yield* VectorClock.query(clock1b)

        return VectorClock.equal(stateA, stateB)
      })

      const result = await Effect.runPromise(program)
      expect(result).toBe(true)
    })

    it("should be associative", async () => {
      const program = Effect.gen(function* () {
        const clock1 = yield* VectorClock.make(ReplicaId("replica-1"))
        const clock2 = yield* VectorClock.make(ReplicaId("replica-2"))
        const clock3 = yield* VectorClock.make(ReplicaId("replica-3"))
        const clock4 = yield* VectorClock.make(ReplicaId("replica-4"))

        yield* VectorClock.increment(clock1)
        yield* VectorClock.increment(clock2)
        yield* VectorClock.increment(clock3)
        yield* VectorClock.increment(clock4)

        const state1 = yield* VectorClock.query(clock1)
        const state2 = yield* VectorClock.query(clock2)
        const state3 = yield* VectorClock.query(clock3)

        // (1 ∪ 2) ∪ 3
        const clockA = yield* VectorClock.fromState(state1)
        yield* VectorClock.merge(clockA, state2)
        yield* VectorClock.merge(clockA, state3)
        const stateA = yield* VectorClock.query(clockA)

        // 1 ∪ (2 ∪ 3)
        const clockB = yield* VectorClock.make(ReplicaId("replica-2"))
        yield* VectorClock.merge(clockB, state2)
        yield* VectorClock.merge(clockB, state3)
        const stateBC = yield* VectorClock.query(clockB)

        const clockC = yield* VectorClock.fromState(state1)
        yield* VectorClock.merge(clockC, stateBC)
        const stateC = yield* VectorClock.query(clockC)

        return VectorClock.equal(stateA, stateC)
      })

      const result = await Effect.runPromise(program)
      expect(result).toBe(true)
    })
  })

  describe("Comparison", () => {
    it("should detect Equal ordering", async () => {
      const program = Effect.gen(function* () {
        const clock1 = yield* VectorClock.make(ReplicaId("replica-1"))
        const clock2 = yield* VectorClock.make(ReplicaId("replica-1"))

        yield* VectorClock.increment(clock1)
        yield* VectorClock.increment(clock2)

        const state1 = yield* VectorClock.query(clock1)
        const state2 = yield* VectorClock.query(clock2)

        return VectorClock.compare(state1, state2)
      })

      const result = await Effect.runPromise(program)
      expect(result).toBe("Equal")
    })

    it("should detect Before ordering", async () => {
      const program = Effect.gen(function* () {
        const clock1 = yield* VectorClock.make(ReplicaId("replica-1"))
        const clock2 = yield* VectorClock.make(ReplicaId("replica-1"))

        yield* VectorClock.increment(clock1)

        yield* VectorClock.increment(clock2)
        yield* VectorClock.increment(clock2)

        const state1 = yield* VectorClock.query(clock1)
        const state2 = yield* VectorClock.query(clock2)

        return VectorClock.compare(state1, state2)
      })

      const result = await Effect.runPromise(program)
      expect(result).toBe("Before")
    })

    it("should detect After ordering", async () => {
      const program = Effect.gen(function* () {
        const clock1 = yield* VectorClock.make(ReplicaId("replica-1"))
        const clock2 = yield* VectorClock.make(ReplicaId("replica-1"))

        yield* VectorClock.increment(clock1)
        yield* VectorClock.increment(clock1)
        yield* VectorClock.increment(clock1)

        yield* VectorClock.increment(clock2)

        const state1 = yield* VectorClock.query(clock1)
        const state2 = yield* VectorClock.query(clock2)

        return VectorClock.compare(state1, state2)
      })

      const result = await Effect.runPromise(program)
      expect(result).toBe("After")
    })

    it("should detect Concurrent ordering", async () => {
      const program = Effect.gen(function* () {
        const clock1 = yield* VectorClock.make(ReplicaId("replica-1"))
        const clock2 = yield* VectorClock.make(ReplicaId("replica-2"))

        yield* VectorClock.increment(clock1)
        yield* VectorClock.increment(clock2)

        const state1 = yield* VectorClock.query(clock1)
        const state2 = yield* VectorClock.query(clock2)

        return VectorClock.compare(state1, state2)
      })

      const result = await Effect.runPromise(program)
      expect(result).toBe("Concurrent")
    })

    it("should detect complex concurrent scenario", async () => {
      const program = Effect.gen(function* () {
        const state1: VectorClock.VectorClockState = {
          type: "VectorClock",
          replicaId: ReplicaId("replica-1"),
          counters: new Map([
            [ReplicaId("replica-1"), 3],
            [ReplicaId("replica-2"), 1],
            [ReplicaId("replica-3"), 2]
          ])
        }

        const state2: VectorClock.VectorClockState = {
          type: "VectorClock",
          replicaId: ReplicaId("replica-2"),
          counters: new Map([
            [ReplicaId("replica-1"), 2],
            [ReplicaId("replica-2"), 4],
            [ReplicaId("replica-3"), 1]
          ])
        }

        return VectorClock.compare(state1, state2)
      })

      const result = await Effect.runPromise(program)
      expect(result).toBe("Concurrent")
    })
  })

  describe("Helper Functions", () => {
    it("happenedBefore should work correctly", async () => {
      const program = Effect.gen(function* () {
        const clock1 = yield* VectorClock.make(ReplicaId("replica-1"))
        const clock2 = yield* VectorClock.make(ReplicaId("replica-1"))

        yield* VectorClock.increment(clock1)
        const state1 = yield* VectorClock.query(clock1)

        yield* VectorClock.increment(clock2)
        yield* VectorClock.increment(clock2)
        const state2 = yield* VectorClock.query(clock2)

        return VectorClock.happenedBefore(state1, state2)
      })

      const result = await Effect.runPromise(program)
      expect(result).toBe(true)
    })

    it("happenedAfter should work correctly", async () => {
      const program = Effect.gen(function* () {
        const clock1 = yield* VectorClock.make(ReplicaId("replica-1"))
        const clock2 = yield* VectorClock.make(ReplicaId("replica-1"))

        yield* VectorClock.increment(clock1)
        yield* VectorClock.increment(clock1)
        const state1 = yield* VectorClock.query(clock1)

        yield* VectorClock.increment(clock2)
        const state2 = yield* VectorClock.query(clock2)

        return VectorClock.happenedAfter(state1, state2)
      })

      const result = await Effect.runPromise(program)
      expect(result).toBe(true)
    })

    it("concurrent should work correctly", async () => {
      const program = Effect.gen(function* () {
        const clock1 = yield* VectorClock.make(ReplicaId("replica-1"))
        const clock2 = yield* VectorClock.make(ReplicaId("replica-2"))

        yield* VectorClock.increment(clock1)
        const state1 = yield* VectorClock.query(clock1)

        yield* VectorClock.increment(clock2)
        const state2 = yield* VectorClock.query(clock2)

        return VectorClock.concurrent(state1, state2)
      })

      const result = await Effect.runPromise(program)
      expect(result).toBe(true)
    })

    it("equal should work correctly", async () => {
      const program = Effect.gen(function* () {
        const clock1 = yield* VectorClock.make(ReplicaId("replica-1"))
        const clock2 = yield* VectorClock.make(ReplicaId("replica-1"))

        yield* VectorClock.increment(clock1)
        yield* VectorClock.increment(clock2)

        const state1 = yield* VectorClock.query(clock1)
        const state2 = yield* VectorClock.query(clock2)

        return VectorClock.equal(state1, state2)
      })

      const result = await Effect.runPromise(program)
      expect(result).toBe(true)
    })
  })

  describe("Transitivity", () => {
    it("should maintain transitive ordering: A < B and B < C => A < C", async () => {
      const program = Effect.gen(function* () {
        const clockA = yield* VectorClock.make(ReplicaId("replica-1"))
        const clockB = yield* VectorClock.make(ReplicaId("replica-1"))
        const clockC = yield* VectorClock.make(ReplicaId("replica-1"))

        // A: [1]
        yield* VectorClock.increment(clockA)
        const stateA = yield* VectorClock.query(clockA)

        // B: [2]
        yield* VectorClock.increment(clockB)
        yield* VectorClock.increment(clockB)
        const stateB = yield* VectorClock.query(clockB)

        // C: [3]
        yield* VectorClock.increment(clockC)
        yield* VectorClock.increment(clockC)
        yield* VectorClock.increment(clockC)
        const stateC = yield* VectorClock.query(clockC)

        const aBeforeB = VectorClock.happenedBefore(stateA, stateB)
        const bBeforeC = VectorClock.happenedBefore(stateB, stateC)
        const aBeforeC = VectorClock.happenedBefore(stateA, stateC)

        return { aBeforeB, bBeforeC, aBeforeC }
      })

      const result = await Effect.runPromise(program)
      expect(result.aBeforeB).toBe(true)
      expect(result.bBeforeC).toBe(true)
      expect(result.aBeforeC).toBe(true)
    })

    it("should maintain antisymmetry: A < B => !(B < A)", async () => {
      const program = Effect.gen(function* () {
        const clockA = yield* VectorClock.make(ReplicaId("replica-1"))
        const clockB = yield* VectorClock.make(ReplicaId("replica-1"))

        yield* VectorClock.increment(clockA)
        const stateA = yield* VectorClock.query(clockA)

        yield* VectorClock.increment(clockB)
        yield* VectorClock.increment(clockB)
        const stateB = yield* VectorClock.query(clockB)

        const aBeforeB = VectorClock.happenedBefore(stateA, stateB)
        const bBeforeA = VectorClock.happenedBefore(stateB, stateA)

        return { aBeforeB, bBeforeA }
      })

      const result = await Effect.runPromise(program)
      expect(result.aBeforeB).toBe(true)
      expect(result.bBeforeA).toBe(false)
    })
  })

  describe("Merge Preserves Causality", () => {
    it("should preserve causal ordering after merge", async () => {
      const program = Effect.gen(function* () {
        const clock1 = yield* VectorClock.make(ReplicaId("replica-1"))
        const clock2 = yield* VectorClock.make(ReplicaId("replica-2"))

        // Event 1 on replica-1
        yield* VectorClock.increment(clock1)
        const state1 = yield* VectorClock.query(clock1)

        // Replica-2 merges state1 (happens after event 1)
        yield* VectorClock.merge(clock2, state1)

        // Event 2 on replica-2
        yield* VectorClock.increment(clock2)
        const state2 = yield* VectorClock.query(clock2)

        // State1 should happen before state2
        return VectorClock.happenedBefore(state1, state2)
      })

      const result = await Effect.runPromise(program)
      expect(result).toBe(true)
    })

    it("should detect concurrent events correctly", async () => {
      const program = Effect.gen(function* () {
        const clock1 = yield* VectorClock.make(ReplicaId("replica-1"))
        const clock2 = yield* VectorClock.make(ReplicaId("replica-2"))

        // Event 1 on replica-1
        yield* VectorClock.increment(clock1)
        const state1 = yield* VectorClock.query(clock1)

        // Event 2 on replica-2 (concurrent with event 1)
        yield* VectorClock.increment(clock2)
        const state2 = yield* VectorClock.query(clock2)

        return VectorClock.concurrent(state1, state2)
      })

      const result = await Effect.runPromise(program)
      expect(result).toBe(true)
    })
  })

  describe("Layer and Dependency Injection", () => {
    it("should use Layer for dependency injection", async () => {
      const program = Effect.gen(function* () {
        const clock = yield* VectorClock.Tag

        yield* VectorClock.increment(clock)
        yield* VectorClock.increment(clock)

        return yield* VectorClock.get(clock, ReplicaId("replica-1"))
      })

      const result = await Effect.runPromise(
        program.pipe(Effect.provide(VectorClock.Live(ReplicaId("replica-1"))))
      )

      expect(result).toBe(2)
    })
  })

  describe("Query", () => {
    it("should return correct state", async () => {
      const program = Effect.gen(function* () {
        const clock = yield* VectorClock.make(ReplicaId("replica-1"))

        yield* VectorClock.increment(clock)
        yield* VectorClock.increment(clock)

        return yield* VectorClock.query(clock)
      })

      const result = await Effect.runPromise(program)
      expect(result.type).toBe("VectorClock")
      expect(result.replicaId).toBe(ReplicaId("replica-1"))
      expect(result.counters.get(ReplicaId("replica-1"))).toBe(2)
    })
  })

  describe("STM Compare", () => {
    it("should compare within STM transaction", async () => {
      const program = Effect.gen(function* () {
        const clock1 = yield* VectorClock.make(ReplicaId("replica-1"))
        const clock2 = yield* VectorClock.make(ReplicaId("replica-2"))

        yield* VectorClock.increment(clock1)
        const state1 = yield* VectorClock.query(clock1)

        yield* VectorClock.increment(clock2)

        return yield* VectorClock.compareSTM(clock2, state1)
      })

      const result = await Effect.runPromise(program)
      expect(result).toBe("Concurrent")
    })
  })
})
