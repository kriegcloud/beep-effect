import { describe, expect, it } from "tstyche";
import { loadSpecimenConfig, SpecimenConfig } from "../src/Layer.ts";
import type { SpecimenPublicConfig } from "../src/PublicConfig.ts";
import type { SpecimenSecretConfig } from "../src/Secrets.ts";

describe("@beep/fixture-lab-specimen-config", () => {
  it("types the resolved config service", () => {
    expect<SpecimenPublicConfig["labelPrefix"]>().type.toBe<string>();
    expect<SpecimenSecretConfig["signingSecret"]>().type.not.toBe<string>();
    expect(SpecimenConfig).type.toBe<typeof SpecimenConfig>();
    expect(loadSpecimenConfig).type.not.toBe<never>();
  });
});
