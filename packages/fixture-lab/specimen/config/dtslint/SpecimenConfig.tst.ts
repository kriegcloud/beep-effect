import { loadSpecimenConfig, SpecimenConfig } from "@beep/fixture-lab-specimen-config/layer";
import type { SpecimenPublicConfig } from "@beep/fixture-lab-specimen-config/public";
import type { SpecimenSecretConfig } from "@beep/fixture-lab-specimen-config/secrets";
import { describe, expect, it } from "tstyche";

describe("@beep/fixture-lab-specimen-config", () => {
  it("types the resolved config service", () => {
    expect<SpecimenPublicConfig["labelPrefix"]>().type.toBe<string>();
    expect<SpecimenSecretConfig["signingSecret"]>().type.not.toBe<string>();
    expect(SpecimenConfig).type.toBe<typeof SpecimenConfig>();
    expect(loadSpecimenConfig).type.not.toBe<never>();
  });
});
