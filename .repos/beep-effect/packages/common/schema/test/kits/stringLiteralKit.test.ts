import { describe, expect, it } from "bun:test";
import { StringLiteralKit } from "@beep/schema/derived";

describe("stringLiteralKit with pick and omit", () => {
  it("maps literals to custom enum keys when enumMapping is provided", () => {
    const Kit = StringLiteralKit("beep", "hole", {
      enumMapping: [
        ["beep", "BEEP"],
        ["hole", "HOLE"],
      ],
    });
    expect(Kit.Enum.BEEP).toBe("beep");
    expect(Kit.Enum.HOLE).toBe("hole");
  });
});

describe("stringLiteralKit.$match", () => {
  it("matches literals in uncurried form", () => {
    const WaveformMode = StringLiteralKit("static", "scrolling");

    const result = WaveformMode.$match("static", {
      static: (value) => `mode:${value}`,
      scrolling: (value) => `mode:${value}`,
    });

    expect(result).toBe("mode:static");
  });

  it("matches literals in curried form with literal narrowing", () => {
    const WaveformMode = StringLiteralKit("static", "scrolling");

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

  it("remains available when used via class extension and annotations", () => {
    class WaveformMode extends StringLiteralKit("static", "scrolling").annotations({
      description: "The mode of the live waveform",
    }) {}

    const result = WaveformMode.$match("scrolling", {
      static: () => "fixed",
      scrolling: () => "animated",
    });

    expect(result).toBe("animated");
  });
});
