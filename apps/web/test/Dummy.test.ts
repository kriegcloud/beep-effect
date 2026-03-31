import { VERSION } from "@beep/shared-ui";
import { describe, expect, it } from "vitest";

describe("@beep/shared-ui", () => {
  it("exports the package version constant", () => {
    expect(VERSION).toBe("0.0.0");
  });
});
