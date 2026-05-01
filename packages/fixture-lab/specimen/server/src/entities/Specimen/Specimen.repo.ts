/**
 * In-memory repository implementation for the synthetic `fixture-lab/Specimen` slice.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { SpecimenConfig, type SpecimenConfigShape } from "@beep/fixture-lab-specimen-config/layer";
import { Specimen } from "@beep/fixture-lab-specimen-domain";
import { type SpecimenRepository, SpecimenRepositoryNotFound } from "@beep/fixture-lab-specimen-use-cases/server";
import { Effect, Ref } from "effect";
import * as S from "effect/Schema";

const systemPrincipal = { kind: "System", component: "Runtime" } as const;
const decodeSpecimen: (input: unknown) => Specimen = Reflect.apply(S.decodeUnknownSync, undefined, [Specimen]);

const makeInitialSpecimen = (config: SpecimenConfigShape): Specimen =>
  decodeSpecimen({
    createdAt: 1,
    createdByPrincipal: systemPrincipal,
    entityType: Specimen.definition.entityId.entityType,
    fixtureKey: config.server.initialSpecimenId,
    id: 1,
    label: config.public.labelPrefix,
    orgId: 1,
    rowVersion: 1,
    schemaVersion: "0.0.0",
    source: "System",
    status: "draft",
    updatedAt: 1,
    updatedByPrincipal: systemPrincipal,
  });

const getStoredSpecimen = (store: Ref.Ref<Specimen>, id: string): Effect.Effect<Specimen, SpecimenRepositoryNotFound> =>
  Ref.get(store).pipe(
    Effect.flatMap((specimen) =>
      specimen.fixtureKey === id ? Effect.succeed(specimen) : Effect.fail(new SpecimenRepositoryNotFound({ id }))
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
