import { VERSION } from "@beep/shared-config";
import { describe, expect, it } from "vitest";

describe("@beep/shared-config", () => {
  it("exports the package version constant", () => {
    expect(VERSION).toBe("0.0.0");
  });
});
