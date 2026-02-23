/**
 * Unit tests for LWW-Register CRDT.
 *
 * @since 0.1.0
 */

import { describe, it, expect } from "vitest"
import * as Effect from "effect/Effect"
import * as Option from "effect/Option"
import * as Duration from "effect/Duration"
import * as LWWRegister from "./LWWRegister"
import { ReplicaId } from "./CRDT"
import * as VectorClock from "./VectorClock"

describe("LWWRegister", () => {
  describe("Basic Operations", () => {
    it("should start with None when no initial value", async () => {
      const result = await Effect.runPromise(
        Effect.gen(function* () {
          const register = yield* LWWRegister.make(ReplicaId("replica-1"))
          return yield* LWWRegister.get(register)
        }).pipe(Effect.provide(VectorClock.Live(ReplicaId("replica-1"))))
      )
      expect(Option.isNone(result)).toBe(true)
    })

    it("should start with initial value when provided", async () => {
      const result = await Effect.runPromise(
        Effect.gen(function* () {
          const register = yield* LWWRegister.make(ReplicaId("replica-1"), "initial")
          return yield* LWWRegister.get(register)
        }).pipe(Effect.provide(VectorClock.Live(ReplicaId("replica-1"))))
      )
      expect(Option.isSome(result)).toBe(true)
      expect(Option.getOrThrow(result)).toBe("initial")
    })

    it("should set value correctly", async () => {
      const program = Effect.gen(function* () {
        const register = yield* LWWRegister.make(ReplicaId("replica-1"))
        yield* LWWRegister.set(register, "hello")
        return yield* LWWRegister.get(register)
      })

      const result = await Effect.runPromise(program
      )
      expect(Option.isSome(result)).toBe(true)
      expect(Option.getOrThrow(result)).toBe("hello")
    })

    it("should overwrite value on subsequent set", async () => {
      const program = Effect.gen(function* () {
        const register = yield* LWWRegister.make(ReplicaId("replica-1"))
        yield* LWWRegister.set(register, "first")
        yield* LWWRegister.set(register, "second")
        return yield* LWWRegister.get(register)
      })

      const result = await Effect.runPromise(program)
      expect(Option.getOrThrow(result)).toBe("second")
    })

    it("should clear value to None", async () => {
      const program = Effect.gen(function* () {
        const register = yield* LWWRegister.make(ReplicaId("replica-1"))
        yield* LWWRegister.set(register, "hello")
        yield* LWWRegister.clear(register)
        return yield* LWWRegister.get(register)
      })

      const result = await Effect.runPromise(program
      )
      expect(Option.isNone(result)).toBe(true)
    })

    it("should support data-last style with pipe", async () => {
      const program = Effect.gen(function* () {
        const register = yield* LWWRegister.make<string>(ReplicaId("replica-1"))
        yield* LWWRegister.set("first")(register)
        yield* LWWRegister.set("second")(register)
        return yield* LWWRegister.get(register)
      })

      const result = await Effect.runPromise(program
      )
      expect(Option.isSome(result)).toBe(true)
      expect(Option.getOrThrow(result)).toBe("second")
    })
  })

  describe("State Operations", () => {
    it("should query state correctly", async () => {
      const program = Effect.gen(function* () {
        const register = yield* LWWRegister.make(ReplicaId("replica-1"))
        yield* LWWRegister.set(register, "hello")
        return yield* LWWRegister.query(register)
      })

      const result = await Effect.runPromise(program)
      expect(result.type).toBe("LWWRegister")
      expect(result.replicaId).toBe(ReplicaId("replica-1"))
      expect(Option.getOrThrow(result.value)).toBe("hello")
      expect(result.clock.counters.get(ReplicaId("replica-1"))).toBeGreaterThan(0)
    })

    it("should restore from state", async () => {
      const program = Effect.gen(function* () {
        const state: LWWRegister.LWWRegisterState<string> = {
          type: "LWWRegister",
          replicaId: ReplicaId("replica-1"),
          value: Option.some("restored"),
          clock: {
            type: "VectorClock",
            replicaId: ReplicaId("replica-1"),
            counters: new Map([[ReplicaId("replica-1"), 1]])
          }
        }

        const register = yield* LWWRegister.fromState(state)
        const value = yield* LWWRegister.get(register)
        const queryState = yield* LWWRegister.query(register)

        return { value, queryState }
      })

      const result = await Effect.runPromise(program
      )
      expect(Option.getOrThrow(result.value)).toBe("restored")
      expect(result.queryState.clock.counters.get(ReplicaId("replica-1"))).toBe(1)
    })
  })

  describe("Merge and Conflict Resolution", () => {
    it("should merge - higher timestamp wins", async () => {
      const program = Effect.gen(function* () {
        const register1 = yield* LWWRegister.make(ReplicaId("replica-1"))
        yield* LWWRegister.set(register1, "value1")
        const state1 = yield* LWWRegister.query(register1)

        // register2 merges state1 first (establishes causality), then writes
        const register2 = yield* LWWRegister.make(ReplicaId("replica-2"))
        yield* LWWRegister.merge(register2, state1)
        yield* LWWRegister.set(register2, "value2")
        const state2 = yield* LWWRegister.query(register2)

        // Merge state2 (newer) into register1
        yield* LWWRegister.merge(register1, state2)
        const result = yield* LWWRegister.get(register1)

        return { result, clock1: state1.clock, clock2: state2.clock }
      })

      const { result, clock1, clock2 } = await Effect.runPromise(
        program
      )
      // clock2 should be causally after clock1
      expect(VectorClock.happenedAfter(clock2, clock1)).toBe(true)
      expect(Option.getOrThrow(result)).toBe("value2")
    })

    it("should merge - keep own value if timestamp is higher", async () => {
      const program = Effect.gen(function* () {
        const register1 = yield* LWWRegister.make(ReplicaId("replica-1"))
        yield* LWWRegister.set(register1, "newer")

        // Simulate older state from another replica (lower clock)
        const olderState: LWWRegister.LWWRegisterState<string> = {
          type: "LWWRegister",
          replicaId: ReplicaId("replica-2"),
          value: Option.some("older"),
          clock: {
            type: "VectorClock",
            replicaId: ReplicaId("replica-2"),
            counters: new Map([[ReplicaId("replica-2"), 0]])
          }
        }

        yield* LWWRegister.merge(register1, olderState)
        const result = yield* LWWRegister.get(register1)

        return result
      })

      const result = await Effect.runPromise(program
      )
      expect(Option.getOrThrow(result)).toBe("newer")
    })

    it("should merge - replica ID tie-breaking when clocks are concurrent", async () => {
      const program = Effect.gen(function* () {
        // Create concurrent clocks (different replicas, same counter)
        const stateA: LWWRegister.LWWRegisterState<string> = {
          type: "LWWRegister",
          replicaId: ReplicaId("replica-A"),
          value: Option.some("from A"),
          clock: {
            type: "VectorClock",
            replicaId: ReplicaId("replica-A"),
            counters: new Map([[ReplicaId("replica-A"), 1]])
          }
        }

        const stateZ: LWWRegister.LWWRegisterState<string> = {
          type: "LWWRegister",
          replicaId: ReplicaId("replica-Z"),
          value: Option.some("from Z"),
          clock: {
            type: "VectorClock",
            replicaId: ReplicaId("replica-Z"),
            counters: new Map([[ReplicaId("replica-Z"), 1]])
          }
        }

        // Create register from stateA
        const registerA = yield* LWWRegister.fromState(stateA)

        // Merge stateZ (concurrent, but lexicographically higher replica ID)
        yield* LWWRegister.merge(registerA, stateZ)
        const result = yield* LWWRegister.get(registerA)

        return result
      })

      const result = await Effect.runPromise(
        program
      )
      // replica-Z > replica-A lexicographically, so Z wins
      expect(Option.getOrThrow(result)).toBe("from Z")
    })

    it("should merge - idempotent merge", async () => {
      const program = Effect.gen(function* () {
        const register1 = yield* LWWRegister.make(ReplicaId("replica-1"))
        yield* LWWRegister.set(register1, "value")

        const state = yield* LWWRegister.query(register1)

        // Merge same state multiple times
        yield* LWWRegister.merge(register1, state)
        yield* LWWRegister.merge(register1, state)
        yield* LWWRegister.merge(register1, state)

        const result = yield* LWWRegister.get(register1)
        return result
      })

      const result = await Effect.runPromise(
        program
      )
      expect(Option.getOrThrow(result)).toBe("value")
    })

    it("should merge - commutative property", async () => {
      const program = Effect.gen(function* () {
        // Create three states with proper causal chain
        const reg1 = yield* LWWRegister.make(ReplicaId("replica-1"))
        yield* LWWRegister.set(reg1, "value1")
        const state1 = yield* LWWRegister.query(reg1)

        // reg2 merges reg1's state first (establishes causality), then writes
        const reg2 = yield* LWWRegister.make(ReplicaId("replica-2"))
        yield* LWWRegister.merge(reg2, state1)
        yield* LWWRegister.set(reg2, "value2")
        const state2 = yield* LWWRegister.query(reg2)

        // reg3 merges reg2's state (which includes reg1), then writes
        const reg3 = yield* LWWRegister.make(ReplicaId("replica-3"))
        yield* LWWRegister.merge(reg3, state2)
        yield* LWWRegister.set(reg3, "value3")
        const state3 = yield* LWWRegister.query(reg3)

        // Now state3 happened after state2 happened after state1 (causal chain)
        // Merge in order: 1, 2, 3
        const regA = yield* LWWRegister.make(ReplicaId("merged-A"))
        yield* LWWRegister.merge(regA, state1)
        yield* LWWRegister.merge(regA, state2)
        yield* LWWRegister.merge(regA, state3)
        const resultA = yield* LWWRegister.get(regA)

        // Merge in different order: 3, 1, 2
        const regB = yield* LWWRegister.make(ReplicaId("merged-B"))
        yield* LWWRegister.merge(regB, state3)
        yield* LWWRegister.merge(regB, state1)
        yield* LWWRegister.merge(regB, state2)
        const resultB = yield* LWWRegister.get(regB)

        return { resultA, resultB }
      })

      const { resultA, resultB } = await Effect.runPromise(
        program
      )
      // Both should converge to value3 (it happened after value2 and value1)
      expect(Option.getOrThrow(resultA)).toBe("value3")
      expect(Option.getOrThrow(resultB)).toBe("value3")
      expect(resultA).toEqual(resultB)
    })

    it("should merge - associative property", async () => {
      const program = Effect.gen(function* () {
        const reg1 = yield* LWWRegister.make(ReplicaId("replica-1"))
        yield* LWWRegister.set(reg1, "v1")
        const s1 = yield* LWWRegister.query(reg1)

        yield* Effect.sleep(Duration.millis(10))
        const reg2 = yield* LWWRegister.make(ReplicaId("replica-2"))
        yield* LWWRegister.set(reg2, "v2")
        const s2 = yield* LWWRegister.query(reg2)

        yield* Effect.sleep(Duration.millis(10))
        const reg3 = yield* LWWRegister.make(ReplicaId("replica-3"))
        yield* LWWRegister.set(reg3, "v3")
        const s3 = yield* LWWRegister.query(reg3)

        // (a merge b) merge c
        const regA = yield* LWWRegister.make(ReplicaId("test-A"))
        yield* LWWRegister.merge(regA, s1)
        yield* LWWRegister.merge(regA, s2)
        yield* LWWRegister.merge(regA, s3)
        const resultA = yield* LWWRegister.get(regA)

        // a merge (b merge c)
        const regB = yield* LWWRegister.make(ReplicaId("test-B"))
        const temp = yield* LWWRegister.make(ReplicaId("temp"))
        yield* LWWRegister.merge(temp, s2)
        yield* LWWRegister.merge(temp, s3)
        const tempState = yield* LWWRegister.query(temp)
        yield* LWWRegister.merge(regB, s1)
        yield* LWWRegister.merge(regB, tempState)
        const resultB = yield* LWWRegister.get(regB)

        return { resultA, resultB }
      })

      const { resultA, resultB } = await Effect.runPromise(
        program
      )
      expect(resultA).toEqual(resultB)
    })
  })

  describe("Concurrent Writes Scenarios", () => {
    it("should handle concurrent writes - same replica", async () => {
      const program = Effect.gen(function* () {
        const register = yield* LWWRegister.make(ReplicaId("replica-1"))

        // Sequential writes (each gets a new timestamp)
        yield* LWWRegister.set(register, "first")
        yield* LWWRegister.set(register, "second")
        yield* LWWRegister.set(register, "third")

        return yield* LWWRegister.get(register)
      })

      const result = await Effect.runPromise(
        program
      )
      expect(Option.getOrThrow(result)).toBe("third")
    })

    it("should handle concurrent writes - different replicas merging", async () => {
      const program = Effect.gen(function* () {
        // Replica 1 writes
        const reg1 = yield* LWWRegister.make(ReplicaId("replica-1"))
        yield* LWWRegister.set(reg1, "from-1")
        const state1 = yield* LWWRegister.query(reg1)

        yield* Effect.sleep(Duration.millis(10))
        // Replica 2 writes (later timestamp)
        const reg2 = yield* LWWRegister.make(ReplicaId("replica-2"))
        yield* LWWRegister.set(reg2, "from-2")
        const state2 = yield* LWWRegister.query(reg2)

        // Both replicas merge each other's state
        yield* LWWRegister.merge(reg1, state2)
        yield* LWWRegister.merge(reg2, state1)

        const result1 = yield* LWWRegister.get(reg1)
        const result2 = yield* LWWRegister.get(reg2)

        return { result1, result2 }
      })

      const { result1, result2 } = await Effect.runPromise(
        program
      )
      // Both should converge to "from-2" (higher timestamp)
      expect(Option.getOrThrow(result1)).toBe("from-2")
      expect(Option.getOrThrow(result2)).toBe("from-2")
    })

    it("should handle network partition scenario", async () => {
      const program = Effect.gen(function* () {
        // Create initial register
        const reg1 = yield* LWWRegister.make(ReplicaId("replica-1"))
        yield* LWWRegister.set(reg1, "initial")
        const initialState = yield* LWWRegister.query(reg1)

        // Replica 2 starts with same state
        const reg2 = yield* LWWRegister.fromState({
          ...initialState,
          replicaId: ReplicaId("replica-2")
        })

        // Network partition - both write independently
        yield* Effect.sleep(Duration.millis(10))
        yield* LWWRegister.set(reg1, "partition-1")

        yield* Effect.sleep(Duration.millis(10))
        yield* LWWRegister.set(reg2, "partition-2")

        // Network heals - replicas exchange states
        const state1 = yield* LWWRegister.query(reg1)
        const state2 = yield* LWWRegister.query(reg2)

        yield* LWWRegister.merge(reg1, state2)
        yield* LWWRegister.merge(reg2, state1)

        const result1 = yield* LWWRegister.get(reg1)
        const result2 = yield* LWWRegister.get(reg2)

        return { result1, result2 }
      })

      const { result1, result2 } = await Effect.runPromise(
        program
      )
      // Both should converge to same value (highest timestamp)
      expect(result1).toEqual(result2)
    })
  })

  describe("Type Safety", () => {
    it("should work with different value types", async () => {
      const program = Effect.gen(function* () {
        const numberReg = yield* LWWRegister.make(ReplicaId("num"), 42)
        const numVal = yield* LWWRegister.get(numberReg)

        const stringReg = yield* LWWRegister.make(ReplicaId("str"), "hello")
        const strVal = yield* LWWRegister.get(stringReg)

        const objReg = yield* LWWRegister.make(ReplicaId("obj"), { x: 1, y: 2 })
        const objVal = yield* LWWRegister.get(objReg)

        return { numVal, strVal, objVal }
      })

      const result = await Effect.runPromise(
        program
      )
      expect(Option.getOrThrow(result.numVal)).toBe(42)
      expect(Option.getOrThrow(result.strVal)).toBe("hello")
      expect(Option.getOrThrow(result.objVal)).toEqual({ x: 1, y: 2 })
    })

    it("should preserve Option semantics", async () => {
      const program = Effect.gen(function* () {
        const register = yield* LWWRegister.make<string>(ReplicaId("replica-1"))

        const none1 = yield* LWWRegister.get(register)
        expect(Option.isNone(none1)).toBe(true)

        yield* LWWRegister.set(register, "value")
        const some = yield* LWWRegister.get(register)
        expect(Option.isSome(some)).toBe(true)

        yield* LWWRegister.clear(register)
        const none2 = yield* LWWRegister.get(register)
        expect(Option.isNone(none2)).toBe(true)

        return true
      })

      await Effect.runPromise(
        program.pipe(Effect.provide(VectorClock.Live(ReplicaId("replica-1"))))
      )
    })
  })

  describe("Layer Integration", () => {
    it("should work with Layer for dependency injection", async () => {
      const RegisterTag = LWWRegister.Tag<string>()

      const program = Effect.gen(function* () {
        const register = yield* RegisterTag
        yield* LWWRegister.set(register, "via layer")
        return yield* LWWRegister.get(register)
      })

      const result = await Effect.runPromise(
        program.pipe(
          Effect.provide(LWWRegister.Live(RegisterTag, ReplicaId("replica-1")))
        )
      )

      expect(Option.getOrThrow(result)).toBe("via layer")
    })

    it("should work with Layer and initial value", async () => {
      const RegisterTag = LWWRegister.Tag<number>()

      const program = Effect.gen(function* () {
        const register = yield* RegisterTag
        return yield* LWWRegister.get(register)
      })

      const result = await Effect.runPromise(
        program.pipe(
          Effect.provide(LWWRegister.Live(RegisterTag, ReplicaId("replica-1"), 100))
        )
      )

      expect(Option.getOrThrow(result)).toBe(100)
    })
  })

  describe("CRDT Properties (Property-Based Testing)", () => {
    it("should satisfy eventual consistency", async () => {
      const program = Effect.gen(function* () {
        // Create multiple replicas
        const replicas = yield* Effect.all([
          LWWRegister.make(ReplicaId("r1")),
          LWWRegister.make(ReplicaId("r2")),
          LWWRegister.make(ReplicaId("r3"))
        ])

        // Each writes a value at different times
        yield* LWWRegister.set(replicas[0], "v1")
        yield* Effect.sleep(Duration.millis(10))
        yield* LWWRegister.set(replicas[1], "v2")
        yield* Effect.sleep(Duration.millis(10))
        yield* LWWRegister.set(replicas[2], "v3")

        // Collect all states
        const states = yield* Effect.all(
          replicas.map(r => LWWRegister.query(r))
        )

        // Create new replica and merge all states
        const finalReg = yield* LWWRegister.make(ReplicaId("final"))
        for (const state of states) {
          yield* LWWRegister.merge(finalReg, state)
        }

        return yield* LWWRegister.get(finalReg)
      })

      const result = await Effect.runPromise(
        program
      )
      // Should converge to the value with highest timestamp
      expect(Option.getOrThrow(result)).toBe("v3")
    })

    it("should handle empty merges", async () => {
      const program = Effect.gen(function* () {
        const reg1 = yield* LWWRegister.make<string>(ReplicaId("r1"))
        const reg2 = yield* LWWRegister.make<string>(ReplicaId("r2"))

        // Both empty, merge should be idempotent
        const state2 = yield* LWWRegister.query(reg2)
        yield* LWWRegister.merge(reg1, state2)

        const result = yield* LWWRegister.get(reg1)
        return Option.isNone(result)
      })

      const result = await Effect.runPromise(
        program
      )
      expect(result).toBe(true)
    })

    it("should merge None with Some correctly", async () => {
      const program = Effect.gen(function* () {
        const regEmpty = yield* LWWRegister.make<string>(ReplicaId("empty"))
        const stateEmpty = yield* LWWRegister.query(regEmpty)

        yield* Effect.sleep(Duration.millis(10))
        const regFull = yield* LWWRegister.make<string>(ReplicaId("full"))
        yield* LWWRegister.set(regFull, "value")
        const stateFull = yield* LWWRegister.query(regFull)

        // Merge full into empty - full should win (higher timestamp)
        yield* LWWRegister.merge(regEmpty, stateFull)
        const result1 = yield* LWWRegister.get(regEmpty)

        // Merge empty into full - full should keep its value
        yield* LWWRegister.merge(regFull, stateEmpty)
        const result2 = yield* LWWRegister.get(regFull)

        return { result1, result2 }
      })

      const { result1, result2 } = await Effect.runPromise(
        program
      )
      expect(Option.getOrThrow(result1)).toBe("value")
      expect(Option.getOrThrow(result2)).toBe("value")
    })
  })
})
