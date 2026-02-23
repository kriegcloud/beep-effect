/**
 * 2P-Set (Two-Phase Set) CRDT implementation.
 *
 * A 2P-Set is a state-based CRDT that implements a set supporting both additions
 * and removals. It uses two internal G-Sets: one for added elements and one for
 * removed elements. An element is considered present if it's in the added set
 * but not in the removed set.
 *
 * Properties:
 * - Supports add and remove operations
 * - Once removed, an element cannot be re-added (tombstone forever)
 * - Commutative merge operation
 * - Associative merge operation
 * - Idempotent merge operation
 * - Eventually consistent across all replicas
 *
 * Semantics:
 * - Add operation: insert into added set
 * - Remove operation: insert into removed set
 * - Member check: element ∈ added AND element ∉ removed
 * - Merge: union both added and removed sets independently
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
import * as Schema from "effect/Schema"
import * as STM from "effect/STM"
import * as TSet from "effect/TSet"
import type { Mutable } from "effect/Types"
import * as Types from "effect/Types"
import { type ReplicaId } from "./CRDT.js"
import type { TwoPSetState } from "./CRDTSet.js"
import { makeProtoBase } from "./internal/proto.js"
import * as Persistence from "./Persistence.js"

// =============================================================================
// Symbols
// =============================================================================

/**
 * 2P-Set type identifier.
 *
 * @since 0.1.0
 * @category symbols
 */
export const TwoPSetTypeId: unique symbol = Symbol.for("effect-crdts/TwoPSet")

/**
 * 2P-Set type identifier type.
 *
 * @since 0.1.0
 * @category symbols
 */
export type TwoPSetTypeId = typeof TwoPSetTypeId

// =============================================================================
// Models
// =============================================================================

/**
 * 2P-Set (Two-Phase Set) data structure.
 *
 * @since 0.1.0
 * @category models
 */
export interface TwoPSet<A> {
  readonly [TwoPSetTypeId]: {
    readonly _A: Types.Invariant<A>
  }
  readonly replicaId: ReplicaId
  readonly added: TSet.TSet<A>
  readonly removed: TSet.TSet<A>
}

/**
 * Re-export TwoPSetState from CRDTSet for convenience.
 *
 * @since 0.1.0
 * @category models
 */
export type { TwoPSetState } from "./CRDTSet.js"

// =============================================================================
// Errors
// =============================================================================

/**
 * Error thrown by 2P-Set operations.
 *
 * @since 0.1.0
 * @category errors
 */
export class TwoPSetError extends Data.TaggedError("TwoPSetError")<{
  readonly message: string
}> {}

// =============================================================================
// Type Guards
// =============================================================================

/**
 * Type guard to check if a value is a TwoPSet.
 *
 * @since 0.1.0
 * @category guards
 */
export const isTwoPSet = <A>(u: unknown): u is TwoPSet<A> =>
  Predicate.hasProperty(u, TwoPSetTypeId)

// =============================================================================
// Proto Objects
// =============================================================================

/** @internal */
const ProtoTwoPSet = {
  ...makeProtoBase(TwoPSetTypeId),
  [TwoPSetTypeId]: TwoPSetTypeId
}

// =============================================================================
// Constructors
// =============================================================================

/**
 * Creates a new 2P-Set with the given replica ID.
 *
 * @example
 * ```ts
 * import { make, add, remove, has, ReplicaId } from "effect-crdts/TwoPSet"
 * import * as Effect from "effect/Effect"
 * import * as STM from "effect/STM"
 *
 * const program = Effect.gen(function* () {
 *   const set = yield* make<string>(ReplicaId("replica-1"))
 *
 *   yield* STM.commit(add(set, "apple"))
 *   yield* STM.commit(add(set, "banana"))
 *   yield* STM.commit(remove(set, "apple"))
 *
 *   const hasApple = yield* STM.commit(has(set, "apple"))
 *   const hasBanana = yield* STM.commit(has(set, "banana"))
 *
 *   console.log("Has apple:", hasApple)    // false
 *   console.log("Has banana:", hasBanana)  // true
 * })
 * ```
 *
 * @since 0.1.0
 * @category constructors
 */
export const make = <A>(replicaId: ReplicaId): STM.STM<TwoPSet<A>> =>
  STM.gen(function* () {
    const added = yield* TSet.empty<A>()
    const removed = yield* TSet.empty<A>()
    const set: Mutable<TwoPSet<A>> = Object.create(ProtoTwoPSet)
    set.replicaId = replicaId
    set.added = added
    set.removed = removed
    return set
  })

