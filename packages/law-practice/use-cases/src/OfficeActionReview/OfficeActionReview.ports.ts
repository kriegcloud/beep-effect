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
import { FileProcessingOperationError } from "@beep/file-processing/Operation";
import { $LawPracticeUseCasesId } from "@beep/identity/packages";
import { LangExtractError } from "@beep/langextract/Extraction";
import { Context } from "effect";
import * as S from "effect/Schema";
import { IrToLawExtractionError } from "../IrToLaw/index.ts";
import type { ClaimProjectionView } from "@beep/epistemic-domain/values";
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
 * Failure raised by the office-action review loop while extracting source text,
 * extracting grounded law labels, or mapping those labels into law entities.
 *
 * @example
 * ```ts
 * import { OfficeActionReviewError } from "@beep/law-practice-use-cases/OfficeActionReview"
 *
 * console.log(OfficeActionReviewError)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export const OfficeActionReviewError = S.Union([
  FileProcessingOperationError,
  LangExtractError,
  IrToLawExtractionError,
]).annotate(
  $I.annote("OfficeActionReviewError", {
    description: "Failure union for the law-practice office-action review loop.",
  })
);

/**
 * Type for {@link OfficeActionReviewError}.
 *
 * @category errors
 * @since 0.0.0
 */
export type OfficeActionReviewError = typeof OfficeActionReviewError.Type;

/**
 * Service shape for the office-action review loop: take an
 * {@link OfficeActionReviewInput} and return the epistemic
 * {@link ClaimProjectionView} folded from the reviewed claims.
 *
 * The server Layer satisfying this contract composes `@beep/file-processing`,
 * `@beep/langextract`, the {@link IrToLaw} mapper, and the epistemic `ClaimGate`
 * / `ClaimLifecycle` services. The shape stays driver-neutral so tests can
 * inject deterministic fake extraction output without live provider credentials.
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
  readonly review: (input: OfficeActionReviewInput) => Effect.Effect<ClaimProjectionView, OfficeActionReviewError>;
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
