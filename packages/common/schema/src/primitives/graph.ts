import {$SchemaId} from "@beep/identity/packages";
import * as Graph from "effect/Graph";
import * as S from "effect/Schema";
import * as P from "effect/Predicate";


const $I = $SchemaId.create("primitives/graph");
/**
 * Brand for validated node indices.
 *
 * Invariants:
 * - Must be a finite number
 * - Must be an integer (no fractional part)
 * - Must be non-negative (>= 0)
 *
 * @since 0.1.0
 * @category brands
 */
export class NodeIndex extends S.NonNegativeInt.pipe(
  S.finite(),
  S.brand("NodeIndex")
).annotations(
  $I.annotations(
    "NodeIndex",
    {
      description: "Brand for validated node indices."
    }
  )
) {}

export declare namespace NodeIndex {
 export type Type = typeof NodeIndex.Type
 export type Encoded = typeof NodeIndex.Encoded
}

/**
 * Brand for validated edge indices.
 *
 * Invariants:
 * - Must be a finite number
 * - Must be an integer (no fractional part)
 * - Must be non-negative (>= 0)
 *
 * @since 0.1.0
 * @category brands
 */
export class EdgeIndex extends S.NonNegativeInt.pipe(
  S.finite(),
  S.brand("EdgeIndex")
).annotations(
  $I.annotations(
    "EdgeIndex",
    {
      description: "Brand for validated edge indices."
    }
  )
) {}

declare namespace EdgeIndex {
 export type Type = typeof EdgeIndex.Type
 export type Encoded = typeof EdgeIndex.Encoded
}