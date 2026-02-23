/**
 * Vector Clock CRDT implementation for causal tracking.
 *
 * A Vector Clock is a state-based CRDT that tracks causality between events
 * in a distributed system. Each replica maintains a logical counter, and the
 * vector clock is the map of all replica counters. This allows determining
 * whether two events are causally related (before/after) or concurrent.
 *
 * Properties:
 * - Increment: increases local replica's counter
 * - Merge: max of each replica's counter
 * - Comparison: determines causal ordering (Before, After, Equal, Concurrent)
 * - Commutative merge operation
 * - Associative merge operation
 * - Idempotent merge operation
 * - Eventually consistent across all replicas
 *
 * @since 0.1.0
 */

import * as Context from "effect/Context"
import * as Data from "effect/Data"
import { dual, pipe } from "effect/Function"
import * as Layer from "effect/Layer"
import * as Option from "effect/Option"
import * as Predicate from "effect/Predicate"
import * as Schema from "effect/Schema"
import * as STM from "effect/STM"
import * as TMap from "effect/TMap"
import type { Mutable } from "effect/Types"
import { type ReplicaId, ReplicaIdSchema } from "./CRDT.js"
import { makeProtoBase } from "./internal/proto.js"

// =============================================================================
// Symbols
// =============================================================================

/**
 * VectorClock type identifier.
 *
 * @since 0.1.0
 * @category symbols
 */
export const VectorClockTypeId: unique symbol = Symbol.for("effect-crdts/VectorClock")

/**
 * VectorClock type identifier type.
 *
 * @since 0.1.0
 * @category symbols
 */
export type VectorClockTypeId = typeof VectorClockTypeId

// =============================================================================
// Models
// =============================================================================

/**
 * Causal ordering relationship between two vector clocks.
 *
 * @since 0.1.0
 * @category models
 */
export type CausalOrdering = "Before" | "After" | "Equal" | "Concurrent"

/**
 * State of a Vector Clock CRDT for persistence.
 *
 * @since 0.1.0
 * @category models
 */
export interface VectorClockState {
  readonly type: "VectorClock"
  readonly replicaId: ReplicaId
  readonly counters: ReadonlyMap<ReplicaId, number>
}

/**
 * Vector Clock CRDT data structure.
 *
 * @since 0.1.0
 * @category models
 */
export interface VectorClock {
  readonly replicaId: ReplicaId
  readonly counters: TMap.TMap<ReplicaId, number>
}



// =============================================================================
// Errors
// =============================================================================

/**
 * Error thrown by Vector Clock operations.
 *
 * @since 0.1.0
 * @category errors
 */
export class VectorClockError extends Data.TaggedError("VectorClockError")<{
  readonly message: string
}> { }

// =============================================================================
// Type Guards
// =============================================================================

/**
 * Type guard to check if a value is a VectorClock.
 *
 * @since 0.1.0
 * @category guards
 */
export const isVectorClock = (u: unknown): u is VectorClock =>
  Predicate.hasProperty(u, VectorClockTypeId)

// =============================================================================
// Proto Objects
// =============================================================================

/** @internal */
const ProtoVectorClock = makeProtoBase(VectorClockTypeId)

// =============================================================================
// Constructors
// =============================================================================

/**
 * Creates a new Vector Clock with the given replica ID.
 *
 * @example
 * ```ts
 * import { make, increment, get, ReplicaId } from "effect-crdts/VectorClock"
 * import * as Effect from "effect/Effect"
 * import * as STM from "effect/STM"
 *
 * const program = Effect.gen(function* () {
 *   const clock = yield* make(ReplicaId("replica-1"))
 *
 *   yield* STM.commit(increment(clock))
 *   const counter = yield* STM.commit(get(clock, ReplicaId("replica-1")))
 *
 *   console.log("Counter:", counter) // 1
 * })
 * ```
 *
 * @since 0.1.0
 * @category constructors
 */
