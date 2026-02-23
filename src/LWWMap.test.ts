/**
 * Unit tests for LWW-Map CRDT.
 *
 * @since 0.1.0
 */

import { describe, it, expect } from "vitest"
import * as Effect from "effect/Effect"
import * as Option from "effect/Option"
import * as LWWMap from "./LWWMap"
import { ReplicaId } from "./CRDT"
import * as VectorClock from "./VectorClock.js"

describe("LWWMap", () => {
  describe("Basic Operations", () => {
    it("should start empty", async () => {
      const program = Effect.gen(function* () {
        const map = yield* LWWMap.make<string, number>(ReplicaId("replica-1"))
        const mapSize = yield* LWWMap.size(map)
        return mapSize
      })

      const result = await Effect.runPromise(program)
      expect(result).toBe(0)
    })

    it("should set and get values", async () => {
      const program = Effect.gen(function* () {
        const map = yield* LWWMap.make<string, number>(ReplicaId("replica-1"))

        yield* LWWMap.set(map, "key1", 42)
        const val = yield* LWWMap.get(map, "key1")

        return val
      })

      const result = await Effect.runPromise(program.pipe(Effect.provide(VectorClock.Live(ReplicaId("test")))))
      expect(Option.isSome(result)).toBe(true)
      expect(Option.getOrThrow(result)).toBe(42)
    })

    it("should return None for non-existent keys", async () => {
      const program = Effect.gen(function* () {
        const map = yield* LWWMap.make<string, number>(ReplicaId("replica-1"))
        const val = yield* LWWMap.get(map, "nonexistent")
        return val
      })

      const result = await Effect.runPromise(program)
      expect(Option.isNone(result)).toBe(true)
    })

    it("should update existing values", async () => {
      const program = Effect.gen(function* () {
        const map = yield* LWWMap.make<string, number>(ReplicaId("replica-1"))

        yield* LWWMap.set(map, "key1", 42)
        yield* LWWMap.set(map, "key1", 100)

        const val = yield* LWWMap.get(map, "key1")
        return val
      })

      const result = await Effect.runPromise(program.pipe(Effect.provide(VectorClock.Live(ReplicaId("test")))))
      expect(Option.getOrThrow(result)).toBe(100)
    })

    it("should handle multiple keys", async () => {
      const program = Effect.gen(function* () {
        const map = yield* LWWMap.make<string, string>(ReplicaId("replica-1"))

        yield* LWWMap.set(map, "key1", "value1")
        yield* LWWMap.set(map, "key2", "value2")
        yield* LWWMap.set(map, "key3", "value3")

        const val1 = yield* LWWMap.get(map, "key1")
        const val2 = yield* LWWMap.get(map, "key2")
        const val3 = yield* LWWMap.get(map, "key3")
        const mapSize = yield* LWWMap.size(map)

        return { val1, val2, val3, mapSize }
      })

      const result = await Effect.runPromise(program.pipe(Effect.provide(VectorClock.Live(ReplicaId("test")))))
      expect(Option.getOrThrow(result.val1)).toBe("value1")
      expect(Option.getOrThrow(result.val2)).toBe("value2")
      expect(Option.getOrThrow(result.val3)).toBe("value3")
      expect(result.mapSize).toBe(3)
    })
  })

  describe("Delete Operations", () => {
    it("should delete keys by tombstoning", async () => {
      const program = Effect.gen(function* () {
        const map = yield* LWWMap.make<string, number>(ReplicaId("replica-1"))

        yield* LWWMap.set(map, "key1", 42)
        const before = yield* LWWMap.get(map, "key1")

        yield* LWWMap.delete_(map, "key1")
        const after = yield* LWWMap.get(map, "key1")

        return { before, after }
      })

      const result = await Effect.runPromise(program.pipe(Effect.provide(VectorClock.Live(ReplicaId("test")))))
      expect(Option.isSome(result.before)).toBe(true)
      expect(Option.isNone(result.after)).toBe(true)
    })

    it("should handle deleting non-existent keys", async () => {
      const program = Effect.gen(function* () {
        const map = yield* LWWMap.make<string, number>(ReplicaId("replica-1"))

        yield* LWWMap.delete_(map, "nonexistent")
        const val = yield* LWWMap.get(map, "nonexistent")

        return val
      })

      const result = await Effect.runPromise(program.pipe(Effect.provide(VectorClock.Live(ReplicaId("test")))))
      expect(Option.isNone(result)).toBe(true)
    })

    it("should reduce size when deleting", async () => {
      const program = Effect.gen(function* () {
        const map = yield* LWWMap.make<string, number>(ReplicaId("replica-1"))

        yield* LWWMap.set(map, "key1", 1)
        yield* LWWMap.set(map, "key2", 2)
        yield* LWWMap.set(map, "key3", 3)

        const sizeBefore = yield* LWWMap.size(map)

        yield* LWWMap.delete_(map, "key2")

        const sizeAfter = yield* LWWMap.size(map)

        return { sizeBefore, sizeAfter }
      })

      const result = await Effect.runPromise(program.pipe(Effect.provide(VectorClock.Live(ReplicaId("test")))))
      expect(result.sizeBefore).toBe(3)
      expect(result.sizeAfter).toBe(2)
    })
  })

  describe("has Operation", () => {
    it("should return true for existing keys", async () => {
      const program = Effect.gen(function* () {
        const map = yield* LWWMap.make<string, number>(ReplicaId("replica-1"))

        yield* LWWMap.set(map, "key1", 42)
        const exists = yield* LWWMap.has(map, "key1")

        return exists
      })

      const result = await Effect.runPromise(program.pipe(Effect.provide(VectorClock.Live(ReplicaId("test")))))
      expect(result).toBe(true)
    })

    it("should return false for non-existent keys", async () => {
      const program = Effect.gen(function* () {
        const map = yield* LWWMap.make<string, number>(ReplicaId("replica-1"))
        const exists = yield* LWWMap.has(map, "nonexistent")
        return exists
      })

      const result = await Effect.runPromise(program)
      expect(result).toBe(false)
    })

    it("should return false for tombstoned keys", async () => {
      const program = Effect.gen(function* () {
        const map = yield* LWWMap.make<string, number>(ReplicaId("replica-1"))

        yield* LWWMap.set(map, "key1", 42)
        yield* LWWMap.delete_(map, "key1")
        const exists = yield* LWWMap.has(map, "key1")

        return exists
      })

      const result = await Effect.runPromise(program.pipe(Effect.provide(VectorClock.Live(ReplicaId("test")))))
      expect(result).toBe(false)
    })
  })

  describe("keys, values, size Operations", () => {
    it("should return all non-tombstoned keys", async () => {
      const program = Effect.gen(function* () {
        const map = yield* LWWMap.make<string, number>(ReplicaId("replica-1"))

        yield* LWWMap.set(map, "key1", 1)
        yield* LWWMap.set(map, "key2", 2)
        yield* LWWMap.set(map, "key3", 3)
        yield* LWWMap.delete_(map, "key2")

        const allKeys = yield* LWWMap.keys(map)
        return allKeys.sort()
      })

      const result = await Effect.runPromise(program.pipe(Effect.provide(VectorClock.Live(ReplicaId("test")))))
      expect(result).toEqual(["key1", "key3"])
    })

    it("should return all non-tombstoned values", async () => {
      const program = Effect.gen(function* () {
        const map = yield* LWWMap.make<string, number>(ReplicaId("replica-1"))

        yield* LWWMap.set(map, "key1", 10)
        yield* LWWMap.set(map, "key2", 20)
        yield* LWWMap.set(map, "key3", 30)
        yield* LWWMap.delete_(map, "key2")

        const allValues = yield* LWWMap.values(map)
        return allValues.sort()
      })

      const result = await Effect.runPromise(program.pipe(Effect.provide(VectorClock.Live(ReplicaId("test")))))
      expect(result).toEqual([10, 30])
    })

    it("should return correct size", async () => {
      const program = Effect.gen(function* () {
        const map = yield* LWWMap.make<string, number>(ReplicaId("replica-1"))

        yield* LWWMap.set(map, "key1", 1)
        yield* LWWMap.set(map, "key2", 2)
        yield* LWWMap.set(map, "key3", 3)
        yield* LWWMap.delete_(map, "key2")

        const mapSize = yield* LWWMap.size(map)
        return mapSize
      })

      const result = await Effect.runPromise(program.pipe(Effect.provide(VectorClock.Live(ReplicaId("test")))))
      expect(result).toBe(2)
    })
  })

  describe("Merge Operations", () => {
    it("should merge disjoint maps", async () => {
      const program = Effect.gen(function* () {
        const map1 = yield* LWWMap.make<string, number>(ReplicaId("replica-1"))
        const map2 = yield* LWWMap.make<string, number>(ReplicaId("replica-2"))

        yield* LWWMap.set(map1, "key1", 100)
        yield* LWWMap.set(map2, "key2", 200)

        const state2 = yield* LWWMap.query(map2)
        yield* LWWMap.merge(map1, state2)

        const val1 = yield* LWWMap.get(map1, "key1")
        const val2 = yield* LWWMap.get(map1, "key2")
        const mapSize = yield* LWWMap.size(map1)

        return { val1, val2, mapSize }
      })

      const result = await Effect.runPromise(program.pipe(Effect.provide(VectorClock.Live(ReplicaId("test")))))
      expect(Option.getOrThrow(result.val1)).toBe(100)
      expect(Option.getOrThrow(result.val2)).toBe(200)
      expect(result.mapSize).toBe(2)
    })

    it("should resolve conflicts with timestamps (last write wins)", async () => {
      const program = Effect.gen(function* () {
        const map1 = yield* LWWMap.make<string, number>(ReplicaId("replica-1"))
        const map2 = yield* LWWMap.make<string, number>(ReplicaId("replica-2"))

        // Write to map1 first
        yield* LWWMap.set(map1, "key1", 100)

        // Wait a bit to ensure different timestamps
        yield* Effect.sleep(10)
        yield* LWWMap.set(map2, "key1", 200)

        // Merge - map2's value should win (later timestamp)
        const state2 = yield* LWWMap.query(map2)
        yield* LWWMap.merge(map1, state2)

        const val = yield* LWWMap.get(map1, "key1")
        return val
      })

      const result = await Effect.runPromise(program.pipe(Effect.provide(VectorClock.Live(ReplicaId("test")))))
      expect(Option.getOrThrow(result)).toBe(200)
    })

    it("should use replica ID for tie-breaking", async () => {
      const program = Effect.gen(function* () {
        const map1 = yield* LWWMap.make<string, number>(ReplicaId("replica-1"))
        const map2 = yield* LWWMap.make<string, number>(ReplicaId("replica-2"))

        // Write to both at the same time (same timestamp)
        yield* Effect.all([
          LWWMap.set(map1, "key1", 100),
          LWWMap.set(map2, "key1", 200)
        ])

        const state2 = yield* LWWMap.query(map2)
        yield* LWWMap.merge(map1, state2)

        const val = yield* LWWMap.get(map1, "key1")
        return val
      })

      const result = await Effect.runPromise(program.pipe(Effect.provide(VectorClock.Live(ReplicaId("test")))))
      // replica-2 > replica-1 lexicographically, so map2's value should win
      expect(Option.getOrThrow(result)).toBe(200)
    })

    it("should handle tombstones in merge", async () => {
      const program = Effect.gen(function* () {
        const map1 = yield* LWWMap.make<string, number>(ReplicaId("replica-1"))
        const map2 = yield* LWWMap.make<string, number>(ReplicaId("replica-2"))

        // Set in map1
        yield* LWWMap.set(map1, "key1", 100)

        // Delete in map2 after a delay
        yield* Effect.sleep(10)
        yield* LWWMap.delete_(map2, "key1")

        // Merge - deletion should win
        const state2 = yield* LWWMap.query(map2)
        yield* LWWMap.merge(map1, state2)

        const val = yield* LWWMap.get(map1, "key1")
        return val
      })

      const result = await Effect.runPromise(program.pipe(Effect.provide(VectorClock.Live(ReplicaId("test")))))
      expect(Option.isNone(result)).toBe(true)
    })

    it("should handle multiple merges", async () => {
      const program = Effect.gen(function* () {
        const map1 = yield* LWWMap.make<string, number>(ReplicaId("replica-1"))
        const map2 = yield* LWWMap.make<string, number>(ReplicaId("replica-2"))
        const map3 = yield* LWWMap.make<string, number>(ReplicaId("replica-3"))

        yield* LWWMap.set(map1, "key1", 100)
        yield* LWWMap.set(map2, "key2", 200)
        yield* LWWMap.set(map3, "key3", 300)

        const state1 = yield* LWWMap.query(map1)
        const state2 = yield* LWWMap.query(map2)
        const state3 = yield* LWWMap.query(map3)

        const merged = yield* LWWMap.make<string, number>(ReplicaId("merged"))
        yield* LWWMap.merge(merged, state1)
        yield* LWWMap.merge(merged, state2)
        yield* LWWMap.merge(merged, state3)

        const mapSize = yield* LWWMap.size(merged)
        return mapSize
      })

      const result = await Effect.runPromise(program.pipe(Effect.provide(VectorClock.Live(ReplicaId("test")))))
      expect(result).toBe(3)
    })
  })

  describe("State Operations", () => {
    it("should create from state", async () => {
      const program = Effect.gen(function* () {
        const state: LWWMap.LWWMapState<string, number> = {
          type: "LWWMap",
          replicaId: ReplicaId("replica-1"),
          entries: new Map([
            ["key1", {
              value: Option.some(100),
              clock: { type: "VectorClock", replicaId: ReplicaId("replica-1"), counters: new Map([[ReplicaId("replica-1"), 1]]) },
              replicaId: ReplicaId("replica-1")
            }],
            ["key2", {
              value: Option.some(200),
              clock: { type: "VectorClock", replicaId: ReplicaId("replica-1"), counters: new Map([[ReplicaId("replica-1"), 2]]) },
              replicaId: ReplicaId("replica-1")
            }]
          ])
        }

        const map = yield* LWWMap.fromState(state)

        const val1 = yield* LWWMap.get(map, "key1")
        const val2 = yield* LWWMap.get(map, "key2")
        const mapSize = yield* LWWMap.size(map)

        return { val1, val2, mapSize }
      })

      const result = await Effect.runPromise(program)
      expect(Option.getOrThrow(result.val1)).toBe(100)
      expect(Option.getOrThrow(result.val2)).toBe(200)
      expect(result.mapSize).toBe(2)
    })

    it("should query state correctly", async () => {
      const program = Effect.gen(function* () {
        const map = yield* LWWMap.make<string, number>(ReplicaId("replica-1"))

        yield* LWWMap.set(map, "key1", 42)
        yield* LWWMap.set(map, "key2", 100)

        const state = yield* LWWMap.query(map)

        return {
          type: state.type,
          replicaId: state.replicaId,
          entryCount: state.entries.size
        }
      })

      const result = await Effect.runPromise(program.pipe(Effect.provide(VectorClock.Live(ReplicaId("test")))))
      expect(result.type).toBe("LWWMap")
      expect(result.replicaId).toBe(ReplicaId("replica-1"))
      expect(result.entryCount).toBe(2)
    })

    it("should round-trip through state", async () => {
      const program = Effect.gen(function* () {
        const map1 = yield* LWWMap.make<string, number>(ReplicaId("replica-1"))

        yield* LWWMap.set(map1, "key1", 42)
        yield* LWWMap.set(map1, "key2", 100)
        yield* LWWMap.delete_(map1, "key2")

        const state = yield* LWWMap.query(map1)
        const map2 = yield* LWWMap.fromState(state)

        const val1 = yield* LWWMap.get(map2, "key1")
        const val2 = yield* LWWMap.get(map2, "key2")
        const mapSize = yield* LWWMap.size(map2)

        return { val1, val2, mapSize }
      })

      const result = await Effect.runPromise(program.pipe(Effect.provide(VectorClock.Live(ReplicaId("test")))))
      expect(Option.getOrThrow(result.val1)).toBe(42)
      expect(Option.isNone(result.val2)).toBe(true)
      expect(result.mapSize).toBe(1)
    })
  })

  describe("CRDT Properties", () => {
    it("should be commutative (merge order doesn't matter)", async () => {
      const program = Effect.gen(function* () {
        // Create two maps with different values
        const mapA1 = yield* LWWMap.make<string, number>(ReplicaId("replica-A"))
        const mapB1 = yield* LWWMap.make<string, number>(ReplicaId("replica-B"))

        yield* LWWMap.set(mapA1, "key1", 100)
        yield* LWWMap.set(mapB1, "key2", 200)

        const stateA = yield* LWWMap.query(mapA1)
        const stateB = yield* LWWMap.query(mapB1)

        // Merge A then B
        const merged1 = yield* LWWMap.make<string, number>(ReplicaId("merged1"))
        yield* LWWMap.merge(merged1, stateA)
        yield* LWWMap.merge(merged1, stateB)

        // Merge B then A
        const merged2 = yield* LWWMap.make<string, number>(ReplicaId("merged2"))
        yield* LWWMap.merge(merged2, stateB)
        yield* LWWMap.merge(merged2, stateA)

        const state1 = yield* LWWMap.query(merged1)
        const state2 = yield* LWWMap.query(merged2)

        return {
          entries1: state1.entries,
          entries2: state2.entries
        }
      })

      const result = await Effect.runPromise(program.pipe(Effect.provide(VectorClock.Live(ReplicaId("test")))))

      // Convert to arrays and compare
      const entries1 = Array.from(result.entries1.entries())
      const entries2 = Array.from(result.entries2.entries())

      expect(entries1.length).toBe(entries2.length)
      expect(entries1.sort()).toEqual(entries2.sort())
    })

    it("should be associative (grouping doesn't matter)", async () => {
      const program = Effect.gen(function* () {
        const mapA = yield* LWWMap.make<string, number>(ReplicaId("replica-A"))
        const mapB = yield* LWWMap.make<string, number>(ReplicaId("replica-B"))
        const mapC = yield* LWWMap.make<string, number>(ReplicaId("replica-C"))

        yield* LWWMap.set(mapA, "key1", 100)
        yield* LWWMap.set(mapB, "key2", 200)
        yield* LWWMap.set(mapC, "key3", 300)

        const stateA = yield* LWWMap.query(mapA)
        const stateB = yield* LWWMap.query(mapB)
        const stateC = yield* LWWMap.query(mapC)

        // (A merge B) merge C
        const merged1 = yield* LWWMap.make<string, number>(ReplicaId("merged1"))
        yield* LWWMap.merge(merged1, stateA)
        yield* LWWMap.merge(merged1, stateB)
        yield* LWWMap.merge(merged1, stateC)

        // A merge (B merge C)
        const mergedBC = yield* LWWMap.make<string, number>(ReplicaId("mergedBC"))
        yield* LWWMap.merge(mergedBC, stateB)
        yield* LWWMap.merge(mergedBC, stateC)
        const stateBC = yield* LWWMap.query(mergedBC)

        const merged2 = yield* LWWMap.make<string, number>(ReplicaId("merged2"))
        yield* LWWMap.merge(merged2, stateA)
        yield* LWWMap.merge(merged2, stateBC)

        const size1 = yield* LWWMap.size(merged1)
        const size2 = yield* LWWMap.size(merged2)

        return { size1, size2 }
      })

      const result = await Effect.runPromise(program.pipe(Effect.provide(VectorClock.Live(ReplicaId("test")))))
      expect(result.size1).toBe(result.size2)
    })

    it("should be idempotent (merging same state multiple times has no effect)", async () => {
      const program = Effect.gen(function* () {
        const map1 = yield* LWWMap.make<string, number>(ReplicaId("replica-1"))
        const map2 = yield* LWWMap.make<string, number>(ReplicaId("replica-2"))

        yield* LWWMap.set(map1, "key1", 100)
        yield* LWWMap.set(map2, "key2", 200)

        const state2 = yield* LWWMap.query(map2)

        // Merge once
        yield* LWWMap.merge(map1, state2)
        const sizeAfterFirst = yield* LWWMap.size(map1)

        // Merge again
        yield* LWWMap.merge(map1, state2)
        const sizeAfterSecond = yield* LWWMap.size(map1)

        return { sizeAfterFirst, sizeAfterSecond }
      })

      const result = await Effect.runPromise(program.pipe(Effect.provide(VectorClock.Live(ReplicaId("test")))))
      expect(result.sizeAfterFirst).toBe(2)
      expect(result.sizeAfterSecond).toBe(2)
    })
  })

  describe("Concurrent Operations", () => {
    it("should handle concurrent sets to different keys", async () => {
      const program = Effect.gen(function* () {
        const map = yield* LWWMap.make<string, number>(ReplicaId("replica-1"))

        yield* Effect.all([
          LWWMap.set(map, "key1", 100),
          LWWMap.set(map, "key2", 200),
          LWWMap.set(map, "key3", 300)
        ], { concurrency: "unbounded" })

        const mapSize = yield* LWWMap.size(map)
        return mapSize
      })

      const result = await Effect.runPromise(program.pipe(Effect.provide(VectorClock.Live(ReplicaId("test")))))
      expect(result).toBe(3)
    })

    it("should handle concurrent sets to same key", async () => {
      const program = Effect.gen(function* () {
        const map = yield* LWWMap.make<string, number>(ReplicaId("replica-1"))

        // All writes happen at roughly the same time
        yield* Effect.all([
          LWWMap.set(map, "key1", 100),
          LWWMap.set(map, "key1", 200),
          LWWMap.set(map, "key1", 300)
        ], { concurrency: "unbounded" })

        const val = yield* LWWMap.get(map, "key1")
        return val
      })

      const result = await Effect.runPromise(program.pipe(Effect.provide(VectorClock.Live(ReplicaId("test")))))
      // Should have one of the values (last write wins based on actual execution)
      expect(Option.isSome(result)).toBe(true)
      const value = Option.getOrThrow(result)
      expect([100, 200, 300]).toContain(value)
    })
  })

  describe("Layer and Tag", () => {
    it("should use Layer for dependency injection", async () => {
      const MapTag = LWWMap.Tag<string, number>()

      const program = Effect.gen(function* () {
        const map = yield* MapTag

        yield* LWWMap.set(map, "count", 42)
        const val = yield* LWWMap.get(map, "count")

        return val
      })

      const result = await Effect.runPromise(
        program.pipe(
          Effect.provide(LWWMap.Live(MapTag, ReplicaId("replica-1"))),
          Effect.provide(VectorClock.Live(ReplicaId("test")))
        )
      )

      expect(Option.getOrThrow(result)).toBe(42)
    })
  })
})

/**
 * Type alias for LWWMapState to make tests cleaner.
 * Re-export from LWWMap module.
 */
declare module "./LWWMap" {
  export type LWWMapState<K, V> = import("./CRDTMap").LWWMapState<K, V>
}
