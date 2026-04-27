import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";
import { Specimen } from "../../domain/src/index.js";
import { makeSpecimenUseCases, ObserveSpecimen } from "../src/server.js";

describe("Specimen use-case fixture", () => {
  it("observes a specimen through the command facade", async () => {
    let current = new Specimen({ id: "specimen-1", label: "Fixture", status: "draft" });
    const useCases = makeSpecimenUseCases({
      get: () => Effect.succeed(current),
      save: (specimen) =>
        Effect.sync(() => {
          current = specimen;
          return specimen;
        }),
    });

    const observed = await Effect.runPromise(useCases.observeSpecimen(new ObserveSpecimen({ id: current.id })));

    expect(observed.status).toBe("observed");
  });
});