/**
 * Creates a 2P-Set from an existing state.
 *
 * @example
 * ```ts
 * import { fromState, values, ReplicaId } from "effect-crdts/TwoPSet"
 * import * as Effect from "effect/Effect"
 * import * as STM from "effect/STM"
 *
 * const program = Effect.gen(function* () {
 *   const state = {
 *     type: "TwoPSet" as const,
 *     replicaId: ReplicaId("replica-1"),
 *     added: new Set(["apple", "banana", "cherry"]),
 *     removed: new Set(["apple"])
 *   }
 *   const set = yield* fromState(state)
 *
 *   const vals = yield* STM.commit(values(set))
 *   console.log("Values:", Array.from(vals)) // ["banana", "cherry"]
 * })
 * ```
 *
 * @since 0.1.0
 * @category constructors
 */
export const fromState = <A>(state: TwoPSetState<A>): STM.STM<TwoPSet<A>> =>
  STM.gen(function* () {
    const added = yield* TSet.fromIterable(state.added)
    const removed = yield* TSet.fromIterable(state.removed)
    const set: Mutable<TwoPSet<A>> = Object.create(ProtoTwoPSet)
    set.replicaId = state.replicaId
    set.added = added
    set.removed = removed
    return set
  })

// =============================================================================
// Operations
// =============================================================================

/**
 * Add an element to a set.
 *
 * Adds the element to the added set. If the element was previously removed,
 * it will remain removed (tombstone property).
 *
 * @example
 * ```ts
 * import { TwoPSet, add } from "effect-crdts/TwoPSet"
 * import * as Effect from "effect/Effect"
 * import * as STM from "effect/STM"
 * import { pipe } from "effect/Function"
 *
 * const program = Effect.gen(function* () {
 *   const set = yield* TwoPSet<string>()
 *
 *   // Data-first
 *   yield* STM.commit(add(set, "apple"))
 *
 *   // Data-last (with pipe)
 *   yield* pipe(set, add("banana"), STM.commit)
 * })
 * ```
 *
 * @since 0.1.0
 * @category operations
 */
export const add: {
  <A>(value: A): (self: TwoPSet<A>) => STM.STM<TwoPSet<A>>
  <A>(self: TwoPSet<A>, value: A): STM.STM<TwoPSet<A>>
} = dual(
  2,
  <A>(self: TwoPSet<A>, value: A): STM.STM<TwoPSet<A>> =>
    TSet.add(self.added, value).pipe(STM.as(self))
)

/**
 * Remove an element from a set.
 *
 * Adds the element to the removed set. Once removed, the element cannot
 * be re-added (tombstone forever).
 *
 * @example
 * ```ts
 * import { TwoPSet, add, remove, has } from "effect-crdts/TwoPSet"
 * import * as Effect from "effect/Effect"
 * import * as STM from "effect/STM"
 * import { pipe } from "effect/Function"
 *
 * const program = Effect.gen(function* () {
 *   const set = yield* TwoPSet<string>()
 *
 *   yield* pipe(set, add("apple"), STM.commit)
 *   yield* pipe(set, remove("apple"), STM.commit)
 *
 *   // Try to re-add
 *   yield* pipe(set, add("apple"), STM.commit)
 *
 *   const hasApple = yield* pipe(set, has("apple"), STM.commit)
 *   console.log("Has apple:", hasApple) // false - tombstone forever
 * })
 * ```
 *
 * @since 0.1.0
 * @category operations
 */
export const remove: {
  <A>(value: A): (self: TwoPSet<A>) => STM.STM<TwoPSet<A>>
  <A>(self: TwoPSet<A>, value: A): STM.STM<TwoPSet<A>>
} = dual(
  2,
  <A>(self: TwoPSet<A>, value: A): STM.STM<TwoPSet<A>> =>
    TSet.add(self.removed, value).pipe(STM.as(self))
)

/**
 * Merge another set's state into this set.
 *
 * Takes the union of both added sets and the union of both removed sets.
 *
 * @example
 * ```ts
 * import { make, add, remove, merge, values, query, ReplicaId } from "effect-crdts/TwoPSet"
 * import * as Effect from "effect/Effect"
 * import * as STM from "effect/STM"
 *
 * const program = Effect.gen(function* () {
 *   const set1 = yield* make<string>(ReplicaId("replica-1"))
 *   const set2 = yield* make<string>(ReplicaId("replica-2"))
 *
 *   yield* STM.commit(add(set1, "apple"))
 *   yield* STM.commit(add(set2, "banana"))
 *   yield* STM.commit(remove(set2, "banana"))
 *
 *   const state2 = yield* STM.commit(query(set2))
 *   yield* STM.commit(merge(set1, state2))
 *
 *   const vals = yield* STM.commit(values(set1))
 *   console.log("Merged values:", Array.from(vals)) // ["apple"]
 * })
 * ```
 *
 * @since 0.1.0
 * @category operations
 */
