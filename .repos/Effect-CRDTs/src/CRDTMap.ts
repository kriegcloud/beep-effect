/**
 * Map CRDT state types and schemas.
 *
 * Provides state type definitions for map-based CRDTs.
 * These state types are used for persistence and serialization.
 *
 * @since 0.1.0
 */
import * as Option from "effect/Option"
import * as Schema from "effect/Schema"
import { ReplicaIdSchema } from "./CRDT.js"
import type { ReplicaId } from "./CRDT.js"
import type { RegisterState } from "./CRDTRegister.js"
import type { VectorClockState } from "./VectorClock.js"
import { VectorClockStateSchema } from "./VectorClock.js"

// =============================================================================
// Models
// =============================================================================

/**
 * State of an LWW-Map (Last-Write-Wins Map) CRDT.
 *
 * An LWW-Map is a map where each key is associated with an LWW-Register.
 * Conflicts are resolved using causal ordering (last write wins).
 *
 * @since 0.1.0
 * @category models
 */
export interface LWWMapState<K, V> {
  readonly type: "LWWMap"
  readonly replicaId: ReplicaId
  readonly entries: ReadonlyMap<K, {
    readonly value: Option.Option<V>
    readonly clock: VectorClockState
    readonly replicaId: ReplicaId
  }>
}

/**
 * State of an OR-Map (Observed-Remove Map) CRDT.
 *
 * An OR-Map is a map where each key can be added and removed, and entries
 * can be re-added after removal. Uses causal tracking to resolve conflicts.
 *
 * @since 0.1.0
 * @category models
 */
export interface ORMapState<K, V> {
  readonly type: "ORMap"
  readonly replicaId: ReplicaId
  readonly entries: ReadonlyMap<K, RegisterState<V>>
}

/**
 * Discriminated union of all map CRDT states.
 *
 * @since 0.1.0
 * @category models
 */
export type MapState<K, V> = LWWMapState<K, V> | ORMapState<K, V>

// =============================================================================
// Schemas
// =============================================================================

/**
 * Schema for LWWMapState.
 *
 * An LWW-Map is a map where each key is associated with an LWW-Register.
 * Each entry stores a value (Option for tombstone), vector clock, and replicaId.
 * Conflicts are resolved using causal ordering (last write wins).
 *
 * @since 0.1.0
 * @category schemas
 */
export const LWWMapState = <K extends Schema.Schema.Any, V extends Schema.Schema.Any>(
  keySchema: K,
  valueSchema: V
) =>
  Schema.Struct({
    type: Schema.Literal("LWWMap"),
    replicaId: ReplicaIdSchema,
    entries: Schema.ReadonlyMap({
      key: keySchema,
      value: Schema.Struct({
        value: Schema.OptionFromSelf(valueSchema),
        clock: VectorClockStateSchema,
        replicaId: ReplicaIdSchema
      })
    })
  }).pipe(
    Schema.Data,
    Schema.annotations({
      identifier: "LWWMapState",
      title: "LWW-Map State",
      description: "State of a last-write-wins map CRDT"
    })
  )
