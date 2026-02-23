/**
 * Unit tests for OR-Set CRDT.
 *
 * @since 0.1.0
 */

import { describe, it, expect } from "vitest"
import * as Effect from "effect/Effect"
import * as ORSet from "./ORSet"
import { ReplicaId } from "./CRDT"
import * as STM from "effect/STM"

describe("ORSet", () => {
  it("should start empty", async () => {
    const program = Effect.gen(function* () {
      const set = yield* ORSet.make<string>(ReplicaId("replica-1"))
      const s = yield* ORSet.size(set)
      const vals = yield* ORSet.values(set)
      return { size: s, values: vals }
    })

    const result = await Effect.runPromise(program)
    expect(result.size).toBe(0)
    expect(result.values).toEqual([])
  })

  it("should add elements correctly", async () => {
    const program = Effect.gen(function* () {
      const set = yield* ORSet.make<string>(ReplicaId("replica-1"))

      yield* ORSet.add(set, "apple")
      yield* ORSet.add(set, "banana")

      const vals = yield* ORSet.values(set)
      const s = yield* ORSet.size(set)
      const hasApple = yield* ORSet.has(set, "apple")
      const hasOrange = yield* ORSet.has(set, "orange")

      return {
        values: vals.sort(),
        size: s,
        hasApple,
        hasOrange
      }
    })

    const result = await Effect.runPromise(program)
    expect(result.values).toEqual(["apple", "banana"])
    expect(result.size).toBe(2)
    expect(result.hasApple).toBe(true)
    expect(result.hasOrange).toBe(false)
  })

  it("should remove elements correctly", async () => {
    const program = Effect.gen(function* () {
      const set = yield* ORSet.make<string>(ReplicaId("replica-1"))

      yield* ORSet.add(set, "apple")
      yield* ORSet.add(set, "banana")

      const beforeRemove = yield* ORSet.has(set, "apple")
      yield* ORSet.remove(set, "apple")
      const afterRemove = yield* ORSet.has(set, "apple")

      const vals = yield* ORSet.values(set)
      const s = yield* ORSet.size(set)

      return {
        beforeRemove,
        afterRemove,
        values: vals,
        size: s
      }
    })

    const result = await Effect.runPromise(program)
    expect(result.beforeRemove).toBe(true)
    expect(result.afterRemove).toBe(false)
    expect(result.values).toEqual(["banana"])
    expect(result.size).toBe(1)
  })

  it("should allow re-adding after removal (add-remove-add)", async () => {
    const program = Effect.gen(function* () {
      const set = yield* ORSet.make<string>(ReplicaId("replica-1"))

      // Add
      yield* ORSet.add(set, "apple")
      const afterAdd = yield* ORSet.has(set, "apple")

      // Remove
      yield* ORSet.remove(set, "apple")
      const afterRemove = yield* ORSet.has(set, "apple")

      // Add again
      yield* ORSet.add(set, "apple")
      const afterReAdd = yield* ORSet.has(set, "apple")

      return {
        afterAdd,
        afterRemove,
        afterReAdd
      }
    })

    const result = await Effect.runPromise(program)
    expect(result.afterAdd).toBe(true)
    expect(result.afterRemove).toBe(false)
    expect(result.afterReAdd).toBe(true)
  })

  it("should track multiple tags per element", async () => {
    const program = Effect.gen(function* () {
      const set = yield* ORSet.make<string>(ReplicaId("replica-1"))

      // Add the same element multiple times - each creates a new tag
      yield* ORSet.add(set, "apple")
      yield* ORSet.add(set, "apple")
      yield* ORSet.add(set, "apple")

      const appleTags = yield* ORSet.tags(set, "apple")

      return {
        tagCount: appleTags.size,
        hasElement: yield* ORSet.has(set, "apple")
      }
    })

    const result = await Effect.runPromise(program)
    expect(result.tagCount).toBe(3)
    expect(result.hasElement).toBe(true)
  })

  it("should merge states correctly", async () => {
    const program = Effect.gen(function* () {
      const set1 = yield* ORSet.make<string>(ReplicaId("replica-1"))
      const set2 = yield* ORSet.make<string>(ReplicaId("replica-2"))

      yield* ORSet.add(set1, "apple")
      yield* ORSet.add(set2, "banana")

      const state2 = yield* ORSet.query(set2)
      yield* ORSet.merge(set1, state2)

      const vals = yield* ORSet.values(set1)
      return vals.sort()
    })

    const result = await Effect.runPromise(program)
    expect(result).toEqual(["apple", "banana"])
  })

  it("should handle concurrent add operations correctly", async () => {
    const program = Effect.gen(function* () {
      const set1 = yield* ORSet.make<string>(ReplicaId("replica-1"))
      const set2 = yield* ORSet.make<string>(ReplicaId("replica-2"))

      // Both replicas add the same element concurrently
      yield* ORSet.add(set1, "apple")
      yield* ORSet.add(set2, "apple")

      // Merge
      const state2 = yield* ORSet.query(set2)
      yield* ORSet.merge(set1, state2)

      // After merge, apple should have 2 tags
      const appleTags = yield* ORSet.tags(set1, "apple")
      return appleTags.size
    })

    const result = await Effect.runPromise(program)
    expect(result).toBe(2)
  })

  it("should handle concurrent add/remove correctly (add wins)", async () => {
    const program = Effect.gen(function* () {
      const set1 = yield* ORSet.make<string>(ReplicaId("replica-1"))
      const set2 = yield* ORSet.make<string>(ReplicaId("replica-2"))

      // Start with element in both
      yield* ORSet.add(set1, "apple")
      const state1 = yield* ORSet.query(set1)
      yield* ORSet.merge(set2, state1)

      // replica-1 removes, replica-2 adds (concurrent)
      yield* ORSet.remove(set1, "apple")
      yield* ORSet.add(set2, "apple") // Creates new tag

      // Merge both ways
      const state1AfterRemove = yield* ORSet.query(set1)
      const state2AfterAdd = yield* ORSet.query(set2)

      yield* ORSet.merge(set1, state2AfterAdd)
      yield* ORSet.merge(set2, state1AfterRemove)

      // Both should have the element (add wins)
      const has1 = yield* ORSet.has(set1, "apple")
      const has2 = yield* ORSet.has(set2, "apple")

      return { has1, has2 }
    })

    const result = await Effect.runPromise(program)
    expect(result.has1).toBe(true)
    expect(result.has2).toBe(true)
  })

  it("should handle remove of all tags", async () => {
    const program = Effect.gen(function* () {
      const set1 = yield* ORSet.make<string>(ReplicaId("replica-1"))

      // Add element multiple times to create multiple tags
      yield* ORSet.add(set1, "apple")
      yield* ORSet.add(set1, "apple")
      yield* ORSet.add(set1, "apple")

      const tagsBefore = yield* ORSet.tags(set1, "apple")

      // Remove should delete ALL tags
      yield* ORSet.remove(set1, "apple")

      const tagsAfter = yield* ORSet.tags(set1, "apple")
      const hasAfter = yield* ORSet.has(set1, "apple")

      return {
        tagsBeforeCount: tagsBefore.size,
        tagsAfterCount: tagsAfter.size,
        hasAfter
      }
    })

    const result = await Effect.runPromise(program)
    expect(result.tagsBeforeCount).toBe(3)
    expect(result.tagsAfterCount).toBe(0)
    expect(result.hasAfter).toBe(false)
  })

  it("should merge correctly with overlapping elements", async () => {
    const program = Effect.gen(function* () {
      const set1 = yield* ORSet.make<string>(ReplicaId("replica-1"))
      const set2 = yield* ORSet.make<string>(ReplicaId("replica-2"))

      // Add overlapping elements
      yield* ORSet.add(set1, "apple")
      yield* ORSet.add(set1, "banana")

      yield* ORSet.add(set2, "banana")
      yield* ORSet.add(set2, "cherry")

      // Merge
      const state2 = yield* ORSet.query(set2)
      yield* ORSet.merge(set1, state2)

      const vals = yield* ORSet.values(set1)
      const bananaTags = yield* ORSet.tags(set1, "banana")

      return {
        values: vals.sort(),
        bananaTagCount: bananaTags.size
      }
    })

    const result = await Effect.runPromise(program)
    expect(result.values).toEqual(["apple", "banana", "cherry"])
    expect(result.bananaTagCount).toBe(2) // One tag from each replica
  })

  it("should handle multiple sequential merges", async () => {
    const program = Effect.gen(function* () {
      const set1 = yield* ORSet.make<string>(ReplicaId("replica-1"))
      const set2 = yield* ORSet.make<string>(ReplicaId("replica-2"))
      const set3 = yield* ORSet.make<string>(ReplicaId("replica-3"))

      yield* ORSet.add(set1, "apple")
      yield* ORSet.add(set2, "banana")
      yield* ORSet.add(set3, "cherry")

      const state1 = yield* ORSet.query(set1)
      const state2 = yield* ORSet.query(set2)
      const state3 = yield* ORSet.query(set3)

      const merged = yield* ORSet.make<string>(ReplicaId("merged"))
      yield* ORSet.merge(merged, state1)
      yield* ORSet.merge(merged, state2)
      yield* ORSet.merge(merged, state3)

      const vals = yield* ORSet.values(merged)
      return vals.sort()
    })

    const result = await Effect.runPromise(program)
    expect(result).toEqual(["apple", "banana", "cherry"])
  })

  it("should support fluent chaining with dual currying", async () => {
    const program = Effect.gen(function* () {
      const set = yield* ORSet.make<string>(ReplicaId("replica-1"))

      // Chain multiple operations
      const finalSet = yield* ORSet.add(set, "apple").pipe(
        STM.flatMap(ORSet.add("banana")),
        STM.flatMap(ORSet.add("cherry"))
      )

      const vals = yield* ORSet.values(finalSet)
      return vals.sort()
    })

    const result = await Effect.runPromise(program)
    expect(result).toEqual(["apple", "banana", "cherry"])
  })

  it("should handle fromState correctly", async () => {
    const program = Effect.gen(function* () {
      const state: ORSet.ORSetState<string> = {
        type: "ORSet",
        replicaId: ReplicaId("replica-1"),
        elements: new Map([
          ["apple", new Set(["tag1", "tag2"])],
          ["banana", new Set(["tag3"])]
        ])
      }

      const set = yield* ORSet.fromState(state)

      const vals = yield* ORSet.values(set)
      const appleTags = yield* ORSet.tags(set, "apple")
      const bananaTags = yield* ORSet.tags(set, "banana")

      return {
        values: vals.sort(),
        appleTagCount: appleTags.size,
        bananaTagCount: bananaTags.size
      }
    })

    const result = await Effect.runPromise(program)
    expect(result.values).toEqual(["apple", "banana"])
    expect(result.appleTagCount).toBe(2)
    expect(result.bananaTagCount).toBe(1)
  })

  it("should handle query correctly", async () => {
    const program = Effect.gen(function* () {
      const set = yield* ORSet.make<string>(ReplicaId("replica-1"))

      yield* ORSet.add(set, "apple")
      yield* ORSet.add(set, "banana")

      const state = yield* ORSet.query(set)

      return {
        type: state.type,
        replicaId: state.replicaId,
        elementCount: state.elements.size,
        hasApple: state.elements.has("apple"),
        hasBanana: state.elements.has("banana")
      }
    })

    const result = await Effect.runPromise(program)
    expect(result.type).toBe("ORSet")
    expect(result.replicaId).toBe(ReplicaId("replica-1"))
    expect(result.elementCount).toBe(2)
    expect(result.hasApple).toBe(true)
    expect(result.hasBanana).toBe(true)
  })

  it("should preserve CRDT properties: commutativity", async () => {
    const program = Effect.gen(function* () {
      // Set up two scenarios with same operations in different order
      const set1a = yield* ORSet.make<string>(ReplicaId("replica-1"))
      const set2a = yield* ORSet.make<string>(ReplicaId("replica-2"))

      const set1b = yield* ORSet.make<string>(ReplicaId("replica-1"))
      const set2b = yield* ORSet.make<string>(ReplicaId("replica-2"))

      // Scenario A: set1 merges set2
      yield* ORSet.add(set1a, "apple")
      yield* ORSet.add(set2a, "banana")

      const state2a = yield* ORSet.query(set2a)
      yield* ORSet.merge(set1a, state2a)

      const valsA = yield* ORSet.values(set1a)

      // Scenario B: set2 merges set1
      yield* ORSet.add(set1b, "apple")
      yield* ORSet.add(set2b, "banana")

      const state1b = yield* ORSet.query(set1b)
      yield* ORSet.merge(set2b, state1b)

      const valsB = yield* ORSet.values(set2b)

      return {
        valsA: valsA.sort(),
        valsB: valsB.sort()
      }
    })

    const result = await Effect.runPromise(program)
    expect(result.valsA).toEqual(result.valsB)
  })

  it("should preserve CRDT properties: associativity", async () => {
    const program = Effect.gen(function* () {
      const set1 = yield* ORSet.make<string>(ReplicaId("replica-1"))
      const set2 = yield* ORSet.make<string>(ReplicaId("replica-2"))
      const set3 = yield* ORSet.make<string>(ReplicaId("replica-3"))

      yield* ORSet.add(set1, "a")
      yield* ORSet.add(set2, "b")
      yield* ORSet.add(set3, "c")

      const state1 = yield* ORSet.query(set1)
      const state2 = yield* ORSet.query(set2)
      const state3 = yield* ORSet.query(set3)

      // (set1 + set2) + set3
      const mergedA = yield* ORSet.make<string>(ReplicaId("merged-a"))
      yield* ORSet.merge(mergedA, state1)
      yield* ORSet.merge(mergedA, state2)
      yield* ORSet.merge(mergedA, state3)
      const valsA = yield* ORSet.values(mergedA)

      // set1 + (set2 + set3)
      const mergedB = yield* ORSet.make<string>(ReplicaId("merged-b"))
      yield* ORSet.merge(mergedB, state2)
      yield* ORSet.merge(mergedB, state3)
      yield* ORSet.merge(mergedB, state1)
      const valsB = yield* ORSet.values(mergedB)

      return {
        valsA: valsA.sort(),
        valsB: valsB.sort()
      }
    })

    const result = await Effect.runPromise(program)
    expect(result.valsA).toEqual(result.valsB)
  })

  it("should preserve CRDT properties: idempotency", async () => {
    const program = Effect.gen(function* () {
      const set1 = yield* ORSet.make<string>(ReplicaId("replica-1"))
      const set2 = yield* ORSet.make<string>(ReplicaId("replica-2"))

      yield* ORSet.add(set1, "apple")
      yield* ORSet.add(set2, "banana")

      const state2 = yield* ORSet.query(set2)

      // Merge once
      yield* ORSet.merge(set1, state2)
      const valsAfterOnce = yield* ORSet.values(set1)

      // Merge again (idempotent)
      yield* ORSet.merge(set1, state2)
      const valsAfterTwice = yield* ORSet.values(set1)

      // Merge third time
      yield* ORSet.merge(set1, state2)
      const valsAfterThrice = yield* ORSet.values(set1)

      return {
        valsAfterOnce: valsAfterOnce.sort(),
        valsAfterTwice: valsAfterTwice.sort(),
        valsAfterThrice: valsAfterThrice.sort()
      }
    })

    const result = await Effect.runPromise(program)
    expect(result.valsAfterOnce).toEqual(result.valsAfterTwice)
    expect(result.valsAfterTwice).toEqual(result.valsAfterThrice)
  })

  it("should handle empty tag query", async () => {
    const program = Effect.gen(function* () {
      const set = yield* ORSet.make<string>(ReplicaId("replica-1"))
      const tags = yield* ORSet.tags(set, "nonexistent")
      return tags.size
    })

    const result = await Effect.runPromise(program)
    expect(result).toBe(0)
  })
})
