/**
 * Office-action review loop implementation.
 *
 * The end-to-end loop for reviewing one office action: extract text through
 * `@beep/file-processing`, build a fixed candidate set (stand-in for LLM
 * extraction), deterministically align those candidates to the extracted text
 * via `@beep/langextract`, map the grounded extractions into law entities
 * through {@link IrToLaw}, then run the distinction's claim through the
 * epistemic admission lifecycle (gate to transition) and fold the result into a
 * {@link ClaimProjectionView}.
 *
 * The candidate set is FIXED here as a spike affordance — the LLM-driven
 * extraction step that would emit these candidates from the source text is
 * deferred. Everything downstream of the candidates (alignment, mapping,
 * gating, transition, projection) is the real pipeline.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { CandidateClaim, Evidence } from "@beep/epistemic-domain";
import { projectClaims } from "@beep/epistemic-use-cases/ClaimProjection";
import { FileProcessingOperationError, ProcessFileOperation } from "@beep/file-processing/Operation";
import { alignCandidates } from "@beep/langextract/Alignment";
import { ExtractionCandidate } from "@beep/langextract/Extraction";
import { Effect } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { spikeEntityInput } from "../internal/spikeEntity.js";
import type { ClaimGateShape } from "@beep/epistemic-use-cases/ClaimGate";
import type { ClaimTransitionShape } from "@beep/epistemic-use-cases/ClaimLifecycle";
import type { ProcessFileResult } from "@beep/file-processing/Extraction";
import type { FileProcessingServiceShape } from "@beep/file-processing/Service";
import type { IrToLawShape, LawEntities } from "../IrToLaw/IrToLaw.ports.js";
import type { OfficeActionReviewShape } from "./OfficeActionReview.ports.js";

const decodeCandidateClaim = S.decodeUnknownSync(CandidateClaim);
const decodeEvidence = S.decodeUnknownSync(Evidence);

// Fixed candidate set — stand-in for the deferred LLM extraction step.
const candidates = [
  ExtractionCandidate.make({ label: "office_action", text: "Office Action" }),
  ExtractionCandidate.make({ label: "claim", text: "A widget comprising a lid and a base." }),
  ExtractionCandidate.make({ label: "rejection_reference", text: "Smith" }),
  ExtractionCandidate.make({ label: "distinction", text: "a hinge coupling the lid to the base" }),
];

const candidateClaimOf = (law: LawEntities): CandidateClaim =>
  decodeCandidateClaim({
    ...spikeEntityInput("EpistemicCandidateClaim", 1),
    fixtureKey: law.distinction.fixtureKey,
    lifecycle: "candidate",
    snapshot: {},
  });

const evidenceOf = (law: LawEntities): Evidence =>
  decodeEvidence({
    ...spikeEntityInput("EpistemicEvidence", 2),
    artifactFixtureKey: law.officeAction.fixtureKey,
    span: {
      confidence: 0.9,
      endChar: law.distinction.anchor.endChar,
      quote: law.distinction.anchor.quote,
      startChar: law.distinction.anchor.startChar,
    },
    spanFixtureKey: law.distinction.fixtureKey,
  });

const sourceTextFrom = Effect.fn("law_practice.office_action.source_text_from")(function* (
  result: ProcessFileResult
): Effect.fn.Return<string, FileProcessingOperationError> {
  if (result.resultKind !== "extracted") {
    return yield* FileProcessingOperationError.fromReason("file-extraction-failed", {
      artifactId: result.sourceArtifactId,
      engine: result.engine,
      format: result.format,
      message: `Office-action review requires extracted text, received ${result.resultKind}.`,
      operationId: result.operationId,
    });
  }

  return yield* O.match(O.fromUndefinedOr(result.extraction.text), {
    onNone: () =>
      Effect.fail(
        FileProcessingOperationError.fromReason("file-extraction-failed", {
          artifactId: result.extraction.sourceArtifactId,
          engine: result.engine,
          format: result.format,
          message: "Office-action review requires text extraction output.",
          operationId: result.operationId,
        })
      ),
    onSome: Effect.succeed,
  });
});

/**
 * Dependencies the office-action review loop composes: file-processing source
 * extraction, the IR-to-law mapping, plus the epistemic claim gate and
 * lifecycle transition.
 *
 * @example
 * ```ts
 * import type { OfficeActionReviewDeps } from "@beep/law-practice-use-cases/OfficeActionReview"
 *
 * const accept = (deps: OfficeActionReviewDeps) => deps.irToLaw
 * console.log(accept)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export interface OfficeActionReviewDeps {
  readonly fileProcessing: FileProcessingServiceShape;
  readonly gate: ClaimGateShape;
  readonly irToLaw: IrToLawShape;
  readonly transition: ClaimTransitionShape;
}

/**
 * Build the office-action review loop shape from its injected dependencies.
 *
 * @example
 * ```ts
 * import { makeOfficeActionReview } from "@beep/law-practice-use-cases/OfficeActionReview"
 *
 * console.log(typeof makeOfficeActionReview)
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const makeOfficeActionReview = (deps: OfficeActionReviewDeps): OfficeActionReviewShape => ({
  review: Effect.fn("law_practice.office_action.review")(function* (input) {
    const processed = yield* deps.fileProcessing.process(
      ProcessFileOperation.make({
        exportChildren: false,
        operationId: input.operationId,
        operationKind: "process",
        preference: { engine: "auto" },
        source: input.sourceArtifact,
      })
    );
    const sourceText = yield* sourceTextFrom(processed);

    // Deterministically align the fixed candidates against the extracted source text.
    const extractions = alignCandidates(sourceText, candidates);

    // Map the grounded extractions into law entities.
    const law = yield* deps.irToLaw.toLaw(extractions);

    // Build the epistemic candidate claim + evidence from the distinction.
    const candidate = candidateClaimOf(law);
    const evidence = evidenceOf(law);

    // Gate the claim: a well-formed span admits it.
    const verdict = yield* deps.gate.evaluate(candidate, [evidence]);

    // Advance the lifecycle. candidate -> shape_valid is always legal, so the
    // impossible ClaimInvalidTransition is a defect (orDie) and E stays never.
    const advanced = yield* deps.transition.advance(candidate, verdict).pipe(Effect.orDie);

    // Fold the single-claim authority into the deterministic projection.
    return projectClaims([advanced]);
  }),
});
