/**
 * Value schemas for the synthetic `fixture-lab/Specimen` entity.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $FixtureLabSpecimenId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";

const $I = $FixtureLabSpecimenId.create("domain/entities/Specimen/Specimen.values");

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
 * @example
 * ```ts
 * import type { SpecimenStatus } from "@beep/fixture-lab-specimen-domain"
 *
 * const status: SpecimenStatus = "draft"
 * console.log(status)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type SpecimenStatus = typeof SpecimenStatus.Type;
