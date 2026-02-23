/**
 * LWW-Register (Last-Write-Wins Register) CRDT implementation.
 *
 * An LWW-Register is a state-based CRDT that stores a single value with
 * an associated timestamp. When concurrent writes occur, conflicts are
 * resolved by keeping the value with the highest timestamp. If timestamps
 * are equal, the replica ID is used for deterministic tie-breaking.
 *
 * Properties:
 * - Stores a single value (or none)
 * - Timestamp-based conflict resolution
 * - Deterministic tie-breaking via replica ID
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
import * as TRef from "effect/TRef"
import type { Mutable } from "effect/Types"
import type { ReplicaId } from "./CRDT.js"
import type { LWWRegisterState as LWWRegisterStateType } from "./CRDTRegister.js"
import { makeProtoBase } from "./internal/proto.js"
import * as Persistence$ from "./Persistence.js"
import * as VectorClock from "./VectorClock.js"
import type { VectorClockState } from "./VectorClock.js"

// Re-export LWWRegisterState type for external use
export type { LWWRegisterState } from "./CRDTRegister.js"

// =============================================================================
// Symbols
// =============================================================================

/**
 * LWW-Register type identifier.
 *
 * @since 0.1.0
 * @category symbols
 */
export const LWWRegisterTypeId: unique symbol = Symbol.for("effect-crdts/LWWRegister")

/**
 * LWW-Register type identifier type.
 *
 * @since 0.1.0
 * @category symbols
 */
export type LWWRegisterTypeId = typeof LWWRegisterTypeId

// =============================================================================
// Models
// =============================================================================

/**
 * LWW-Register CRDT data structure.
 *
 * @since 0.1.0
 * @category models
 */
export interface LWWRegister<A> {
  readonly [LWWRegisterTypeId]: LWWRegisterTypeId
  readonly replicaId: ReplicaId
  readonly value: TRef.TRef<Option.Option<A>>
  readonly clock: TRef.TRef<VectorClockState>
}

// =============================================================================
// Errors
// =============================================================================

/**
 * Error thrown by LWW-Register operations.
 *
 * @since 0.1.0
 * @category errors
 */
export class LWWRegisterError extends Data.TaggedError("LWWRegisterError")<{
  readonly message: string
}> { }

// =============================================================================
// Type Guards
// =============================================================================

/**
 * Type guard to check if a value is an LWWRegister.
 *
 * @since 0.1.0
 * @category guards
 */
export const isLWWRegister = (u: unknown): u is LWWRegister<unknown> =>
  Predicate.hasProperty(u, LWWRegisterTypeId)

// =============================================================================
// Proto Objects
// =============================================================================

/** @internal */
const ProtoLWWRegister = makeProtoBase(LWWRegisterTypeId)

// =============================================================================
// Internal Helpers
// =============================================================================

/**
 * Compare two writes to determine which should win.
 *
 * Returns:
 * - 1 if write1 wins (causally after or concurrent with higher replica ID)
 * - -1 if write2 wins
 * - 0 if equal
 *
 * @internal
 */
const compareWrites = (
  clock1: VectorClockState,
  replica1: string,
  clock2: VectorClockState,
  replica2: string
): -1 | 0 | 1 => {
  const ordering = VectorClock.compare(clock1, clock2)
  switch (ordering) {
    case "After":
      return 1
    case "Before":
      return -1
    case "Equal":
      return 0
    case "Concurrent": {
      // Use replica ID for tie-breaking
      const cmp = replica1.localeCompare(replica2)
      if (cmp > 0) return 1
      if (cmp < 0) return -1
      return 0
    }
  }
}

// =============================================================================
// Constructors
// =============================================================================

/**
 * Creates a new LWW-Register with the given replica ID and optional initial value.
 *
 * @example
 * ```ts
 * import { make, ReplicaId } from "effect-crdts/LWWRegister"
 * import * as Effect from "effect/Effect"
 * import * as STM from "effect/STM"
 * import * as Option from "effect/Option"
 *
 * const program = Effect.gen(function* () {
 *   const register = yield* make(ReplicaId("replica-1"), "initial value")
 *
 *   const val = yield* STM.commit(get(register))
 *   console.log("Value:", val) // Some("initial value")
 * })
 * ```
 *
 * @since 0.1.0
 * @category constructors
 */
