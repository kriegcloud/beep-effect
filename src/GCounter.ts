/**
 * G-Counter (Grow-only Counter) CRDT implementation.
 *
 * A G-Counter is a state-based CRDT that implements a counter that can only be
 * incremented. Each replica maintains its own count, and the global value is the
 * sum of all replica counts. Merging is done by taking the maximum count for each
 * replica.
 *
 * Properties:
 * - Increment-only (no decrements)
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
import * as Number from "effect/Number"
import * as Option from "effect/Option"
import * as Predicate from "effect/Predicate"
import * as STM from "effect/STM"
import * as TMap from "effect/TMap"
import type { Mutable } from "effect/Types"
import type { ReplicaId } from "./CRDT.js"
import { makeProtoBase } from "./internal/proto.js"

// =============================================================================
// Symbols
// =============================================================================

/**
 * G-Counter type identifier.
 *
 * @since 0.1.0
 * @category symbols
 */
export const GCounterTypeId: unique symbol = Symbol.for("effect-crdts/GCounter")

/**
 * G-Counter type identifier type.
 *
 * @since 0.1.0
 * @category symbols
 */
export type GCounterTypeId = typeof GCounterTypeId

// =============================================================================
// Models
// =============================================================================

/**
 * State of a G-Counter CRDT for persistence.
 *
 * @since 0.1.0
 * @category models
 */
export interface CounterState {
  readonly type: "GCounter"
  readonly replicaId: ReplicaId
  readonly counts: ReadonlyMap<ReplicaId, number>
}

/**
 * G-Counter CRDT data structure.
 *
 * @since 0.1.0
 * @category models
 */
export interface GCounter extends GCounter.Variance {
  readonly replicaId: ReplicaId
  readonly counts: TMap.TMap<ReplicaId, number>
}

/**
 * @since 0.1.0
 */
export declare namespace GCounter {
  /**
   * @since 0.1.0
   * @category models
   */
  export interface Variance {
    readonly [GCounterTypeId]: GCounterTypeId
  }
}

// =============================================================================
// Errors
// =============================================================================

/**
 * Error thrown by G-Counter operations.
 *
 * @since 0.1.0
 * @category errors
 */
export class GCounterError extends Data.TaggedError("GCounterError")<{
  readonly message: string
}> { }

// =============================================================================
// Type Guards
// =============================================================================

/**
 * Type guard to check if a value is a GCounter.
 *
 * @since 0.1.0
 * @category guards
 */
export const isGCounter = (u: unknown): u is GCounter =>
  Predicate.hasProperty(u, GCounterTypeId)

// =============================================================================
// Proto Objects
// =============================================================================

/** @internal */
const ProtoGCounter = makeProtoBase(GCounterTypeId)

// =============================================================================
// Constructors
// =============================================================================

/**
 * Creates a new G-Counter with the given replica ID.
 *
 * @example
 * ```ts
 * import { make, increment, value, ReplicaId } from "effect-crdts/GCounter"
 * import * as Effect from "effect/Effect"
 * import * as STM from "effect/STM"
 *
 * const program = Effect.gen(function* () {
 *   const counter = yield* make(ReplicaId("replica-1"))
 *
 *   yield* STM.commit(increment(counter, 10))
 *   const val = yield* STM.commit(value(counter))
 *
 *   console.log("Value:", val) // 10
 * })
 * ```
 *
 * @since 0.1.0
 * @category constructors
 */
export const make = (replicaId: ReplicaId): STM.STM<GCounter> =>
  STM.gen(function* () {
    const counts = yield* TMap.make<ReplicaId, number>([replicaId, 0])
    const counter = Object.create(ProtoGCounter)
    counter.replicaId = replicaId
    counter.counts = counts
    return counter
  })

/**
 * Creates a G-Counter from a persisted state.
 *
 * @example
 * ```ts
 * import { fromState, value, ReplicaId } from "effect-crdts/GCounter"
 * import * as Effect from "effect/Effect"
 * import * as STM from "effect/STM"
 *
 * const program = Effect.gen(function* () {
 *   const state = {
 *     type: "GCounter" as const,
 *     replicaId: ReplicaId("replica-1"),
 *     counts: new Map([[ReplicaId("replica-1"), 5]])
 *   }
 *
 *   const counter = yield* fromState(state)
 *   const val = yield* STM.commit(value(counter))
 *
 *   console.log("Value:", val) // 5
 * })
 * ```
 *
 * @since 0.1.0
 * @category constructors
 */
export const fromState = (state: CounterState): STM.STM<Mutable<GCounter>> =>
  STM.gen(function* () {
    const counts = yield* TMap.fromIterable(state.counts.entries())
    const counter: Mutable<GCounter> = Object.create(ProtoGCounter)
    counter.replicaId = state.replicaId
    counter.counts = counts
    return counter
  })

// =============================================================================
// Operations
// =============================================================================

/**
 * Increment a counter by a value (default: 1).
 *
 * @example
 * ```ts
 * import { make, increment, value, ReplicaId } from "effect-crdts/GCounter"
 * import { pipe } from "effect/Function"
 * import * as STM from "effect/STM"
 *
 * const program = STM.gen(function* () {
 *   const counter = yield* make(ReplicaId("replica-1"))
 *
 *   // Data-first style
 *   yield* increment(counter, 5)
 *
 *   // Data-last style (pipe)
 *   yield* pipe(counter, increment(3))
 *
 *   const val = yield* value(counter)
 *   console.log("Value:", val) // 8
 * })
 * ```
 *
 * @since 0.1.0
 * @category operations
 */
