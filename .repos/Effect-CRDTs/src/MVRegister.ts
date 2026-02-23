/**
 * MV-Register (Multi-Value Register) CRDT implementation.
 *
 * An MV-Register is a state-based CRDT that can hold multiple concurrent values.
 * Each value is associated with a vector clock to track causality. When writes
 * happen concurrently (not causally related), all values are preserved. When a
 * write causally dominates previous values, those dominated values are pruned.
 *
 * Properties:
 * - Preserves all concurrent writes
 * - Prunes causally dominated values
 * - Application chooses conflict resolution strategy
 * - Commutative merge operation
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
import { ReplicaIdSchema, type ReplicaId } from "./CRDT.js"
import type { MVRegisterState } from "./CRDTRegister.js"
import { makeProtoBase } from "./internal/proto.js"
import * as Persistence from "./Persistence.js"
import * as VectorClock from "./VectorClock.js"

// =============================================================================
// Symbols
// =============================================================================

/**
 * MV-Register type identifier.
 *
 * @since 0.1.0
 * @category symbols
 */
export const MVRegisterTypeId: unique symbol = Symbol.for("effect-crdts/MVRegister")

/**
 * MV-Register type identifier type.
 *
 * @since 0.1.0
 * @category symbols
 */
export type MVRegisterTypeId = typeof MVRegisterTypeId

// =============================================================================
// Models
// =============================================================================

/**
 * Entry stored in the MV-Register.
 *
 * @since 0.1.0
 * @category models
 */
export interface MVRegisterEntry<A> {
  readonly value: A
  readonly clock: VectorClock.VectorClock
}

/**
 * MV-Register (Multi-Value Register) data structure.
 *
 * @since 0.1.0
 * @category models
 */
export interface MVRegister<A> {
  readonly [MVRegisterTypeId]: {
    readonly _A: Types.Invariant<A>
  }
  readonly replicaId: ReplicaId
  readonly values: TSet.TSet<MVRegisterEntry<A>>
}

// =============================================================================
// Errors
// =============================================================================

/**
 * Error thrown by MV-Register operations.
 *
 * @since 0.1.0
 * @category errors
 */
export class MVRegisterError extends Data.TaggedError("MVRegisterError")<{
  readonly message: string
}> { }

// =============================================================================
// Type Guards
// =============================================================================

/**
 * Type guard to check if a value is an MVRegister.
 *
 * @since 0.1.0
 * @category guards
 */
export const isMVRegister = <A>(u: unknown): u is MVRegister<A> =>
  Predicate.hasProperty(u, MVRegisterTypeId)

// =============================================================================
// Proto Objects
// =============================================================================

/** @internal */
const ProtoMVRegister = {
  ...makeProtoBase(MVRegisterTypeId),
  [MVRegisterTypeId]: MVRegisterTypeId
}

// =============================================================================
// Constructors
// =============================================================================

/**
 * Creates a new MV-Register with the given replica ID.
 *
 * @example
 * ```ts
 * import { make, ReplicaId } from "effect-crdts/MVRegister"
 * import * as Effect from "effect/Effect"
 * import * as STM from "effect/STM"
 *
 * const program = Effect.gen(function* () {
 *   const register = yield* make<string>(ReplicaId("replica-1"))
 *
 *   yield* STM.commit(set(register, "hello"))
 *   const values = yield* STM.commit(get(register))
 *   console.log("Values:", values) // ["hello"]
 * })
 * ```
 *
 * @since 0.1.0
 * @category constructors
 */
export const make = <A>(replicaId: ReplicaId, initial?: A): STM.STM<MVRegister<A>> =>
  STM.gen(function* () {
    const values = yield* TSet.empty<MVRegisterEntry<A>>()
    const register: Mutable<MVRegister<A>> = Object.create(ProtoMVRegister)
    register.replicaId = replicaId
    register.values = values

    // Set initial value if provided
    if (initial !== undefined) {
      const clock = yield* VectorClock.make(replicaId)
      yield* VectorClock.increment(clock)
      yield* TSet.add(values, { value: initial, clock })
    }

    return register
  })

