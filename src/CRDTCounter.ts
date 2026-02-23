/**
 * Counter CRDT state types and schemas.
 *
 * Provides state type definitions for counter-based CRDTs (GCounter and PNCounter).
 * These state types are used for persistence and serialization.
 *
 * @since 0.1.0
 */
import * as Schema from "effect/Schema"
import { ReplicaIdSchema } from "./CRDT.js"

// =============================================================================
// Schemas
// =============================================================================

/**
 * Schema for GCounterState.
 *
 * A G-Counter can only be incremented. It maintains a map of replica IDs to
 * their local counts, and the global value is the sum of all counts.
 *
 * @since 0.1.0
 * @category schemas
 * @example
 * ```ts
 * import * as CRDTCounter from "effect-crdts/CRDTCounter"
 * import { ReplicaId } from "effect-crdts/CRDT"
 *
 * const state: CRDTCounter.GCounterState = {
 *   type: "GCounter",
 *   replicaId: ReplicaId("replica-1"),
 *   counts: new Map([
 *     [ReplicaId("replica-1"), 5],
 *     [ReplicaId("replica-2"), 3]
 *   ])
 * }
 * ```
 */
export const GCounterState = Schema.Struct({
  type: Schema.Literal("GCounter"),
  replicaId: ReplicaIdSchema,
  counts: Schema.ReadonlyMap({
    key: ReplicaIdSchema,
    value: Schema.Number
  })
}).pipe(
  Schema.Data,
  Schema.annotations({
    identifier: "GCounterState",
    title: "G-Counter State",
    description: "State of a grow-only counter CRDT"
  })
)

/**
 * Schema for PNCounterState.
 *
 * A PN-Counter supports both increments and decrements. It maintains two maps:
 * one for increments (counts) and one for decrements. The global value is the
 * difference between the sum of counts and the sum of decrements.
 *
 * @since 0.1.0
 * @category schemas
 * @example
 * ```ts
 * import * as CRDTCounter from "effect-crdts/CRDTCounter"
 * import { ReplicaId } from "effect-crdts/CRDT"
 *
 * const state: CRDTCounter.PNCounterState = {
 *   type: "PNCounter",
 *   replicaId: ReplicaId("replica-1"),
 *   counts: new Map([[ReplicaId("replica-1"), 10]]),
 *   decrements: new Map([[ReplicaId("replica-1"), 3]])
 * }
 * ```
 */
export const PNCounterState = Schema.Struct({
  type: Schema.Literal("PNCounter"),
  replicaId: ReplicaIdSchema,
  counts: Schema.ReadonlyMap({
    key: ReplicaIdSchema,
    value: Schema.Number
  }),
  decrements: Schema.ReadonlyMap({
    key: ReplicaIdSchema,
    value: Schema.Number
  })
}).pipe(
  Schema.Data,
  Schema.annotations({
    identifier: "PNCounterState",
    title: "PN-Counter State",
    description: "State of a positive-negative counter CRDT"
  })
)

/**
 * Schema for CounterState (union of GCounter and PNCounter states).
 *
 * @since 0.1.0
 * @category schemas
 * @example
 * ```ts
 * import * as CRDTCounter from "effect-crdts/CRDTCounter"
 * import { ReplicaId } from "effect-crdts/CRDT"
 *
 * const gState: CRDTCounter.CounterState = {
 *   type: "GCounter",
 *   replicaId: ReplicaId("replica-1"),
 *   counts: new Map([[ReplicaId("replica-1"), 5]])
 * }
 *
 * const pnState: CRDTCounter.CounterState = {
 *   type: "PNCounter",
 *   replicaId: ReplicaId("replica-1"),
 *   counts: new Map([[ReplicaId("replica-1"), 10]]),
 *   decrements: new Map([[ReplicaId("replica-1"), 3]])
 * }
 * ```
 */
export const CounterState = Schema.Union(GCounterState, PNCounterState).pipe(
  Schema.annotations({
    identifier: "CounterState",
    title: "Counter State",
    description: "Discriminated union of all counter CRDT states"
  })
)

// =============================================================================
// Models
// =============================================================================

/**
 * State of a G-Counter (grow-only counter) CRDT.
 *
 * A G-Counter can only be incremented. It maintains a map of replica IDs to
 * their local counts, and the global value is the sum of all counts.
 *
 * @since 0.1.0
 * @category models
 */
export type GCounterState = Schema.Schema.Type<typeof GCounterState>

/**
 * State of a PN-Counter (positive-negative counter) CRDT.
 *
 * A PN-Counter supports both increments and decrements. It maintains two maps:
 * one for increments (counts) and one for decrements. The global value is the
 * difference between the sum of counts and the sum of decrements.
 *
 * @since 0.1.0
 * @category models
 */
export type PNCounterState = Schema.Schema.Type<typeof PNCounterState>

/**
 * Discriminated union of all counter CRDT states.
 *
 * @since 0.1.0
 * @category models
 */
export type CounterState = Schema.Schema.Type<typeof CounterState>
