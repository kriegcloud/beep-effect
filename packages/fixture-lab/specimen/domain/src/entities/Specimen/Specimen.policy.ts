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
 * declare const specimen: Specimen
 * const observed = observeSpecimen(specimen)
 * console.log(observed.status)
 * ```
 *
 * @category policies
 * @since 0.0.0
 */
export const observeSpecimen = (specimen: Specimen): Specimen =>
  new Specimen({
    ...specimen,
    status: "observed",
  });

/**
 * Move a specimen into the retired lifecycle state.
 *
 * @example
 * ```ts
 * import { retireSpecimen, Specimen } from "@beep/fixture-lab-specimen-domain"
 *
 * declare const specimen: Specimen
 * const retired = retireSpecimen(specimen)
 * console.log(retired.status)
 * ```
 *
 * @category policies
 * @since 0.0.0
 */
export const retireSpecimen = (specimen: Specimen): Specimen =>
  new Specimen({
    ...specimen,
    status: "retired",
  });