/**
 * Creates an MV-Register from an existing state.
 *
 * @example
 * ```ts
 * import { fromState, ReplicaId } from "effect-crdts/MVRegister"
 * import * as Effect from "effect/Effect"
 * import * as STM from "effect/STM"
 *
 * const program = Effect.gen(function* () {
 *   const state = {
 *     type: "MVRegister" as const,
 *     replicaId: ReplicaId("replica-1"),
 *     values: [
 *       { value: "apple", clock: new Map([["replica-1", 1]]) },
 *       { value: "banana", clock: new Map([["replica-2", 1]]) }
 *     ]
 *   }
 *   const register = yield* fromState(state)
 *
 *   const vals = yield* STM.commit(get(register))
 *   console.log("Values:", vals) // ["apple", "banana"]
 * })
 * ```
 *
 * @since 0.1.0
 * @category constructors
 */
export const fromState = <A>(state: MVRegisterState<A>): STM.STM<MVRegister<A>> =>
  STM.gen(function* () {
    const values = yield* TSet.empty<MVRegisterEntry<A>>()

    // Restore each value with its vector clock
    for (const entry of state.values) {
      const clock = yield* VectorClock.fromState(entry.clock)
      yield* TSet.add(values, { value: entry.value, clock })
    }

    const register: Mutable<MVRegister<A>> = Object.create(ProtoMVRegister)
    register.replicaId = state.replicaId
    register.values = values
    return register
  })

// =============================================================================
// Internal Helpers
// =============================================================================

/**
 * Check if a value is dominated by any other value in the set.
 * A value is dominated if its clock happened before another clock.
 *
 * @internal
 */
const isDominated = (
  entry: MVRegisterEntry<any>,
  allEntries: ReadonlyArray<MVRegisterEntry<any>>
): STM.STM<boolean> =>
  STM.gen(function* () {
    const entryClock = yield* VectorClock.query(entry.clock)

    // Query all clocks in one go to avoid STM retry issues with imperative loops
    const otherClocksWithEntry = yield* STM.forEach(allEntries, (other) =>
      pipe(
        VectorClock.query(other.clock),
        STM.map((clock) => ({ clock, other }))
      )
    )

    // Filter out self by comparing vector clock equality (not object reference)
    const otherClocks = otherClocksWithEntry
      .filter(({ clock }) => !VectorClock.equal(entryClock, clock))
      .map(({ clock }) => clock)

    // Check if any other clock dominates this entry's clock
    // Entry is dominated if entryClock happened before any otherClock
    return otherClocks.some((otherClock) => VectorClock.compare(entryClock, otherClock) === "Before")
  })

/**
 * Remove all dominated values from the set.
 *
 * @internal
 */
const pruneDominated = <A>(self: MVRegister<A>): STM.STM<void> =>
  STM.gen(function* () {
    const allEntries = yield* TSet.toArray(self.values)

    // Find all dominated entries using STM.forEach to avoid imperative loop issues
    const dominatedFlags = yield* STM.forEach(allEntries, (entry) =>
      pipe(
        isDominated(entry, allEntries),
        STM.map((dominated) => ({ entry, dominated }))
      )
    )

    // Filter to get only the dominated entries
    const toRemove = dominatedFlags.filter(({ dominated }) => dominated).map(({ entry }) => entry)

    // Remove dominated entries
    for (const entry of toRemove) {
      yield* TSet.remove(self.values, entry)
    }
  })

// =============================================================================
// Operations
// =============================================================================

/**
 * Set a value in the register.
 *
 * This operation:
 * 1. Increments the local replica's vector clock
 * 2. Removes all values that are causally dominated by the new value
 * 3. Adds the new value with the updated vector clock
 *
 * @example
 * ```ts
 * import { MVRegister, set } from "effect-crdts/MVRegister"
 * import * as Effect from "effect/Effect"
 * import * as STM from "effect/STM"
 * import { pipe } from "effect/Function"
 *
 * const program = Effect.gen(function* () {
 *   const register = yield* MVRegister<string>()
 *
 *   // Data-first
 *   yield* STM.commit(set(register, "apple"))
 *
 *   // Data-last (with pipe)
 *   yield* pipe(register, set("banana"), STM.commit)
 * })
 * ```
 *
 * @since 0.1.0
 * @category operations
 */
