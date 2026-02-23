/**
 * OR-Set (Observed-Remove Set) CRDT implementation.
 *
 * An OR-Set is a state-based CRDT that implements a set supporting both additions
 * and removals. Unlike 2P-Set, elements can be re-added after removal. Each add
 * operation generates a unique tag, and remove operations delete all current tags
 * for an element. This allows proper handling of concurrent add/remove operations.
 *
 * Properties:
 * - Supports both add and remove operations
 * - Elements can be re-added after removal
 * - Each add generates a unique tag (UUID)
 * - Remove operation removes all current tags
 * - Commutative merge operation
 * - Associative merge operation
 * - Idempotent merge operation
 * - Eventually consistent across all replicas
 * - Concurrent add wins over remove (observe-remove semantics)
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
import * as TMap from "effect/TMap"
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
 * OR-Set type identifier.
 *
 * @since 0.1.0
 * @category symbols
 */
export const ORSetTypeId: unique symbol = Symbol.for("effect-crdts/ORSet")

/**
 * OR-Set type identifier type.
 *
 * @since 0.1.0
 * @category symbols
 */
export type ORSetTypeId = typeof ORSetTypeId

// =============================================================================
// Models
// =============================================================================

/**
 * OR-Set (Observed-Remove Set) data structure.
 *
 * @since 0.1.0
 * @category models
 */
export interface ORSet<A> {
  readonly [ORSetTypeId]: {
    readonly _A: Types.Invariant<A>
  }
  readonly replicaId: ReplicaId
  readonly elements: TMap.TMap<A, TSet.TSet<string>>
}

/**
 * State of an OR-Set CRDT for persistence.
 *
 * @since 0.1.0
 * @category models
 */
export interface ORSetState<A> {
  readonly type: "ORSet"
  readonly replicaId: ReplicaId
  readonly elements: ReadonlyMap<A, ReadonlySet<string>>
}

// =============================================================================
// Errors
// =============================================================================

/**
 * Error thrown by OR-Set operations.
 *
 * @since 0.1.0
 * @category errors
 */
export class ORSetError extends Data.TaggedError("ORSetError")<{
  readonly message: string
}> {}

// =============================================================================
// Type Guards
// =============================================================================

/**
 * Type guard to check if a value is an ORSet.
 *
 * @since 0.1.0
 * @category guards
 */
export const isORSet = <A>(u: unknown): u is ORSet<A> =>
  Predicate.hasProperty(u, ORSetTypeId)

// =============================================================================
// Proto Objects
// =============================================================================

/** @internal */
const ProtoORSet = {
  ...makeProtoBase(ORSetTypeId),
  [ORSetTypeId]: ORSetTypeId
}

// =============================================================================
// Tag Generation
// =============================================================================

/**
 * Counter for generating unique tags within this replica.
 * @internal
 */
let tagCounter = 0

/**
 * Generate a unique tag for an add operation.
 *
 * Uses a combination of timestamp, replica ID, and counter for uniqueness.
 * This ensures tags are unique both within a replica (counter) and across
 * replicas (replica ID).
 *
 * @internal
 */
const generateTag = (replicaId: ReplicaId): STM.STM<string> =>
  STM.sync(() => {
    const timestamp = Date.now()
    const counter = tagCounter++
    return `${replicaId}-${timestamp}-${counter}`
  })

// =============================================================================
// Constructors
// =============================================================================

/**
 * Creates a new OR-Set with the given replica ID.
 *
 * @example
 * ```ts
 * import { make, ReplicaId } from "effect-crdts/ORSet"
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
 *   console.log("Values:", vals)
 * })
 * ```
 *
 * @since 0.1.0
 * @category constructors
 */
export const make = <A>(replicaId: ReplicaId): STM.STM<ORSet<A>> =>
  STM.gen(function* () {
    const elements = yield* TMap.empty<A, TSet.TSet<string>>()
    const set: Mutable<ORSet<A>> = Object.create(ProtoORSet)
    set.replicaId = replicaId
    set.elements = elements
    return set
  })

