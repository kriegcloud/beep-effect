/**
 * Claim projection read-model schema factories.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import * as S from "effect/Schema";
import type { SchemaIdentity } from "../Factory/index.ts";

/**
 * Build the per-lifecycle-state claim count schema.
 *
 * **Details**
 *
 * Returns `ClaimStateCountsSchema`, the annotated struct a binding wraps in
 * its own `S.Opaque` class before building {@link makeClaimProjectionView}.
 *
 * **Example** (Bind claim state counts)
 *
 * ```ts
 * import { makeClaimStateCounts } from "@beep/epistemics/ClaimProjection"
 * import { $ScratchpadId } from "@beep/identity/packages"
 * import * as S from "effect/Schema"
 *
 * const { ClaimStateCountsSchema } = makeClaimStateCounts({ $I: $ScratchpadId.create("party/ClaimProjection") })
 * const counts = S.decodeUnknownSync(ClaimStateCountsSchema)({
 *   admitted: 1,
 *   candidate: 2,
 *   consistency_checked: 0,
 *   shape_valid: 1
 * })
 * console.log(counts.admitted) // 1
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const makeClaimStateCounts = (config: { readonly $I: SchemaIdentity }) => {
  const { $I } = config;

  const ClaimStateCountsSchema = S.Struct({
    candidate: S.Natural.annotateKey({ description: "Number of candidate claims." }),
    shape_valid: S.Natural.annotateKey({ description: "Number of shape-valid claims." }),
    consistency_checked: S.Natural.annotateKey({ description: "Number of consistency-checked claims." }),
    admitted: S.Natural.annotateKey({ description: "Number of admitted claims." }),
  }).pipe(
    $I.annoteSchema("ClaimStateCounts", {
      description: "Count of claims in each lifecycle state.",
    })
  );

  return { ClaimStateCountsSchema };
};

/**
 * Build the claim projection view schema over a caller-bound counts class and
 * claim reference schema.
 *
 * **Details**
 *
 * Returns `ClaimProjectionViewSchema`: a total, the per-state counts, and the
 * admitted claim references sorted deterministically by the caller.
 *
 * **Example** (Bind a projection view to string claim references)
 *
 * ```ts
 * import { makeClaimProjectionView, makeClaimStateCounts } from "@beep/epistemics/ClaimProjection"
 * import { $ScratchpadId } from "@beep/identity/packages"
 * import * as S from "effect/Schema"
 *
 * const $I = $ScratchpadId.create("party/ClaimProjection")
 * const { ClaimStateCountsSchema } = makeClaimStateCounts({ $I })
 * const { ClaimProjectionViewSchema } = makeClaimProjectionView({
 *   $I,
 *   ClaimStateCounts: ClaimStateCountsSchema,
 *   claimRef: S.NonEmptyString
 * })
 * console.log(Object.keys(ClaimProjectionViewSchema.fields)) // ["total", "counts", "admittedKeys"]
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const makeClaimProjectionView = <Counts extends S.Top, ClaimRef extends S.Top>(config: {
  readonly $I: SchemaIdentity;
  readonly ClaimStateCounts: Counts;
  readonly claimRef: ClaimRef;
}) => {
  const { $I, ClaimStateCounts, claimRef } = config;

  const ClaimProjectionViewSchema = S.Struct({
    total: S.Natural.annotateKey({ description: "Total claim count represented by the projection." }),
    counts: ClaimStateCounts.annotateKey({ description: "Claim counts by lifecycle state." }),
    admittedKeys: S.Array(claimRef).annotateKey({
      description: "Stable fixture keys for admitted claims, sorted deterministically.",
    }),
  }).pipe(
    $I.annoteSchema("ClaimProjectionView", {
      description: "Deterministic in-memory read model folded from a single-owner authority array.",
    })
  );

  return { ClaimProjectionViewSchema };
};
