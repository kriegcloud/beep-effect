/**
 * Domain model for the synthetic `fixture-lab/Specimen` slice.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $FixtureLabSpecimenId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $FixtureLabSpecimenId.create("domain/entities/Specimen/Specimen.model");

/**
 * Lifecycle status for a synthetic specimen.
 *
 * @example
 * ```ts
 * import { SpecimenStatus } from "@beep/fixture-lab-specimen-domain"
 *
 * const isObserved = SpecimenStatus.is.observed("observed")
 * console.log(isObserved)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const SpecimenStatus = LiteralKit(["draft", "observed", "retired"] as const).annotate(
  $I.annote("SpecimenStatus", {
    description: "Lifecycle status for the synthetic Specimen concept.",
  })
);

/**
 * Decoded lifecycle status for a synthetic specimen.
 *
 * @category models
 * @since 0.0.0
 */
export type SpecimenStatus = typeof SpecimenStatus.Type;

/**
 * Synthetic entity model used to prove generated package topology.
 *
 * @example
 * ```ts
 * import { Specimen } from "@beep/fixture-lab-specimen-domain"
 *
 * const specimen = new Specimen({
 *   id: "specimen-1",
 *   label: "Fixture",
 *   status: "draft",
 * })
 * console.log(specimen.label)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class Specimen extends S.Class<Specimen>($I`Specimen`)(
  {
    id: S.String,
    label: S.String,
    status: SpecimenStatus,
  },
  $I.annote("Specimen", {
    description: "Synthetic entity model used by the architecture automation fixture.",
  })
) {}
