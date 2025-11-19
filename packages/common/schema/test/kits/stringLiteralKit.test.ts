import { describe, expect, it } from "bun:test";
import { StringLiteralKit } from "@beep/schema/derived";

describe("stringLiteralKit with pick and omit", () => {
  it("maps literals to custom enum keys when enumMapping is provided", () => {
    const Kit = StringLiteralKit("beep", "hole", {
      enumMapping: [
        ["beep", "BEEP"],
        ["hole", "HOLE"],
      ],
    });
    expect(Kit.Enum.BEEP).toBe("beep");
    expect(Kit.Enum.HOLE).toBe("hole");
  });
});