export const make = (replicaId: ReplicaId): STM.STM<VectorClock> =>
  STM.gen(function* () {
    const counters = yield* TMap.make<ReplicaId, number>([replicaId, 0])
    const clock = Object.create(ProtoVectorClock)
    clock.replicaId = replicaId
    clock.counters = counters
    return clock
  })

/**
 * Creates a Vector Clock from a persisted state.
 *
 * @example
 * ```ts
 * import { fromState, get, ReplicaId } from "effect-crdts/VectorClock"
 * import * as Effect from "effect/Effect"
 * import * as STM from "effect/STM"
 *
 * const program = Effect.gen(function* () {
 *   const state = {
 *     type: "VectorClock" as const,
 *     replicaId: ReplicaId("replica-1"),
 *     counters: new Map([[ReplicaId("replica-1"), 5]])
 *   }
 *
 *   const clock = yield* fromState(state)
 *   const counter = yield* STM.commit(get(clock, ReplicaId("replica-1")))
 *
 *   console.log("Counter:", counter) // 5
 * })
 * ```
 *
 * @since 0.1.0
 * @category constructors
 */
export const fromState = (state: VectorClockState): STM.STM<Mutable<VectorClock>> =>
  STM.gen(function* () {
    const counters = yield* TMap.fromIterable(state.counters.entries())
    const clock: Mutable<VectorClock> = Object.create(ProtoVectorClock)
    clock.replicaId = state.replicaId
    clock.counters = counters
    return clock
  })

// =============================================================================
// Operations
// =============================================================================

/**
 * Increment the local replica's counter by 1.
 *
 * @example
 * ```ts
 * import { make, increment, get, ReplicaId } from "effect-crdts/VectorClock"
 * import { pipe } from "effect/Function"
 * import * as STM from "effect/STM"
 *
 * const program = STM.gen(function* () {
 *   const clock = yield* make(ReplicaId("replica-1"))
 *
 *   // Data-first style
 *   yield* increment(clock)
 *
 *   // Data-last style (pipe)
 *   yield* pipe(clock, increment)
 *
 *   const counter = yield* get(clock, ReplicaId("replica-1"))
 *   console.log("Counter:", counter) // 2
 * })
 * ```
 *
 * @since 0.1.0
 * @category operations
 */
export const increment = (self: VectorClock): STM.STM<VectorClock> =>
  pipe(
    TMap.get(self.counters, self.replicaId),
    STM.flatMap((currentOpt) => {
      const current = Option.getOrElse(currentOpt, () => 0)
      return TMap.set(self.counters, self.replicaId, current + 1)
    }),
    STM.as(self)
  )

/**
 * Get the counter value for a specific replica (defaults to 0 if not present).
 *
 * @example
 * ```ts
 * import { make, increment, get, ReplicaId } from "effect-crdts/VectorClock"
 * import * as STM from "effect/STM"
 *
 * const program = STM.gen(function* () {
 *   const clock = yield* make(ReplicaId("replica-1"))
 *   yield* increment(clock)
 *
 *   const counter1 = yield* get(clock, ReplicaId("replica-1"))
 *   const counter2 = yield* get(clock, ReplicaId("replica-2"))
 *
 *   console.log("Counter 1:", counter1) // 1
 *   console.log("Counter 2:", counter2) // 0 (default)
 * })
 * ```
 *
 * @since 0.1.0
 * @category operations
 */
export const get: {
  (replicaId: ReplicaId): (self: VectorClock) => STM.STM<number>
  (self: VectorClock, replicaId: ReplicaId): STM.STM<number>
} = dual(
  2,
  (self: VectorClock, replicaId: ReplicaId): STM.STM<number> =>
    pipe(
      TMap.get(self.counters, replicaId),
      STM.map((opt) => Option.getOrElse(opt, () => 0))
    )
)

/**
 * Compare this vector clock with another to determine causal ordering.
 *
 * @example
 * ```ts
 * import { make, increment, compare, query, ReplicaId } from "effect-crdts/VectorClock"
 * import * as STM from "effect/STM"
 *
 * const program = STM.gen(function* () {
 *   const clock1 = yield* make(ReplicaId("replica-1"))
 *   const clock2 = yield* make(ReplicaId("replica-2"))
 *
 *   yield* increment(clock1)
 *   const state1 = yield* query(clock1)
 *
 *   const ordering = yield* compare(clock2, state1)
 *   console.log("Ordering:", ordering) // "Before"
 * })
 * ```
 *
 * @since 0.1.0
 * @category operations
 */
