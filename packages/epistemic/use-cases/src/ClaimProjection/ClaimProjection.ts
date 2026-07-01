/**
 * Claim projection.
 *
 * The signature is the federation invariant: a pure, read-only fold from a
 * single-owner authority array into a deterministic read model. It takes a local
 * authority array and returns a view — it has no write capability and no central
 * store, and rebuilding from the same authority yields a structurally-equal view.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { ClaimProjectionView } from "@beep/epistemic-domain/values";
import { Order, pipe } from "effect";
import * as A from "effect/Array";
import * as S from "effect/Schema";
import type * as DomainCandidateClaim from "@beep/epistemic-domain/entities/CandidateClaim";

/**
 * Pure read-only projection from a single-owner authority array of candidate
 * claims to a deterministic {@link ClaimProjectionView}.
 *
 * @example
 * ```ts
 * import { strictEqual } from "node:assert"
 * import { projectClaims } from "@beep/epistemic-use-cases/ClaimProjection"
 * import type { ClaimProjection } from "@beep/epistemic-use-cases/ClaimProjection"
 *
 * const project: ClaimProjection = projectClaims
 *
 * strictEqual(project([]).total, 0)
 * ```
 *
 * @category use-cases
 * @since 0.0.0
 */
export type ClaimProjection = (authority: ReadonlyArray<DomainCandidateClaim.CandidateClaim>) => ClaimProjectionView;

/**
 * Deterministic pure projection implementation. Counts claims per lifecycle
 * state and lists the admitted claims' fixture keys in sorted order so rebuilds
 * from the same authority are structurally equal.
 *
 * @example
 * ```ts
 * import { strictEqual } from "node:assert"
 * import { projectClaims } from "@beep/epistemic-use-cases/ClaimProjection"
 *
 * strictEqual(projectClaims([]).counts.admitted, 0)
 * ```
 *
 * @category use-cases
 * @since 0.0.0
 */
export const projectClaims: ClaimProjection = (authority) => {
  const countOf = (state: DomainCandidateClaim.CandidateClaim["lifecycle"]): number =>
    A.filter(authority, (claim) => claim.lifecycle === state).length;
  const admittedKeys = pipe(
    authority,
    A.filter((claim) => claim.lifecycle === "admitted"),
    A.map((claim) => claim.fixtureKey),
    A.sort(Order.String)
  );
  // decode brands the folded counts/total into NonNegativeInt from known-good plain numbers.
  return S.decodeUnknownSync(ClaimProjectionView)({
    total: authority.length,
    counts: {
      candidate: countOf("candidate"),
      shape_valid: countOf("shape_valid"),
      consistency_checked: countOf("consistency_checked"),
      admitted: countOf("admitted"),
    },
    admittedKeys,
  });
};
