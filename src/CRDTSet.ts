/**
 * Set CRDT state types.
 *
 * Provides state type definitions for set-based CRDTs.
 * These state types are used for persistence and serialization.
 *
 * @since 0.1.0
 */
import type { ReplicaId } from "./CRDT.js"

// =============================================================================
// Models
// =============================================================================

/**
 * State of a G-Set (grow-only set) CRDT.
 *
 * A G-Set can only add elements, never remove them. It maintains a single set
 * of all added elements.
 *
 * @since 0.1.0
 * @category models
 */
export interface GSetState<A> {
  readonly type: "GSet"
  readonly replicaId: ReplicaId
  readonly added: ReadonlySet<A>
}

/**
 * State of a 2P-Set (two-phase set) CRDT.
 *
 * A 2P-Set supports both additions and removals. Once an element is removed,
 * it cannot be re-added. It maintains two sets: one for added elements and
 * one for removed elements.
 *
 * @since 0.1.0
 * @category models
 */
export interface TwoPSetState<A> {
  readonly type: "TwoPSet"
  readonly replicaId: ReplicaId
  readonly added: ReadonlySet<A>
  readonly removed: ReadonlySet<A>
}

/**
 * State of an OR-Set (observed-remove set) CRDT.
 *
 * An OR-Set supports both additions and removals, and elements can be re-added
 * after removal. Each element is tagged with unique identifiers to track causality.
 *
 * @since 0.1.0
 * @category models
 */
export interface ORSetState<A> {
  readonly type: "ORSet"
  readonly replicaId: ReplicaId
  readonly added: ReadonlySet<A>
  readonly tags: ReadonlyMap<A, ReadonlySet<string>>
}

/**
 * Discriminated union of all set CRDT states.
 *
 * @since 0.1.0
 * @category models
 */
export type SetState<A> = GSetState<A> | TwoPSetState<A> | ORSetState<A>