export const make = <A>(
  replicaId: ReplicaId,
  initial?: A
): STM.STM<LWWRegister<A>> =>
  STM.gen(function* () {
    const register: Mutable<LWWRegister<A>> = Object.create(ProtoLWWRegister)
    register.replicaId = replicaId
    register.value = yield* TRef.make<Option.Option<A>>(
      initial === undefined ? Option.none() : Option.some(initial)
    )

    // Initialize with empty vector clock or with count 1 if we have initial value
    const initialClock: VectorClockState = {
      type: "VectorClock",
      replicaId,
      counters: new Map(initial !== undefined ? [[replicaId, 1]] : [[replicaId, 0]])
    }
    register.clock = yield* TRef.make(initialClock)

    return register
  })

/**
 * Creates an LWW-Register from a persisted state.
 *
 * @example
 * ```ts
 * import { fromState, get, ReplicaId } from "effect-crdts/LWWRegister"
 * import * as Effect from "effect/Effect"
 * import * as STM from "effect/STM"
 * import * as Option from "effect/Option"
 *
 * const program = Effect.gen(function* () {
 *   const state = {
 *     type: "LWWRegister" as const,
 *     replicaId: ReplicaId("replica-1"),
 *     value: Option.some("restored value"),
 *     clock: { type: "VectorClock", replicaId: ReplicaId("replica-1"), counters: new Map() }
 *   }
 *
 *   const register = yield* fromState(state)
 *   const val = yield* STM.commit(get(register))
 *
 *   console.log("Value:", val) // Some("restored value")
 * })
 * ```
 *
 * @since 0.1.0
 * @category constructors
 */
export const fromState = <A>(state: LWWRegisterStateType<A>): STM.STM<LWWRegister<A>> =>
  STM.gen(function* () {
    const register: Mutable<LWWRegister<A>> = Object.create(ProtoLWWRegister)
    register.replicaId = state.replicaId
    register.value = yield* TRef.make(state.value)
    register.clock = yield* TRef.make(state.clock)
    return register
  })

// =============================================================================
// Operations
// =============================================================================

/**
 * Set the register value with an incremented vector clock.
 *
 * Uses the VectorClock service to obtain causal ordering.
 *
 * @example
 * ```ts
 * import { make, set, get, ReplicaId } from "effect-crdts/LWWRegister"
 * import * as Effect from "effect/Effect"
 * import * as STM from "effect/STM"
 * import { pipe } from "effect/Function"
 *
 * // Data-first style
 * const program1 = Effect.gen(function* () {
 *   const register = yield* make(ReplicaId("replica-1"))
 *   yield* set(register, "hello")
 *   return yield* STM.commit(get(register))
 * })
 *
 * // Data-last style (with pipe)
 * const program2 = Effect.gen(function* () {
 *   const register = yield* make(ReplicaId("replica-1"))
 *   yield* pipe(register, set("world"))
 *   return yield* STM.commit(get(register))
 * })
 * ```
 *
 * @since 0.1.0
 * @category operations
 */
export const set: {
  <A>(value: A): (self: LWWRegister<A>) => STM.STM<LWWRegister<A>>
  <A>(self: LWWRegister<A>, value: A): STM.STM<LWWRegister<A>>
} = dual(
  2,
  <A>(self: LWWRegister<A>, value: A): STM.STM<LWWRegister<A>> =>
    STM.gen(function* () {
      // Get current clock and increment it
      const currentClock = yield* TRef.get(self.clock)
      const currentCount = currentClock.counters.get(self.replicaId) ?? 0
      const newClock: VectorClockState = {
        type: "VectorClock",
        replicaId: self.replicaId,
        counters: new Map(currentClock.counters).set(self.replicaId, currentCount + 1)
      }

      yield* TRef.set(self.value, Option.some(value))
      yield* TRef.set(self.clock, newClock)

      return self
    })
)

/**
 * Clear the register (set to None) with an incremented vector clock.
 *
 * @example
 * ```ts
 * import { make, set, clear, get, ReplicaId } from "effect-crdts/LWWRegister"
 * import * as Effect from "effect/Effect"
 * import * as STM from "effect/STM"
 *
 * const program = Effect.gen(function* () {
 *   const register = yield* make(ReplicaId("replica-1"))
 *   yield* set(register, "hello")
 *   yield* clear(register)
 *   const val = yield* STM.commit(get(register))
 *   console.log("Value:", val) // None
 * })
 * ```
 *
 * @since 0.1.0
 * @category operations
 */
