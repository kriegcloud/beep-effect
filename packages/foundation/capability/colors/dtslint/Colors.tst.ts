import colors, { createColors, isColorSupported, supportsColor } from "@beep/colors";
import browserColors, { type Formatter as BrowserFormatter } from "@beep/colors/Colors.browser";
import { describe, expect, it } from "tstyche";
import type { Colors, Formatter, ProcessLike, ProcessLikeStdout } from "@beep/colors";

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
    expect(browserColors.red).type.toBe<BrowserFormatter>();
    expect(createColors(true).bold("beep")).type.toBe<string>();
    expect(createColors(true).bold(42)).type.toBe<string>();
    expect(createColors(true).bold(undefined)).type.toBe<string>();
  });

  it("exposes schema-backed process-like detection input types", () => {
    expect<ProcessLike["env"]>().type.toBe<Readonly<Record<string, string | undefined>> | undefined>();
    expect<ProcessLikeStdout["isTTY"]>().type.toBe<boolean | undefined>();
  });

  it("rejects invalid process-like shapes", () => {
    // @ts-expect-error Type 'string' is not assignable to type 'boolean | undefined'.
    supportsColor({ stdout: { isTTY: "yes" } });
  });
});
