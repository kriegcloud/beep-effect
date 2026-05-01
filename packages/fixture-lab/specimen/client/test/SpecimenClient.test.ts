import { makeSpecimenClient } from "@beep/fixture-lab-specimen-client";
import { Specimen } from "@beep/fixture-lab-specimen-domain";
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

describe("Specimen client fixture", () => {
  it("wraps transport calls", async () => {
    const client = makeSpecimenClient({
      request: () => Effect.succeed(makeSpecimen("observed")),
    });

    const result = await Effect.runPromise(client.getSpecimen("specimen-1"));

    expect(result.status).toBe("observed");
  });
});
