import { VERSION } from "@beep/shared-tables";
import { describe, expect, it } from "vitest";

describe("@beep/shared-tables", () => {
  it("exports the package version constant", () => {
    expect(VERSION).toBe("0.0.0");
  });
});
