/**
 * Server-side product ports for the synthetic `fixture-lab/Specimen` slice.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import type { Specimen } from "@beep/fixture-lab-specimen-domain";
import type { Effect } from "effect";
import type { SpecimenNotFound } from "./Specimen.errors.js";

/**
 * Repository boundary required by the specimen use-case facade.
 *
 * @example
 * ```ts
 * import { Specimen } from "@beep/fixture-lab-specimen-domain"
 * import type { SpecimenRepository } from "@beep/fixture-lab-specimen-use-cases/server"
 * import { Effect } from "effect"
 *
 * const specimen = new Specimen({ id: "specimen-1", label: "Fixture", status: "draft" })
 * const repository: SpecimenRepository = {
 *   get: () => Effect.succeed(specimen),
 *   save: Effect.succeed,
 * }
 * void repository
 * ```
 *
 * @category ports
 * @since 0.0.0
 */
export interface SpecimenRepository {
  readonly get: (id: string) => Effect.Effect<Specimen, SpecimenNotFound>;
  readonly save: (specimen: Specimen) => Effect.Effect<Specimen>;
}
