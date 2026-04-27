import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";
import { SpecimenConfigTestLayer } from "../../config/src/TestLayer.js";
import { ObserveSpecimen } from "../../use-cases/src/public.js";
import { makeSpecimenServer } from "../src/index.js";

describe("Specimen server fixture", () => {
  it.effect("wires use-cases to an implementation", () =>
    Effect.gen(function* () {
      const server = yield* makeSpecimenServer();
      const result = yield* server.observeSpecimen(new ObserveSpecimen({ id: "specimen-1" }));

      expect(result.status).toBe("observed");
    }).pipe(Effect.provide(SpecimenConfigTestLayer))
  );
});
