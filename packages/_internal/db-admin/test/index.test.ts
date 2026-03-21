import { VERSION } from "@beep/db-admin";
import { describe, expect, it } from "vitest";

describe("@beep/db-admin", () => {
  it("exports the package version constant", () => {
    expect(VERSION).toBe("0.0.0");
  });
});
