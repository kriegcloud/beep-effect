import { Num } from "@beep/utils";
import { describe, expect, it } from "vitest";

describe("Number utilities", () => {
  it("refines positive numeric values", () => {
    expect(Num.isPositive(0)).toBe(true);
    expect(Num.isPositive(42)).toBe(true);
    expect(Num.isPositive(-1)).toBe(false);
    expect(Num.isPositive("42")).toBe(false);
  });

  it("refines integer numeric values", () => {
    expect(Num.isInteger(42)).toBe(true);
    expect(Num.isInteger(3.14)).toBe(false);
    expect(Num.isInteger("42")).toBe(false);
  });
});
