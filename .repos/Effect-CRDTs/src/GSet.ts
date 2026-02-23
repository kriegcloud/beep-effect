/**
 * G-Set (Grow-only Set) CRDT implementation.
 *
 * A G-Set is a state-based CRDT that implements a set that can only grow by adding
 * elements. Once an element is added, it cannot be removed. Merging is done by
 * taking the union of both sets.
 *
 * Properties:
 * - Add-only (no removes)
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
import * as Schema from "effect/Schema"
import * as STM from "effect/STM"
import * as TSet from "effect/TSet"
import type { Mutable } from "effect/Types"
import * as Types from "effect/Types"
import { type ReplicaId } from "./CRDT.js"
import { makeProtoBase } from "./internal/proto.js"
import * as Persistence from "./Persistence.js"

// =============================================================================
// Symbols
// =============================================================================

/**
 * G-Set type identifier.
 *
 * @since 0.1.0
 * @category symbols
 */
export const GSetTypeId: unique symbol = Symbol.for("effect-crdts/GSet")

/**
 * G-Set type identifier type.
 *
 * @since 0.1.0
 * @category symbols
 */
export type GSetTypeId = typeof GSetTypeId

// =============================================================================
// Models
// =============================================================================

/**
 * G-Set (Grow-only Set) data structure.
 *
 * @since 0.1.0
 * @category models
 */
export interface GSet<A> {
  readonly [GSetTypeId]: {
    readonly _A: Types.Invariant<A>
  }
  readonly replicaId: ReplicaId
  readonly added: TSet.TSet<A>
}

/**
 * State of a G-Set CRDT for persistence.
 *
 * @since 0.1.0
 * @category models
 */
export interface GSetState<A> {
  readonly type: "GSet"
  readonly replicaId: ReplicaId
  readonly added: ReadonlySet<A>
}

// =============================================================================
// Errors
// =============================================================================

/**
 * Error thrown by G-Set operations.
 *
 * @since 0.1.0
 * @category errors
 */
export class GSetError extends Data.TaggedError("GSetError")<{
  readonly message: string
}> {}

// =============================================================================
// Type Guards
// =============================================================================

/**
 * Type guard to check if a value is a GSet.
 *
 * @since 0.1.0
 * @category guards
 */
export const isGSet = <A>(u: unknown): u is GSet<A> =>
  Predicate.hasProperty(u, GSetTypeId)

// =============================================================================
// Proto Objects
// =============================================================================

/** @internal */
const ProtoGSet = {
  ...makeProtoBase(GSetTypeId),
  [GSetTypeId]: GSetTypeId
}

// =============================================================================
// Constructors
// =============================================================================

/**
 * Creates a new G-Set with the given replica ID.
 *
 * @example
 * ```ts
 * import { make, ReplicaId } from "effect-crdts/GSet"
 * import * as Effect from "effect/Effect"
 * import * as STM from "effect/STM"
 *
 * const program = Effect.gen(function* () {
 *   const set = yield* make<string>(ReplicaId("replica-1"))
 *
 *   yield* STM.commit(add(set, "item1"))
 *   yield* STM.commit(add(set, "item2"))
 *
 *   const vals = yield* STM.commit(values(set))
 *   console.log("Values:", Array.from(vals))
 * })
 * ```
 *
 * @since 0.1.0
 * @category constructors
 */
export const make = <A>(replicaId: ReplicaId): STM.STM<GSet<A>> =>
  STM.gen(function* () {
    const added = yield* TSet.empty<A>()
    const set: Mutable<GSet<A>> = Object.create(ProtoGSet)
    set.replicaId = replicaId
    set.added = added
    return set
  })

/**
 * Creates a G-Set from an existing state.
 *
 * @example
 * ```ts
 * import { fromState, ReplicaId } from "effect-crdts/GSet"
 * import * as Effect from "effect/Effect"
 * import * as STM from "effect/STM"
 *
 * const program = Effect.gen(function* () {
 *   const state = {
 *     type: "GSet" as const,
 *     replicaId: ReplicaId("replica-1"),
 *     added: new Set(["apple", "banana"])
 *   }
 *   const set = yield* fromState(state)
 *
 *   const vals = yield* STM.commit(values(set))
 *   console.log("Values:", Array.from(vals)) // ["apple", "banana"]
 * })
 * ```
 *
 * @since 0.1.0
 * @category constructors
 */
export const fromState = <A>(state: GSetState<A>): STM.STM<GSet<A>> =>
  STM.gen(function* () {
    const added = yield* TSet.fromIterable(state.added)
    const set: Mutable<GSet<A>> = Object.create(ProtoGSet)
    set.replicaId = state.replicaId
    set.added = added
    return set
  })

// =============================================================================
// Operations
// =============================================================================

