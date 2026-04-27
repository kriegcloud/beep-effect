import { Specimen } from "@beep/fixture-lab-specimen-domain";
import type { SpecimenNotFound } from "@beep/fixture-lab-specimen-use-cases/public";
import { Effect } from "effect";
import { describe, expect, it } from "tstyche";
import { makeSpecimenClient, type SpecimenClient, type SpecimenClientTransport } from "../src/index.ts";

describe("@beep/fixture-lab-specimen-client", () => {
  it("types the client facade over a transport boundary", () => {
    const transport: SpecimenClientTransport = {
      request: () => Effect.succeed(new Specimen({ id: "specimen-1", label: "Fixture", status: "observed" })),
    };
    const client = makeSpecimenClient(transport);

    expect(client).type.toBe<SpecimenClient>();
    expect(client.getSpecimen("specimen-1")).type.toBe<Effect.Effect<Specimen, SpecimenNotFound>>();
  });
});
