/**
 * Shared Proto object utilities for CRDTs.
 *
 * Provides common implementations of Inspectable and Pipeable protocols
 * to reduce duplication across CRDT implementations.
 *
 * @since 0.1.0
 * @internal
 */

import { format, NodeInspectSymbol } from "effect/Inspectable"
import { pipeArguments } from "effect/Pipeable"
import * as Predicate from "effect/Predicate"

/**
 * Type guard factory to check if a value has a specific type ID.
 *
 * Provides a consistent type guard implementation across all CRDTs.
 *
 * @example
 * ```ts
 * const isGCounter = hasCRDTTypeId(GCounterTypeId)
 * if (isGCounter(value)) {
 *   // value has GCounterTypeId
 * }
 * ```
 *
 * @internal
 */
export const hasCRDTTypeId = (typeId: symbol) => (u: unknown): boolean =>
  Predicate.hasProperty(u, typeId)

/**
 * Creates common Proto object methods for CRDTs.
 *
 * This factory provides consistent implementations of:
 * - TypeId symbol (for type identification)
 * - NodeInspectSymbol (uses format for inspection)
 * - toString (uses format)
 * - pipe (uses pipeArguments for pipeable support)
 *
 * @example
 * ```ts
 * const ProtoGCounter = {
 *   ...makeProtoBase(GCounterTypeId),
 *   // other properties
 * }
 * ```
 *
 * @internal
 */
export const makeProtoBase = (typeId: symbol) => ({
  [typeId]: typeId,
  [NodeInspectSymbol]() {
    return format(this)
  },
  toString() {
    return format(this)
  },
  pipe() {
    return pipeArguments(this, arguments)
  }
})

