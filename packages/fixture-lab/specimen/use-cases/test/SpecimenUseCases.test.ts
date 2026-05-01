import { Specimen } from "@beep/fixture-lab-specimen-domain";
import { GetSpecimen, ObserveSpecimen, SpecimenNotFound } from "@beep/fixture-lab-specimen-use-cases/public";
import { makeSpecimenUseCases, SpecimenRepositoryNotFound } from "@beep/fixture-lab-specimen-use-cases/server";
import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";
import * as S from "effect/Schema";

const systemPrincipal = { kind: "System", component: "Runtime" } as const;

const makeSpecimen = (status: "draft" | "observed" | "retired" = "draft"): Specimen =>
  S.decodeUnknownSync(Specimen)({
    createdAt: 1,
    createdByPrincipal: systemPrincipal,
    entityType: Specimen.definition.entityId.entityType,
    fixtureKey: "specimen-1",
    id: 1,
    label: "Fixture",
    orgId: 1,
    rowVersion: 1,
    schemaVersion: "0.0.0",
    source: "System",
    status,
    updatedAt: 1,
    updatedByPrincipal: systemPrincipal,
  });

describe("Specimen use-case fixture", () => {
  it("observes a specimen through the command facade", async () => {
    let current = makeSpecimen();
    const useCases = makeSpecimenUseCases({
      get: () => Effect.succeed(current),
      save: (specimen) =>
        Effect.sync(() => {
          current = specimen;
          return specimen;
        }),
    });

    const observed = await Effect.runPromise(useCases.observeSpecimen(new ObserveSpecimen({ id: current.fixtureKey })));

    expect(observed.status).toBe("observed");
  });

  it("translates repository errors into public action errors", async () => {
    const useCases = makeSpecimenUseCases({
      get: (id) => Effect.fail(new SpecimenRepositoryNotFound({ id })),
      save: Effect.succeed,
    });

    const error = await Effect.runPromise(Effect.flip(useCases.getSpecimen(new GetSpecimen({ id: "missing" }))));

    expect(error).toBeInstanceOf(SpecimenNotFound);
    expect(error).toMatchObject({ _tag: "SpecimenNotFound", id: "missing" });
  });
});
