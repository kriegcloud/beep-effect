import {
  observeSpecimen,
  type Specimen,
  type SpecimenStatus,
  type SpecimenStatus as SpecimenStatusType,
} from "@beep/fixture-lab-specimen-domain";
import { describe, expect, it } from "tstyche";

declare const specimen: Specimen;

describe("@beep/fixture-lab-specimen-domain", () => {
  it("exposes schema-backed lifecycle types", () => {
    expect<typeof SpecimenStatus.Type>().type.toBe<SpecimenStatusType>();
    expect<SpecimenStatusType>().type.toBe<"draft" | "observed" | "retired">();
  });

  it("preserves lifecycle helper input and output types", () => {
    expect(specimen).type.toBe<Specimen>();
    expect(observeSpecimen(specimen)).type.toBe<Specimen>();
  });
});
