/**
 * Application commands for the synthetic `fixture-lab/Specimen` slice.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $FixtureLabSpecimenId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $FixtureLabSpecimenId.create("use-cases/entities/Specimen/Specimen.commands");

/**
 * Command requesting that a specimen be marked as observed.
 *
 * @example
 * ```ts
 * import { ObserveSpecimen } from "@beep/fixture-lab-specimen-use-cases/public"
 *
 * const command = new ObserveSpecimen({ id: "specimen-1" })
 * console.log(command.id)
 * ```
 *
 * @category commands
 * @since 0.0.0
 */
export class ObserveSpecimen extends S.Class<ObserveSpecimen>($I`ObserveSpecimen`)(
  {
    id: S.String,
  },
  $I.annote("ObserveSpecimen", {
    description: "Command requesting that a specimen be marked as observed.",
  })
) {}

/**
 * Command requesting that a specimen be marked as retired.
 *
 * @example
 * ```ts
 * import { RetireSpecimen } from "@beep/fixture-lab-specimen-use-cases/public"
 *
 * const command = new RetireSpecimen({ id: "specimen-1" })
 * console.log(command.id)
 * ```
 *
 * @category commands
 * @since 0.0.0
 */
export class RetireSpecimen extends S.Class<RetireSpecimen>($I`RetireSpecimen`)(
  {
    id: S.String,
  },
  $I.annote("RetireSpecimen", {
    description: "Command requesting that a specimen be marked as retired.",
  })
) {}
