/**
 * PN-Counter (Positive-Negative Counter) CRDT implementation.
 *
 * A PN-Counter is a state-based CRDT that implements a counter that can be both
 * incremented and decremented. It maintains two G-Counters internally: one for
 * increments (positive) and one for decrements (negative). The value is the
 * difference between the two.
 *
 * Properties:
 * - Supports both increment and decrement
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
import * as Number from "effect/Number"
import * as Option from "effect/Option"
import * as Predicate from "effect/Predicate"
import * as STM from "effect/STM"
import * as TMap from "effect/TMap"
import type { Mutable } from "effect/Types"
import type { ReplicaId } from "./CRDT.js"
import { makeProtoBase } from "./internal/proto.js"
import * as Persistence$ from "./Persistence.js"
import { PNCounterState } from "./CRDTCounter.js"

// =============================================================================
// Symbols
// =============================================================================

/**
 * PN-Counter type identifier.
 *
 * @since 0.1.0
 * @category symbols
 */
export const PNCounterTypeId: unique symbol = Symbol.for("effect-crdts/PNCounter")

/**
 * PN-Counter type identifier type.
 *
 * @since 0.1.0
 * @category symbols
 */
export type PNCounterTypeId = typeof PNCounterTypeId

// =============================================================================
// Models
// =============================================================================

/**
 * A PN-Counter CRDT that supports both increment and decrement operations.
 *
 * @since 0.1.0
 * @category models
 */
export interface PNCounter {
  readonly [PNCounterTypeId]: PNCounterTypeId
  readonly replicaId: ReplicaId
  readonly counts: TMap.TMap<ReplicaId, number>
  readonly decrements: TMap.TMap<ReplicaId, number>
}

/**
 * State of a PN-Counter CRDT for persistence and merging.
 *
 * @since 0.1.0
 * @category models
 */
export interface PNCounterS {
  readonly type: "PNCounter"
  readonly replicaId: ReplicaId
  readonly counts: ReadonlyMap<ReplicaId, number>
  readonly decrements: ReadonlyMap<ReplicaId, number>
}

// =============================================================================
// Errors
// =============================================================================

/**
 * Error thrown by PN-Counter operations.
 *
 * @since 0.1.0
 * @category errors
 */
export class PNCounterError extends Data.TaggedError("PNCounterError")<{
  readonly message: string
}> { }

// =============================================================================
// Type Guards
// =============================================================================

/**
 * Type guard to check if a value is a PNCounter.
 *
 * @since 0.1.0
 * @category guards
 */
export const isPNCounter = (u: unknown): u is PNCounter =>
  Predicate.hasProperty(u, PNCounterTypeId)

// =============================================================================
// Proto Objects
// =============================================================================

/** @internal */
const ProtoPNCounter = makeProtoBase(PNCounterTypeId)

// =============================================================================
// Constructors
// =============================================================================

/**
 * Creates a new PN-Counter with the given replica ID.
 *
 * @example
 * ```ts
 * import { make, ReplicaId } from "effect-crdts/PNCounter"
 * import * as Effect from "effect/Effect"
 * import * as STM from "effect/STM"
 *
 * const program = Effect.gen(function* () {
 *   const counter = yield* make(ReplicaId("replica-1"))
 *
 *   yield* STM.commit(increment(counter, 10))
 *   yield* STM.commit(decrement(counter, 3))
 *   const val = yield* STM.commit(value(counter))
 *
 *   console.log("Value:", val) // 7
 * })
 * ```
 *
 * @since 0.1.0
 * @category constructors
 */
export const make = (replicaId: ReplicaId): STM.STM<PNCounter> =>
  STM.gen(function* () {
    const counts = yield* TMap.make<ReplicaId, number>([replicaId, 0])
    const decrements = yield* TMap.make<ReplicaId, number>([replicaId, 0])
    const counter: Mutable<PNCounter> = Object.create(ProtoPNCounter)
    counter.replicaId = replicaId
    counter.counts = counts
    counter.decrements = decrements
    return counter
  })

/**
 * Creates a PN-Counter from an existing state.
 *
 * @example
 * ```ts
 * import { fromState, ReplicaId } from "effect-crdts/PNCounter"
 * import * as STM from "effect/STM"
 *
 * const state = {
 *   type: "PNCounter" as const,
 *   replicaId: ReplicaId("replica-1"),
 *   counts: new Map([[ReplicaId("replica-1"), 10]]),
 *   decrements: new Map([[ReplicaId("replica-1"), 3]])
 * }
 *
 * const program = STM.gen(function* () {
 *   const counter = yield* fromState(state)
 *   const val = yield* value(counter)
 *   console.log("Value:", val) // 7
 * })
 * ```
 *
 * @since 0.1.0
 * @category constructors
 */
