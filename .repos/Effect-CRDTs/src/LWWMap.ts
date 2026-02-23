/**
 * LWW-Map (Last-Write-Wins Map) CRDT implementation.
 *
 * An LWW-Map is a state-based CRDT that implements a map where each key is
 * associated with an independent LWW-Register. Each entry stores a value
 * (or tombstone), timestamp, and replica ID. Conflicts are resolved using
 * timestamps - the entry with the highest timestamp wins. Replica IDs are
 * used for tie-breaking when timestamps are equal.
 *
 * Properties:
 * - Last-write-wins conflict resolution
 * - Tombstone-based deletion (Option.none)
 * - Commutative merge operation
 * - Associative merge operation
 * - Idempotent merge operation
 * - Eventually consistent across all replicas
 *
 * @since 0.1.0
 */

import * as Context from "effect/Context"
import * as Data from "effect/Data"
import * as Effect from "effect/Effect"
import { dual, pipe } from "effect/Function"
import * as Layer from "effect/Layer"
import * as Option from "effect/Option"
import * as Predicate from "effect/Predicate"
import * as STM from "effect/STM"
import * as TMap from "effect/TMap"
import type { Mutable } from "effect/Types"
import type { ReplicaId } from "./CRDT.js"
import type { LWWMapState } from "./CRDTMap.js"
import { makeProtoBase } from "./internal/proto.js"
import * as Persistence$ from "./Persistence.js"
import * as VectorClock from "./VectorClock.js"
import type { VectorClockState } from "./VectorClock.js"

// =============================================================================
// Symbols
// =============================================================================

/**
 * LWW-Map type identifier.
 *
 * @since 0.1.0
 * @category symbols
 */
export const LWWMapTypeId: unique symbol = Symbol.for("effect-crdts/LWWMap")

/**
 * LWW-Map type identifier type.
 *
 * @since 0.1.0
 * @category symbols
 */
export type LWWMapTypeId = typeof LWWMapTypeId

// =============================================================================
// Models
// =============================================================================

/**
 * Entry metadata for LWW-Map.
 *
 * @since 0.1.0
 * @category models
 */
export interface LWWEntry<V> {
  readonly value: Option.Option<V>
  readonly clock: VectorClockState
  readonly replicaId: ReplicaId
}

/**
 * LWW-Map CRDT data structure.
 *
 * @since 0.1.0
 * @category models
 */
export interface LWWMap<K, V> extends LWWMap.Variance {
  readonly replicaId: ReplicaId
  readonly entries: TMap.TMap<K, LWWEntry<V>>
}

/**
 * @since 0.1.0
 */
export declare namespace LWWMap {
  /**
   * @since 0.1.0
   * @category models
   */
  export interface Variance {
    readonly [LWWMapTypeId]: LWWMapTypeId
  }
}

// =============================================================================
// Errors
// =============================================================================

/**
 * Error thrown by LWW-Map operations.
 *
 * @since 0.1.0
 * @category errors
 */
export class LWWMapError extends Data.TaggedError("LWWMapError")<{
  readonly message: string
}> { }

// =============================================================================
// Type Guards
// =============================================================================

/**
 * Type guard to check if a value is an LWWMap.
 *
 * @since 0.1.0
 * @category guards
 */
export const isLWWMap = (u: unknown): u is LWWMap<unknown, unknown> =>
  Predicate.hasProperty(u, LWWMapTypeId)

// =============================================================================
// Proto Objects
// =============================================================================

/** @internal */
const ProtoLWWMap = makeProtoBase(LWWMapTypeId)

// =============================================================================
// Constructors
// =============================================================================

