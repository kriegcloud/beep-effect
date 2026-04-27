import { Specimen } from "@beep/fixture-lab-specimen-domain";
import { Effect } from "effect";
import { describe, expect, it } from "tstyche";
import { GetSpecimen, ObserveSpecimen, type SpecimenNotFound, type SpecimenUseCases } from "../src/public.ts";
import { makeSpecimenUseCases, type SpecimenRepository } from "../src/server.ts";

describe("@beep/fixture-lab-specimen-use-cases", () => {
  it("types the command facade and repository boundary", () => {
    const specimen = new Specimen({ id: "specimen-1", label: "Fixture", status: "draft" });
    const repository: SpecimenRepository = {
      get: () => Effect.succeed(specimen),
      save: Effect.succeed,
    };
    const useCases = makeSpecimenUseCases(repository);

    expect(useCases).type.toBe<SpecimenUseCases>();
    expect(useCases.getSpecimen(new GetSpecimen({ id: "specimen-1" }))).type.toBe<
      Effect.Effect<Specimen, SpecimenNotFound>
    >();
    expect(useCases.observeSpecimen(new ObserveSpecimen({ id: "specimen-1" }))).type.toBe<
      Effect.Effect<Specimen, SpecimenNotFound>
    >();
  });
});