export const merge: {
  <A>(other: TwoPSetState<A>): (self: TwoPSet<A>) => STM.STM<TwoPSet<A>>
  <A>(self: TwoPSet<A>, other: TwoPSetState<A>): STM.STM<TwoPSet<A>>
} = dual(
  2,
  <A>(self: TwoPSet<A>, other: TwoPSetState<A>): STM.STM<TwoPSet<A>> =>
    STM.gen(function* () {
      // Merge added sets (union)
      yield* STM.forEach(other.added, (value) => TSet.add(self.added, value))
      // Merge removed sets (union)
      yield* STM.forEach(other.removed, (value) => TSet.add(self.removed, value))
      return self
    })
)

// =============================================================================
// Getters
// =============================================================================

/**
 * Check if a set contains an element.
 *
 * An element is present if it's in the added set and not in the removed set.
 *
 * @example
 * ```ts
 * import { TwoPSet, add, remove, has } from "effect-crdts/TwoPSet"
 * import * as Effect from "effect/Effect"
 * import * as STM from "effect/STM"
 *
 * const program = Effect.gen(function* () {
 *   const set = yield* TwoPSet<string>()
 *
 *   yield* STM.commit(add(set, "apple"))
 *   const exists1 = yield* STM.commit(has(set, "apple"))
 *   console.log("Has apple:", exists1) // true
 *
 *   yield* STM.commit(remove(set, "apple"))
 *   const exists2 = yield* STM.commit(has(set, "apple"))
 *   console.log("Has apple:", exists2) // false
 * })
 * ```
 *
 * @since 0.1.0
 * @category getters
 */
export const has: {
  <A>(value: A): (self: TwoPSet<A>) => STM.STM<boolean>
  <A>(self: TwoPSet<A>, value: A): STM.STM<boolean>
} = dual(
  2,
  <A>(self: TwoPSet<A>, value: A): STM.STM<boolean> =>
    STM.gen(function* () {
      const inAdded = yield* TSet.has(self.added, value)
      const inRemoved = yield* TSet.has(self.removed, value)
      return inAdded && !inRemoved
    })
)

/**
 * Get all values in a set.
 *
 * Returns elements that are in the added set but not in the removed set.
 *
 * @example
 * ```ts
 * import { TwoPSet, add, remove, values } from "effect-crdts/TwoPSet"
 * import * as Effect from "effect/Effect"
 * import * as STM from "effect/STM"
 *
 * const program = Effect.gen(function* () {
 *   const set = yield* TwoPSet<string>()
 *
 *   yield* STM.commit(add(set, "apple"))
 *   yield* STM.commit(add(set, "banana"))
 *   yield* STM.commit(remove(set, "apple"))
 *
 *   const vals = yield* STM.commit(values(set))
 *   console.log("Values:", Array.from(vals)) // ["banana"]
 * })
 * ```
 *
 * @since 0.1.0
 * @category getters
 */
export const values = <A>(self: TwoPSet<A>): STM.STM<ReadonlySet<A>> =>
  STM.gen(function* () {
    const addedSet = yield* TSet.toReadonlySet(self.added)
    const removedSet = yield* TSet.toReadonlySet(self.removed)

    // Filter out removed elements
    const result = new Set<A>()
    for (const value of addedSet) {
      if (!removedSet.has(value)) {
        result.add(value)
      }
    }
    return result
  })

/**
 * Get the size of a set.
 *
 * Returns the count of elements in the added set minus those in the removed set.
 *
 * @example
 * ```ts
 * import { TwoPSet, add, remove, size } from "effect-crdts/TwoPSet"
 * import * as Effect from "effect/Effect"
 * import * as STM from "effect/STM"
 *
 * const program = Effect.gen(function* () {
 *   const set = yield* TwoPSet<string>()
 *
 *   yield* STM.commit(add(set, "apple"))
 *   yield* STM.commit(add(set, "banana"))
 *   yield* STM.commit(add(set, "cherry"))
 *   yield* STM.commit(remove(set, "apple"))
 *
 *   const s = yield* STM.commit(size(set))
 *   console.log("Size:", s) // 2
 * })
 * ```
 *
 * @since 0.1.0
 * @category getters
 */
