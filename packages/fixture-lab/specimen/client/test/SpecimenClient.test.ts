import { makeSpecimenClient } from "@beep/fixture-lab-specimen-client";
import { Specimen } from "@beep/fixture-lab-specimen-domain";
import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";

describe("Specimen client fixture", () => {
  it("wraps transport calls", async () => {
    const client = makeSpecimenClient({
      request: () => Effect.succeed(new Specimen({ id: "specimen-1", label: "Fixture", status: "observed" })),
    });

    const result = await Effect.runPromise(client.getSpecimen("specimen-1"));

    expect(result.status).toBe("observed");
  });
});