/**
 * Creates a new LWW-Map with the given replica ID.
 *
 * @example
 * ```ts
 * import { make, set, get, ReplicaId } from "effect-crdts/LWWMap"
 * import * as Effect from "effect/Effect"
 * import * as STM from "effect/STM"
 *
 * const program = Effect.gen(function* () {
 *   const map = yield* STM.commit(make(ReplicaId("replica-1")))
 *
 *   yield* set(map, "key1", "value1")
 *   const val = yield* STM.commit(get(map, "key1"))
 *
 *   console.log("Value:", val) // Option.some("value1")
 * })
 * ```
 *
 * @since 0.1.0
 * @category constructors
 */
export const make = <K, V>(replicaId: ReplicaId): STM.STM<LWWMap<K, V>> =>
  STM.gen(function* () {
    const entries = yield* TMap.empty<K, LWWEntry<V>>()
    const map: Mutable<LWWMap<K, V>> = Object.create(ProtoLWWMap)
    map.replicaId = replicaId
    map.entries = entries
    return map
  })

/**
 * Creates an LWW-Map from a persisted state.
 *
 * @example
 * ```ts
 * import { fromState, get, ReplicaId } from "effect-crdts/LWWMap"
 * import * as Effect from "effect/Effect"
 * import * as Option from "effect/Option"
 * import * as STM from "effect/STM"
 *
 * const program = Effect.gen(function* () {
 *   const state = {
 *     type: "LWWMap" as const,
 *     replicaId: ReplicaId("replica-1"),
 *     entries: new Map([
 *       ["key1", { value: Option.some("value1"), timestamp: 100, replicaId: ReplicaId("replica-1") }]
 *     ])
 *   }
 *
 *   const map = yield* STM.commit(fromState(state))
 *   const val = yield* STM.commit(get(map, "key1"))
 *
 *   console.log("Value:", val) // Option.some("value1")
 * })
 * ```
 *
 * @since 0.1.0
 * @category constructors
 */
export const fromState = <K, V>(state: LWWMapState<K, V>): STM.STM<LWWMap<K, V>> =>
  STM.gen(function* () {
    const entries = yield* TMap.fromIterable(state.entries.entries())
    const map: Mutable<LWWMap<K, V>> = Object.create(ProtoLWWMap)
    map.replicaId = state.replicaId
    map.entries = entries
    return map
  })

// =============================================================================
// Operations
// =============================================================================

/**
 * Helper to compare two entries for LWW resolution.
 * Returns true if entry1 wins over entry2.
 *
 * @internal
 */
const compareEntries = <V>(
  entry1: LWWEntry<V>,
  entry2: LWWEntry<V>
): boolean => {
  const ordering = VectorClock.compare(entry1.clock, entry2.clock)
  switch (ordering) {
    case "After":
      return true
    case "Before":
      return false
    case "Equal":
      return false
    case "Concurrent":
      // Tie-break with replica ID (lexicographic comparison)
      return entry1.replicaId > entry2.replicaId
  }
}

/**
 * Get the value for a key.
 *
 * Returns Option.none if the key doesn't exist or has been tombstoned.
 *
 * @example
 * ```ts
 * import { make, set, get, ReplicaId } from "effect-crdts/LWWMap"
 * import * as Effect from "effect/Effect"
 * import * as Option from "effect/Option"
 * import * as STM from "effect/STM"
 *
 * const program = STM.gen(function* () {
 *   const map = yield* make(ReplicaId("replica-1"))
 *
 *   // Get non-existent key
 *   const val1 = yield* get(map, "key1")
 *   console.log(Option.isNone(val1)) // true
 * })
 * ```
 *
 * @since 0.1.0
 * @category operations
 */
export const get: {
  <K>(key: K): <V>(self: LWWMap<K, V>) => STM.STM<Option.Option<V>>
  <K, V>(self: LWWMap<K, V>, key: K): STM.STM<Option.Option<V>>
} = dual(
  2,
  <K, V>(self: LWWMap<K, V>, key: K): STM.STM<Option.Option<V>> =>
    pipe(
      TMap.get(self.entries, key),
      STM.map(Option.flatMap((entry) => entry.value))
    )
)