/**
 * Creates an OR-Set from an existing state.
 *
 * @example
 * ```ts
 * import { fromState, ReplicaId } from "effect-crdts/ORSet"
 * import * as Effect from "effect/Effect"
 * import * as STM from "effect/STM"
 *
 * const program = Effect.gen(function* () {
 *   const state = {
 *     type: "ORSet" as const,
 *     replicaId: ReplicaId("replica-1"),
 *     elements: new Map([
 *       ["apple", new Set(["tag1", "tag2"])],
 *       ["banana", new Set(["tag3"])]
 *     ])
 *   }
 *   const set = yield* fromState(state)
 *
 *   const vals = yield* STM.commit(values(set))
 *   console.log("Values:", vals)
 * })
 * ```
 *
 * @since 0.1.0
 * @category constructors
 */
export const fromState = <A>(state: ORSetState<A>): STM.STM<ORSet<A>> =>
  STM.gen(function* () {
    const elements = yield* TMap.empty<A, TSet.TSet<string>>()

    // Convert each element's tag set to TSet and store in TMap
    yield* STM.forEach(state.elements.entries(), ([element, tags]) =>
      STM.gen(function* () {
        const tagSet = yield* TSet.fromIterable(tags)
        yield* TMap.set(elements, element, tagSet)
      })
    )

    const set: Mutable<ORSet<A>> = Object.create(ProtoORSet)
    set.replicaId = state.replicaId
    set.elements = elements
    return set
  })

// =============================================================================
// Operations
// =============================================================================

/**
 * Add an element to a set.
 *
 * Generates a unique tag for this add operation. If the element already exists,
 * adds a new tag to its tag set. This allows the same element to be added
 * multiple times with different tags.
 *
 * @example
 * ```ts
 * import { ORSet, add } from "effect-crdts/ORSet"
 * import * as Effect from "effect/Effect"
 * import * as STM from "effect/STM"
 * import { pipe } from "effect/Function"
 *
 * const program = Effect.gen(function* () {
 *   const set = yield* ORSet<string>()
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
  <A>(value: A): (self: ORSet<A>) => STM.STM<ORSet<A>>
  <A>(self: ORSet<A>, value: A): STM.STM<ORSet<A>>
} = dual(
  2,
  <A>(self: ORSet<A>, value: A): STM.STM<ORSet<A>> =>
    STM.gen(function* () {
      // Generate a unique tag for this add operation
      const tag = yield* generateTag(self.replicaId)

      // Get or create tag set for this element
      const tagSetOpt = yield* TMap.get(self.elements, value)
      const tagSet = yield* Option.match(tagSetOpt, {
        onNone: () => TSet.empty<string>(),
        onSome: (existing) => STM.succeed(existing)
      })

      // Add the new tag
      yield* TSet.add(tagSet, tag)

      // Store the updated tag set
      yield* TMap.set(self.elements, value, tagSet)

      return self
    })
)

/**
 * Remove an element from a set.
 *
 * Removes ALL current tags for the element, effectively removing it from the set.
 * The element can be re-added later with new tags.
 *
 * @example
 * ```ts
 * import { ORSet, add, remove, has } from "effect-crdts/ORSet"
 * import * as Effect from "effect/Effect"
 * import * as STM from "effect/STM"
 * import { pipe } from "effect/Function"
 *
 * const program = Effect.gen(function* () {
 *   const set = yield* ORSet<string>()
 *
 *   yield* STM.commit(add(set, "apple"))
 *   const before = yield* STM.commit(has(set, "apple")) // true
 *
 *   yield* STM.commit(remove(set, "apple"))
 *   const after = yield* STM.commit(has(set, "apple")) // false
 * })
 * ```
 *
 * @since 0.1.0
 * @category operations
 */
