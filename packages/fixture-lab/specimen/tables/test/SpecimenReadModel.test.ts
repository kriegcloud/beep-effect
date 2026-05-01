import { SpecimenReadModel, specimenReadModelColumns, specimenTableName } from "@beep/fixture-lab-specimen-tables";
import { describe, expect, it } from "@effect/vitest";
import * as O from "effect/Option";

describe("Specimen read-model fixture", () => {
  it("declares the table contract", () => {
    const row = new SpecimenReadModel({
      id: "specimen-1",
      label: "Fixture",
      status: "observed",
      observedAtIso: O.some("2026-04-27T00:00:00.000Z"),
    });

    expect(row.status).toBe("observed");
    expect(specimenTableName).toBe("fixture_lab_specimen");
    expect(specimenReadModelColumns.status).toBe("text not null");
  });
});