/**
 * Set a key to a value with an incremented vector clock.
 *
 * @example
 * ```ts
 * import { make, set, get, ReplicaId } from "effect-crdts/LWWMap"
 * import { pipe } from "effect/Function"
 * import * as Effect from "effect/Effect"
 * import * as Option from "effect/Option"
 * import * as STM from "effect/STM"
 *
 * const program = Effect.gen(function* () {
 *   const map = yield* STM.commit(make(ReplicaId("replica-1")))
 *
 *   // Data-first style
 *   yield* set(map, "key1", "value1")
 *
 *   // Data-last style (pipe)
 *   yield* pipe(map, set("key2", "value2"))
 *
 *   const val1 = yield* STM.commit(get(map, "key1"))
 *   const val2 = yield* STM.commit(get(map, "key2"))
 *   console.log(val1, val2)
 * })
 * ```
 *
 * @since 0.1.0
 * @category operations
 */
export const set: {
  <K, V>(key: K, value: V): (self: LWWMap<K, V>) => Effect.Effect<LWWMap<K, V>, never, VectorClock.VectorClock>
  <K, V>(self: LWWMap<K, V>, key: K, value: V): Effect.Effect<LWWMap<K, V>, never, VectorClock.VectorClock>
} = dual(
  3,
  <K, V>(self: LWWMap<K, V>, key: K, value: V): Effect.Effect<LWWMap<K, V>, never, VectorClock.VectorClock> =>
    Effect.gen(function* () {
      const vc = yield* VectorClock.Tag
      yield* VectorClock.increment(vc)
      const clockState = yield* VectorClock.query(vc)

      yield* TMap.set(self.entries, key, {
        value: Option.some(value),
        clock: clockState,
        replicaId: self.replicaId
      })

      return self
    })
)

/**
 * Delete a key by writing a tombstone.
 *
 * @example
 * ```ts
 * import { make, set, delete_, has, ReplicaId } from "effect-crdts/LWWMap"
 * import * as Effect from "effect/Effect"
 * import * as STM from "effect/STM"
 * import { pipe } from "effect/Function"
 *
 * const program = Effect.gen(function* () {
 *   const map = yield* STM.commit(make(ReplicaId("replica-1")))
 *
 *   yield* set(map, "key1", "value1")
 *   const exists1 = yield* STM.commit(has(map, "key1"))
 *   console.log(exists1) // true
 *
 *   // Data-first style
 *   yield* delete_(map, "key1")
 *
 *   // Data-last style
 *   // yield* pipe(map, delete_("key1"))
 *
 *   const exists2 = yield* STM.commit(has(map, "key1"))
 *   console.log(exists2) // false
 * })
 * ```
 *
 * @since 0.1.0
 * @category operations
 */
export const delete_: {
  <K>(key: K): <V>(self: LWWMap<K, V>) => Effect.Effect<LWWMap<K, V>, never, VectorClock.VectorClock>
  <K, V>(self: LWWMap<K, V>, key: K): Effect.Effect<LWWMap<K, V>, never, VectorClock.VectorClock>
} = dual(
  2,
  <K, V>(self: LWWMap<K, V>, key: K): Effect.Effect<LWWMap<K, V>, never, VectorClock.VectorClock> =>
    Effect.gen(function* () {
      const vc = yield* VectorClock.Tag
      yield* VectorClock.increment(vc)
      const clockState = yield* VectorClock.query(vc)

      yield* TMap.set(self.entries, key, {
        value: Option.none(),
        clock: clockState,
        replicaId: self.replicaId
      })

      return self
    })
)

