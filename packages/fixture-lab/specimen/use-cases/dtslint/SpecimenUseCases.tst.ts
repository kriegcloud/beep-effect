import type { Specimen } from "@beep/fixture-lab-specimen-domain";
import {
  GetSpecimen,
  ObserveSpecimen,
  type SpecimenNotFound,
  type SpecimenUseCases,
} from "@beep/fixture-lab-specimen-use-cases/public";
import {
  makeSpecimenUseCases,
  type SpecimenRepository,
  type SpecimenRepositoryNotFound,
} from "@beep/fixture-lab-specimen-use-cases/server";
import { Effect } from "effect";
import { describe, expect, it } from "tstyche";

declare const specimen: Specimen;

describe("@beep/fixture-lab-specimen-use-cases", () => {
  it("types the command facade and repository boundary", () => {
    const repository: SpecimenRepository = {
      get: () => Effect.succeed(specimen),
      save: Effect.succeed,
    };
    const useCases = makeSpecimenUseCases(repository);

    expect(useCases).type.toBe<SpecimenUseCases>();
    expect(repository.get("specimen-1")).type.toBe<Effect.Effect<Specimen, SpecimenRepositoryNotFound>>();
    expect(useCases.getSpecimen(new GetSpecimen({ id: "specimen-1" }))).type.toBe<
      Effect.Effect<Specimen, SpecimenNotFound>
    >();
    expect(useCases.observeSpecimen(new ObserveSpecimen({ id: "specimen-1" }))).type.toBe<
      Effect.Effect<Specimen, SpecimenNotFound>
    >();
  });
});
