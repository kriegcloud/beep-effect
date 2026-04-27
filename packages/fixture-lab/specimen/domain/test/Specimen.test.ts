import { describe, expect, it } from "@effect/vitest";
import { observeSpecimen, retireSpecimen, Specimen, SpecimenStatus } from "../src/index.js";

describe("Specimen domain fixture", () => {
  it("moves through the minimal lifecycle", () => {
    const draft = new Specimen({ id: "specimen-1", label: "Fixture", status: "draft" });
    const observed = observeSpecimen(draft);
    const retired = retireSpecimen(observed);

    expect(SpecimenStatus.is.observed(observed.status)).toBe(true);
    expect(observed.status).toBe("observed");
    expect(retired.status).toBe("retired");
  });
});