export const compareSTM: {
  (other: VectorClockState): (self: VectorClock) => STM.STM<CausalOrdering>
  (self: VectorClock, other: VectorClockState): STM.STM<CausalOrdering>
} = dual(
  2,
  (self: VectorClock, other: VectorClockState): STM.STM<CausalOrdering> =>
    STM.gen(function* () {
      const localMap = yield* TMap.toMap(self.counters)
      const remoteMap = other.counters

      // Collect all replica IDs from both clocks
      const allReplicas = new Set([...localMap.keys(), ...remoteMap.keys()])

      let hasLess = false
      let hasGreater = false

      for (const replica of allReplicas) {
        const localVal = localMap.get(replica) ?? 0
        const remoteVal = remoteMap.get(replica) ?? 0

        if (localVal < remoteVal) hasLess = true
        if (localVal > remoteVal) hasGreater = true
      }

      if (!hasLess && !hasGreater) return "Equal"
      if (hasLess && !hasGreater) return "Before"
      if (hasGreater && !hasLess) return "After"
      return "Concurrent"
    })
)

/**
 * Merge another vector clock's state into this clock.
 *
 * Takes the maximum counter for each replica ID.
 *
 * @example
 * ```ts
 * import { make, increment, merge, get, query, ReplicaId } from "effect-crdts/VectorClock"
 * import { pipe } from "effect/Function"
 * import * as STM from "effect/STM"
 *
 * const program = STM.gen(function* () {
 *   const clock1 = yield* make(ReplicaId("replica-1"))
 *   const clock2 = yield* make(ReplicaId("replica-2"))
 *
 *   yield* increment(clock1)
 *   yield* increment(clock1)
 *   yield* increment(clock2)
 *
 *   const state2 = yield* query(clock2)
 *
 *   // Data-first style
 *   yield* merge(clock1, state2)
 *
 *   // Data-last style (pipe)
 *   // yield* pipe(clock1, merge(state2))
 *
 *   const counter1 = yield* get(clock1, ReplicaId("replica-1"))
 *   const counter2 = yield* get(clock1, ReplicaId("replica-2"))
 *   console.log("Counters:", counter1, counter2) // 2, 1
 * })
 * ```
 *
 * @since 0.1.0
 * @category operations
 */
export const merge: {
  (other: VectorClockState): (self: VectorClock) => STM.STM<VectorClock>
  (self: VectorClock, other: VectorClockState): STM.STM<VectorClock>
} = dual(
  2,
  (self: VectorClock, other: VectorClockState): STM.STM<VectorClock> =>
    STM.forEach(other.counters.entries(), ([replicaId, count]) =>
      pipe(
        TMap.get(self.counters, replicaId),
        STM.flatMap((currentOpt) => {
          const current = Option.getOrElse(currentOpt, () => 0)
          return TMap.set(self.counters, replicaId, Math.max(current, count))
        })
      )
    ).pipe(STM.as(self))
)

// =============================================================================
// Getters
// =============================================================================

/**
 * Get the current state of a vector clock.
 *
 * Returns the state suitable for persistence or merging with other replicas.
 *
 * @example
 * ```ts
 * import { make, increment, query, ReplicaId } from "effect-crdts/VectorClock"
 * import * as STM from "effect/STM"
 *
 * const program = STM.gen(function* () {
 *   const clock = yield* make(ReplicaId("replica-1"))
 *   yield* increment(clock)
 *
 *   const state = yield* query(clock)
 *   console.log("State:", state)
 * })
 * ```
 *
 * @since 0.1.0
 * @category getters
 */
