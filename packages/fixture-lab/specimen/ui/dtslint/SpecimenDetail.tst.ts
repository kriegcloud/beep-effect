import type { Specimen } from "@beep/fixture-lab-specimen-domain";
import { SpecimenDetail } from "@beep/fixture-lab-specimen-ui";
import type * as React from "react";
import { describe, expect, it } from "tstyche";

describe("@beep/fixture-lab-specimen-ui", () => {
  it("types the status detail component", () => {
    expect(SpecimenDetail).type.toBe<(props: { readonly specimen: Specimen }) => React.JSX.Element>();
  });
});