export const set: {
  <A>(value: A): (self: MVRegister<A>) => STM.STM<MVRegister<A>>
  <A>(self: MVRegister<A>, value: A): STM.STM<MVRegister<A>>
} = dual(
  2,
  <A>(self: MVRegister<A>, value: A): STM.STM<MVRegister<A>> =>
    STM.gen(function* () {
      // Create new vector clock by merging all existing clocks and incrementing
      const newClock = yield* VectorClock.make(self.replicaId)

      // Get all existing entries
      const allEntries = yield* TSet.toArray(self.values)

      // Query all existing clocks first to avoid STM retry issues
      const allClocks = yield* STM.forEach(allEntries, (entry) => VectorClock.query(entry.clock))

      // Merge all existing clocks into the new one
      yield* STM.forEach(allClocks, (entryClock) => VectorClock.merge(newClock, entryClock))

      // Increment for this replica
      yield* VectorClock.increment(newClock)

      // Add new value with a fresh VectorClock created from the state
      // (not sharing the mutable newClock object)
      const newClockState = yield* VectorClock.query(newClock)
      const freshClock = yield* VectorClock.fromState(newClockState)
      yield* TSet.add(self.values, { value, clock: freshClock })

      // Prune dominated values
      yield* pruneDominated(self)

      return self
    })
)

/**
 * Merge another register's state into this register.
 *
 * Takes the union of all values and prunes those that are causally dominated.
 *
 * @example
 * ```ts
 * import { make, merge, set, get, query, ReplicaId } from "effect-crdts/MVRegister"
 * import * as Effect from "effect/Effect"
 * import * as STM from "effect/STM"
 *
 * const program = Effect.gen(function* () {
 *   const reg1 = yield* make<string>(ReplicaId("replica-1"))
 *   const reg2 = yield* make<string>(ReplicaId("replica-2"))
 *
 *   yield* STM.commit(set(reg1, "apple"))
 *   yield* STM.commit(set(reg2, "banana"))
 *
 *   const state2 = yield* STM.commit(query(reg2))
 *   yield* STM.commit(merge(reg1, state2))
 *
 *   const vals = yield* STM.commit(get(reg1))
 *   console.log("Merged values:", vals) // ["apple", "banana"] (concurrent writes)
 * })
 * ```
 *
 * @since 0.1.0
 * @category operations
 */
export const merge: {
  <A>(other: MVRegisterState<A>): (self: MVRegister<A>) => STM.STM<MVRegister<A>>
  <A>(self: MVRegister<A>, other: MVRegisterState<A>): STM.STM<MVRegister<A>>
} = dual(
  2,
  <A>(self: MVRegister<A>, other: MVRegisterState<A>): STM.STM<MVRegister<A>> =>
    STM.gen(function* () {
      // Get existing entries to check for duplicates
      const existingEntries = yield* TSet.toArray(self.values)

      // Query all existing clocks first to avoid STM retry issues
      const existingClocks = yield* STM.forEach(existingEntries, (entry) =>
        pipe(
          VectorClock.query(entry.clock),
          STM.map((clock) => ({ entry, clock }))
        )
      )

      // Add all values from other register (avoiding duplicates)
      for (const otherEntry of other.values) {
        const otherClock = otherEntry.clock

        // Check if we already have this exact entry
        const alreadyExists = existingClocks.some(
          ({ entry, clock }) =>
            entry.value === otherEntry.value && VectorClock.equal(clock, otherClock)
        )

        if (!alreadyExists) {
          const clock = yield* VectorClock.fromState(otherEntry.clock)
          yield* TSet.add(self.values, { value: otherEntry.value, clock })
        }
      }

      // Prune dominated values
      yield* pruneDominated(self)

      return self
    })
)

// =============================================================================
// Getters
// =============================================================================

/**
 * Get all non-dominated values from the register.
 *
 * @example
 * ```ts
 * import { MVRegister, get } from "effect-crdts/MVRegister"
 * import * as Effect from "effect/Effect"
 * import * as STM from "effect/STM"
 *
 * const program = Effect.gen(function* () {
 *   const register = yield* MVRegister<string>()
 *   const values = yield* STM.commit(get(register))
 *   console.log("Values:", values)
 * })
 * ```
 *
 * @since 0.1.0
 * @category getters
 */
export const get = <A>(self: MVRegister<A>): STM.STM<ReadonlyArray<A>> =>
  pipe(
    TSet.toArray(self.values),
    STM.map((entries) => entries.map((entry) => entry.value))
  )

/**
 * Get all values with their vector clocks.
 *
 * @example
 * ```ts
 * import { MVRegister, getWithClocks } from "effect-crdts/MVRegister"
 * import * as Effect from "effect/Effect"
 * import * as STM from "effect/STM"
 *
 * const program = Effect.gen(function* () {
 *   const register = yield* MVRegister<string>()
 *   const entries = yield* STM.commit(getWithClocks(register))
 *   console.log("Entries:", entries)
 * })
 * ```
 *
 * @since 0.1.0
 * @category getters
 */