export const query = (self: VectorClock): STM.STM<VectorClockState> =>
  pipe(
    TMap.toMap(self.counters),
    STM.map((counters) => ({
      type: "VectorClock" as const,
      replicaId: self.replicaId,
      counters
    }))
  )

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Compare two vector clock states to determine their causal relationship.
 *
 * Returns:
 * - Before: a happened before b (a < b)
 * - After: a happened after b (a > b)
 * - Equal: a and b are identical
 * - Concurrent: a and b are concurrent (neither happened before the other)
 *
 * @since 0.1.0
 * @category helpers
 */
export const compare = (a: VectorClockState, b: VectorClockState): CausalOrdering => {
  const allReplicas = new Set([...a.counters.keys(), ...b.counters.keys()])

  let hasLess = false
  let hasGreater = false

  for (const replicaId of allReplicas) {
    const aTime = a.counters.get(replicaId) ?? 0
    const bTime = b.counters.get(replicaId) ?? 0

    if (aTime < bTime) hasLess = true
    if (aTime > bTime) hasGreater = true

    // Early exit for concurrent
    if (hasLess && hasGreater) return "Concurrent"
  }

  if (!hasLess && !hasGreater) return "Equal"
  if (hasLess && !hasGreater) return "Before"
  if (hasGreater && !hasLess) return "After"

  return "Concurrent"
}

/**
 * Test if vector clock A happened before vector clock B.
 *
 * Returns true if A < B (A is causally before B).
 *
 * @example
 * ```ts
 * import { make, increment, happenedBefore, query, ReplicaId } from "effect-crdts/VectorClock"
 * import * as STM from "effect/STM"
 *
 * const program = STM.gen(function* () {
 *   const clock1 = yield* make(ReplicaId("replica-1"))
 *   const clock2 = yield* make(ReplicaId("replica-1"))
 *
 *   yield* increment(clock1)
 *   yield* increment(clock2)
 *   yield* increment(clock2)
 *
 *   const state1 = yield* query(clock1)
 *   const state2 = yield* query(clock2)
 *
 *   const before = happenedBefore(state1, state2)
 *   console.log("Before:", before) // true
 * })
 * ```
 *
 * @since 0.1.0
 * @category helpers
 */
export const happenedBefore = (a: VectorClockState, b: VectorClockState): boolean => {
  const allReplicas = new Set([...a.counters.keys(), ...b.counters.keys()])

  let hasLess = false
  let hasGreater = false

  for (const replica of allReplicas) {
    const aVal = a.counters.get(replica) ?? 0
    const bVal = b.counters.get(replica) ?? 0

    if (aVal < bVal) hasLess = true
    if (aVal > bVal) hasGreater = true
  }

  return hasLess && !hasGreater
}

/**
 * Test if vector clock A happened after vector clock B.
 *
 * Returns true if A > B (A is causally after B).
 *
 * @example
 * ```ts
 * import { make, increment, happenedAfter, query, ReplicaId } from "effect-crdts/VectorClock"
 * import * as STM from "effect/STM"
 *
 * const program = STM.gen(function* () {
 *   const clock1 = yield* make(ReplicaId("replica-1"))
 *   const clock2 = yield* make(ReplicaId("replica-1"))
 *
 *   yield* increment(clock1)
 *   yield* increment(clock1)
 *   yield* increment(clock2)
 *
 *   const state1 = yield* query(clock1)
 *   const state2 = yield* query(clock2)
 *
 *   const after = happenedAfter(state1, state2)
 *   console.log("After:", after) // true
 * })
 * ```
 *
 * @since 0.1.0
 * @category helpers
 */
export const happenedAfter = (a: VectorClockState, b: VectorClockState): boolean =>
  happenedBefore(b, a)

/**
 * Test if vector clock A is concurrent with vector clock B.
 *
 * Returns true if A and B are concurrent (neither happened before the other).
 *
 * @example
 * ```ts
 * import { make, increment, concurrent, query, ReplicaId } from "effect-crdts/VectorClock"
 * import * as STM from "effect/STM"
 *
 * const program = STM.gen(function* () {
 *   const clock1 = yield* make(ReplicaId("replica-1"))
 *   const clock2 = yield* make(ReplicaId("replica-2"))
 *
 *   yield* increment(clock1)
 *   yield* increment(clock2)
 *
 *   const state1 = yield* query(clock1)
 *   const state2 = yield* query(clock2)
 *
 *   const isConcurrent = concurrent(state1, state2)
 *   console.log("Concurrent:", isConcurrent) // true
 * })
 * ```
 *
 * @since 0.1.0
 * @category helpers
 */
