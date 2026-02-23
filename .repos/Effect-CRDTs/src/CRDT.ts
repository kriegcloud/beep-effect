/**
 * Core CRDT (Conflict-free Replicated Data Type) types and utilities.
 *
 * Provides the foundational types and identifiers used across all CRDT implementations.
 * CRDTs are data structures that can be replicated across multiple nodes and merged
 * without conflicts, guaranteeing strong eventual consistency.
 *
 * @since 0.1.0
 */
import * as Brand from "effect/Brand"
import * as Schema from "effect/Schema"

// =============================================================================
// Symbols
// =============================================================================

/**
 * Core CRDT type identifier.
 *
 * @since 0.1.0
 * @category symbols
 */
export const CRDTTypeId: unique symbol = Symbol.for("effect-crdts/CRDT")

/**
 * Core CRDT type identifier type.
 *
 * @since 0.1.0
 * @category symbols
 */
export type CRDTTypeId = typeof CRDTTypeId

// =============================================================================
// Models
// =============================================================================

/**
 * Replica ID for identifying different CRDT instances.
 *
 * Each CRDT instance is associated with a unique replica ID. This is used to
 * track which replica made which changes, enabling proper conflict resolution
 * during merge operations.
 *
 * @since 0.1.0
 * @category models
 */
export type ReplicaId = Brand.Branded<string, "ReplicaId">

// =============================================================================
// Constructors
// =============================================================================

/**
 * Creates a replica ID from a string.
 *
 * @example
 * ```ts
 * import { ReplicaId } from "effect-crdts/CRDT"
 *
 * const replica1 = ReplicaId("replica-1")
 * const replica2 = ReplicaId("replica-2")
 * ```
 *
 * @since 0.1.0
 * @category constructors
 */
export const ReplicaId = Brand.nominal<ReplicaId>()

// =============================================================================
// Schemas
// =============================================================================

/**
 * Schema for ReplicaId serialization/deserialization.
 *
 * @since 0.1.0
 * @category schemas
 */
export const ReplicaIdSchema: Schema.BrandSchema<ReplicaId, string> = Schema.String.pipe(
  Schema.fromBrand(ReplicaId)
)