/**
 * Check if a key exists and is not tombstoned.
 *
 * @example
 * ```ts
 * import { make, set, has, ReplicaId } from "effect-crdts/LWWMap"
 * import * as Effect from "effect/Effect"
 * import * as STM from "effect/STM"
 *
 * const program = Effect.gen(function* () {
 *   const map = yield* STM.commit(make(ReplicaId("replica-1")))
 *
 *   const exists1 = yield* has(map, "key1")
 *   console.log(exists1) // false
 *
 *   yield* set(map, "key1", "value1")
 *   const exists2 = yield* has(map, "key1")
 *   console.log(exists2) // true
 * })
 * ```
 *
 * @since 0.1.0
 * @category operations
 */
export const has: {
  <K>(key: K): <V>(self: LWWMap<K, V>) => STM.STM<boolean>
  <K, V>(self: LWWMap<K, V>, key: K): STM.STM<boolean>
} = dual(
  2,
  <K, V>(self: LWWMap<K, V>, key: K): STM.STM<boolean> =>
    pipe(
      TMap.get(self.entries, key),
      STM.map(Option.match({
        onNone: () => false,
        onSome: (entry) => Option.isSome(entry.value)
      }))
    )
)

/**
 * Get all keys that are not tombstoned.
 *
 * @example
 * ```ts
 * import { make, set, delete_, keys, ReplicaId } from "effect-crdts/LWWMap"
 * import * as Effect from "effect/Effect"
 * import * as STM from "effect/STM"
 *
 * const program = Effect.gen(function* () {
 *   const map = yield* STM.commit(make(ReplicaId("replica-1")))
 *
 *   yield* set(map, "key1", "value1")
 *   yield* set(map, "key2", "value2")
 *   yield* delete_(map, "key2")
 *
 *   const allKeys = yield* keys(map)
 *   console.log(allKeys) // ["key1"]
 * })
 * ```
 *
 * @since 0.1.0
 * @category operations
 */
export const keys = <K, V>(self: LWWMap<K, V>): STM.STM<Array<K>> =>
  pipe(
    TMap.toArray(self.entries),
    STM.map((entries) =>
      entries
        .filter(([_, entry]) => Option.isSome(entry.value))
        .map(([key, _]) => key)
    )
  )

/**
 * Get all values that are not tombstoned.
 *
 * @example
 * ```ts
 * import { make, set, delete_, values, ReplicaId } from "effect-crdts/LWWMap"
 * import * as Effect from "effect/Effect"
 * import * as STM from "effect/STM"
 *
 * const program = Effect.gen(function* () {
 *   const map = yield* STM.commit(make(ReplicaId("replica-1")))
 *
 *   yield* set(map, "key1", "value1")
 *   yield* set(map, "key2", "value2")
 *   yield* delete_(map, "key2")
 *
 *   const allValues = yield* values(map)
 *   console.log(allValues) // ["value1"]
 * })
 * ```
 *
 * @since 0.1.0
 * @category operations
 */
export const values = <K, V>(self: LWWMap<K, V>): STM.STM<Array<V>> =>
  pipe(
    TMap.values(self.entries),
    STM.map((entries) =>
      entries
        .filter((entry) => Option.isSome(entry.value))
        .map((entry) => Option.getOrThrow(entry.value))
    )
  )

/**
 * Get the number of non-tombstoned entries.
 *
 * @example
 * ```ts
 * import { make, set, delete_, size, ReplicaId } from "effect-crdts/LWWMap"
 * import * as Effect from "effect/Effect"
 * import * as STM from "effect/STM"
 *
 * const program = Effect.gen(function* () {
 *   const map = yield* STM.commit(make(ReplicaId("replica-1")))
 *
 *   yield* set(map, "key1", "value1")
 *   yield* set(map, "key2", "value2")
 *   yield* set(map, "key3", "value3")
 *   yield* delete_(map, "key2")
 *
 *   const count = yield* size(map)
 *   console.log(count) // 2
 * })
 * ```
 *
 * @since 0.1.0
 * @category operations
 */
