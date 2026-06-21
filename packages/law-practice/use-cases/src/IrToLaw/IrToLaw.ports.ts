/**
 * IR-to-law port: the typed contract through which span-bearing extraction
 * output is mapped into concrete law-practice domain entities. This is the
 * boundary at which generic NLP annotations acquire IP-law meaning.
 *
 * The input is `ReadonlyArray<GroundedExtraction>` (from `@beep/langextract`),
 * NOT the `@beep/nlp` `AnnotatedDocument` envelope. The envelope does not carry
 * per-entity character spans: its `Entity.mentions` are bare `MentionId[]` and
 * the span-bearing `Mention` objects are not included in the envelope, so a
 * required `Distinction.anchor` (`TextAnchor`) cannot be recovered from it. A
 * `GroundedExtraction` instead carries its own aligned `span` plus the original
 * `matchedText`, which is exactly what grounding a distinction's anchor needs.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $LawPracticeUseCasesId } from "@beep/identity/packages";
import { Context } from "effect";
import type { GroundedExtraction } from "@beep/langextract/Extraction";
import type { Claim, Distinction, OfficeAction, PriorArtReference, Rejection } from "@beep/law-practice-domain";
import type { Effect } from "effect";
import type { IrToLawExtractionError } from "./IrToLaw.errors.ts";

const $I = $LawPracticeUseCasesId.create("IrToLaw/IrToLaw.ports");

/**
 * The bundle of law-practice domain entities produced by mapping one office
 * action's grounded extractions. Each field is the concrete entity the generic
 * extraction output resolves into.
 *
 * @example
 * ```ts
 * import type { LawEntities } from "@beep/law-practice-use-cases/IrToLaw"
 *
 * const accept = (entities: LawEntities) => entities.officeAction
 * console.log(accept)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export interface LawEntities {
  readonly claim: Claim;
  readonly distinction: Distinction;
  readonly officeAction: OfficeAction;
  readonly priorArtReference: PriorArtReference;
  readonly rejection: Rejection;
}

/**
 * Service shape for the IR-to-law mapping: take the span-bearing grounded
 * extractions for one office action and produce the law-practice
 * {@link LawEntities} they encode. The `span`/`matchedText` an extraction
 * carries is what grounds the distinction's `TextAnchor`.
 *
 * @example
 * ```ts
 * import type { IrToLawShape } from "@beep/law-practice-use-cases/IrToLaw"
 *
 * const accept = (shape: IrToLawShape) => shape
 * console.log(accept)
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export interface IrToLawShape {
  readonly toLaw: (
    extractions: ReadonlyArray<GroundedExtraction>
  ) => Effect.Effect<LawEntities, IrToLawExtractionError>;
}

/**
 * IR-to-law mapping service tag.
 *
 * @example
 * ```ts
 * import { IrToLaw } from "@beep/law-practice-use-cases/IrToLaw"
 *
 * console.log(IrToLaw)
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export class IrToLaw extends Context.Service<IrToLaw, IrToLawShape>()($I`IrToLaw`) {}