export const increment: {
  (value: number): (self: GCounter) => STM.STM<GCounter>
  (self: GCounter, value: number): STM.STM<GCounter>
} = dual(
  2,
  (self: GCounter, value = 1): STM.STM<GCounter> => {
    if (value < 0) {
      return STM.die(new GCounterError({ message: "Cannot increment by negative value" }))
    }
    return pipe(
      TMap.get(self.counts, self.replicaId),
      STM.flatMap((currentOpt) => {
        const current = Option.getOrElse(currentOpt, () => 0)
        return TMap.set(self.counts, self.replicaId, current + value)
      }),
      STM.as(self)
    )
  }
)

/**
 * Merge another counter's state into this counter.
 *
 * Takes the maximum count for each replica ID.
 *
 * @example
 * ```ts
 * import { make, increment, merge, value, query, ReplicaId } from "effect-crdts/GCounter"
 * import { pipe } from "effect/Function"
 * import * as STM from "effect/STM"
 *
 * const program = STM.gen(function* () {
 *   const counter1 = yield* make(ReplicaId("replica-1"))
 *   const counter2 = yield* make(ReplicaId("replica-2"))
 *
 *   yield* increment(counter1, 5)
 *   yield* increment(counter2, 3)
 *
 *   const state2 = yield* query(counter2)
 *
 *   // Data-first style
 *   yield* merge(counter1, state2)
 *
 *   // Data-last style (pipe)
 *   // yield* pipe(counter1, merge(state2))
 *
 *   const val = yield* value(counter1)
 *   console.log("Merged value:", val) // 8
 * })
 * ```
 *
 * @since 0.1.0
 * @category operations
 */
export const merge: {
  (other: CounterState): (self: GCounter) => STM.STM<GCounter>
  (self: GCounter, other: CounterState): STM.STM<GCounter>
} = dual(
  2,
  (self: GCounter, other: CounterState): STM.STM<GCounter> =>
    STM.forEach(other.counts.entries(), ([replicaId, count]) =>
      pipe(
        TMap.get(self.counts, replicaId),
        STM.flatMap((currentOpt) => {
          const current = Option.getOrElse(currentOpt, () => 0)
          return TMap.set(self.counts, replicaId, Math.max(current, count))
        })
      )
    ).pipe(STM.as(self))
)

// =============================================================================
// Getters
// =============================================================================

/**
 * Get the current value of a counter.
 *
 * The value is the sum of all replica counts.
 *
 * @example
 * ```ts
 * import { make, increment, value, ReplicaId } from "effect-crdts/GCounter"
 * import { pipe } from "effect/Function"
 * import * as STM from "effect/STM"
 *
 * const program = STM.gen(function* () {
 *   const counter = yield* make(ReplicaId("replica-1"))
 *   yield* increment(counter, 5)
 *   yield* increment(counter, 3)
 *
 *   const val = yield* value(counter)
 *   console.log("Value:", val) // 8
 * })
 * ```
 *
 * @since 0.1.0
 * @category getters
 */
export const value = (self: GCounter): STM.STM<number> =>
  pipe(
    TMap.values(self.counts),
    STM.map(Number.sumAll)
  )

/**
 * Get the current state of a counter.
 *
 * Returns the state suitable for persistence or merging with other replicas.
 *
 * @example
 * ```ts
 * import { make, increment, query, ReplicaId } from "effect-crdts/GCounter"
 * import * as STM from "effect/STM"
 *
 * const program = STM.gen(function* () {
 *   const counter = yield* make(ReplicaId("replica-1"))
 *   yield* increment(counter, 5)
 *
 *   const state = yield* query(counter)
 *   console.log("State:", state)
 * })
 * ```
 *
 * @since 0.1.0
 * @category getters
 */
export const query = (self: GCounter): STM.STM<CounterState> =>
  pipe(
    TMap.toMap(self.counts),
    STM.map((counts) => ({
      type: "GCounter" as const,
      replicaId: self.replicaId,
      counts
    }))
  )

// =============================================================================
// Tags
// =============================================================================

/**
 * GCounter service tag for dependency injection.
 *
 * @since 0.1.0
 * @category tags
 */
export const Tag = Context.GenericTag<GCounter>("@effect-crdts/GCounter")

// =============================================================================
// Layers
// =============================================================================

/**
 * Creates a live layer with the given replica ID.
 *
 * @example
 * ```ts
 * import * as GCounter from "effect-crdts/GCounter"
 * import * as Effect from "effect/Effect"
 * import * as STM from "effect/STM"
 *
 * const program = Effect.gen(function* () {
 *   const counter = yield* GCounter.Tag
 *   yield* STM.commit(GCounter.increment(counter, 5))
 *   const val = yield* STM.commit(GCounter.value(counter))
 *   console.log("Value:", val) // 5
 * })
 *
 * Effect.runPromise(
 *   program.pipe(
 *     Effect.provide(GCounter.Live(GCounter.ReplicaId("replica-1")))
 *   )
 * )
 * ```
 *
 * @since 0.1.0
 * @category layers
 */
export const Live = (replicaId: ReplicaId): Layer.Layer<GCounter> =>
  Layer.effect(
    Tag,
    make(replicaId)
  )
