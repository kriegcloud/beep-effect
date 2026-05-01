import { observeSpecimen, retireSpecimen, Specimen, SpecimenStatus } from "@beep/fixture-lab-specimen-domain";
import { describe, expect, it } from "@effect/vitest";
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

describe("Specimen domain fixture", () => {
  it("moves through the minimal lifecycle", () => {
    const draft = makeSpecimen();
    const observed = observeSpecimen(draft);
    const retired = retireSpecimen(observed);

    expect(SpecimenStatus.is.observed(observed.status)).toBe(true);
    expect(observed.status).toBe("observed");
    expect(retired.status).toBe("retired");
  });
});
