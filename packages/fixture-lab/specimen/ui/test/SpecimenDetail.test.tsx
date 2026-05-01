import { Specimen } from "@beep/fixture-lab-specimen-domain";
import { SpecimenDetail } from "@beep/fixture-lab-specimen-ui";
import { describe, expect, it } from "@effect/vitest";
import { render, screen } from "@testing-library/react";
import * as S from "effect/Schema";

const systemPrincipal = { kind: "System", component: "Runtime" } as const;

const makeSpecimen = (): Specimen =>
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
    status: "observed",
    updatedAt: 1,
    updatedByPrincipal: systemPrincipal,
  });

describe("Specimen UI fixture", () => {
  it("renders the specimen status", () => {
    render(<SpecimenDetail specimen={makeSpecimen()} />);

    expect(screen.getByText("observed")).toBeDefined();
  });
});