export const fromState = (state: PNCounterState): STM.STM<PNCounter> =>
  STM.gen(function* () {
    const counts = yield* TMap.fromIterable(state.counts.entries())
    const decrements = yield* TMap.fromIterable(state.decrements.entries())
    const counter: Mutable<PNCounter> = Object.create(ProtoPNCounter)
    counter.replicaId = state.replicaId
    counter.counts = counts
    counter.decrements = decrements
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
 * import { make, increment, value, ReplicaId } from "effect-crdts/PNCounter"
 * import * as STM from "effect/STM"
 * import { pipe } from "effect/Function"
 *
 * // Data-first style
 * const program1 = STM.gen(function* () {
 *   const counter = yield* make(ReplicaId("replica-1"))
 *   yield* increment(counter, 5)
 *   return yield* value(counter)
 * })
 *
 * // Data-last style (with pipe)
 * const program2 = STM.gen(function* () {
 *   const counter = yield* make(ReplicaId("replica-1"))
 *   yield* pipe(counter, increment(5))
 *   return yield* value(counter)
 * })
 * ```
 *
 * @since 0.1.0
 * @category operations
 */
export const increment: {
  (value?: number): (self: PNCounter) => STM.STM<PNCounter>
  (self: PNCounter, value?: number): STM.STM<PNCounter>
} = dual(
  (args) => isPNCounter(args[0]),
  (self: PNCounter, value = 1): STM.STM<PNCounter> => {
    if (value < 0) {
      return STM.die(new PNCounterError({ message: "Cannot increment by negative value" }))
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
 * Decrement a counter by a value (default: 1).
 *
 * @example
 * ```ts
 * import { make, decrement, value, ReplicaId } from "effect-crdts/PNCounter"
 * import * as STM from "effect/STM"
 * import { pipe } from "effect/Function"
 *
 * // Data-first style
 * const program1 = STM.gen(function* () {
 *   const counter = yield* make(ReplicaId("replica-1"))
 *   yield* decrement(counter, 3)
 *   return yield* value(counter)
 * })
 *
 * // Data-last style (with pipe)
 * const program2 = STM.gen(function* () {
 *   const counter = yield* make(ReplicaId("replica-1"))
 *   yield* pipe(counter, decrement(3))
 *   return yield* value(counter)
 * })
 * ```
 *
 * @since 0.1.0
 * @category operations
 */
export const decrement: {
  (value?: number): (self: PNCounter) => STM.STM<PNCounter>
  (self: PNCounter, value?: number): STM.STM<PNCounter>
} = dual(
  (args) => isPNCounter(args[0]),
  (self: PNCounter, value = 1): STM.STM<PNCounter> => {
    if (value < 0) {
      return STM.die(new PNCounterError({ message: "Cannot decrement by negative value" }))
    }
    return pipe(
      TMap.get(self.decrements, self.replicaId),
      STM.flatMap((currentOpt) => {
        const current = Option.getOrElse(currentOpt, () => 0)
        return TMap.set(self.decrements, self.replicaId, current + value)
      }),
      STM.as(self)
    )
  }
)

/**
 * Merge another counter's state into this counter.
 *
 * Takes the maximum value for each replica in both counts and decrements maps.
 *
 * @example
 * ```ts
 * import { make, increment, decrement, merge, value, query, ReplicaId } from "effect-crdts/PNCounter"
 * import * as STM from "effect/STM"
 *
 * const program = STM.gen(function* () {
 *   const counter1 = yield* make(ReplicaId("replica-1"))
 *   const counter2 = yield* make(ReplicaId("replica-2"))
 *
 *   yield* increment(counter1, 10)
 *   yield* decrement(counter1, 2)
 *
 *   yield* increment(counter2, 5)
 *   yield* decrement(counter2, 1)
 *
 *   const state2 = yield* query(counter2)
 *   yield* merge(counter1, state2)
 *
 *   const val = yield* value(counter1)
 *   console.log("Merged value:", val) // 12 (10+5-2-1)
 * })
 * ```
 *
 * @since 0.1.0
 * @category operations
 */
export const merge: {
  (other: PNCounterState): (self: PNCounter) => STM.STM<PNCounter>
  (self: PNCounter, other: PNCounterState): STM.STM<PNCounter>
} = dual(
  2,
  (self: PNCounter, other: PNCounterState): STM.STM<PNCounter> =>
    STM.gen(function* () {
      // Merge counts
      yield* STM.forEach(other.counts.entries(), ([replicaId, count]) =>
        pipe(
          TMap.get(self.counts, replicaId),
          STM.flatMap((currentOpt) => {
            const current = Option.getOrElse(currentOpt, () => 0)
            return TMap.set(self.counts, replicaId, Math.max(current, count))
          })
        )
      )
      // Merge decrements
      yield* STM.forEach(other.decrements.entries(), ([replicaId, decrement]) =>
        pipe(
          TMap.get(self.decrements, replicaId),
          STM.flatMap((currentOpt) => {
            const current = Option.getOrElse(currentOpt, () => 0)
            return TMap.set(self.decrements, replicaId, Math.max(current, decrement))
          })
        )
      )
      return self
    })
)

// =============================================================================
// Getters
// =============================================================================

/**
 * Get the current value of a counter.
 *
 * The value is computed as: sum(all counts) - sum(all decrements)
 *
 * @example
 * ```ts
 * import { make, increment, decrement, value, ReplicaId } from "effect-crdts/PNCounter"
 * import * as STM from "effect/STM"
 *
 * const program = STM.gen(function* () {
 *   const counter = yield* make(ReplicaId("replica-1"))
 *   yield* increment(counter, 10)
 *   yield* decrement(counter, 3)
 *   const val = yield* value(counter)
 *   console.log("Value:", val) // 7
 * })
 * ```
 *
 * @since 0.1.0
 * @category getters
 */
export const value = (self: PNCounter): STM.STM<number> =>
  STM.gen(function* () {
    const countSum = yield* pipe(TMap.values(self.counts), STM.map(Number.sumAll))
    const decrementSum = yield* pipe(TMap.values(self.decrements), STM.map(Number.sumAll))
    return countSum - decrementSum
  })

/**
 * Get the current state of a counter.
 *
 * Returns a snapshot of the counter's state that can be used for persistence
 * or merging with other replicas.
 *
 * @example
 * ```ts
 * import { make, increment, query, ReplicaId } from "effect-crdts/PNCounter"
 * import * as STM from "effect/STM"
 *
 * const program = STM.gen(function* () {
 *   const counter = yield* make(ReplicaId("replica-1"))
 *   yield* increment(counter, 5)
 *   const state = yield* query(counter)
 *   console.log("State:", state)
 * })
 * ```
 *
 * @since 0.1.0
 * @category getters
 */
export const query = (self: PNCounter): STM.STM<PNCounterState> =>
  STM.gen(function* () {
    const counts = yield* TMap.toMap(self.counts)
    const decrements = yield* TMap.toMap(self.decrements)
    return {
      type: "PNCounter" as const,
      replicaId: self.replicaId,
      counts,
      decrements
    }
  })

// =============================================================================
// Tags
// =============================================================================

/**
 * PNCounter service tag for dependency injection.
 *
 * @since 0.1.0
 * @category tags
 */
export const Tag = Context.GenericTag<PNCounter>("@effect-crdts/PNCounter")

// =============================================================================
// Layers
// =============================================================================

/**
 * Creates a live layer for PN-Counter with no persistence.
 *
 * State will be held in memory and lost when the process exits.
 *
 * @example
 * ```ts
 * import { Tag, Live, increment, value, ReplicaId } from "effect-crdts/PNCounter"
 * import * as Effect from "effect/Effect"
 * import * as STM from "effect/STM"
 *
 * const program = Effect.gen(function* () {
 *   const counter = yield* Tag
 *   yield* STM.commit(increment(counter, 5))
 *   yield* STM.commit(decrement(counter, 2))
 *   const val = yield* STM.commit(value(counter))
 *   console.log("Counter value:", val) // 3
 * })
 *
 * Effect.runPromise(
 *   program.pipe(Effect.provide(Live(ReplicaId("replica-1"))))
 * )
 * ```
 *
 * @since 0.1.0
 * @category layers
 */
export const Live = (replicaId: ReplicaId): Layer.Layer<PNCounter> =>
  Layer.effect(
    Tag,
    pipe(make(replicaId), STM.commit)
  )

/**
 * Creates a live layer with persistence for PN-Counter.
 *
 * The counter will automatically load its state on startup and save on shutdown.
 * Requires a CRDTPersistence service to be provided in the environment.
 *
 * @example
 * ```ts
 * import { Tag, withPersistence, increment, value, ReplicaId } from "effect-crdts/PNCounter"
 * import * as Persistence from "effect-crdts/Persistence"
 * import * as Effect from "effect/Effect"
 * import * as STM from "effect/STM"
 * import * as KeyValueStore from "@effect/platform/KeyValueStore"
 *
 * const program = Effect.gen(function* () {
 *   const counter = yield* Tag
 *   yield* STM.commit(increment(counter, 5))
 *   const val = yield* STM.commit(value(counter))
 *   console.log("Counter value:", val)
 * })
 *
 * Effect.runPromise(
 *   program.pipe(
 *     Effect.provide(withPersistence(ReplicaId("replica-1"))),
 *     Effect.provide(Persistence.layer),
 *     Effect.provide(KeyValueStore.layerFileSystem("./data"))
 *   )
 * )
 * ```
 *
 * @since 0.1.0
 * @category layers
 */
export const withPersistence = (
  replicaId: ReplicaId
) =>
  Layer.scoped(
    Tag,
    Effect.gen(function* () {
      const persistence = yield* Persistence
      const loadedState: Option.Option<PNCounterState> = yield* persistence.load(replicaId)

      const counter = yield* pipe(
        loadedState,
        Option.match({
          onNone: () => make(replicaId),
          onSome: (state) => fromState(state)
        }),
        STM.commit
      )

      // Setup auto-save on finalization
      yield* Effect.addFinalizer(() =>
        pipe(
          query(counter),
          Effect.flatMap((state) => persistence.save(replicaId, state)),
          Effect.ignoreLogged
        )
      )

      return counter
    })
  ).pipe(Layer.provide(layerSchema))
const persistence = Persistence$.layerSchema(PNCounterState, "@CRDTCounter/PNCounterState")
export const Persistence = persistence.tag
export const layerSchema = persistence.layer
