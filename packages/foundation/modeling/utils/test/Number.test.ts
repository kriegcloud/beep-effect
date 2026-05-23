import { N } from "@beep/utils";
import { describe, expect, it } from "vitest";

describe("Number utilities", () => {
  it("refines positive numeric values", () => {
    expect(N.isPositive(0)).toBe(true);
    expect(N.isPositive(42)).toBe(true);
    expect(N.isPositive(-1)).toBe(false);
    expect(N.isPositive("42")).toBe(false);
  });

  it("refines integer numeric values", () => {
    expect(N.isInteger(42)).toBe(true);
    expect(N.isInteger(3.14)).toBe(false);
    expect(N.isInteger("42")).toBe(false);
  });
});
