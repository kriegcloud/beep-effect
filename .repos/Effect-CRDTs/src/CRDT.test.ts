/**
 * Property-based tests for CRDT laws.
 *
 * These tests verify that CRDTs satisfy the mathematical properties required
 * for strong eventual consistency:
 * - Commutativity: merge(a, b) = merge(b, a)
 * - Associativity: merge(merge(a, b), c) = merge(a, merge(b, c))
 * - Idempotence: merge(a, a) = a
 *
 * @since 0.1.0
 */

import { describe, it, expect } from "vitest"
import * as Array from "effect/Array"
import * as Effect from "effect/Effect"
import * as FastCheck from "effect/FastCheck"
import * as STM from "effect/STM"
import * as GCounter from "./GCounter"
import * as PNCounter from "./PNCounter"
import * as GSet from "./GSet"
import * as TwoPSet from "./TwoPSet"
import { ReplicaId } from "./CRDT"

describe("CRDT Laws", () => {
  describe("G-Counter", () => {
    describe("Commutativity", () => {
      it("merge(a, b) = merge(b, a)", async () => FastCheck.assert(
        FastCheck.asyncProperty(
          FastCheck
            .record({
              replicaA: FastCheck.string().filter((s) => s.length > 0),
              replicaB: FastCheck.string().filter((s) => s.length > 0),
              valueA: FastCheck.nat({ max: 1000 }),
              valueB: FastCheck.nat({ max: 1000 })
            })
            .filter(({ replicaA, replicaB }) => replicaA !== replicaB),
          async ({ replicaA, replicaB, valueA, valueB }) => {
            const program = Effect.gen(function* () {
              // Create two counters on different replicas
              const counter1 = yield* GCounter.make(ReplicaId(replicaA))
              const counter2 = yield* GCounter.make(ReplicaId(replicaB))

              // Increment both counters
              yield* GCounter.increment(counter1, valueA)
              yield* GCounter.increment(counter2, valueB)

              // Get states
              const stateA = yield* GCounter.query(counter1)
              const stateB = yield* GCounter.query(counter2)

              // Test merge(A, B)
              const counterAB1 = yield* GCounter.make(ReplicaId("test-ab1"))
              const counterAB2 = yield* GCounter.make(ReplicaId("test-ab2"))

              yield* GCounter.merge(counterAB1, stateA)
              yield* GCounter.merge(counterAB1, stateB)
              const resultAB = yield* GCounter.value(counterAB1)

              // Test merge(B, A)
              yield* GCounter.merge(counterAB2, stateB)
              yield* GCounter.merge(counterAB2, stateA)
              const resultBA = yield* GCounter.value(counterAB2)

              return resultAB === resultBA && resultAB === valueA + valueB
            })

            const result = await Effect.runPromise(program)
            expect(result).toBe(true)
          }
        ),
        { numRuns: 50 }
      ))
    })

    describe("Associativity", () => {
      it("merge(merge(a, b), c) = merge(a, merge(b, c))", async () => FastCheck.assert(
        FastCheck.asyncProperty(
          FastCheck
            .record({
              replicaA: FastCheck.string().filter((s) => s.length > 0),
              replicaB: FastCheck.string().filter((s) => s.length > 0),
              replicaC: FastCheck.string().filter((s) => s.length > 0),
              valueA: FastCheck.nat({ max: 1000 }),
              valueB: FastCheck.nat({ max: 1000 }),
              valueC: FastCheck.nat({ max: 1000 })
            })
            .filter(
              ({ replicaA, replicaB, replicaC }) =>
                replicaA !== replicaB && replicaB !== replicaC && replicaA !== replicaC
            ),
          async ({ replicaA, replicaB, replicaC, valueA, valueB, valueC }) => {
            const program = Effect.gen(function* () {
              // Create three counters
              const counterA = yield* GCounter.make(ReplicaId(replicaA))
              const counterB = yield* GCounter.make(ReplicaId(replicaB))
              const counterC = yield* GCounter.make(ReplicaId(replicaC))

              yield* GCounter.increment(counterA, valueA)
              yield* GCounter.increment(counterB, valueB)
              yield* GCounter.increment(counterC, valueC)

              const stateA = yield* GCounter.query(counterA)
              const stateB = yield* GCounter.query(counterB)
              const stateC = yield* GCounter.query(counterC)

              // Test merge(merge(a, b), c)
              const counterLeft = yield* GCounter.make(ReplicaId("test-left"))
              yield* GCounter.merge(counterLeft, stateA)
              yield* GCounter.merge(counterLeft, stateB)
              yield* GCounter.merge(counterLeft, stateC)
              const resultLeft = yield* GCounter.value(counterLeft)

              // Test merge(a, merge(b, c))
              const counterRight = yield* GCounter.make(ReplicaId("test-right"))
              yield* GCounter.merge(counterRight, stateB)
              yield* GCounter.merge(counterRight, stateC)
              yield* GCounter.merge(counterRight, stateA)
              const resultRight = yield* GCounter.value(counterRight)

              return resultLeft === resultRight && resultLeft === valueA + valueB + valueC
            })

            const result = await Effect.runPromise(program)
            expect(result).toBe(true)
          }
        ),
        { numRuns: 50 }
      ))
    })

    describe("Idempotence", () => {
      it("merge(a, a) = a", async () => FastCheck.assert(
        FastCheck.asyncProperty(
          FastCheck.record({
            replica: FastCheck.string().filter((s) => s.length > 0),
            value: FastCheck.nat({ max: 1000 })
          }),
          async ({ replica, value }) => {
            const program = Effect.gen(function* () {
              const counter = yield* GCounter.make(ReplicaId(replica))
              yield* GCounter.increment(counter, value)

              const valueBefore = yield* GCounter.value(counter)
              const state = yield* GCounter.query(counter)

              // Merge with itself
              yield* GCounter.merge(counter, state)

              const valueAfter = yield* GCounter.value(counter)

              return valueBefore === valueAfter && valueBefore === value
            })

            const result = await Effect.runPromise(program)
            expect(result).toBe(true)
          }
        ),
        { numRuns: 50 }
      )
      )
    })

    describe("Monotonicity", () => {
      it("values only increase for G-Counter", async () => {
        const program = Effect.gen(function* () {
          const counter = yield* GCounter.make(ReplicaId("monotonic-test"))

          const values = yield* Effect.forEach(
            Array.makeBy(10, (i) => i + 1),
            (increment) => Effect.gen(function* () {
              yield* GCounter.increment(counter, increment)
              return yield* GCounter.value(counter)
            })
          )

          // Check that each value is >= the previous
          return values.every((val, i) => i === 0 || val >= values[i - 1]!)
        })

        const result = await Effect.runPromise(program)
        expect(result).toBe(true)
      })
    })
  })

  describe("PN-Counter", () => {
    describe("Chaining", () => {
      it("should support fluent chaining with dual currying", async () => {
        const program = Effect.gen(function* () {
          const counter = yield* PNCounter.make(ReplicaId("replica-1"))

          // Chain increment and decrement operations in single transaction
          yield* PNCounter.increment(counter, 10).pipe(
            STM.flatMap(PNCounter.decrement(3)),   // Curried!
            STM.flatMap(PNCounter.increment(5)),
            STM.flatMap(PNCounter.decrement(2))
          )

          const value = yield* PNCounter.value(counter)
          expect(value).toBe(10)  // 10 - 3 + 5 - 2 = 10

          return value
        })

        const result = await Effect.runPromise(program)
        expect(result).toBe(10)
      })
    })

    describe("Commutativity", () => {
      it("merge(a, b) = merge(b, a) with increments and decrements", async () => FastCheck.assert(
        FastCheck.asyncProperty(
          FastCheck
            .record({
              replicaA: FastCheck.string().filter((s) => s.length > 0),
              replicaB: FastCheck.string().filter((s) => s.length > 0),
              incA: FastCheck.nat({ max: 1000 }),
              decA: FastCheck.nat({ max: 1000 }),
              incB: FastCheck.nat({ max: 1000 }),
              decB: FastCheck.nat({ max: 1000 })
            })
            .filter(({ replicaA, replicaB }) => replicaA !== replicaB),
          async ({ replicaA, replicaB, incA, decA, incB, decB }) => {
            const program = Effect.gen(function* () {
              const counter1 = yield* PNCounter.make(ReplicaId(replicaA))
              const counter2 = yield* PNCounter.make(ReplicaId(replicaB))

              yield* PNCounter.increment(counter1, incA)
              yield* PNCounter.decrement(counter1, decA)
              yield* PNCounter.increment(counter2, incB)
              yield* PNCounter.decrement(counter2, decB)

              const stateA = yield* PNCounter.query(counter1)
              const stateB = yield* PNCounter.query(counter2)

              // Test merge(A, B)
              const counterAB = yield* PNCounter.make(ReplicaId("test-ab"))
              yield* PNCounter.merge(counterAB, stateA)
              yield* PNCounter.merge(counterAB, stateB)
              const resultAB = yield* PNCounter.value(counterAB)

              // Test merge(B, A)
              const counterBA = yield* PNCounter.make(ReplicaId("test-ba"))
              yield* PNCounter.merge(counterBA, stateB)
              yield* PNCounter.merge(counterBA, stateA)
              const resultBA = yield* PNCounter.value(counterBA)

              const expected = incA - decA + incB - decB
              return resultAB === resultBA && resultAB === expected
            })

            const result = await Effect.runPromise(program)
            expect(result).toBe(true)
          }
        ),
        { numRuns: 50 }
      )
      )
    })

    describe("Idempotence", () => {
      it("merge(a, a) = a", async () => FastCheck.assert(
        FastCheck.asyncProperty(
          FastCheck.record({
            replica: FastCheck.string().filter((s) => s.length > 0),
            inc: FastCheck.nat({ max: 1000 }),
            dec: FastCheck.nat({ max: 1000 })
          }),
          async ({ replica, inc, dec }) => {
            const program = Effect.gen(function* () {
              const counter = yield* PNCounter.make(ReplicaId(replica))
              yield* PNCounter.increment(counter, inc)
              yield* PNCounter.decrement(counter, dec)

              const valueBefore = yield* PNCounter.value(counter)
              const state = yield* PNCounter.query(counter)

              // Merge with itself
              yield* PNCounter.merge(counter, state)

              const valueAfter = yield* PNCounter.value(counter)

              return valueBefore === valueAfter && valueBefore === inc - dec
            })

            const result = await Effect.runPromise(program)
            expect(result).toBe(true)
          }
        ),
        { numRuns: 50 }
      ))
    })
  })

  describe("G-Set", () => {
    describe("Chaining", () => {
      it("should support fluent chaining with dual currying", async () => {
        const program = Effect.gen(function* () {
          const set = yield* GSet.make<string>(ReplicaId("replica-1"))

          // Chain add operations in single transaction
          yield* GSet.add(set, "apple").pipe(
            STM.flatMap(GSet.add("banana")),    // Curried!
            STM.flatMap(GSet.add("cherry")),
            STM.flatMap(GSet.add("apple"))      // Duplicate, idempotent
          )

          const size = yield* GSet.size(set)
          expect(size).toBe(3)

          const values = yield* GSet.values(set)
          const sorted = [...values].sort()
          expect(sorted).toEqual(["apple", "banana", "cherry"])

          return size
        })

        const result = await Effect.runPromise(program)
        expect(result).toBe(3)
      })
    })

    describe("Commutativity", () => {
      it("merge(a, b) = merge(b, a)", async () => FastCheck.assert(
        FastCheck.asyncProperty(
          FastCheck
            .record({
              replicaA: FastCheck.string().filter((s) => s.length > 0),
              replicaB: FastCheck.string().filter((s) => s.length > 0),
              itemsA: FastCheck.array(FastCheck.string(), { maxLength: 10 }),
              itemsB: FastCheck.array(FastCheck.string(), { maxLength: 10 })
            })
            .filter(({ replicaA, replicaB }) => replicaA !== replicaB),
          async ({ replicaA, replicaB, itemsA, itemsB }) => {
            const program = Effect.gen(function* () {
              const set1 = yield* GSet.make<string>(ReplicaId(replicaA))
              const set2 = yield* GSet.make<string>(ReplicaId(replicaB))

              // Add items to both sets
              yield* Effect.forEach(itemsA, (item) => GSet.add(set1, item))
              yield* Effect.forEach(itemsB, (item) => GSet.add(set2, item))

              const stateA = yield* GSet.query(set1)
              const stateB = yield* GSet.query(set2)

              // Test merge(A, B)
              const setAB = yield* GSet.make<string>(ReplicaId("test-ab"))
              yield* GSet.merge(setAB, stateA)
              yield* GSet.merge(setAB, stateB)
              const resultAB = yield* GSet.values(setAB)

              // Test merge(B, A)
              const setBA = yield* GSet.make<string>(ReplicaId("test-ba"))
              yield* GSet.merge(setBA, stateB)
              yield* GSet.merge(setBA, stateA)
              const resultBA = yield* GSet.values(setBA)

              // Compare sets
              if (resultAB.size !== resultBA.size) return false
              for (const item of resultAB) {
                if (!resultBA.has(item)) return false
              }
              return true
            })

            const result = await Effect.runPromise(program)
            expect(result).toBe(true)
          }
        ),
        { numRuns: 50 }
      ))
    })

    describe("Idempotence", () => {
      it("merge(a, a) = a", async () => FastCheck.assert(
        FastCheck.asyncProperty(
          FastCheck.record({
            replica: FastCheck.string().filter((s) => s.length > 0),
            items: FastCheck.array(FastCheck.string(), { maxLength: 10 })
          }),
          async ({ replica, items }) => {
            const program = Effect.gen(function* () {
              const set = yield* GSet.make<string>(ReplicaId(replica))

              yield* Effect.forEach(items, (item) => GSet.add(set, item))

              const sizeBefore = yield* GSet.size(set)
              const state = yield* GSet.query(set)

              // Merge with itself
              yield* GSet.merge(set, state)

              const sizeAfter = yield* GSet.size(set)

              return sizeBefore === sizeAfter
            })

            const result = await Effect.runPromise(program)
            expect(result).toBe(true)
          }
        ),
        { numRuns: 50 }
      ))
    })

    describe("Monotonicity", () => {
      it("set only grows for G-Set", async () => {
        const program = Effect.gen(function* () {
          const set = yield* GSet.make<string>(ReplicaId("monotonic-test"))

          const sizes = yield* Effect.forEach(
            Array.makeBy(10, (i) => i),
            (i) => Effect.gen(function* () {
              yield* GSet.add(set, `item-${i}`)
              return yield* GSet.size(set)
            })
          )

          // Check that each size is >= the previous
          return sizes.every((size, i) => i === 0 || size >= sizes[i - 1]!)
        })

        const result = await Effect.runPromise(program)
        expect(result).toBe(true)
      })
    })
  })

  describe("2P-Set", () => {
    describe("Chaining", () => {
      it("should support fluent chaining with dual currying", async () => {
        const program = Effect.gen(function* () {
          const set = yield* TwoPSet.make<string>(ReplicaId("replica-1"))

          // Chain add and remove operations in single transaction
          yield* TwoPSet.add(set, "apple").pipe(
            STM.flatMap(TwoPSet.add("banana")),
            STM.flatMap(TwoPSet.add("cherry")),
            STM.flatMap(TwoPSet.remove("banana"))
          )

          const size = yield* TwoPSet.size(set)
          expect(size).toBe(2)

          const values = yield* TwoPSet.values(set)
          const sorted = [...values].sort()
          expect(sorted).toEqual(["apple", "cherry"])

          return size
        })

        const result = await Effect.runPromise(program)
        expect(result).toBe(2)
      })
    })

    describe("Commutativity", () => {
      it("merge(a, b) = merge(b, a)", async () => FastCheck.assert(
        FastCheck.asyncProperty(
          FastCheck
            .record({
              replicaA: FastCheck.string().filter((s) => s.length > 0),
              replicaB: FastCheck.string().filter((s) => s.length > 0),
              itemsA: FastCheck.array(FastCheck.string(), { maxLength: 10 }),
              itemsB: FastCheck.array(FastCheck.string(), { maxLength: 10 }),
              removeA: FastCheck.array(FastCheck.string(), { maxLength: 5 }),
              removeB: FastCheck.array(FastCheck.string(), { maxLength: 5 })
            })
            .filter(({ replicaA, replicaB }) => replicaA !== replicaB),
          async ({ replicaA, replicaB, itemsA, itemsB, removeA, removeB }) => {
            const program = Effect.gen(function* () {
              const set1 = yield* TwoPSet.make<string>(ReplicaId(replicaA))
              const set2 = yield* TwoPSet.make<string>(ReplicaId(replicaB))

              // Add items to both sets
              yield* Effect.forEach(itemsA, (item) => TwoPSet.add(set1, item))
              yield* Effect.forEach(itemsB, (item) => TwoPSet.add(set2, item))

              // Remove items from both sets
              yield* Effect.forEach(removeA, (item) => TwoPSet.remove(set1, item))
              yield* Effect.forEach(removeB, (item) => TwoPSet.remove(set2, item))

              const stateA = yield* TwoPSet.query(set1)
              const stateB = yield* TwoPSet.query(set2)

              // Test merge(A, B)
              const setAB = yield* TwoPSet.make<string>(ReplicaId("test-ab"))
              yield* TwoPSet.merge(setAB, stateA)
              yield* TwoPSet.merge(setAB, stateB)
              const resultAB = yield* TwoPSet.values(setAB)

              // Test merge(B, A)
              const setBA = yield* TwoPSet.make<string>(ReplicaId("test-ba"))
              yield* TwoPSet.merge(setBA, stateB)
              yield* TwoPSet.merge(setBA, stateA)
              const resultBA = yield* TwoPSet.values(setBA)

              // Compare sets
              if (resultAB.size !== resultBA.size) return false
              for (const item of resultAB) {
                if (!resultBA.has(item)) return false
              }
              return true
            })

            const result = await Effect.runPromise(program)
            expect(result).toBe(true)
          }
        ),
        { numRuns: 50 }
      ))
    })

    describe("Associativity", () => {
      it("merge(merge(a, b), c) = merge(a, merge(b, c))", async () => FastCheck.assert(
        FastCheck.asyncProperty(
          FastCheck
            .record({
              replicaA: FastCheck.string().filter((s) => s.length > 0),
              replicaB: FastCheck.string().filter((s) => s.length > 0),
              replicaC: FastCheck.string().filter((s) => s.length > 0),
              itemsA: FastCheck.array(FastCheck.string(), { maxLength: 5 }),
              itemsB: FastCheck.array(FastCheck.string(), { maxLength: 5 }),
              itemsC: FastCheck.array(FastCheck.string(), { maxLength: 5 }),
              removeA: FastCheck.array(FastCheck.string(), { maxLength: 3 }),
              removeB: FastCheck.array(FastCheck.string(), { maxLength: 3 }),
              removeC: FastCheck.array(FastCheck.string(), { maxLength: 3 })
            })
            .filter(
              ({ replicaA, replicaB, replicaC }) =>
                replicaA !== replicaB && replicaB !== replicaC && replicaA !== replicaC
            ),
          async ({ replicaA, replicaB, replicaC, itemsA, itemsB, itemsC, removeA, removeB, removeC }) => {
            const program = Effect.gen(function* () {
              const setA = yield* TwoPSet.make<string>(ReplicaId(replicaA))
              const setB = yield* TwoPSet.make<string>(ReplicaId(replicaB))
              const setC = yield* TwoPSet.make<string>(ReplicaId(replicaC))

              // Add and remove items
              yield* Effect.forEach(itemsA, (item) => TwoPSet.add(setA, item))
              yield* Effect.forEach(itemsB, (item) => TwoPSet.add(setB, item))
              yield* Effect.forEach(itemsC, (item) => TwoPSet.add(setC, item))

              yield* Effect.forEach(removeA, (item) => TwoPSet.remove(setA, item))
              yield* Effect.forEach(removeB, (item) => TwoPSet.remove(setB, item))
              yield* Effect.forEach(removeC, (item) => TwoPSet.remove(setC, item))

              const stateA = yield* TwoPSet.query(setA)
              const stateB = yield* TwoPSet.query(setB)
              const stateC = yield* TwoPSet.query(setC)

              // Test merge(merge(a, b), c)
              const setLeft = yield* TwoPSet.make<string>(ReplicaId("test-left"))
              yield* TwoPSet.merge(setLeft, stateA)
              yield* TwoPSet.merge(setLeft, stateB)
              yield* TwoPSet.merge(setLeft, stateC)
              const resultLeft = yield* TwoPSet.values(setLeft)

              // Test merge(a, merge(b, c))
              const setRight = yield* TwoPSet.make<string>(ReplicaId("test-right"))
              yield* TwoPSet.merge(setRight, stateB)
              yield* TwoPSet.merge(setRight, stateC)
              yield* TwoPSet.merge(setRight, stateA)
              const resultRight = yield* TwoPSet.values(setRight)

              // Compare sets
              if (resultLeft.size !== resultRight.size) return false
              for (const item of resultLeft) {
                if (!resultRight.has(item)) return false
              }
              return true
            })

            const result = await Effect.runPromise(program)
            expect(result).toBe(true)
          }
        ),
        { numRuns: 50 }
      ))
    })

    describe("Idempotence", () => {
      it("merge(a, a) = a", async () => FastCheck.assert(
        FastCheck.asyncProperty(
          FastCheck.record({
            replica: FastCheck.string().filter((s) => s.length > 0),
            items: FastCheck.array(FastCheck.string(), { maxLength: 10 }),
            removes: FastCheck.array(FastCheck.string(), { maxLength: 5 })
          }),
          async ({ replica, items, removes }) => {
            const program = Effect.gen(function* () {
              const set = yield* TwoPSet.make<string>(ReplicaId(replica))

              yield* Effect.forEach(items, (item) => TwoPSet.add(set, item))
              yield* Effect.forEach(removes, (item) => TwoPSet.remove(set, item))

              const sizeBefore = yield* TwoPSet.size(set)
              const state = yield* TwoPSet.query(set)

              // Merge with itself
              yield* TwoPSet.merge(set, state)

              const sizeAfter = yield* TwoPSet.size(set)

              return sizeBefore === sizeAfter
            })

            const result = await Effect.runPromise(program)
            expect(result).toBe(true)
          }
        ),
        { numRuns: 50 }
      ))
    })

    describe("Tombstone Property", () => {
      it("once removed, element cannot be re-added", async () => FastCheck.assert(
        FastCheck.asyncProperty(
          FastCheck.record({
            replica: FastCheck.string().filter((s) => s.length > 0),
            item: FastCheck.string()
          }),
          async ({ replica, item }) => {
            const program = Effect.gen(function* () {
              const set = yield* TwoPSet.make<string>(ReplicaId(replica))

              // Add element
              yield* TwoPSet.add(set, item)
              const hasAfterAdd = yield* TwoPSet.has(set, item)

              // Remove element
              yield* TwoPSet.remove(set, item)
              const hasAfterRemove = yield* TwoPSet.has(set, item)

              // Try to re-add
              yield* TwoPSet.add(set, item)
              const hasAfterReAdd = yield* TwoPSet.has(set, item)

              return hasAfterAdd === true && hasAfterRemove === false && hasAfterReAdd === false
            })

            const result = await Effect.runPromise(program)
            expect(result).toBe(true)
          }
        ),
        { numRuns: 50 }
      ))
    })

    describe("Remove Bias", () => {
      it("concurrent add/remove converges to removed state", async () => FastCheck.assert(
        FastCheck.asyncProperty(
          FastCheck.record({
            replicaA: FastCheck.string().filter((s) => s.length > 0),
            replicaB: FastCheck.string().filter((s) => s.length > 0),
            item: FastCheck.string()
          }).filter(({ replicaA, replicaB }) => replicaA !== replicaB),
          async ({ replicaA, replicaB, item }) => {
            const program = Effect.gen(function* () {
              const set1 = yield* TwoPSet.make<string>(ReplicaId(replicaA))
              const set2 = yield* TwoPSet.make<string>(ReplicaId(replicaB))

              // Both add the same element
              yield* TwoPSet.add(set1, item)
              yield* TwoPSet.add(set2, item)

              // One removes it
              yield* TwoPSet.remove(set2, item)

              // Merge states
              const state1 = yield* TwoPSet.query(set1)
              const state2 = yield* TwoPSet.query(set2)

              yield* TwoPSet.merge(set1, state2)
              yield* TwoPSet.merge(set2, state1)

              // Both should converge to removed state
              const hasInSet1 = yield* TwoPSet.has(set1, item)
              const hasInSet2 = yield* TwoPSet.has(set2, item)

              return hasInSet1 === false && hasInSet2 === false
            })

            const result = await Effect.runPromise(program)
            expect(result).toBe(true)
          }
        ),
        { numRuns: 50 }
      ))
    })
  })
})
