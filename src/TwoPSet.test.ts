/**
 * Unit tests for 2P-Set CRDT.
 *
 * @since 0.1.0
 */

import { describe, it, expect } from "vitest"
import * as Effect from "effect/Effect"
import * as STM from "effect/STM"
import * as TwoPSet from "./TwoPSet"
import { ReplicaId } from "./CRDT"

describe("TwoPSet", () => {
  it("should start empty", async () => {
    const program = Effect.gen(function* () {
      const set = yield* TwoPSet.make<string>(ReplicaId("replica-1"))
      return yield* TwoPSet.size(set)
    })

    const result = await Effect.runPromise(program)
    expect(result).toBe(0)
  })

  it("should add elements", async () => {
    const program = Effect.gen(function* () {
      const set = yield* TwoPSet.make<string>(ReplicaId("replica-1"))

      yield* TwoPSet.add(set, "apple")
      yield* TwoPSet.add(set, "banana")

      const hasApple = yield* TwoPSet.has(set, "apple")
      const hasBanana = yield* TwoPSet.has(set, "banana")
      const size = yield* TwoPSet.size(set)

      return { hasApple, hasBanana, size }
    })

    const result = await Effect.runPromise(program)
    expect(result.hasApple).toBe(true)
    expect(result.hasBanana).toBe(true)
    expect(result.size).toBe(2)
  })

  it("should remove elements", async () => {
    const program = Effect.gen(function* () {
      const set = yield* TwoPSet.make<string>(ReplicaId("replica-1"))

      yield* TwoPSet.add(set, "apple")
      yield* TwoPSet.add(set, "banana")

      const sizeBefore = yield* TwoPSet.size(set)

      yield* TwoPSet.remove(set, "apple")

      const hasApple = yield* TwoPSet.has(set, "apple")
      const hasBanana = yield* TwoPSet.has(set, "banana")
      const sizeAfter = yield* TwoPSet.size(set)

      return { sizeBefore, sizeAfter, hasApple, hasBanana }
    })

    const result = await Effect.runPromise(program)
    expect(result.sizeBefore).toBe(2)
    expect(result.sizeAfter).toBe(1)
    expect(result.hasApple).toBe(false)
    expect(result.hasBanana).toBe(true)
  })

  it("should enforce tombstone property (cannot re-add after removal)", async () => {
    const program = Effect.gen(function* () {
      const set = yield* TwoPSet.make<string>(ReplicaId("replica-1"))

      // Add, then remove
      yield* TwoPSet.add(set, "apple")
      yield* TwoPSet.remove(set, "apple")

      const hasAppleAfterRemove = yield* TwoPSet.has(set, "apple")

      // Try to re-add
      yield* TwoPSet.add(set, "apple")

      const hasAppleAfterReAdd = yield* TwoPSet.has(set, "apple")

      return { hasAppleAfterRemove, hasAppleAfterReAdd }
    })

    const result = await Effect.runPromise(program)
    expect(result.hasAppleAfterRemove).toBe(false)
    expect(result.hasAppleAfterReAdd).toBe(false) // Still false - tombstone forever!
  })

  it("should return correct values", async () => {
    const program = Effect.gen(function* () {
      const set = yield* TwoPSet.make<string>(ReplicaId("replica-1"))

      yield* TwoPSet.add(set, "apple")
      yield* TwoPSet.add(set, "banana")
      yield* TwoPSet.add(set, "cherry")
      yield* TwoPSet.remove(set, "banana")

      const vals = yield* TwoPSet.values(set)
      return Array.from(vals).sort()
    })

    const result = await Effect.runPromise(program)
    expect(result).toEqual(["apple", "cherry"])
  })

  it("should merge states correctly", async () => {
    const program = Effect.gen(function* () {
      const set1 = yield* TwoPSet.make<string>(ReplicaId("replica-1"))
      const set2 = yield* TwoPSet.make<string>(ReplicaId("replica-2"))

      // Set1: add apple and banana
      yield* TwoPSet.add(set1, "apple")
      yield* TwoPSet.add(set1, "banana")

      // Set2: add cherry, remove banana
      yield* TwoPSet.add(set2, "cherry")
      yield* TwoPSet.add(set2, "banana")
      yield* TwoPSet.remove(set2, "banana")

      const state2 = yield* TwoPSet.query(set2)
      yield* TwoPSet.merge(set1, state2)

      const vals = yield* TwoPSet.values(set1)
      return Array.from(vals).sort()
    })

    const result = await Effect.runPromise(program)
    // apple: added in set1, not removed -> present
    // banana: added in both, removed in set2 -> removed after merge
    // cherry: added in set2 -> present
    expect(result).toEqual(["apple", "cherry"])
  })

  it("should handle concurrent add/remove correctly", async () => {
    const program = Effect.gen(function* () {
      const set1 = yield* TwoPSet.make<string>(ReplicaId("replica-1"))
      const set2 = yield* TwoPSet.make<string>(ReplicaId("replica-2"))

      // Concurrent operations on same element:
      // Replica1: add "apple"
      // Replica2: remove "apple" (assuming it knew about it from earlier state)
      yield* TwoPSet.add(set1, "apple")
      yield* TwoPSet.add(set2, "apple") // Set2 also adds it first
      yield* TwoPSet.remove(set2, "apple") // Then removes it

      // Merge states
      const state1 = yield* TwoPSet.query(set1)
      const state2 = yield* TwoPSet.query(set2)

      const merged = yield* TwoPSet.make<string>(ReplicaId("merged"))
      yield* TwoPSet.merge(merged, state1)
      yield* TwoPSet.merge(merged, state2)

      const hasApple = yield* TwoPSet.has(merged, "apple")

      return hasApple
    })

    const result = await Effect.runPromise(program)
    // Remove wins - element is in both added and removed sets
    expect(result).toBe(false)
  })

  it("should handle idempotent adds", async () => {
    const program = Effect.gen(function* () {
      const set = yield* TwoPSet.make<string>(ReplicaId("replica-1"))

      yield* TwoPSet.add(set, "apple")
      yield* TwoPSet.add(set, "apple")
      yield* TwoPSet.add(set, "apple")

      const size = yield* TwoPSet.size(set)
      const hasApple = yield* TwoPSet.has(set, "apple")

      return { size, hasApple }
    })

    const result = await Effect.runPromise(program)
    expect(result.size).toBe(1)
    expect(result.hasApple).toBe(true)
  })

  it("should handle idempotent removes", async () => {
    const program = Effect.gen(function* () {
      const set = yield* TwoPSet.make<string>(ReplicaId("replica-1"))

      yield* TwoPSet.add(set, "apple")
      yield* TwoPSet.remove(set, "apple")
      yield* TwoPSet.remove(set, "apple")
      yield* TwoPSet.remove(set, "apple")

      const size = yield* TwoPSet.size(set)
      const hasApple = yield* TwoPSet.has(set, "apple")

      return { size, hasApple }
    })

    const result = await Effect.runPromise(program)
    expect(result.size).toBe(0)
    expect(result.hasApple).toBe(false)
  })

  it("should support chaining operations in STM", async () => {
    const program = Effect.gen(function* () {
      const set = yield* TwoPSet.make<string>(ReplicaId("replica-1"))

      // Chain operations in single transaction
      yield* TwoPSet.add(set, "apple").pipe(
        STM.flatMap(TwoPSet.add("banana")),
        STM.flatMap(TwoPSet.add("cherry")),
        STM.flatMap(TwoPSet.remove("banana"))
      )

      const vals = yield* TwoPSet.values(set)
      return Array.from(vals).sort()
    })

    const result = await Effect.runPromise(program)
    expect(result).toEqual(["apple", "cherry"])
  })

  it("should restore from state correctly", async () => {
    const program = Effect.gen(function* () {
      const state: TwoPSet.TwoPSetState<string> = {
        type: "TwoPSet",
        replicaId: ReplicaId("replica-1"),
        added: new Set(["apple", "banana", "cherry"]),
        removed: new Set(["banana"])
      }

      const set = yield* TwoPSet.fromState(state)

      const vals = yield* TwoPSet.values(set)
      const size = yield* TwoPSet.size(set)
      const hasBanana = yield* TwoPSet.has(set, "banana")

      return { vals: Array.from(vals).sort(), size, hasBanana }
    })

    const result = await Effect.runPromise(program)
    expect(result.vals).toEqual(["apple", "cherry"])
    expect(result.size).toBe(2)
    expect(result.hasBanana).toBe(false)
  })

  it("should preserve state through query/fromState round-trip", async () => {
    const program = Effect.gen(function* () {
      const set1 = yield* TwoPSet.make<string>(ReplicaId("replica-1"))

      yield* TwoPSet.add(set1, "apple")
      yield* TwoPSet.add(set1, "banana")
      yield* TwoPSet.remove(set1, "apple")

      const state = yield* TwoPSet.query(set1)
      const set2 = yield* TwoPSet.fromState(state)

      const vals1 = yield* TwoPSet.values(set1)
      const vals2 = yield* TwoPSet.values(set2)

      return {
        vals1: Array.from(vals1).sort(),
        vals2: Array.from(vals2).sort()
      }
    })

    const result = await Effect.runPromise(program)
    expect(result.vals1).toEqual(result.vals2)
    expect(result.vals1).toEqual(["banana"])
  })

  it("should handle remove without prior add", async () => {
    const program = Effect.gen(function* () {
      const set = yield* TwoPSet.make<string>(ReplicaId("replica-1"))

      // Remove element that was never added
      yield* TwoPSet.remove(set, "apple")

      const hasApple = yield* TwoPSet.has(set, "apple")

      // Now try to add it
      yield* TwoPSet.add(set, "apple")

      const hasAppleAfterAdd = yield* TwoPSet.has(set, "apple")

      return { hasApple, hasAppleAfterAdd }
    })

    const result = await Effect.runPromise(program)
    expect(result.hasApple).toBe(false)
    expect(result.hasAppleAfterAdd).toBe(false) // Tombstone prevents addition
  })

  it("should handle multiple merges correctly", async () => {
    const program = Effect.gen(function* () {
      const set1 = yield* TwoPSet.make<string>(ReplicaId("replica-1"))
      const set2 = yield* TwoPSet.make<string>(ReplicaId("replica-2"))
      const set3 = yield* TwoPSet.make<string>(ReplicaId("replica-3"))

      yield* TwoPSet.add(set1, "apple")
      yield* TwoPSet.add(set2, "banana")
      yield* TwoPSet.add(set3, "cherry")
      yield* TwoPSet.remove(set3, "cherry")

      const state1 = yield* TwoPSet.query(set1)
      const state2 = yield* TwoPSet.query(set2)
      const state3 = yield* TwoPSet.query(set3)

      const merged = yield* TwoPSet.make<string>(ReplicaId("merged"))
      yield* TwoPSet.merge(merged, state1)
      yield* TwoPSet.merge(merged, state2)
      yield* TwoPSet.merge(merged, state3)

      const vals = yield* TwoPSet.values(merged)
      return Array.from(vals).sort()
    })

    const result = await Effect.runPromise(program)
    expect(result).toEqual(["apple", "banana"])
  })

  it("should work with values containing various types", async () => {
    const program = Effect.gen(function* () {
      const set = yield* TwoPSet.make<number>(ReplicaId("replica-1"))

      yield* TwoPSet.add(set, 1)
      yield* TwoPSet.add(set, 2)
      yield* TwoPSet.add(set, 3)
      yield* TwoPSet.remove(set, 2)

      const vals = yield* TwoPSet.values(set)
      return Array.from(vals).sort()
    })

    const result = await Effect.runPromise(program)
    expect(result).toEqual([1, 3])
  })

  it("should demonstrate remove bias in concurrent scenarios", async () => {
    const program = Effect.gen(function* () {
      const set1 = yield* TwoPSet.make<string>(ReplicaId("replica-1"))
      const set2 = yield* TwoPSet.make<string>(ReplicaId("replica-2"))

      // Both replicas start with the same element
      yield* TwoPSet.add(set1, "apple")
      yield* TwoPSet.add(set2, "apple")

      // Replica 1 keeps it, Replica 2 removes it
      yield* TwoPSet.remove(set2, "apple")

      // Merge in both directions
      const state1 = yield* TwoPSet.query(set1)
      const state2 = yield* TwoPSet.query(set2)

      yield* TwoPSet.merge(set1, state2)
      yield* TwoPSet.merge(set2, state1)

      const hasInSet1 = yield* TwoPSet.has(set1, "apple")
      const hasInSet2 = yield* TwoPSet.has(set2, "apple")

      return { hasInSet1, hasInSet2 }
    })

    const result = await Effect.runPromise(program)
    // Both converge to "removed" state - remove wins
    expect(result.hasInSet1).toBe(false)
    expect(result.hasInSet2).toBe(false)
  })
})
