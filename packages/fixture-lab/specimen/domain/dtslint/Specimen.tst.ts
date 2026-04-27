import { describe, expect, it } from "tstyche";
import {
  observeSpecimen,
  Specimen,
  type SpecimenStatus,
  type SpecimenStatus as SpecimenStatusType,
} from "../src/index.ts";

describe("@beep/fixture-lab-specimen-domain", () => {
  it("exposes schema-backed lifecycle types", () => {
    expect<typeof SpecimenStatus.Type>().type.toBe<SpecimenStatusType>();
    expect<SpecimenStatusType>().type.toBe<"draft" | "observed" | "retired">();
  });

  it("preserves lifecycle helper input and output types", () => {
    const specimen = new Specimen({ id: "specimen-1", label: "Fixture", status: "draft" });

    expect(specimen).type.toBe<Specimen>();
    expect(observeSpecimen(specimen)).type.toBe<Specimen>();
  });
});
