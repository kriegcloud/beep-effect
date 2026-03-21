import { VERSION } from "@beep/shared-client";
import { describe, expect, it } from "vitest";

describe("@beep/shared-client", () => {
  it("exports the package version constant", () => {
    expect(VERSION).toBe("0.0.0");
  });
});
