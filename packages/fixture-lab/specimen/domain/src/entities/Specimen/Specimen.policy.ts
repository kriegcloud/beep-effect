/**
 * Pure lifecycle policy for the synthetic `fixture-lab/Specimen` entity.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { Specimen } from "./Specimen.model.js";

/**
 * Move a specimen into the observed lifecycle state.
 *
 * @example
 * ```ts
 * import { observeSpecimen, Specimen } from "@beep/fixture-lab-specimen-domain"
 *
 * const observed = observeSpecimen(
 *   new Specimen({ id: "specimen-1", label: "Fixture", status: "draft" })
 * )
 * console.log(observed.status)
 * ```
 *
 * @category policies
 * @since 0.0.0
 */
export const observeSpecimen = (specimen: Specimen): Specimen =>
  new Specimen({
    id: specimen.id,
    label: specimen.label,
    status: "observed",
  });

/**
 * Move a specimen into the retired lifecycle state.
 *
 * @example
 * ```ts
 * import { retireSpecimen, Specimen } from "@beep/fixture-lab-specimen-domain"
 *
 * const retired = retireSpecimen(
 *   new Specimen({ id: "specimen-1", label: "Fixture", status: "observed" })
 * )
 * console.log(retired.status)
 * ```
 *
 * @category policies
 * @since 0.0.0
 */
export const retireSpecimen = (specimen: Specimen): Specimen =>
  new Specimen({
    id: specimen.id,
    label: specimen.label,
    status: "retired",
  });
