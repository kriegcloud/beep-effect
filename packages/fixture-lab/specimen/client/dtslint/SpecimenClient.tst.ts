import {
  makeSpecimenClient,
  type SpecimenClient,
  type SpecimenClientTransport,
} from "@beep/fixture-lab-specimen-client";
import type { Specimen } from "@beep/fixture-lab-specimen-domain";
import type { SpecimenNotFound } from "@beep/fixture-lab-specimen-use-cases/public";
import { Effect } from "effect";
import { describe, expect, it } from "tstyche";

declare const specimen: Specimen;

describe("@beep/fixture-lab-specimen-client", () => {
  it("types the client facade over a transport boundary", () => {
    const transport: SpecimenClientTransport = {
      request: () => Effect.succeed(specimen),
    };
    const client = makeSpecimenClient(transport);

    expect(client).type.toBe<SpecimenClient>();
    expect(client.getSpecimen("specimen-1")).type.toBe<Effect.Effect<Specimen, SpecimenNotFound>>();
  });
});
