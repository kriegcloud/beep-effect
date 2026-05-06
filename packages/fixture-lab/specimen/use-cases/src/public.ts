/**
 * Fixture-lab specimen public use-case entrypoint.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

/**
 * Specimen command exports.
 *
 * @example
 * ```ts
 * import * as SpecimenUseCases from "@beep/fixture-lab-specimen-use-cases/public"
 *
 * console.log(SpecimenUseCases)
 * ```
 *
 * @category commands
 * @since 0.0.0
 */
export { ObserveSpecimen, RetireSpecimen } from "./entities/Specimen/Specimen.commands.js";
/**
 * Specimen public error exports.
 *
 * @example
 * ```ts
 * import * as SpecimenUseCases from "@beep/fixture-lab-specimen-use-cases/public"
 *
 * console.log(SpecimenUseCases)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export { SpecimenNotFound } from "./entities/Specimen/Specimen.errors.js";
/**
 * Specimen query exports.
 *
 * @example
 * ```ts
 * import * as SpecimenUseCases from "@beep/fixture-lab-specimen-use-cases/public"
 *
 * console.log(SpecimenUseCases)
 * ```
 *
 * @category queries
 * @since 0.0.0
 */
export { GetSpecimen } from "./entities/Specimen/Specimen.queries.js";
/**
 * Specimen use-case type exports.
 *
 * @example
 * ```ts
 * import type { SpecimenUseCases } from "@beep/fixture-lab-specimen-use-cases/public"
 *
 * declare const useCases: SpecimenUseCases
 * console.log(useCases)
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export type { SpecimenUseCases } from "./entities/Specimen/Specimen.service.js";
