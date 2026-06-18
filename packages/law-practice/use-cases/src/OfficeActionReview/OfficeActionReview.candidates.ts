/**
 * Fixed office-action extraction candidates used by the spike review loop.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { ExtractionCandidate } from "@beep/langextract/Extraction";

/**
 * Fixed candidate set for the office-action review spike.
 *
 * This is the stand-in for the deferred LLM extraction step. It is exported
 * through the package test surface so integration tests can assert grounding
 * against the exact candidates the loop consumes.
 *
 * @example
 * ```ts
 * import { OfficeActionReviewSpikeCandidates } from "@beep/law-practice-use-cases/test"
 *
 * console.log(OfficeActionReviewSpikeCandidates.length)
 * ```
 *
 * @category fixtures
 * @since 0.0.0
 */
export const OfficeActionReviewSpikeCandidates = [
  ExtractionCandidate.make({ label: "office_action", text: "Office Action" }),
  ExtractionCandidate.make({ label: "claim", text: "A widget comprising a lid and a base." }),
  ExtractionCandidate.make({ label: "rejection_reference", text: "Smith" }),
  ExtractionCandidate.make({ label: "distinction", text: "a hinge coupling the lid to the base" }),
];
