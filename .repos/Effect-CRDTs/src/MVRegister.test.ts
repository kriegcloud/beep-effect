/**
 * Unit tests for MV-Register CRDT.
 *
 * @since 0.1.0
 */

import { describe, it, expect } from "vitest"
import * as Effect from "effect/Effect"
import * as MVRegister from "./MVRegister"
import { ReplicaId } from "./CRDT"

describe("MVRegister", () => {
  describe("Basic Operations", () => {
    it("should start with no values", async () => {
      const program = Effect.gen(function* () {
        const register = yield* MVRegister.make<string>(ReplicaId("replica-1"))
        return yield* MVRegister.get(register)
      })

      const result = await Effect.runPromise(program)
      expect(result).toEqual([])
    })

    it("should start with initial value if provided", async () => {
      const program = Effect.gen(function* () {
        const register = yield* MVRegister.make<string>(ReplicaId("replica-1"), "initial")
        return yield* MVRegister.get(register)
      })

      const result = await Effect.runPromise(program)
      expect(result).toEqual(["initial"])
    })

    it("should set a single value", async () => {
      const program = Effect.gen(function* () {
        const register = yield* MVRegister.make<string>(ReplicaId("replica-1"))

        yield* MVRegister.set(register, "hello")
        return yield* MVRegister.get(register)
      })

      const result = await Effect.runPromise(program)
      expect(result).toEqual(["hello"])
    })

    it("should return single value after sequential writes on same replica", async () => {
      const program = Effect.gen(function* () {
        const register = yield* MVRegister.make<string>(ReplicaId("replica-1"))

        yield* MVRegister.set(register, "first")
        yield* MVRegister.set(register, "second")
        yield* MVRegister.set(register, "third")

        return yield* MVRegister.get(register)
      })

      const result = await Effect.runPromise(program)
      expect(result).toEqual(["third"])
    })
  })

  describe("Concurrent Writes", () => {
    it("should preserve concurrent writes from different replicas", async () => {
      const program = Effect.gen(function* () {
        const reg1 = yield* MVRegister.make<string>(ReplicaId("replica-1"))
        const reg2 = yield* MVRegister.make<string>(ReplicaId("replica-2"))

        // Concurrent writes
        yield* MVRegister.set(reg1, "value1")
        yield* MVRegister.set(reg2, "value2")

        // Merge both directions
        const state1 = yield* MVRegister.query(reg1)
        const state2 = yield* MVRegister.query(reg2)

        yield* MVRegister.merge(reg1, state2)
        yield* MVRegister.merge(reg2, state1)

        const vals1 = yield* MVRegister.get(reg1)
        const vals2 = yield* MVRegister.get(reg2)

        return { vals1, vals2 }
      })

      const result = await Effect.runPromise(program)

      // Both replicas should have both values (concurrent)
      expect(Array.from(result.vals1).sort()).toEqual(["value1", "value2"])
      expect(Array.from(result.vals2).sort()).toEqual(["value1", "value2"])
    })

    it("should preserve all concurrent values from multiple replicas", async () => {
      const program = Effect.gen(function* () {
        const reg1 = yield* MVRegister.make<string>(ReplicaId("replica-1"))
        const reg2 = yield* MVRegister.make<string>(ReplicaId("replica-2"))
        const reg3 = yield* MVRegister.make<string>(ReplicaId("replica-3"))

        // All write concurrently
        yield* MVRegister.set(reg1, "apple")
        yield* MVRegister.set(reg2, "banana")
        yield* MVRegister.set(reg3, "cherry")

        // Merge all to reg1
        const state2 = yield* MVRegister.query(reg2)
        const state3 = yield* MVRegister.query(reg3)

        yield* MVRegister.merge(reg1, state2)
        yield* MVRegister.merge(reg1, state3)

        return yield* MVRegister.get(reg1)
      })

      const result = await Effect.runPromise(program)
      expect(Array.from(result).sort()).toEqual(["apple", "banana", "cherry"])
    })
  })

  describe("Causal Dominance", () => {
    it("should prune dominated values when causally ordered write happens", async () => {
      const program = Effect.gen(function* () {
        const reg1 = yield* MVRegister.make<string>(ReplicaId("replica-1"))
        const reg2 = yield* MVRegister.make<string>(ReplicaId("replica-2"))

        // reg1 writes first
        yield* MVRegister.set(reg1, "first")

        // reg2 receives reg1's state and writes (causally after)
        const state1 = yield* MVRegister.query(reg1)
        yield* MVRegister.merge(reg2, state1)
        yield* MVRegister.set(reg2, "second")

        // reg1 receives reg2's state
        const state2 = yield* MVRegister.query(reg2)
        yield* MVRegister.merge(reg1, state2)

        const vals1 = yield* MVRegister.get(reg1)

        return vals1
      })

      const result = await Effect.runPromise(program)

      // Only "second" should remain as it causally dominates "first"
      expect(result).toEqual(["second"])
    })

    it("should handle complex causal chains", async () => {
      const program = Effect.gen(function* () {
        const reg1 = yield* MVRegister.make<string>(ReplicaId("replica-1"))
        const reg2 = yield* MVRegister.make<string>(ReplicaId("replica-2"))
        const reg3 = yield* MVRegister.make<string>(ReplicaId("replica-3"))

        // reg1: v1
        yield* MVRegister.set(reg1, "v1")

        // reg2: sees v1, writes v2 (v2 > v1)
        const state1 = yield* MVRegister.query(reg1)
        yield* MVRegister.merge(reg2, state1)
        yield* MVRegister.set(reg2, "v2")

        // reg3: sees v2, writes v3 (v3 > v2 > v1)
        const state2 = yield* MVRegister.query(reg2)
        yield* MVRegister.merge(reg3, state2)
        yield* MVRegister.set(reg3, "v3")

        // Merge all to reg1
        const state2Final = yield* MVRegister.query(reg2)
        const state3 = yield* MVRegister.query(reg3)

        yield* MVRegister.merge(reg1, state2Final)
        yield* MVRegister.merge(reg1, state3)

        return yield* MVRegister.get(reg1)
      })

      const result = await Effect.runPromise(program)

      // Only v3 should remain as it dominates all previous values
      expect(result).toEqual(["v3"])
    })

    it("should preserve concurrent values but prune dominated ones", async () => {
      const program = Effect.gen(function* () {
        const reg1 = yield* MVRegister.make<string>(ReplicaId("replica-1"))
        const reg2 = yield* MVRegister.make<string>(ReplicaId("replica-2"))
        const reg3 = yield* MVRegister.make<string>(ReplicaId("replica-3"))

        // reg1 and reg2 write concurrently
        yield* MVRegister.set(reg1, "concurrent1")
        yield* MVRegister.set(reg2, "concurrent2")

        // Merge reg1 and reg2
        const state1 = yield* MVRegister.query(reg1)
        const state2 = yield* MVRegister.query(reg2)
        yield* MVRegister.merge(reg1, state2)
        yield* MVRegister.merge(reg2, state1)

        // reg3 sees both and writes (dominates both)
        const state2Final = yield* MVRegister.query(reg2)
        yield* MVRegister.merge(reg3, state2Final)
        yield* MVRegister.set(reg3, "dominating")

        // Merge back to reg1
        const state3 = yield* MVRegister.query(reg3)
        yield* MVRegister.merge(reg1, state3)

        return yield* MVRegister.get(reg1)
      })

      const result = await Effect.runPromise(program)

      // Only "dominating" should remain
      expect(result).toEqual(["dominating"])
    })
  })

  describe("Merge Operations", () => {
    it("should merge empty registers correctly", async () => {
      const program = Effect.gen(function* () {
        const reg1 = yield* MVRegister.make<string>(ReplicaId("replica-1"))
        const reg2 = yield* MVRegister.make<string>(ReplicaId("replica-2"))

        const state2 = yield* MVRegister.query(reg2)
        yield* MVRegister.merge(reg1, state2)

        return yield* MVRegister.get(reg1)
      })

      const result = await Effect.runPromise(program)
      expect(result).toEqual([])
    })

    it("should be idempotent", async () => {
      const program = Effect.gen(function* () {
        const reg1 = yield* MVRegister.make<string>(ReplicaId("replica-1"))
        const reg2 = yield* MVRegister.make<string>(ReplicaId("replica-2"))

        yield* MVRegister.set(reg2, "value")

        const state2 = yield* MVRegister.query(reg2)

        // Merge multiple times
        yield* MVRegister.merge(reg1, state2)
        const vals1 = yield* MVRegister.get(reg1)

        yield* MVRegister.merge(reg1, state2)
        const vals2 = yield* MVRegister.get(reg1)

        yield* MVRegister.merge(reg1, state2)
        const vals3 = yield* MVRegister.get(reg1)

        return { vals1, vals2, vals3 }
      })

      const result = await Effect.runPromise(program)

      expect(result.vals1).toEqual(["value"])
      expect(result.vals2).toEqual(["value"])
      expect(result.vals3).toEqual(["value"])
    })

    it("should be commutative", async () => {
      const program = Effect.gen(function* () {
        const reg1 = yield* MVRegister.make<string>(ReplicaId("replica-1"))
        const reg2 = yield* MVRegister.make<string>(ReplicaId("replica-2"))
        const reg3 = yield* MVRegister.make<string>(ReplicaId("replica-3"))
        const reg4 = yield* MVRegister.make<string>(ReplicaId("replica-4"))

        yield* MVRegister.set(reg2, "value2")
        yield* MVRegister.set(reg3, "value3")

        const state2 = yield* MVRegister.query(reg2)
        const state3 = yield* MVRegister.query(reg3)

        // Merge in different orders
        yield* MVRegister.merge(reg1, state2)
        yield* MVRegister.merge(reg1, state3)

        yield* MVRegister.merge(reg4, state3)
        yield* MVRegister.merge(reg4, state2)

        const vals1 = yield* MVRegister.get(reg1)
        const vals4 = yield* MVRegister.get(reg4)

        return { vals1: Array.from(vals1).sort(), vals4: Array.from(vals4).sort() }
      })

      const result = await Effect.runPromise(program)

      expect(result.vals1).toEqual(Array.from(result.vals4).sort())
    })

    it("should be associative", async () => {
      const program = Effect.gen(function* () {
        const reg1 = yield* MVRegister.make<string>(ReplicaId("replica-1"))
        const reg2 = yield* MVRegister.make<string>(ReplicaId("replica-2"))
        const reg3 = yield* MVRegister.make<string>(ReplicaId("replica-3"))
        const regA = yield* MVRegister.make<string>(ReplicaId("replica-A"))
        const regB = yield* MVRegister.make<string>(ReplicaId("replica-B"))

        yield* MVRegister.set(reg1, "v1")
        yield* MVRegister.set(reg2, "v2")
        yield* MVRegister.set(reg3, "v3")

        const state1 = yield* MVRegister.query(reg1)
        const state2 = yield* MVRegister.query(reg2)
        const state3 = yield* MVRegister.query(reg3)

        // (A merge 1) merge (2 merge 3)
        yield* MVRegister.merge(regA, state1)
        const temp = yield* MVRegister.make<string>(ReplicaId("temp"))
        yield* MVRegister.merge(temp, state2)
        yield* MVRegister.merge(temp, state3)
        const tempState = yield* MVRegister.query(temp)
        yield* MVRegister.merge(regA, tempState)

        // ((B merge 1) merge 2) merge 3
        yield* MVRegister.merge(regB, state1)
        yield* MVRegister.merge(regB, state2)
        yield* MVRegister.merge(regB, state3)

        const valsA = yield* MVRegister.get(regA)
        const valsB = yield* MVRegister.get(regB)

        return { valsA: Array.from(valsA).sort(), valsB: Array.from(valsB).sort() }
      })

      const result = await Effect.runPromise(program)

      expect(result.valsA).toEqual(Array.from(result.valsB).sort())
    })
  })

  describe("getWithClocks", () => {
    it("should return values with their vector clocks", async () => {
      const program = Effect.gen(function* () {
        const register = yield* MVRegister.make<string>(ReplicaId("replica-1"))

        yield* MVRegister.set(register, "value1")

        return yield* MVRegister.getWithClocks(register)
      })

      const result = await Effect.runPromise(program)

      expect(result).toHaveLength(1)
      expect(result[0]!.value).toBe("value1")
      expect(result[0]!.clock.counters.get(ReplicaId("replica-1"))).toBe(1)
    })

    it("should show concurrent values with different clocks", async () => {
      const program = Effect.gen(function* () {
        const reg1 = yield* MVRegister.make<string>(ReplicaId("replica-1"))
        const reg2 = yield* MVRegister.make<string>(ReplicaId("replica-2"))

        yield* MVRegister.set(reg1, "from-r1")
        yield* MVRegister.set(reg2, "from-r2")

        const state2 = yield* MVRegister.query(reg2)
        yield* MVRegister.merge(reg1, state2)

        return yield* MVRegister.getWithClocks(reg1)
      })

      const result = await Effect.runPromise(program)

      expect(result).toHaveLength(2)

      const fromR1 = result.find((e) => e.value === "from-r1")
      const fromR2 = result.find((e) => e.value === "from-r2")

      expect(fromR1).toBeDefined()
      expect(fromR2).toBeDefined()

      expect(fromR1!.clock.counters.get(ReplicaId("replica-1"))).toBe(1)
      expect(fromR2!.clock.counters.get(ReplicaId("replica-2"))).toBe(1)
    })
  })

  describe("State Persistence", () => {
    it("should restore from state correctly", async () => {
      const program = Effect.gen(function* () {
        const reg1 = yield* MVRegister.make<string>(ReplicaId("replica-1"))
        const reg2 = yield* MVRegister.make<string>(ReplicaId("replica-2"))

        yield* MVRegister.set(reg1, "value1")
        yield* MVRegister.set(reg2, "value2")

        const state2 = yield* MVRegister.query(reg2)
        yield* MVRegister.merge(reg1, state2)

        // Save and restore
        const state = yield* MVRegister.query(reg1)
        const restored = yield* MVRegister.fromState(state)

        return yield* MVRegister.get(restored)
      })

      const result = await Effect.runPromise(program)
      expect(Array.from(result).sort()).toEqual(["value1", "value2"])
    })

    it("should preserve causal relationships after restore", async () => {
      const program = Effect.gen(function* () {
        const reg1 = yield* MVRegister.make<string>(ReplicaId("replica-1"))

        yield* MVRegister.set(reg1, "first")
        yield* MVRegister.set(reg1, "second")

        const state = yield* MVRegister.query(reg1)
        const restored = yield* MVRegister.fromState(state)

        return yield* MVRegister.get(restored)
      })

      const result = await Effect.runPromise(program)

      // Should only have "second" as it dominated "first"
      expect(result).toEqual(["second"])
    })
  })

  describe("Layer Usage", () => {
    it("should use Layer for dependency injection", async () => {
      const program = Effect.gen(function* () {
        const register = yield* MVRegister.Tag<string>()

        yield* MVRegister.set(register, "injected-value")
        return yield* MVRegister.get(register)
      })

      const result = await Effect.runPromise(
        program.pipe(Effect.provide(MVRegister.Live<string>(ReplicaId("replica-1"))))
      )

      expect(result).toEqual(["injected-value"])
    })

    it("should support initial value in Layer", async () => {
      const program = Effect.gen(function* () {
        const register = yield* MVRegister.Tag<string>()
        return yield* MVRegister.get(register)
      })

      const result = await Effect.runPromise(
        program.pipe(Effect.provide(MVRegister.Live<string>(ReplicaId("replica-1"), "initial")))
      )

      expect(result).toEqual(["initial"])
    })
  })

  describe("Complex Scenarios", () => {
    it("should handle diamond merge pattern", async () => {
      const program = Effect.gen(function* () {
        // Create diamond pattern:
        //     reg1
        //    /    \
        //  reg2   reg3
        //    \    /
        //     reg4

        const reg1 = yield* MVRegister.make<string>(ReplicaId("replica-1"))
        const reg2 = yield* MVRegister.make<string>(ReplicaId("replica-2"))
        const reg3 = yield* MVRegister.make<string>(ReplicaId("replica-3"))
        const reg4 = yield* MVRegister.make<string>(ReplicaId("replica-4"))

        // reg1 has initial value
        yield* MVRegister.set(reg1, "initial")

        // Both reg2 and reg3 see initial and write concurrently
        const state1 = yield* MVRegister.query(reg1)
        yield* MVRegister.merge(reg2, state1)
        yield* MVRegister.merge(reg3, state1)

        yield* MVRegister.set(reg2, "from-reg2")
        yield* MVRegister.set(reg3, "from-reg3")

        // reg4 merges both
        const state2 = yield* MVRegister.query(reg2)
        const state3 = yield* MVRegister.query(reg3)

        yield* MVRegister.merge(reg4, state2)
        yield* MVRegister.merge(reg4, state3)

        return yield* MVRegister.get(reg4)
      })

      const result = await Effect.runPromise(program)

      // Both concurrent writes should be preserved, initial should be pruned
      expect(Array.from(result).sort()).toEqual(["from-reg2", "from-reg3"])
    })

    it("should handle multiple concurrent writes then causal write", async () => {
      const program = Effect.gen(function* () {
        const reg1 = yield* MVRegister.make<string>(ReplicaId("replica-1"))
        const reg2 = yield* MVRegister.make<string>(ReplicaId("replica-2"))
        const reg3 = yield* MVRegister.make<string>(ReplicaId("replica-3"))
        const reg4 = yield* MVRegister.make<string>(ReplicaId("replica-4"))

        // Three concurrent writes
        yield* MVRegister.set(reg1, "concurrent1")
        yield* MVRegister.set(reg2, "concurrent2")
        yield* MVRegister.set(reg3, "concurrent3")

        // Merge all to reg4
        const state1 = yield* MVRegister.query(reg1)
        const state2 = yield* MVRegister.query(reg2)
        const state3 = yield* MVRegister.query(reg3)

        yield* MVRegister.merge(reg4, state1)
        yield* MVRegister.merge(reg4, state2)
        yield* MVRegister.merge(reg4, state3)

        // Check concurrent values
        const concurrentVals = yield* MVRegister.get(reg4)

        // Now reg4 writes (causally after all three)
        yield* MVRegister.set(reg4, "final")

        const finalVals = yield* MVRegister.get(reg4)

        return { concurrentVals: Array.from(concurrentVals).sort(), finalVals }
      })

      const result = await Effect.runPromise(program)

      expect(result.concurrentVals).toEqual(["concurrent1", "concurrent2", "concurrent3"])
      expect(result.finalVals).toEqual(["final"])
    })
  })
})