export const size = <A>(self: TwoPSet<A>): STM.STM<number> =>
  pipe(
    values(self),
    STM.map((vals) => vals.size)
  )

/**
 * Get the current state of a set.
 *
 * Returns a snapshot of the set's state that can be used for persistence
 * or merging with other replicas.
 *
 * @example
 * ```ts
 * import { TwoPSet, add, remove, query } from "effect-crdts/TwoPSet"
 * import * as Effect from "effect/Effect"
 * import * as STM from "effect/STM"
 *
 * const program = Effect.gen(function* () {
 *   const set = yield* TwoPSet<string>()
 *
 *   yield* STM.commit(add(set, "apple"))
 *   yield* STM.commit(remove(set, "apple"))
 *
 *   const state = yield* STM.commit(query(set))
 *   console.log("State:", state)
 * })
 * ```
 *
 * @since 0.1.0
 * @category getters
 */
export const query = <A>(self: TwoPSet<A>): STM.STM<TwoPSetState<A>> =>
  STM.gen(function* () {
    const added = yield* TSet.toReadonlySet(self.added)
    const removed = yield* TSet.toReadonlySet(self.removed)
    return {
      type: "TwoPSet" as const,
      replicaId: self.replicaId,
      added,
      removed
    }
  })

// =============================================================================
// Layers
// =============================================================================

/**
 * Creates a live layer with no persistence.
 *
 * State will be held in memory and lost when the process exits.
 *
 * @example
 * ```ts
 * import { Live, ReplicaId } from "effect-crdts/TwoPSet"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const set = yield* TwoPSet<string>()
 *   // ... use set
 * })
 *
 * Effect.runPromise(
 *   program.pipe(Effect.provide(Live<string>(ReplicaId("replica-1"))))
 * )
 * ```
 *
 * @since 0.1.0
 * @category layers
 */
export const Live = <A>(replicaId: ReplicaId): Layer.Layer<TwoPSet<A>> =>
  Layer.effect(
    Context.GenericTag<TwoPSet<A>>("TwoPSet"),
    pipe(make<A>(replicaId), STM.commit)
  )

/**
 * Creates a layer with persistence support.
 *
 * State will be loaded on initialization and saved on finalization.
 * Requires CRDTPersistence to be provided.
 *
 * @param elementSchema - Schema for the elements stored in the set
 * @param replicaId - Unique identifier for this replica
 *
 * @example
 * ```ts
 * import { withPersistence, ReplicaId } from "effect-crdts/TwoPSet"
 * import { layerMemory } from "effect-crdts/Persistence"
 * import * as Schema from "effect/Schema"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const set = yield* TwoPSet<string>()
 *   // ... use set - state will be persisted
 * }).pipe(
 *   Effect.provide(withPersistence(Schema.String, ReplicaId("replica-1"))),
 *   Effect.provide(layerMemory)
 * )
 * ```
 *
 * @since 0.1.0
 * @category layers
 */
export const withPersistence = <A, I, R>(
  elementSchema: Schema.Schema<A, I, R>,
  replicaId: ReplicaId
) => {
  const stateSchema: Schema.Schema<TwoPSetState<A>, TwoPSetState<A>, R> = Schema.Struct({
    type: Schema.Literal("TwoPSet"),
    replicaId: Schema.String as unknown as Schema.Schema<ReplicaId, ReplicaId, never>,
    added: Schema.ReadonlySet(elementSchema),
    removed: Schema.ReadonlySet(elementSchema)
  }) as any

  return Layer.scoped(
    Context.GenericTag<TwoPSet<A>>("TwoPSet"),
    Effect.gen(function* () {
      const basePersistence = yield* Persistence.CRDTPersistence
      const persistence = basePersistence.forSchema(stateSchema)
      const loadedState: Option.Option<TwoPSetState<A>> = yield* persistence.load(replicaId)

      const set = yield* pipe(
        loadedState,
        Option.match({
          onNone: () => make<A>(replicaId),
          onSome: (state) => fromState(state)
        }),
        STM.commit
      )

      // Setup auto-save on finalization
      yield* Effect.addFinalizer(() =>
        pipe(
          query(set),
          STM.commit,
          Effect.flatMap((state) => persistence.save(replicaId, state)),
          Effect.ignoreLogged
        )
      )

      return set
    })
  )
}
