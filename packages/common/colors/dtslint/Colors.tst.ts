import { describe, expect, it } from "tstyche";
import colors, { type Colors, createColors, type Formatter, isColorSupported, supportsColor } from "../src/index.ts";

describe("@beep/colors", () => {
  it("exposes a shared Colors instance and typed constructors", () => {
    expect(colors).type.toBe<Colors>();
    expect(createColors()).type.toBe<Colors>();
    expect(createColors(false)).type.toBe<Colors>();
    expect(isColorSupported).type.toBe<boolean>();
    expect(supportsColor()).type.toBe<boolean>();
  });

  it("keeps formatter functions unary over string, number, and undefined", () => {
    expect(colors.red).type.toBe<Formatter>();
    expect(createColors(true).bold("beep")).type.toBe<string>();
    expect(createColors(true).bold(42)).type.toBe<string>();
    expect(createColors(true).bold(undefined)).type.toBe<string>();
  });

  it("rejects invalid process-like shapes", () => {
    // @ts-expect-error Type 'string' is not assignable to type 'boolean | undefined'.
    supportsColor({ stdout: { isTTY: "yes" } });
  });
});