export const clear = <A>(self: LWWRegister<A>): STM.STM<LWWRegister<A>> =>
  STM.gen(function* () {
    // Get current clock and increment it
    const currentClock = yield* TRef.get(self.clock)
    const currentCount = currentClock.counters.get(self.replicaId) ?? 0
    const newClock: VectorClockState = {
      type: "VectorClock",
      replicaId: self.replicaId,
      counters: new Map(currentClock.counters).set(self.replicaId, currentCount + 1)
    }

    yield* TRef.set(self.value, Option.none())
    yield* TRef.set(self.clock, newClock)

    return self
  })

/**
 * Merge another register's state into this register.
 *
 * Keeps the value with the causally later clock, or uses replica ID for tie-breaking.
 *
 * @example
 * ```ts
 * import { make, set, merge, get, query, ReplicaId } from "effect-crdts/LWWRegister"
 * import * as Effect from "effect/Effect"
 * import * as STM from "effect/STM"
 *
 * const program = Effect.gen(function* () {
 *   const register1 = yield* make(ReplicaId("replica-1"))
 *   const register2 = yield* make(ReplicaId("replica-2"))
 *
 *   yield* set(register1, "value1")
 *   yield* set(register2, "value2")
 *
 *   const state2 = yield* STM.commit(query(register2))
 *   yield* STM.commit(merge(register1, state2))
 *
 *   const val = yield* STM.commit(get(register1))
 *   console.log("Merged value:", val) // Causally later value wins
 * })
 * ```
 *
 * @since 0.1.0
 * @category operations
 */
export const merge: {
  <A>(other: LWWRegisterStateType<A>): (self: LWWRegister<A>) => STM.STM<LWWRegister<A>>
  <A>(self: LWWRegister<A>, other: LWWRegisterStateType<A>): STM.STM<LWWRegister<A>>
} = dual(
  2,
  <A>(self: LWWRegister<A>, other: LWWRegisterStateType<A>): STM.STM<LWWRegister<A>> =>
    STM.gen(function* () {
      const currentClock = yield* TRef.get(self.clock)
      const currentReplicaId = self.replicaId

      const comparison = compareWrites(
        other.clock,
        other.replicaId,
        currentClock,
        currentReplicaId
      )

      if (comparison > 0) {
        // Other write wins - update our state
        yield* TRef.set(self.value, other.value)
        yield* TRef.set(self.clock, other.clock)
      }
      // If comparison <= 0, our write wins - no change needed

      return self
    })
)

// =============================================================================
// Getters
// =============================================================================

/**
 * Get the current value of the register.
 *
 * @example
 * ```ts
 * import { make, set, get, ReplicaId } from "effect-crdts/LWWRegister"
 * import * as Effect from "effect/Effect"
 * import * as STM from "effect/STM"
 *
 * const program = Effect.gen(function* () {
 *   const register = yield* make(ReplicaId("replica-1"))
 *   yield* set(register, "hello")
 *   const val = yield* STM.commit(get(register))
 *   console.log("Value:", val) // Some("hello")
 * })
 * ```
 *
 * @since 0.1.0
 * @category getters
 */
export const get = <A>(self: LWWRegister<A>): STM.STM<Option.Option<A>> =>
  TRef.get(self.value)

/**
 * Get the current state of the register.
 *
 * Returns a snapshot of the register's state that can be used for persistence
 * or merging with other replicas.
 *
 * @example
 * ```ts
 * import { make, set, query, ReplicaId } from "effect-crdts/LWWRegister"
 * import * as Effect from "effect/Effect"
 * import * as STM from "effect/STM"
 *
 * const program = Effect.gen(function* () {
 *   const register = yield* make(ReplicaId("replica-1"))
 *   yield* set(register, "hello")
 *   const state = yield* STM.commit(query(register))
 *   console.log("State:", state)
 * })
 * ```
 *
 * @since 0.1.0
 * @category getters
 */
export const query = <A>(self: LWWRegister<A>): STM.STM<LWWRegisterStateType<A>> =>
  STM.gen(function* () {
    const value = yield* TRef.get(self.value)
    const clock = yield* TRef.get(self.clock)
    return {
      type: "LWWRegister" as const,
      replicaId: self.replicaId,
      value,
      clock
    }
  })

// =============================================================================
// Tags
// =============================================================================

/**
 * LWWRegister service tag for dependency injection.
 *
 * @since 0.1.0
 * @category tags
 */
export const Tag = <A>() => Context.GenericTag<LWWRegister<A>>("@effect-crdts/LWWRegister")

// =============================================================================
// Layers
// =============================================================================

