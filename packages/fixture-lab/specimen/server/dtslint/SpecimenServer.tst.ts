import type { SpecimenConfig } from "@beep/fixture-lab-specimen-config/layer";
import {
  makeSpecimenServer,
  SpecimenServer,
  SpecimenServerLayer,
  SpecimenServerLive,
} from "@beep/fixture-lab-specimen-server";
import type { SpecimenUseCases } from "@beep/fixture-lab-specimen-use-cases/public";
import type { Effect } from "effect";
import { describe, expect, it } from "tstyche";

describe("@beep/fixture-lab-specimen-server", () => {
  it("types the server constructor and layer", () => {
    expect(makeSpecimenServer()).type.toBe<Effect.Effect<SpecimenUseCases, never, SpecimenConfig>>();
    expect(SpecimenServer).type.toBe<typeof SpecimenServer>();
    expect(SpecimenServerLayer).type.not.toBe<never>();
    expect(SpecimenServerLive).type.not.toBe<never>();
  });
});
