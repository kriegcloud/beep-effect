import { VERSION } from "@beep/shared-server";
import { describe, expect, it } from "vitest";

describe("@beep/shared-server", () => {
  it("exports the package version constant", () => {
    expect(VERSION).toBe("0.0.0");
  });
});
