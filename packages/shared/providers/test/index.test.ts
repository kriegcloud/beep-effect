import { VERSION } from "@beep/shared-providers";
import { describe, expect, it } from "vitest";

describe("@beep/shared-providers", () => {
  it("exports the package version constant", () => {
    expect(VERSION).toBe("0.0.0");
  });
});