/**
 * Add an element to a set.
 *
 * @example
 * ```ts
 * import { GSet, add } from "effect-crdts/GSet"
 * import * as Effect from "effect/Effect"
 * import * as STM from "effect/STM"
 * import { pipe } from "effect/Function"
 *
 * const program = Effect.gen(function* () {
 *   const set = yield* GSet<string>()
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
  <A>(value: A): (self: GSet<A>) => STM.STM<GSet<A>>
  <A>(self: GSet<A>, value: A): STM.STM<GSet<A>>
} = dual(
  2,
  <A>(self: GSet<A>, value: A): STM.STM<GSet<A>> =>
    TSet.add(self.added, value).pipe(STM.as(self))
)

/**
 * Merge another set's state into this set.
 *
 * Takes the union of both sets by adding all elements from the other set.
 *
 * @example
 * ```ts
 * import { make, merge, add, values, query, ReplicaId } from "effect-crdts/GSet"
 * import * as Effect from "effect/Effect"
 * import * as STM from "effect/STM"
 *
 * const program = Effect.gen(function* () {
 *   const set1 = yield* make<string>(ReplicaId("replica-1"))
 *   const set2 = yield* make<string>(ReplicaId("replica-2"))
 *
 *   yield* STM.commit(add(set1, "apple"))
 *   yield* STM.commit(add(set2, "banana"))
 *
 *   const state2 = yield* STM.commit(query(set2))
 *   yield* STM.commit(merge(set1, state2))
 *
 *   const vals = yield* STM.commit(values(set1))
 *   console.log("Merged values:", Array.from(vals)) // ["apple", "banana"]
 * })
 * ```
 *
 * @since 0.1.0
 * @category operations
 */
export const merge: {
  <A>(other: GSetState<A>): (self: GSet<A>) => STM.STM<GSet<A>>
  <A>(self: GSet<A>, other: GSetState<A>): STM.STM<GSet<A>>
} = dual(
  2,
  <A>(self: GSet<A>, other: GSetState<A>): STM.STM<GSet<A>> =>
    STM.forEach(other.added, (value) => TSet.add(self.added, value)).pipe(STM.as(self))
)

// =============================================================================
// Getters
// =============================================================================

/**
 * Check if a set contains an element.
 *
 * @example
 * ```ts
 * import { GSet, has } from "effect-crdts/GSet"
 * import * as Effect from "effect/Effect"
 * import * as STM from "effect/STM"
 *
 * const program = Effect.gen(function* () {
 *   const set = yield* GSet<string>()
 *   const exists = yield* STM.commit(has(set, "apple"))
 *   console.log("Has apple:", exists)
 * })
 * ```
 *
 * @since 0.1.0
 * @category getters
 */
export const has: {
  <A>(value: A): (self: GSet<A>) => STM.STM<boolean>
  <A>(self: GSet<A>, value: A): STM.STM<boolean>
} = dual(
  2,
  <A>(self: GSet<A>, value: A): STM.STM<boolean> =>
    TSet.has(self.added, value)
)

/**
 * Get all values in a set.
 *
 * @example
 * ```ts
 * import { GSet, values } from "effect-crdts/GSet"
 * import * as Effect from "effect/Effect"
 * import * as STM from "effect/STM"
 *
 * const program = Effect.gen(function* () {
 *   const set = yield* GSet<string>()
 *   const vals = yield* STM.commit(values(set))
 *   console.log("Values:", Array.from(vals))
 * })
 * ```
 *
 * @since 0.1.0
 * @category getters
 */
export const values = <A>(self: GSet<A>): STM.STM<ReadonlySet<A>> =>
  TSet.toReadonlySet(self.added)

/**
 * Get the size of a set.
 *
 * @example
 * ```ts
 * import { GSet, size } from "effect-crdts/GSet"
 * import * as Effect from "effect/Effect"
 * import * as STM from "effect/STM"
 *
 * const program = Effect.gen(function* () {
 *   const set = yield* GSet<string>()
 *   const s = yield* STM.commit(size(set))
 *   console.log("Size:", s)
 * })
 * ```
 *
 * @since 0.1.0
 * @category getters
 */
export const size = <A>(self: GSet<A>): STM.STM<number> =>
  TSet.size(self.added)

/**
 * Get the current state of a set.
 *
 * Returns a snapshot of the set's state that can be used for persistence
 * or merging with other replicas.
 *
 * @example
 * ```ts
 * import { GSet, query } from "effect-crdts/GSet"
 * import * as Effect from "effect/Effect"
 * import * as STM from "effect/STM"
 *
 * const program = Effect.gen(function* () {
 *   const set = yield* GSet<string>()
 *   const state = yield* STM.commit(query(set))
 *   console.log("State:", state)
 * })
 * ```
 *
 * @since 0.1.0
 * @category getters
 */
export const query = <A>(self: GSet<A>): STM.STM<GSetState<A>> =>
  pipe(
    TSet.toReadonlySet(self.added),
    STM.map((added) => ({
      type: "GSet" as const,
      replicaId: self.replicaId,
      added
    }))
  )

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
 * import { Live, ReplicaId } from "effect-crdts/GSet"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const set = yield* GSet<string>()
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
export const Live = <A>(replicaId: ReplicaId): Layer.Layer<GSet<A>> =>
  Layer.effect(
    Context.GenericTag<GSet<A>>("GSet"),
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
 * import { withPersistence, ReplicaId } from "effect-crdts/GSet"
 * import { layerMemory } from "effect-crdts/Persistence"
 * import * as Schema from "effect/Schema"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const set = yield* GSet<string>()
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
  const stateSchema: Schema.Schema<GSetState<A>, GSetState<A>, R> = Schema.Struct({
    type: Schema.Literal("GSet"),
    replicaId: Schema.String as unknown as Schema.Schema<ReplicaId, ReplicaId, never>,
    added: Schema.ReadonlySet(elementSchema)
  }) as any

  return Layer.scoped(
    Context.GenericTag<GSet<A>>("GSet"),
    Effect.gen(function* () {
      const basePersistence = yield* Persistence.CRDTPersistence
      const persistence = basePersistence.forSchema(stateSchema)
      const loadedState: Option.Option<GSetState<A>> = yield* persistence.load(replicaId)

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
