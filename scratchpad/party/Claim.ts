/**
 * Epistemic plane: source-local assertions, evidence signals, review state,
 * and immutable bitemporal claim versions.
 *
 * This file mirrors three shipped contracts so the experiment can move without
 * cross-package churn (see the mapping table in PARTY-DATA-MODEL.md):
 *
 * - `ClaimVersion` ↔ `@beep/epistemic-domain` `EdgeVersion` (half-open valid
 *   and knowledge intervals, `supersedes`, no stored "isLatest").
 * - `StructuralVerdict` ↔ `ClaimGateResult` (`admitted` = conforms to shape).
 * - `EvidenceSignals` ↔ `evidence-signals/v1` (five signals, absence ≠ zero,
 *   no aggregate score, explicit source dependence).
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $ScratchpadId } from "@beep/identity";
import { LiteralKit } from "@beep/schema";
import * as A from "effect/Array";
import { dual } from "effect/Function";
import * as S from "effect/Schema";
import { ActivityId, AssertionId, ClaimVersionId, Digest, PrincipalId } from "./Ids.ts";
import { Proposition } from "./Proposition.ts";
import { EvidenceAnchor } from "./Provenance.ts";
import { holdsAt, KnowledgeInterval, knownAt, TemporalExtent, UtcInstant } from "./Time.ts";

const $I = $ScratchpadId.create("party/Claim");

// ---------------------------------------------------------------------------
// Source-local assertions
// ---------------------------------------------------------------------------

/**
 * One proposition asserted (or denied) by one source, with exact anchors.
 * Identical propositions from five documents stay five assertions; whether
 * they are five *independent* witnesses is a separate dependence assessment.
 *
 * @category claim
 * @since 0.0.0
 */
export const SourceAssertion = S.Struct({
  id: AssertionId,
  proposition: Proposition,
  stance: LiteralKit(["asserts", "denies"]),
  anchors: S.NonEmptyArray(EvidenceAnchor),
  producedBy: ActivityId,
  validTime: TemporalExtent,
  recordedAt: UtcInstant,
}).pipe($I.annoteSchema("SourceAssertion", { description: "One proposition asserted by one source." }));
export type SourceAssertion = typeof SourceAssertion.Type;

// ---------------------------------------------------------------------------
// evidence-signals/v1 mirror
// ---------------------------------------------------------------------------

/**
 * Why a signal is absent. Absence is never zero.
 *
 * @category signals
 * @since 0.0.0
 */
export const AbsenceReason = LiteralKit(["not-assessed", "unavailable", "not-applicable", "legacy-unknown"]).pipe(
  $I.annoteSchema("AbsenceReason", { description: "Why an evidence signal is absent." })
);

const signal = <A extends S.Top>(value: A) =>
  S.TaggedUnion({ Present: { value }, Absent: { reason: AbsenceReason } });

/**
 * A typed measurement. A detector score, a cosine similarity and a calibrated
 * probability are different contracts and never share a column.
 *
 * @category signals
 * @since 0.0.0
 */
export const Measurement = S.TaggedUnion({
  Similarity: { value: S.Finite, metric: S.NonEmptyString, model: S.NonEmptyString },
  ClassifierProbability: {
    value: S.Finite.check(S.isBetween({ minimum: 0, maximum: 1 })),
    model: S.NonEmptyString,
    calibrated: S.Boolean,
  },
  OrdinalJudgment: { level: LiteralKit(["low", "moderate", "high"]) },
}).pipe($I.annoteSchema("Measurement", { description: "Typed measurement." }));
export type Measurement = typeof Measurement.Type;

/**
 * A human reviewer's disposition, bound to the exact evidence basis digest it
 * looked at. Automation cannot produce one. `abstained` is a present decision.
 *
 * @category signals
 * @since 0.0.0
 */
export const ReviewerDisposition = S.Struct({
  disposition: LiteralKit(["accepted", "rejected", "abstained"]),
  reviewer: PrincipalId,
  basis: Digest,
  reviewedAt: UtcInstant,
  reason: S.NonEmptyString,
}).pipe($I.annoteSchema("ReviewerDisposition", { description: "Human disposition on an exact basis." }));
export type ReviewerDisposition = typeof ReviewerDisposition.Type;

/**
 * The five separate signals. There is intentionally no `score` field.
 *
 * @category signals
 * @since 0.0.0
 */
export const EvidenceSignals = S.Struct({
  sourceTrust: signal(LiteralKit(["low", "moderate", "high"])),
  sourceAssertedConfidence: signal(Measurement),
  extractorConfidence: signal(Measurement),
  validator: signal(
    S.TaggedUnion({
      Conforms: {},
      Violations: { messages: S.NonEmptyArray(S.String) },
})
  ),
  reviewer: signal(ReviewerDisposition),
}).pipe($I.annoteSchema("EvidenceSignals", { description: "evidence-signals/v1 mirror." }));
export type EvidenceSignals = typeof EvidenceSignals.Type;