/**
 * Creates a live layer for LWW-Register with no persistence.
 *
 * State will be held in memory and lost when the process exits.
 *
 * @example
 * ```ts
 * import * as LWWRegister from "effect-crdts/LWWRegister"
 * import { ReplicaId } from "effect-crdts/CRDT"
 * import * as Effect from "effect/Effect"
 * import * as STM from "effect/STM"
 *
 * const RegisterTag = LWWRegister.Tag<string>()
 *
 * const program = Effect.gen(function* () {
 *   const register = yield* RegisterTag
 *   yield* LWWRegister.set(register, "hello")
 *   const val = yield* STM.commit(LWWRegister.get(register))
 *   console.log("Register value:", val) // Some("hello")
 * })
 *
 * Effect.runPromise(
 *   program.pipe(Effect.provide(LWWRegister.Live(RegisterTag, ReplicaId("replica-1"))))
 * )
 * ```
 *
 * @since 0.1.0
 * @category layers
 */
export const Live = <A>(
  tag: Context.Tag<LWWRegister<A>, LWWRegister<A>>,
  replicaId: ReplicaId,
  initial?: A
): Layer.Layer<LWWRegister<A>> =>
  Layer.effect(tag, STM.commit(make(replicaId, initial)))

/**
 * Creates a live layer with persistence for LWW-Register.
 *
 * The register will automatically load its state on startup and save on shutdown.
 * Requires a SchemaStore service to be provided in the environment.
 *
 * @example
 * ```ts
 * import * as LWWRegister from "effect-crdts/LWWRegister"
 * import { ReplicaId } from "effect-crdts/CRDT"
 * import * as Persistence from "effect-crdts/Persistence"
 * import * as Schema from "effect/Schema"
 * import * as Effect from "effect/Effect"
 * import * as STM from "effect/STM"
 * import * as KeyValueStore from "@effect/platform/KeyValueStore"
 *
 * const RegisterTag = LWWRegister.Tag<string>()
 *
 * const program = Effect.gen(function* () {
 *   const register = yield* RegisterTag
 *   yield* LWWRegister.set(register, "hello")
 *   const val = yield* STM.commit(LWWRegister.get(register))
 *   console.log("Register value:", val)
 * })
 *
 * Effect.runPromise(
 *   program.pipe(
 *     Effect.provide(LWWRegister.withPersistence(RegisterTag, ReplicaId("replica-1"), Schema.String)),
 *     Effect.provide(Persistence.layer),
 *     Effect.provide(KeyValueStore.layerMemory)
 *   )
 * )
 * ```
 *
 * @since 0.1.0
 * @category layers
 */
export const withPersistence = <A, I, R>(
  tag: Context.Tag<LWWRegister<A>, LWWRegister<A>>,
  replicaId: ReplicaId,
  valueSchema: Schema.Schema<A, I, R>
) =>
  Layer.scoped(
    tag,
    Effect.gen(function* () {
      const persistence = yield* Persistence
      const loadedState = yield* persistence.load(replicaId) as Effect.Effect<Option.Option<LWWRegisterStateType<A>>, any, any>

      const register = yield* pipe(
        loadedState,
        Option.match({
          onNone: () => make<A>(replicaId),
          onSome: (state) => pipe(fromState(state), STM.commit)
        })
      )

      // Setup auto-save on finalization
      yield* Effect.addFinalizer(() =>
        pipe(
          query(register),
          STM.commit,
          Effect.flatMap((state) => persistence.save(replicaId, state)),
          Effect.ignoreLogged
        )
      )

      return register
    })
  ).pipe(Layer.provide(layerSchema(valueSchema)))

// =============================================================================
// Schemas
// =============================================================================

/**
 * Schema for LWWRegisterState serialization/deserialization.
 *
 * @since 0.1.0
 * @category schemas
 */
export const LWWRegisterStateSchema = <A, I, R>(
  valueSchema: Schema.Schema<A, I, R>
): Schema.Schema<LWWRegisterStateType<A>, any, R> =>
  Schema.Struct({
    type: Schema.Literal("LWWRegister"),
    replicaId: Schema.String,
    value: Schema.OptionFromSelf(valueSchema),
    clock: VectorClock.VectorClockStateSchema
  }) as any

const persistence = <A, I, R>(valueSchema: Schema.Schema<A, I, R>) =>
  Persistence$.layerSchema(
    LWWRegisterStateSchema(valueSchema),
    "@CRDTRegister/LWWRegisterState"
  )

export const Persistence = persistence(Schema.Unknown).tag
const layerSchema = <A, I, R>(valueSchema: Schema.Schema<A, I, R>) =>
  persistence(valueSchema).layer
