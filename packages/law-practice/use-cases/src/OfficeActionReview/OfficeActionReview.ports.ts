/**
 * Office-action review port: the typed contract for the loop orchestrator that
 * reviews a single office action end to end. Given the office action's fixture
 * identity and its source artifact, the review extracts text and spans, maps
 * them into law-practice entities, gates the resulting claims through the
 * epistemic admission lifecycle, and folds the authority into a deterministic
 * projection.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { OperationId, SourceArtifact } from "@beep/file-processing/Artifact";
import { $LawPracticeUseCasesId } from "@beep/identity/packages";
import { Context } from "effect";
import * as S from "effect/Schema";
import type { ClaimProjectionView } from "@beep/epistemic-domain/values";
import type { FileProcessingOperationError } from "@beep/file-processing/Operation";
import type { Effect } from "effect";

const $I = $LawPracticeUseCasesId.create("OfficeActionReview/OfficeActionReview.ports");

/**
 * Input to one office-action review: the fixture identity of the office action
 * under review, the matter it prosecutes, and the source artifact the loop
 * extracts character-anchored text from.
 *
 * @example
 * ```ts
 * import { OfficeActionReviewInput } from "@beep/law-practice-use-cases/OfficeActionReview"
 *
 * console.log(OfficeActionReviewInput)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class OfficeActionReviewInput extends S.Class<OfficeActionReviewInput>($I`OfficeActionReviewInput`)(
  {
    matterFixtureKey: S.NonEmptyString,
    officeActionFixtureKey: S.NonEmptyString,
    operationId: OperationId,
    sourceArtifact: SourceArtifact,
  },
  $I.annote("OfficeActionReviewInput", {
    description: "Schema-backed input for reviewing one office-action source artifact.",
  })
) {}

/**
 * Service shape for the office-action review loop: take an
 * {@link OfficeActionReviewInput} and return the epistemic
 * {@link ClaimProjectionView} folded from the reviewed claims.
 *
 * The eventual P2 live Layer satisfying this contract will depend on
 * `@beep/file-processing` + `@beep/langextract` for source ingestion, the
 * {@link IrToLaw} mapping for IR-to-entity translation, and the epistemic
 * `ClaimGate` / `ClaimLifecycle` services (plus the pure `projectClaims` fold)
 * for admission and projection. None of that orchestration lives in this tier —
 * this is a contract only.
 *
 * @example
 * ```ts
 * import type { OfficeActionReviewShape } from "@beep/law-practice-use-cases/OfficeActionReview"
 *
 * const accept = (shape: OfficeActionReviewShape) => shape
 * console.log(accept)
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export interface OfficeActionReviewShape {
  readonly review: (input: OfficeActionReviewInput) => Effect.Effect<ClaimProjectionView, FileProcessingOperationError>;
}

/**
 * Office-action review loop service tag.
 *
 * @example
 * ```ts
 * import { OfficeActionReview } from "@beep/law-practice-use-cases/OfficeActionReview"
 *
 * console.log(OfficeActionReview)
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export class OfficeActionReview extends Context.Service<OfficeActionReview, OfficeActionReviewShape>()(
  $I`OfficeActionReview`
) {}
