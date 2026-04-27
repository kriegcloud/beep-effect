/**
 * Application errors for the synthetic `fixture-lab/Specimen` slice.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $FixtureLabSpecimenId } from "@beep/identity/packages";
import { TaggedErrorClass } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $FixtureLabSpecimenId.create("use-cases/entities/Specimen/Specimen.errors");

/**
 * Error raised when a specimen cannot be loaded from the repository.
 *
 * @example
 * ```ts
 * import { SpecimenNotFound } from "@beep/fixture-lab-specimen-use-cases/public"
 *
 * const error = new SpecimenNotFound({ id: "missing" })
 * console.log(error._tag)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class SpecimenNotFound extends TaggedErrorClass<SpecimenNotFound>($I`SpecimenNotFound`)(
  "SpecimenNotFound",
  {
    id: S.String,
  },
  $I.annote("SpecimenNotFound", {
    description: "Raised when a specimen cannot be loaded.",
  })
) {}
