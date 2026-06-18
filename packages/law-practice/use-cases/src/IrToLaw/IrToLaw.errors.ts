/**
 * IR-to-law extraction failures.
 *
 * @packageDocumentation
 * @category errors
 * @since 0.0.0
 */

import { $LawPracticeUseCasesId } from "@beep/identity/packages";
import { LiteralKit, TaggedErrorClass } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $LawPracticeUseCasesId.create("IrToLaw/IrToLaw.errors");

/**
 * Machine-readable reasons for rejecting span-bearing extraction output before
 * it becomes law-practice entities.
 *
 * @example
 * ```ts
 * import { IrToLawExtractionErrorReason } from "@beep/law-practice-use-cases/IrToLaw"
 *
 * console.log(IrToLawExtractionErrorReason.is["required-extraction-missing"]("required-extraction-missing"))
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export const IrToLawExtractionErrorReason = LiteralKit([
  "required-extraction-missing",
  "required-extraction-unaligned",
]).pipe(
  $I.annoteSchema("IrToLawExtractionErrorReason", {
    description: "Reasons the law-practice IR mapper rejects extraction output.",
  })
);

/**
 * Type for {@link IrToLawExtractionErrorReason}.
 *
 * @category errors
 * @since 0.0.0
 */
export type IrToLawExtractionErrorReason = typeof IrToLawExtractionErrorReason.Type;

/**
 * Failure raised when required office-action extraction output is missing or
 * lacks a source-grounded span needed for legal evidence.
 *
 * @example
 * ```ts
 * import { IrToLawExtractionError } from "@beep/law-practice-use-cases/IrToLaw"
 *
 * console.log(IrToLawExtractionError.fromReason("required-extraction-missing", {
 *   label: "distinction",
 *   message: "Missing distinction extraction."
 * }))
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class IrToLawExtractionError extends TaggedErrorClass<IrToLawExtractionError>($I`IrToLawExtractionError`)(
  "IrToLawExtractionError",
  {
    alignmentStatus: S.optionalKey(S.String),
    label: S.NonEmptyString,
    message: S.String,
    reason: IrToLawExtractionErrorReason,
  },
  $I.annote("IrToLawExtractionError", {
    description: "Sanitized failure emitted when office-action extraction output cannot be grounded.",
  })
) {
  /**
   * Create a sanitized IR-to-law extraction error.
   *
   * @category constructors
   * @since 0.0.0
   */
  static readonly fromReason = (
    reason: IrToLawExtractionErrorReason,
    options: {
      readonly alignmentStatus?: string;
      readonly label: string;
      readonly message: string;
    }
  ): IrToLawExtractionError => IrToLawExtractionError.make({ reason, ...options });
}
