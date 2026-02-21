import { NotInLiteralsError, StringLiteralKit } from "@beep/schema/StringLiteralKit.schema";
import { describe, expect, it } from "@effect/vitest";

describe("StringLiteralKit", () => {
  const WaveformMode = StringLiteralKit(["static", "scrolling"] as const);

  it("exposes Options with the original literal tuple", () => {
    expect(WaveformMode.Options).toEqual(["static", "scrolling"]);
  });

  it("creates an identity Enum map", () => {
    expect(WaveformMode.Enum.static).toBe("static");
    expect(WaveformMode.Enum.scrolling).toBe("scrolling");
  });

  it("creates per-literal guards", () => {
    expect(WaveformMode.is.static("static")).toBe(true);
    expect(WaveformMode.is.static("scrolling")).toBe(false);
    expect(WaveformMode.is.scrolling("scrolling")).toBe(true);
    expect(WaveformMode.is.scrolling("static")).toBe(false);
    expect(WaveformMode.is.static(null)).toBe(false);
  });

  it("returns the provided subset with pickOptions", () => {
    const picked = WaveformMode.pickOptions(["scrolling"] as const);
    expect(picked).toEqual(["scrolling"]);
  });

  it("omits literals outside the provided subset", () => {
    const omitted = WaveformMode.omitOptions(["scrolling"] as const);
    expect(omitted).toEqual(["static"]);
  });

  it("throws NotInLiteralsError when omitOptions removes every literal", () => {
    expect(() => WaveformMode.omitOptions(["static", "scrolling"] as const)).toThrow(NotInLiteralsError);
  });

  it("matches literals in uncurried form", () => {
    const result = WaveformMode.$match("static", {
      static: (value) => `mode:${value}`,
      scrolling: (value) => `mode:${value}`,
    });

    expect(result).toBe("mode:static");
  });

  it("matches literals in curried form with literal narrowing", () => {
    const matcher = WaveformMode.$match({
      static: (value) => {
        const narrowed: "static" = value;
        return narrowed;
      },
      scrolling: (value) => {
        const narrowed: "scrolling" = value;
        return narrowed;
      },
    });

    expect(matcher("static")).toBe("static");
    expect(matcher("scrolling")).toBe("scrolling");
  });
});