export const getWithClocks = <A>(
  self: MVRegister<A>
): STM.STM<
  ReadonlyArray<{
    value: A
    clock: {
      readonly type: "VectorClock"
      readonly replicaId: ReplicaId
      readonly counters: ReadonlyMap<ReplicaId, number>
    }
  }>
> =>
  STM.gen(function* () {
    const entries = yield* TSet.toArray(self.values)

    // Query all clocks at once to avoid STM retry issues
    return yield* STM.forEach(entries, (entry) =>
      pipe(
        VectorClock.query(entry.clock),
        STM.map((clock) => ({ value: entry.value, clock }))
      )
    )
  })

/**
 * Get the current state of the register.
 *
 * Returns a snapshot of the register's state that can be used for persistence
 * or merging with other replicas.
 *
 * @example
 * ```ts
 * import { MVRegister, query } from "effect-crdts/MVRegister"
 * import * as Effect from "effect/Effect"
 * import * as STM from "effect/STM"
 *
 * const program = Effect.gen(function* () {
 *   const register = yield* MVRegister<string>()
 *   const state = yield* STM.commit(query(register))
 *   console.log("State:", state)
 * })
 * ```
 *
 * @since 0.1.0
 * @category getters
 */
export const query = <A>(self: MVRegister<A>): STM.STM<MVRegisterState<A>> =>
  STM.gen(function* () {
    const entries = yield* TSet.toArray(self.values)

    // Query all clocks at once to avoid STM retry issues
    const values = yield* STM.forEach(entries, (entry) =>
      pipe(
        VectorClock.query(entry.clock),
        STM.map((clock) => ({ value: entry.value, clock }))
      )
    )

    return {
      type: "MVRegister" as const,
      replicaId: self.replicaId,
      values
    }
  })

// =============================================================================
// Layers
// =============================================================================

/**
 * Service tag for MVRegister.
 *
 * @since 0.1.0
 * @category tags
 */
export const Tag = <A>(): Context.Tag<MVRegister<A>, MVRegister<A>> =>
  Context.GenericTag<MVRegister<A>>("MVRegister")

/**
 * Creates a live layer with no persistence.
 *
 * State will be held in memory and lost when the process exits.
 *
 * @example
 * ```ts
 * import { Live, ReplicaId } from "effect-crdts/MVRegister"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const register = yield* MVRegister<string>()
 *   // ... use register
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
export const Live = <A>(replicaId: ReplicaId, initial?: A): Layer.Layer<MVRegister<A>> =>
  Layer.effect(Tag<A>(), pipe(make<A>(replicaId, initial), STM.commit))

/**
 * Creates a layer with persistence support.
 *
 * State will be loaded on initialization and saved on finalization.
 * Requires CRDTPersistence to be provided.
 *
 * @param valueSchema - Schema for the values stored in the register
 * @param replicaId - Unique identifier for this replica
 * @param initial - Optional initial value
 *
 * @example
 * ```ts
 * import { withPersistence, ReplicaId } from "effect-crdts/MVRegister"
 * import { layerMemory } from "effect-crdts/Persistence"
 * import * as Schema from "effect/Schema"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const register = yield* MVRegister<string>()
 *   // ... use register - state will be persisted
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
  valueSchema: Schema.Schema<A, I, R>,
  replicaId: ReplicaId,
  initial?: A
) => {
  const vectorClockStateSchema = Schema.Struct({
    type: Schema.Literal("VectorClock"),
    replicaId: ReplicaIdSchema,
    counters: Schema.ReadonlyMap({
      key: ReplicaIdSchema,
      value: Schema.Number
    })
  })

  const stateSchema = Schema.Struct({
    type: Schema.Literal("MVRegister"),
    replicaId: ReplicaIdSchema,
    values: Schema.Array(
      Schema.Struct({
        value: valueSchema,
        clock: vectorClockStateSchema
      })
    )
  })

  return Layer.scoped(
    Tag<A>(),
    Effect.gen(function* () {
      const basePersistence = yield* Persistence.CRDTPersistence
      const persistence = basePersistence.forSchema(stateSchema)
      const loadedState: Option.Option<MVRegisterState<A>> = yield* persistence.load(replicaId)

      const register = yield* pipe(
        loadedState,
        Option.match({
          onNone: () => make<A>(replicaId, initial),
          onSome: (state) => fromState(state)
        }),
      )

      // Setup auto-save on finalization
      yield* Effect.addFinalizer(() =>
        pipe(
          query(register),
          Effect.flatMap((state) => persistence.save(replicaId, state)),
          Effect.ignoreLogged
        )
      )

      return register
    })
  )
}
