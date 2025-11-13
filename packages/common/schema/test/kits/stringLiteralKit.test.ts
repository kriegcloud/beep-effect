import { describe, expect, it } from "bun:test";
import { stringLiteralKit } from "@beep/schema/kits/stringLiteralKit";

describe("stringLiteralKit with pick and omit", () => {
  it("maps literals to custom enum keys when enumMapping is provided", () => {
    const Kit = stringLiteralKit("beep", "hole", {
      enumMapping: [
        ["beep", "BEEP"],
        ["hole", "HOLE"],
      ],
    });
    expect(Kit.Enum.BEEP).toBe("beep");
    expect(Kit.Enum.HOLE).toBe("hole");
  });
});
