/**
 * Server service layer for the synthetic `fixture-lab/Specimen` slice.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { makeSpecimenUseCases, type SpecimenUseCases } from "@beep/fixture-lab-specimen-use-cases/server";
import { $FixtureLabSpecimenId } from "@beep/identity/packages";
import { Context, Effect, Layer } from "effect";
import { makeSpecimenRepository } from "./Specimen.repo.js";

const $I = $FixtureLabSpecimenId.create("server/entities/Specimen/Specimen.layer");

/**
 * Build an in-memory specimen server for the golden fixture.
 *
 * @example
 * ```ts
 * import { makeSpecimenServer } from "@beep/fixture-lab-specimen-server"
 *
 * const program = makeSpecimenServer()
 * void program
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const makeSpecimenServer = Effect.fn("SpecimenServer.make")(function* () {
  const repository = yield* makeSpecimenRepository();

  return makeSpecimenUseCases(repository);
});

/**
 * Context service key for the specimen server facade.
 *
 * @example
 * ```ts
 * import { SpecimenServer } from "@beep/fixture-lab-specimen-server"
 *
 * void SpecimenServer
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export class SpecimenServer extends Context.Service<SpecimenServer, SpecimenUseCases>()($I`SpecimenServer`) {}

/**
 * Config-dependent in-memory server layer for the golden fixture.
 *
 * @example
 * ```ts
 * import { SpecimenServerLayer } from "@beep/fixture-lab-specimen-server"
 *
 * void SpecimenServerLayer
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const SpecimenServerLayer = Layer.effect(SpecimenServer, makeSpecimenServer());