export const size = <K, V>(self: LWWMap<K, V>): STM.STM<number> =>
  pipe(
    TMap.values(self.entries),
    STM.map((entries) =>
      entries.filter((entry) => Option.isSome(entry.value)).length
    )
  )

/**
 * Merge another map's state into this map.
 *
 * For each key in the union of both maps, keeps the entry with the higher
 * timestamp. Uses replica ID for tie-breaking when timestamps are equal.
 *
 * @example
 * ```ts
 * import { make, set, merge, query, get, ReplicaId } from "effect-crdts/LWWMap"
 * import * as Effect from "effect/Effect"
 * import * as STM from "effect/STM"
 * import { pipe } from "effect/Function"
 *
 * const program = Effect.gen(function* () {
 *   const map1 = yield* STM.commit(make(ReplicaId("replica-1")))
 *   const map2 = yield* STM.commit(make(ReplicaId("replica-2")))
 *
 *   yield* set(map1, "key1", "value1")
 *   yield* set(map2, "key2", "value2")
 *
 *   const state2 = yield* STM.commit(query(map2))
 *
 *   // Data-first style
 *   yield* merge(map1, state2)
 *
 *   // Data-last style (pipe)
 *   // yield* pipe(map1, merge(state2))
 *
 *   const val1 = yield* STM.commit(get(map1, "key1"))
 *   const val2 = yield* STM.commit(get(map1, "key2"))
 *   console.log(val1, val2) // Option.some("value1"), Option.some("value2")
 * })
 * ```
 *
 * @since 0.1.0
 * @category operations
 */
export const merge: {
  <K, V>(other: LWWMapState<K, V>): (self: LWWMap<K, V>) => STM.STM<LWWMap<K, V>>
  <K, V>(self: LWWMap<K, V>, other: LWWMapState<K, V>): STM.STM<LWWMap<K, V>>
} = dual(
  2,
  <K, V>(self: LWWMap<K, V>, other: LWWMapState<K, V>): STM.STM<LWWMap<K, V>> =>
    STM.forEach(other.entries.entries(), ([key, otherEntry]) =>
      pipe(
        TMap.get(self.entries, key),
        STM.flatMap((selfEntryOpt) =>
          Option.match(selfEntryOpt, {
            // Key doesn't exist in self, add it
            onNone: () => TMap.set(self.entries, key, otherEntry),
            // Key exists, resolve conflict
            onSome: (selfEntry) =>
              compareEntries(otherEntry, selfEntry)
                ? TMap.set(self.entries, key, otherEntry)
                : STM.void
          })
        )
      )
    ).pipe(STM.as(self))
)

// =============================================================================
// Getters
// =============================================================================

/**
 * Get the current state of the map.
 *
 * Returns the state suitable for persistence or merging with other replicas.
 *
 * @example
 * ```ts
 * import { make, set, query, ReplicaId } from "effect-crdts/LWWMap"
 * import * as Effect from "effect/Effect"
 * import * as STM from "effect/STM"
 *
 * const program = Effect.gen(function* () {
 *   const map = yield* STM.commit(make(ReplicaId("replica-1")))
 *   yield* set(map, "key1", "value1")
 *
 *   const state = yield* query(map)
 *   console.log("State:", state)
 * })
 * ```
 *
 * @since 0.1.0
 * @category getters
 */
export const query = <K, V>(self: LWWMap<K, V>): STM.STM<LWWMapState<K, V>> =>
  pipe(
    TMap.toMap(self.entries),
    STM.map((entries) => ({
      type: "LWWMap" as const,
      replicaId: self.replicaId,
      entries
    }))
  )

// =============================================================================
// Tags
// =============================================================================

/**
 * LWWMap service tag for dependency injection.
 *
 * @since 0.1.0
 * @category tags
 */
export const Tag = <K, V>() => Context.GenericTag<LWWMap<K, V>>("@effect-crdts/LWWMap")

// =============================================================================
// Layers
// =============================================================================

