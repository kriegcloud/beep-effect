/**
 * Fixture-lab specimen server use-case entrypoint.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

/**
 * Specimen repository error exports.
 *
 * @example
 * ```ts
 * import * as SpecimenServerUseCases from "@beep/fixture-lab-specimen-use-cases/server"
 *
 * console.log(SpecimenServerUseCases)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export { SpecimenRepositoryNotFound, toSpecimenActionError } from "./entities/Specimen/Specimen.errors.js";
/**
 * Specimen repository port exports.
 *
 * @example
 * ```ts
 * import * as SpecimenServerUseCases from "@beep/fixture-lab-specimen-use-cases/server"
 *
 * console.log(SpecimenServerUseCases)
 * ```
 *
 * @category ports
 * @since 0.0.0
 */
export * from "./entities/Specimen/Specimen.ports.js";
/**
 * Specimen service exports.
 *
 * @example
 * ```ts
 * import * as SpecimenServerUseCases from "@beep/fixture-lab-specimen-use-cases/server"
 *
 * console.log(SpecimenServerUseCases)
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export * from "./entities/Specimen/Specimen.service.js";
/**
 * Specimen public use-case exports.
 *
 * @example
 * ```ts
 * import * as SpecimenServerUseCases from "@beep/fixture-lab-specimen-use-cases/server"
 *
 * console.log(SpecimenServerUseCases)
 * ```
 *
 * @category fixtures
 * @since 0.0.0
 */
export * from "./public.js";