export const concurrent = (a: VectorClockState, b: VectorClockState): boolean => {
  const allReplicas = new Set([...a.counters.keys(), ...b.counters.keys()])

  let hasLess = false
  let hasGreater = false

  for (const replica of allReplicas) {
    const aVal = a.counters.get(replica) ?? 0
    const bVal = b.counters.get(replica) ?? 0

    if (aVal < bVal) hasLess = true
    if (aVal > bVal) hasGreater = true
  }

  return hasLess && hasGreater
}

/**
 * Test if two vector clocks are equal.
 *
 * Returns true if all counters are identical.
 *
 * @example
 * ```ts
 * import { make, increment, equal, query, ReplicaId } from "effect-crdts/VectorClock"
 * import * as STM from "effect/STM"
 *
 * const program = STM.gen(function* () {
 *   const clock1 = yield* make(ReplicaId("replica-1"))
 *   const clock2 = yield* make(ReplicaId("replica-1"))
 *
 *   yield* increment(clock1)
 *   yield* increment(clock2)
 *
 *   const state1 = yield* query(clock1)
 *   const state2 = yield* query(clock2)
 *
 *   const isEqual = equal(state1, state2)
 *   console.log("Equal:", isEqual) // true
 * })
 * ```
 *
 * @since 0.1.0
 * @category helpers
 */
export const equal = (a: VectorClockState, b: VectorClockState): boolean => {
  const allReplicas = new Set([...a.counters.keys(), ...b.counters.keys()])

  for (const replica of allReplicas) {
    const aVal = a.counters.get(replica) ?? 0
    const bVal = b.counters.get(replica) ?? 0

    if (aVal !== bVal) return false
  }

  return true
}

// =============================================================================
// Schemas
// =============================================================================

/**
 * Schema for VectorClockState serialization/deserialization.
 *
 * @since 0.1.0
 * @category schemas
 */
export const VectorClockStateSchema = Schema.Struct({
  type: Schema.Literal("VectorClock"),
  replicaId: ReplicaIdSchema,
  counters: Schema.ReadonlyMap({
    key: ReplicaIdSchema,
    value: Schema.Number
  })
}).pipe(
  Schema.Data,
  Schema.annotations({
    identifier: "VectorClockState",
    title: "Vector Clock State",
    description: "State of a vector clock CRDT"
  })
)

// =============================================================================
// Tags
// =============================================================================

/**
 * VectorClock service tag for dependency injection.
 *
 * @since 0.1.0
 * @category tags
 */
export const Tag = Context.GenericTag<VectorClock>("@effect-crdts/VectorClock")

// =============================================================================
// Layers
// =============================================================================

/**
 * Creates a live layer with the given replica ID.
 *
 * @example
 * ```ts
 * import * as VectorClock from "effect-crdts/VectorClock"
 * import * as Effect from "effect/Effect"
 * import * as STM from "effect/STM"
 *
 * const program = Effect.gen(function* () {
 *   const clock = yield* VectorClock.Tag
 *   yield* STM.commit(VectorClock.increment(clock))
 *   const counter = yield* STM.commit(VectorClock.get(clock, VectorClock.ReplicaId("replica-1")))
 *   console.log("Counter:", counter) // 1
 * })
 *
 * Effect.runPromise(
 *   program.pipe(
 *     Effect.provide(VectorClock.Live(VectorClock.ReplicaId("replica-1")))
 *   )
 * )
 * ```
 *
 * @since 0.1.0
 * @category layers
 */
export const Live = (replicaId: ReplicaId): Layer.Layer<VectorClock> =>
  Layer.effect(
    Tag,
    make(replicaId)
  )