/**
 * Creates a live layer with the given replica ID.
 *
 * @example
 * ```ts
 * import * as LWWMap from "effect-crdts/LWWMap"
 * import { ReplicaId } from "effect-crdts/CRDT"
 * import * as Effect from "effect/Effect"
 * import * as STM from "effect/STM"
 *
 * const MapTag = LWWMap.Tag<string, number>()
 *
 * const program = Effect.gen(function* () {
 *   const map = yield* MapTag
 *   yield* LWWMap.set(map, "count", 42)
 *   const val = yield* STM.commit(LWWMap.get(map, "count"))
 *   console.log("Value:", val)
 * })
 *
 * Effect.runPromise(
 *   program.pipe(
 *     Effect.provide(LWWMap.Live(MapTag, ReplicaId("replica-1")))
 *   )
 * )
 * ```
 *
 * @since 0.1.0
 * @category layers
 */
export const Live = <K, V>(
  tag: Context.Tag<LWWMap<K, V>, LWWMap<K, V>>,
  replicaId: ReplicaId
): Layer.Layer<LWWMap<K, V>> =>
  Layer.effect(
    tag,
    pipe(make<K, V>(replicaId), STM.commit)
  )

/**
 * Creates a live layer with persistence for LWW-Map.
 *
 * The map will automatically load its state on startup and save on shutdown.
 * Requires a SchemaStore service to be provided in the environment.
 *
 * @example
 * ```ts
 * import * as LWWMap from "effect-crdts/LWWMap"
 * import * as CRDTMap from "effect-crdts/CRDTMap"
 * import { ReplicaId } from "effect-crdts/CRDT"
 * import * as Persistence from "effect-crdts/Persistence"
 * import * as Effect from "effect/Effect"
 * import * as Schema from "effect/Schema"
 * import * as STM from "effect/STM"
 * import * as KeyValueStore from "@effect/platform/KeyValueStore"
 *
 * const MapTag = LWWMap.Tag<string, number>()
 * const schema = CRDTMap.LWWMapState(Schema.String, Schema.Number)
 * const persistence = Persistence.layerSchema(schema, "LWWMapStore")
 *
 * const program = Effect.gen(function* () {
 *   const map = yield* MapTag
 *   yield* LWWMap.set(map, "count", 42)
 *   const val = yield* STM.commit(LWWMap.get(map, "count"))
 *   console.log("Counter value:", val)
 * })
 *
 * Effect.runPromise(
 *   program.pipe(
 *     Effect.provide(LWWMap.withPersistence(MapTag, persistence.tag, ReplicaId("replica-1"))),
 *     Effect.provide(persistence.layer),
 *     Effect.provide(Persistence.layer),
 *     Effect.provide(KeyValueStore.layerMemory)
 *   )
 * )
 * ```
 *
 * @since 0.1.0
 * @category layers
 */
export const withPersistence = <K, V>(
  tag: Context.Tag<LWWMap<K, V>, LWWMap<K, V>>,
  persistenceTag: Context.Tag<
    Persistence$.SchemaStore<LWWMapState<K, V>, never>,
    Persistence$.SchemaStore<LWWMapState<K, V>, never>
  >,
  replicaId: ReplicaId
) =>
  Layer.scoped(
    tag,
    Effect.gen(function* () {
      const persistence = yield* persistenceTag
      const loadedState: Option.Option<LWWMapState<K, V>> = yield* persistence.load(replicaId)

      const map = yield* pipe(
        loadedState,
        Option.match({
          onNone: () => make<K, V>(replicaId),
          onSome: (state) => fromState(state)
        }),
        STM.commit
      )

      // Setup auto-save on finalization
      yield* Effect.addFinalizer(() =>
        pipe(
          query(map),
          STM.commit,
          Effect.flatMap((state) => persistence.save(replicaId, state)),
          Effect.ignoreLogged
        )
      )

      return map
    })
  )
