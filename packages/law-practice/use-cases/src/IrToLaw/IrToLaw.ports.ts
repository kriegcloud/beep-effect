/**
 * IR-to-law port: the typed contract through which the generic `@beep/nlp`
 * Handoff IR (a product-neutral annotated document of chunks, entities, and
 * relations) is mapped into concrete law-practice domain entities. This is the
 * boundary at which generic NLP annotations acquire IP-law meaning.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $LawPracticeUseCasesId } from "@beep/identity/packages";
import { Context } from "effect";
import type { Claim, Distinction, OfficeAction, PriorArtReference, Rejection } from "@beep/law-practice-domain";
import type { AnnotatedDocument } from "@beep/nlp/Handoff/Contract";
import type { Effect } from "effect";

const $I = $LawPracticeUseCasesId.create("IrToLaw/IrToLaw.ports");

/**
 * The bundle of law-practice domain entities produced by mapping one annotated
 * document. Each field is the concrete entity the generic IR resolves into.
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
 * Service shape for the IR-to-law mapping: take an annotated document emitted by
 * `@beep/nlp` and produce the law-practice {@link LawEntities} it encodes.
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
  readonly toLaw: (ir: AnnotatedDocument) => Effect.Effect<LawEntities>;
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
