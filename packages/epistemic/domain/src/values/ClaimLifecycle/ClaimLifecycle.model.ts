/**
 * Claim lifecycle value schemas.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $EpistemicDomainId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";

const $I = $EpistemicDomainId.create("values/ClaimLifecycle/ClaimLifecycle.model");

/**
 * Candidate lifecycle vocabulary for claim outputs.
 *
 * @example
 * ```ts
 * import { ClaimLifecycle } from "@beep/epistemic-domain"
 *
 * console.log(ClaimLifecycle.is.candidate("candidate"))
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const ClaimLifecycle = LiteralKit(["candidate"]).annotate(
  $I.annote("ClaimLifecycle", {
    description: "Lifecycle state for epistemic claims produced by the runtime proof.",
  })
);

/**
 * Runtime type for {@link ClaimLifecycle}.
 *
 * @example
 * ```ts
 * import type { ClaimLifecycle } from "@beep/epistemic-domain"
 *
 * const value: ClaimLifecycle = "candidate"
 * console.log(value)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type ClaimLifecycle = typeof ClaimLifecycle.Type;
