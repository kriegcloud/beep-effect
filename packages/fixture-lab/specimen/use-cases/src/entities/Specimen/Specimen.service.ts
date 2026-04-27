/**
 * Application service facade for the synthetic `fixture-lab/Specimen` slice.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { observeSpecimen, retireSpecimen, type Specimen } from "@beep/fixture-lab-specimen-domain";
import { Effect } from "effect";
import type { ObserveSpecimen, RetireSpecimen } from "./Specimen.commands.js";
import type { SpecimenNotFound } from "./Specimen.errors.js";
import type { SpecimenRepository } from "./Specimen.ports.js";
import type { GetSpecimen } from "./Specimen.queries.js";

/**
 * Application-facing specimen command and query operations.
 *
 * @category services
 * @since 0.0.0
 */
export interface SpecimenUseCases {
  readonly getSpecimen: (query: GetSpecimen) => Effect.Effect<Specimen, SpecimenNotFound>;
  readonly observeSpecimen: (command: ObserveSpecimen) => Effect.Effect<Specimen, SpecimenNotFound>;
  readonly retireSpecimen: (command: RetireSpecimen) => Effect.Effect<Specimen, SpecimenNotFound>;
}

/**
 * Create the specimen command/query facade over a repository boundary.
 *
 * @example
 * ```ts
 * import { Specimen } from "@beep/fixture-lab-specimen-domain"
 * import { GetSpecimen, makeSpecimenUseCases } from "@beep/fixture-lab-specimen-use-cases/server"
 * import { Effect } from "effect"
 *
 * const specimen = new Specimen({ id: "specimen-1", label: "Fixture", status: "draft" })
 * const useCases = makeSpecimenUseCases({
 *   get: () => Effect.succeed(specimen),
 *   save: Effect.succeed,
 * })
 * const program = useCases.getSpecimen(new GetSpecimen({ id: "specimen-1" }))
 * void program
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const makeSpecimenUseCases = (repository: SpecimenRepository): SpecimenUseCases => ({
  getSpecimen: Effect.fn("SpecimenUseCases.getSpecimen")((query: GetSpecimen) => repository.get(query.id)),
  observeSpecimen: Effect.fn("SpecimenUseCases.observeSpecimen")((command: ObserveSpecimen) =>
    Effect.flatMap(repository.get(command.id), (specimen) => repository.save(observeSpecimen(specimen)))
  ),
  retireSpecimen: Effect.fn("SpecimenUseCases.retireSpecimen")((command: RetireSpecimen) =>
    Effect.flatMap(repository.get(command.id), (specimen) => repository.save(retireSpecimen(specimen)))
  ),
});