/**
 * Lineage between two assertions. `unknown` is never treated as independent.
 *
 * @category signals
 * @since 0.0.0
 */
export const DependenceAssessment = S.Struct({
  left: AssertionId,
  right: AssertionId,
  dependence: LiteralKit(["independent", "dependent", "unknown"]),
  basis: S.NonEmptyString,
  producedBy: ActivityId,
}).pipe($I.annoteSchema("DependenceAssessment", { description: "Source dependence between two assertions." }));
export type DependenceAssessment = typeof DependenceAssessment.Type;

// ---------------------------------------------------------------------------
// Structural verdict vs review state
// ---------------------------------------------------------------------------

/**
 * Structural verdict, mirroring `ClaimGateResult`. `Admitted` means the
 * candidate satisfied the shape contract. It does not mean true.
 *
 * @category claim
 * @since 0.0.0
 */
export const StructuralVerdict = S.TaggedUnion({
  Admitted: {},
  ShapeRejected: { violations: S.NonEmptyArray(S.String) },
}).pipe($I.annoteSchema("StructuralVerdict", { description: "Shape verdict only." }));
export type StructuralVerdict = typeof StructuralVerdict.Type;

/**
 * Epistemic review state. Accepting and rejecting require a disposition
 * object; there is no way to be accepted "because the gate admitted it".
 *
 * @category claim
 * @since 0.0.0
 */
export const ReviewState = S.TaggedUnion({
  Proposed: {},
  Accepted: { disposition: ReviewerDisposition },
  Rejected: { disposition: ReviewerDisposition },
  Disputed: { challengedBy: S.NonEmptyArray(AssertionId), openedAt: UtcInstant },
  Retracted: { reason: S.NonEmptyString, at: UtcInstant },
}).pipe($I.annoteSchema("ReviewState", { description: "Epistemic review state." }));
export type ReviewState = typeof ReviewState.Type;

/**
 * Review-state tags a projection may read.
 *
 * @category claim
 * @since 0.0.0
 */
export const ReviewTag = LiteralKit(["Proposed", "Accepted", "Rejected", "Disputed", "Retracted"]).pipe(
  $I.annoteSchema("ReviewTag", { description: "Review-state tag." })
);
export type ReviewTag = typeof ReviewTag.Type;

// ---------------------------------------------------------------------------
// Authority ledger row
// ---------------------------------------------------------------------------

/**
 * One immutable row of the authority ledger (EdgeVersion mirror). Corrections
 * append a new version with `supersedes` and expire the old one's knowledge
 * interval; nothing is updated in place.
 *
 * @category claim
 * @since 0.0.0
 */
export const ClaimVersion = S.Struct({
  id: ClaimVersionId,
  logicalKey: S.NonEmptyString,
  proposition: Proposition,
  supportedBy: S.NonEmptyArray(AssertionId),
  challengedBy: S.Array(AssertionId),
  validTime: TemporalExtent,
  knowledge: KnowledgeInterval,
  supersedes: S.OptionFromNullOr(ClaimVersionId),
  review: ReviewState,
  signals: EvidenceSignals,
}).pipe($I.annoteSchema("ClaimVersion", { description: "Immutable bitemporal claim version." }));
export type ClaimVersion = typeof ClaimVersion.Type;

/**
 * Bitemporal read: which versions the system held at `asOf` that are valid at
 * `validAt` and in an allowed review state.
 *
 * @category claim
 * @since 0.0.0
 */
export const versionsAt: {
  (scope: {
    readonly asOf: UtcInstant;
    readonly validAt: UtcInstant;
    readonly states: ReadonlyArray<ReviewTag>;
  }): (ledger: ReadonlyArray<ClaimVersion>) => ReadonlyArray<ClaimVersion>;
  (
    ledger: ReadonlyArray<ClaimVersion>,
    scope: { readonly asOf: UtcInstant; readonly validAt: UtcInstant; readonly states: ReadonlyArray<ReviewTag> }
  ): ReadonlyArray<ClaimVersion>;
} = dual(
  2,
  (
    ledger: ReadonlyArray<ClaimVersion>,
    scope: { readonly asOf: UtcInstant; readonly validAt: UtcInstant; readonly states: ReadonlyArray<ReviewTag> }
  ): ReadonlyArray<ClaimVersion> =>
    A.filter(
      ledger,
      (v) => knownAt(v.knowledge, scope.asOf) && holdsAt(v.validTime, scope.validAt) && A.contains(scope.states, v.review._tag)
    )
);
