/**
 * Claim lifecycle transition service.
 *
 * Advances a candidate claim along the lifecycle in response to a gate verdict:
 * an admitted verdict drives `candidate -> shape_valid`; a rejected verdict
 * blocks the advance (the claim is returned unchanged); an illegal forward step
 * fails with {@link ClaimInvalidTransition}.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import * as DomainCandidateClaim from "@beep/epistemic-domain/entities/CandidateClaim";
import { ClaimInvalidTransition } from "@beep/epistemic-domain/values";
import { $EpistemicUseCasesId } from "@beep/identity/packages";
import { Context, Effect } from "effect";
import type { ClaimGateResult } from "@beep/epistemic-domain/values";

const $I = $EpistemicUseCasesId.create("ClaimLifecycle/ClaimLifecycle.service");

/**
 * Service shape for the claim lifecycle transition.
 *
 * @example
 * ```ts
 * import type { ClaimTransitionShape } from "@beep/epistemic-use-cases/ClaimLifecycle"
 *
 * const accept = (shape: ClaimTransitionShape) => shape
 * console.log(accept)
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export interface ClaimTransitionShape {
  readonly advance: (
    claim: DomainCandidateClaim.CandidateClaim,
    gateResult: ClaimGateResult
  ) => Effect.Effect<DomainCandidateClaim.CandidateClaim, ClaimInvalidTransition>;
}

/**
 * Claim lifecycle transition service tag.
 *
 * @example
 * ```ts
 * import { ClaimTransition } from "@beep/epistemic-use-cases/ClaimLifecycle"
 *
 * console.log(ClaimTransition)
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export class ClaimTransition extends Context.Service<ClaimTransition, ClaimTransitionShape>()($I`ClaimTransition`) {}

/**
 * Build the claim lifecycle transition shape. Pure: it has no dependencies and
 * derives the next claim deterministically from the current claim and a gate
 * verdict.
 *
 * @example
 * ```ts
 * import { makeClaimTransition } from "@beep/epistemic-use-cases/ClaimLifecycle"
 *
 * console.log(makeClaimTransition)
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const makeClaimTransition = (): ClaimTransitionShape => ({
  advance: (claim, gateResult) =>
    gateResult.verdict === "rejected"
      ? Effect.succeed(claim)
      : claim.lifecycle === "candidate"
        ? Effect.succeed(DomainCandidateClaim.CandidateClaim.make({ ...claim, lifecycle: "shape_valid" }))
        : Effect.fail(ClaimInvalidTransition.between(claim.lifecycle, "shape_valid")),
});
