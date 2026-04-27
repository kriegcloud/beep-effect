/**
 * In-memory repository implementation for the synthetic `fixture-lab/Specimen` slice.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { SpecimenConfig, type SpecimenConfigShape } from "@beep/fixture-lab-specimen-config/layer";
import { Specimen } from "@beep/fixture-lab-specimen-domain";
import { SpecimenNotFound, type SpecimenRepository } from "@beep/fixture-lab-specimen-use-cases/server";
import { Effect, Ref } from "effect";

const makeInitialSpecimen = (config: SpecimenConfigShape): Specimen =>
  new Specimen({
    id: config.server.initialSpecimenId,
    label: config.public.labelPrefix,
    status: "draft",
  });

const getStoredSpecimen = (store: Ref.Ref<Specimen>, id: string): Effect.Effect<Specimen, SpecimenNotFound> =>
  Ref.get(store).pipe(
    Effect.flatMap((specimen) =>
      specimen.id === id ? Effect.succeed(specimen) : Effect.fail(new SpecimenNotFound({ id }))
    )
  );

/**
 * Build an in-memory repository backed by a local Ref.
 *
 * @example
 * ```ts
 * import { makeSpecimenRepository } from "@beep/fixture-lab-specimen-server"
 *
 * const program = makeSpecimenRepository()
 * void program
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const makeSpecimenRepository = Effect.fn("SpecimenRepository.make")(function* () {
  const config = yield* SpecimenConfig;
  const store = yield* Ref.make(makeInitialSpecimen(config));

  return {
    get: (id) => getStoredSpecimen(store, id),
    save: (specimen) => Effect.as(Ref.set(store, specimen), specimen),
  } satisfies SpecimenRepository;
});