export const remove: {
  <A>(value: A): (self: ORSet<A>) => STM.STM<ORSet<A>>
  <A>(self: ORSet<A>, value: A): STM.STM<ORSet<A>>
} = dual(
  2,
  <A>(self: ORSet<A>, value: A): STM.STM<ORSet<A>> =>
    TMap.remove(self.elements, value).pipe(STM.as(self))
)

/**
 * Merge another set's state into this set.
 *
 * For each element, takes the union of both tag sets. Elements present in only
 * one set are copied to the merged result.
 *
 * @example
 * ```ts
 * import { make, merge, add, values, query, ReplicaId } from "effect-crdts/ORSet"
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
 *   console.log("Merged values:", vals) // ["apple", "banana"]
 * })
 * ```
 *
 * @since 0.1.0
 * @category operations
 */
export const merge: {
  <A>(other: ORSetState<A>): (self: ORSet<A>) => STM.STM<ORSet<A>>
  <A>(self: ORSet<A>, other: ORSetState<A>): STM.STM<ORSet<A>>
} = dual(
  2,
  <A>(self: ORSet<A>, other: ORSetState<A>): STM.STM<ORSet<A>> =>
    STM.gen(function* () {
      // For each element in other, merge its tags with self's tags
      yield* STM.forEach(other.elements.entries(), ([element, otherTags]) =>
        STM.gen(function* () {
          const selfTagSetOpt = yield* TMap.get(self.elements, element)

          yield* Option.match(selfTagSetOpt, {
            onNone: () =>
              // Element only in other, copy it
              STM.gen(function* () {
                const tagSet = yield* TSet.fromIterable(otherTags)
                yield* TMap.set(self.elements, element, tagSet)
              }),
            onSome: (selfTagSet) =>
              // Element in both, union the tag sets
              STM.forEach(otherTags, (tag) => TSet.add(selfTagSet, tag))
          })
        })
      )

      return self
    })
)

// =============================================================================
// Getters
// =============================================================================

/**
 * Check if a set contains an element.
 *
 * An element is present if it has at least one tag.
 *
 * @example
 * ```ts
 * import { ORSet, has } from "effect-crdts/ORSet"
 * import * as Effect from "effect/Effect"
 * import * as STM from "effect/STM"
 *
 * const program = Effect.gen(function* () {
 *   const set = yield* ORSet<string>()
 *   const exists = yield* STM.commit(has(set, "apple"))
 *   console.log("Has apple:", exists)
 * })
 * ```
 *
 * @since 0.1.0
 * @category getters
 */
export const has: {
  <A>(value: A): (self: ORSet<A>) => STM.STM<boolean>
  <A>(self: ORSet<A>, value: A): STM.STM<boolean>
} = dual(
  2,
  <A>(self: ORSet<A>, value: A): STM.STM<boolean> =>
    TMap.has(self.elements, value)
)

/**
 * Get all values in a set.
 *
 * Returns only elements that have at least one tag.
 *
 * @example
 * ```ts
 * import { ORSet, values } from "effect-crdts/ORSet"
 * import * as Effect from "effect/Effect"
 * import * as STM from "effect/STM"
 *
 * const program = Effect.gen(function* () {
 *   const set = yield* ORSet<string>()
 *   const vals = yield* STM.commit(values(set))
 *   console.log("Values:", vals)
 * })
 * ```
 *
 * @since 0.1.0
 * @category getters
 */
export const values = <A>(self: ORSet<A>): STM.STM<Array<A>> =>
  TMap.keys(self.elements)

/**
 * Get the size of a set.
 *
 * Returns the count of elements that have at least one tag.
 *
 * @example
 * ```ts
 * import { ORSet, size } from "effect-crdts/ORSet"
 * import * as Effect from "effect/Effect"
 * import * as STM from "effect/STM"
 *
 * const program = Effect.gen(function* () {
 *   const set = yield* ORSet<string>()
 *   const s = yield* STM.commit(size(set))
 *   console.log("Size:", s)
 * })
 * ```
 *
 * @since 0.1.0
 * @category getters
 */
