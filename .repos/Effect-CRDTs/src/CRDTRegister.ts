/**
 * Register CRDT state types.
 *
 * Provides state type definitions for register-based CRDTs.
 * These state types are used for persistence and serialization.
 *
 * @since 0.1.0
 */
import type * as Option from "effect/Option"
import type { ReplicaId } from "./CRDT.js"
import type { VectorClockState } from "./VectorClock.js"

// =============================================================================
// Models
// =============================================================================

/**
 * State of an LWW-Register (Last-Write-Wins Register) CRDT.
 *
 * An LWW-Register stores a single value with a vector clock. Conflicts are
 * resolved using causal ordering (last write wins).
 *
 * @since 0.1.0
 * @category models
 */
export interface LWWRegisterState<A> {
  readonly type: "LWWRegister"
  readonly replicaId: ReplicaId
  readonly value: Option.Option<A>
  readonly clock: VectorClockState
}

/**
 * State of an MV-Register (Multi-Value Register) CRDT.
 *
 * An MV-Register can store multiple concurrent values when writes happen
 * concurrently. Applications must resolve conflicts by merging or choosing
 * one value.
 *
 * @since 0.1.0
 * @category models
 */
export interface MVRegisterState<A> {
  readonly type: "MVRegister"
  readonly replicaId: ReplicaId
  readonly values: ReadonlyArray<{
    readonly value: A
    readonly clock: {
      readonly type: "VectorClock"
      readonly replicaId: ReplicaId
      readonly counters: ReadonlyMap<ReplicaId, number>
    }
  }>
}

/**
 * Discriminated union of all register CRDT states.
 *
 * @since 0.1.0
 * @category models
 */
export type RegisterState<A> = LWWRegisterState<A> | MVRegisterState<A>
