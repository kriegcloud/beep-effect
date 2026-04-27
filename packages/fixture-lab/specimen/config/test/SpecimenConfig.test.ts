import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";
import { SpecimenConfig } from "../src/Layer.js";
import { specimenPublicConfig } from "../src/PublicConfig.js";
import { SpecimenConfigTestLayer } from "../src/TestLayer.js";

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