export const size = <A>(self: ORSet<A>): STM.STM<number> =>
  TMap.size(self.elements)

/**
 * Get the tags for a specific element.
 *
 * Returns all unique tags associated with the element. If the element
 * is not in the set, returns an empty set.
 *
 * @example
 * ```ts
 * import { ORSet, tags, add } from "effect-crdts/ORSet"
 * import * as Effect from "effect/Effect"
 * import * as STM from "effect/STM"
 *
 * const program = Effect.gen(function* () {
 *   const set = yield* ORSet<string>()
 *   yield* STM.commit(add(set, "apple"))
 *   const appleTags = yield* STM.commit(tags(set, "apple"))
 *   console.log("Tags for apple:", appleTags)
 * })
 * ```
 *
 * @since 0.1.0
 * @category getters
 */
export const tags: {
  <A>(value: A): (self: ORSet<A>) => STM.STM<ReadonlySet<string>>
  <A>(self: ORSet<A>, value: A): STM.STM<ReadonlySet<string>>
} = dual(
  2,
  <A>(self: ORSet<A>, value: A): STM.STM<ReadonlySet<string>> =>
    pipe(
      TMap.get(self.elements, value),
      STM.flatMap(
        Option.match({
          onNone: () => STM.succeed(new Set<string>() as ReadonlySet<string>),
          onSome: (tagSet) => TSet.toReadonlySet(tagSet)
        })
      )
    )
)

/**
 * Get the current state of a set.
 *
 * Returns a snapshot of the set's state that can be used for persistence
 * or merging with other replicas.
 *
 * @example
 * ```ts
 * import { ORSet, query } from "effect-crdts/ORSet"
 * import * as Effect from "effect/Effect"
 * import * as STM from "effect/STM"
 *
 * const program = Effect.gen(function* () {
 *   const set = yield* ORSet<string>()
 *   const state = yield* STM.commit(query(set))
 *   console.log("State:", state)
 * })
 * ```
 *
 * @since 0.1.0
 * @category getters
 */
export const query = <A>(self: ORSet<A>): STM.STM<ORSetState<A>> =>
  STM.gen(function* () {
    const entries = yield* TMap.toArray(self.elements)

    const elementsMap = new Map<A, ReadonlySet<string>>()

    for (const [element, tagSet] of entries) {
      const tags = yield* TSet.toReadonlySet(tagSet)
      elementsMap.set(element, tags)
    }

    return {
      type: "ORSet" as const,
      replicaId: self.replicaId,
      elements: elementsMap
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
 * import { Live, ReplicaId } from "effect-crdts/ORSet"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const set = yield* ORSet<string>()
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
export const Live = <A>(replicaId: ReplicaId): Layer.Layer<ORSet<A>> =>
  Layer.effect(
    Context.GenericTag<ORSet<A>>("ORSet"),
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
 * import { withPersistence, ReplicaId } from "effect-crdts/ORSet"
 * import { layerMemory } from "effect-crdts/Persistence"
 * import * as Schema from "effect/Schema"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const set = yield* ORSet<string>()
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
  const stateSchema: Schema.Schema<ORSetState<A>, ORSetState<A>, R> = Schema.Struct({
    type: Schema.Literal("ORSet"),
    replicaId: Schema.String as unknown as Schema.Schema<ReplicaId, ReplicaId, never>,
    elements: Schema.ReadonlyMap({
      key: elementSchema,
      value: Schema.ReadonlySet(Schema.String)
    })
  }) as any

  return Layer.scoped(
    Context.GenericTag<ORSet<A>>("ORSet"),
    Effect.gen(function* () {
      const basePersistence = yield* Persistence.CRDTPersistence
      const persistence = basePersistence.forSchema(stateSchema)
      const loadedState: Option.Option<ORSetState<A>> = yield* persistence.load(replicaId)

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
