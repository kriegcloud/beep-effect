/**
 * Claim projection read-model value schemas.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { makeClaimProjectionView, makeClaimStateCounts } from "@beep/epistemics/ClaimProjection";
import { $EpistemicDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { EpistemicFixtureKey } from "../EpistemicFixtureKey/index.ts";

const $I = $EpistemicDomainId.create("values/ClaimProjection/ClaimProjectionView.model");
const counts = makeClaimStateCounts({ $I });

/**
 * Count of claims in each lifecycle state. One key per {@link ClaimLifecycle}
 * state so the projection is total and deterministic.
 *
 * **Example** (Decode lifecycle state counts)
 *
 * ```ts
 * import { ClaimStateCounts } from "@beep/epistemic-domain"
 * import * as S from "effect/Schema"
 *
 * const counts = S.decodeUnknownSync(ClaimStateCounts)({
 *   candidate: 2,
 *   shape_valid: 1,
 *   consistency_checked: 0,
 *   admitted: 3,
 * })
 * console.log(counts.admitted)
 * ```
 *
 * @category read-models
 * @since 0.0.0
 */
export class ClaimStateCounts extends S.Opaque<ClaimStateCounts, { readonly brand: unique symbol }>()(
  counts.ClaimStateCountsSchema
) {}

const view = makeClaimProjectionView({ $I, ClaimStateCounts, claimRef: EpistemicFixtureKey });

/**
 * Deterministic in-memory read model folded from a single-owner authority array
 * of candidate claims. It is a rebuildable projection: the same authority always
 * yields a structurally-equal view, and it carries no write capability. The
 * `admittedKeys` are sorted for stable, referentially-equal rebuilds.
 *
 * **Example** (Decode projection view data)
 *
 * ```ts
 * import { ClaimProjectionView } from "@beep/epistemic-domain"
 * import * as S from "effect/Schema"
 *
 * const view = S.decodeUnknownSync(ClaimProjectionView)({
 *   total: 4,
 *   counts: { candidate: 2, shape_valid: 1, consistency_checked: 0, admitted: 1 },
 *   admittedKeys: ["claim.patentability"],
 * })
 * console.log(view.total)
 * ```
 *
 * @category read-models
 * @since 0.0.0
 */
export class ClaimProjectionView extends S.Opaque<ClaimProjectionView, { readonly brand: unique symbol }>()(
  view.ClaimProjectionViewSchema
) {}
