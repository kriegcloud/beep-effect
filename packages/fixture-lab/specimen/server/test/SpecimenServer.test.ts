import { SpecimenConfigTestLayer } from "@beep/fixture-lab-specimen-config/test";
import { makeSpecimenServer } from "@beep/fixture-lab-specimen-server";
import { ObserveSpecimen } from "@beep/fixture-lab-specimen-use-cases/public";
import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";

describe("Specimen server fixture", () => {
  it.effect("wires use-cases to an implementation", () =>
    Effect.gen(function* () {
      const server = yield* makeSpecimenServer();
      const result = yield* server.observeSpecimen(new ObserveSpecimen({ id: "specimen-1" }));

      expect(result.status).toBe("observed");
    }).pipe(Effect.provide(SpecimenConfigTestLayer))
  );
});
