import type { SpecimenStatus } from "@beep/fixture-lab-specimen-domain";
import * as O from "effect/Option";
import { describe, expect, it } from "tstyche";
import { SpecimenReadModel, specimenReadModelColumns, specimenTableName } from "../src/index.ts";

describe("@beep/fixture-lab-specimen-tables", () => {
  it("types the read model and table metadata", () => {
    const row = new SpecimenReadModel({
      id: "specimen-1",
      label: "Fixture",
      observedAtIso: O.none(),
      status: "draft",
    });

    expect(row.status).type.toBe<SpecimenStatus>();
    expect(specimenTableName).type.toBe<"fixture_lab_specimen">();
    expect(specimenReadModelColumns.status).type.toBe<string>();
  });
});
