import { SpecimenConfig } from "@beep/fixture-lab-specimen-config/layer";
import { specimenPublicConfig } from "@beep/fixture-lab-specimen-config/public";
import { SpecimenConfigTestLayer } from "@beep/fixture-lab-specimen-config/test";
import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";

describe("Specimen config fixture", () => {
  it.effect("provides a default public label prefix", () =>
    Effect.gen(function* () {
      const config = yield* specimenPublicConfig;

      expect(config.labelPrefix).toBe("Fixture");
    })
  );

  it.effect("provides the static test layer", () =>
    Effect.gen(function* () {
      const config = yield* SpecimenConfig;

      expect(config.server.initialSpecimenId).toBe("specimen-1");
    }).pipe(Effect.provide(SpecimenConfigTestLayer))
  );
});
