/**
 * Exact claim and evidence snapshots presented for human review.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import {
  makeClaimEvidenceBasis,
  makeClaimEvidenceReview,
  makeClaimEvidenceReviewStatus,
  makeReviewStatusFor,
} from "@beep/epistemics/ClaimEvidenceReview";
import { $EpistemicDomainId } from "@beep/identity/packages";
import { UserPrincipal } from "@beep/shared-domain/entity/Principal";
import * as S from "effect/Schema";
import { EpistemicFixtureKey } from "../EpistemicFixtureKey/index.ts";
import type * as O from "effect/Option";

const $I = $EpistemicDomainId.create("values/ClaimEvidenceReview/ClaimEvidenceReview.model");
const basis = makeClaimEvidenceBasis({ $I, claimRef: EpistemicFixtureKey });

/**
 * Complete assertion and source manifestation a reviewer is asked to assess.
 *
 * **Details**
 *
 * The source carries the scope and extractor identity. Extraction confidence
 * remains an extractor score; it does not establish that the assertion is true.
 * Changing any field changes the basis of the review.
 *
 * **Example** (Inspect the evidence boundary)
 *
 * ```ts
 * import { ClaimEvidenceBasis } from "@beep/epistemic-domain/values/ClaimEvidenceReview"
 *
 * console.log(ClaimEvidenceBasis.fields.evidence !== undefined) // true
 * ```
 *
 * @category value-objects
 * @since 0.0.0
 */
export class ClaimEvidenceBasis extends S.Opaque<ClaimEvidenceBasis, { readonly brand: unique symbol }>()(
  basis.ClaimEvidenceBasisSchema
) {}

const review = makeClaimEvidenceReview({ $I, ClaimEvidenceBasis, reviewer: UserPrincipal });

/**
 * A human approval bound to the entire reviewed claim and evidence snapshot.
 *
 * **Details**
 *
 * This is a portable record of an approval, not authentication or current
 * source verification. The application supplies its authenticated user and
 * stores the returned record. Current use must reverify the source and compare
 * the complete basis; an old approval never silently transfers to a new one.
 *
 * **Example** (Inspect the human principal requirement)
 *
 * ```ts
 * import { ClaimEvidenceReview } from "@beep/epistemic-domain/values/ClaimEvidenceReview"
 *
 * console.log(ClaimEvidenceReview.fields.reviewedBy !== undefined) // true
 * ```
 *
 * @category value-objects
 * @since 0.0.0
 */
export class ClaimEvidenceReview extends S.Opaque<ClaimEvidenceReview, { readonly brand: unique symbol }>()(
  review.ClaimEvidenceReviewSchema
) {}

const status = makeClaimEvidenceReviewStatus({ $I, ClaimEvidenceBasis, ClaimEvidenceReview });

/**
 * Result of checking a quote against the presently resolved source text.
 *
 * **Example** (Construct an unverified result)
 *
 * ```ts
 * import { ClaimEvidenceVerification } from "@beep/epistemic-domain/values/ClaimEvidenceReview"
 *
 * const result = ClaimEvidenceVerification.cases.Unverified.make({ reason: "stale-source" })
 * console.log(result.reason) // stale-source
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const ClaimEvidenceVerification = status.ClaimEvidenceVerification;

/**
 * Runtime type of {@link ClaimEvidenceVerification}.
 *
 * **Example** (Use the verified variant)
 *
 * ```ts
 * import { ClaimEvidenceVerification } from "@beep/epistemic-domain/values/ClaimEvidenceReview"
 *
 * const verification: ClaimEvidenceVerification = ClaimEvidenceVerification.cases.Verified.make({})
 * console.log(verification._tag) // Verified
 * ```
 *
 * @category type-level
 * @since 0.0.0
 */
export type ClaimEvidenceVerification = typeof ClaimEvidenceVerification.Type;

/**
 * Human-review state with the historical approval retained after drift.
 *
 * **Example** (Start without a review)
 *
 * ```ts
 * import { ClaimEvidenceReviewStatus } from "@beep/epistemic-domain/values/ClaimEvidenceReview"
 *
 * console.log(ClaimEvidenceReviewStatus.cases.Pending.make({})._tag) // Pending
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const ClaimEvidenceReviewStatus = status.ClaimEvidenceReviewStatus;

/**
 * Runtime type of {@link ClaimEvidenceReviewStatus}.
 *
 * **Example** (Type a pending state)
 *
 * ```ts
 * import { ClaimEvidenceReviewStatus } from "@beep/epistemic-domain/values/ClaimEvidenceReview"
 *
 * const status: ClaimEvidenceReviewStatus = ClaimEvidenceReviewStatus.cases.Pending.make({})
 * console.log(status._tag) // Pending
 * ```
 *
 * @category type-level
 * @since 0.0.0
 */
export type ClaimEvidenceReviewStatus = typeof ClaimEvidenceReviewStatus.Type;

/**
 * Inspectable claim, exact-source verification, and human-review status.
 *
 * **Details**
 *
 * Consumers must inspect both verification and review: a correctly quoted
 * source does not approve its interpretation, and a historical approval does
 * not prove that the source still matches.
 *
 * **Example** (Inspect the independent review and verification fields)
 *
 * ```ts
 * import { ClaimEvidenceExplanation } from "@beep/epistemic-domain/values/ClaimEvidenceReview"
 *
 * console.log(ClaimEvidenceExplanation.fields.review !== undefined) // true
 * console.log(ClaimEvidenceExplanation.fields.verification !== undefined) // true
 * ```
 *
 * @category value-objects
 * @since 0.0.0
 */
export class ClaimEvidenceExplanation extends S.Opaque<ClaimEvidenceExplanation, { readonly brand: unique symbol }>()(
  status.ClaimEvidenceExplanationSchema
) {}

/**
 * Explain whether a historical approval still applies to the current basis.
 *
 * **Details**
 *
 * A changed assertion, subject, confidence, span, scope, or source identity
 * invalidates reuse of the approval. Even an unchanged basis requires fresh
 * source verification before its approval can be reported as current.
 *
 * **Example** (No approval means pending review)
 *
 * ```ts
 * import { reviewStatusFor } from "@beep/epistemic-domain/values/ClaimEvidenceReview"
 *
 * console.log(typeof reviewStatusFor) // function
 * ```
 *
 * @param basis - Exact claim and evidence currently presented.
 * @param verification - Result of verifying the presently resolved source.
 * @param review - Optional historical human approval.
 * @returns Pending, current, or stale status, retaining the original approval.
 * @category validation
 * @since 0.0.0
 */
export const reviewStatusFor: {
  (
    basis: ClaimEvidenceBasis,
    verification: ClaimEvidenceVerification,
    review: O.Option<ClaimEvidenceReview>
  ): ClaimEvidenceReviewStatus;
  (
    verification: ClaimEvidenceVerification,
    review: O.Option<ClaimEvidenceReview>
  ): (basis: ClaimEvidenceBasis) => ClaimEvidenceReviewStatus;
} = makeReviewStatusFor({
  ClaimEvidenceBasis,
  ClaimEvidenceReview,
  ClaimEvidenceReviewStatus,
}).reviewStatusFor;
