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
 * Action-level error raised when a specimen cannot be loaded by a use case.
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
    description: "Raised when a specimen cannot be loaded by a public use case.",
  })
) {}

/**
 * Repository boundary error raised when persisted specimen data is missing.
 *
 * @example
 * ```ts
 * import { SpecimenRepositoryNotFound } from "@beep/fixture-lab-specimen-use-cases/server"
 *
 * const error = new SpecimenRepositoryNotFound({ id: "missing" })
 * console.log(error._tag)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class SpecimenRepositoryNotFound extends TaggedErrorClass<SpecimenRepositoryNotFound>(
  $I`SpecimenRepositoryNotFound`
)(
  "SpecimenRepositoryNotFound",
  {
    id: S.String,
  },
  $I.annote("SpecimenRepositoryNotFound", {
    description: "Repository boundary failure raised when no specimen exists for the requested id.",
  })
) {}

/**
 * Translate repository boundary failures into the public use-case error vocabulary.
 *
 * @example
 * ```ts
 * import {
 *   SpecimenRepositoryNotFound,
 *   toSpecimenActionError,
 * } from "@beep/fixture-lab-specimen-use-cases/server"
 *
 * const error = toSpecimenActionError(new SpecimenRepositoryNotFound({ id: "missing" }))
 * console.log(error._tag)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export const toSpecimenActionError = (error: SpecimenRepositoryNotFound): SpecimenNotFound =>
  new SpecimenNotFound({ id: error.id });
