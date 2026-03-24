import { VERSION } from "@beep/shared-env";
import { describe, expect, it } from "vitest";

describe("@beep/shared-env", () => {
  it("exports the package version constant", () => {
    expect(VERSION).toBe("0.0.0");
  });
});
