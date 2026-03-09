import {
  ColorValue,
  Darken,
  DesktopTheme,
  GenerateAlphaScale,
  GenerateNeutralScale,
  GenerateScale,
  HexColor,
  HexColorInput,
  HexColorScale12,
  HexToOklch,
  HexToRgb,
  Lighten,
  MixColors,
  NormalizeHexColor,
  OklchColor,
  OklchInput,
  OklchToHex,
  OklchToRgb,
  ResolvedTheme,
  Rgb,
  RgbInput,
  RgbToHex,
  RgbToOklch,
  WithAlpha,
} from "@beep/schema";
import { describe, expect, it } from "@effect/vitest";
import * as S from "effect/Schema";

describe("HexColorInput", () => {
  const decode = S.decodeUnknownSync(HexColorInput);

  it("accepts shorthand hex input", () => {
    expect(decode("#AbC")).toBe("#AbC");
  });

  it("rejects invalid hex input", () => {
    expect(() => decode("#abcd")).toThrow("Hex colors must look like #rgb or #rrggbb");
  });
});

describe("NormalizeHexColor", () => {
  const decode = S.decodeUnknownSync(NormalizeHexColor);

  it("normalizes shorthand and mixed-case hex input", () => {
    expect(decode("#AbC")).toBe("#aabbcc");
  });
});

describe("HexColor", () => {
  const decode = S.decodeUnknownSync(HexColor);

  it("accepts canonical lowercase hex", () => {
    expect(decode("#aabbcc")).toBe("#aabbcc");
  });

  it("rejects non-canonical hex", () => {
    expect(() => decode("#AABBCC")).toThrow("Hex colors must be canonical lowercase #rrggbb strings");
  });
});

describe("Rgb", () => {
  const decode = S.decodeUnknownSync(Rgb);

  it("accepts normalized RGB channels", () => {
    const value = decode({ r: 0.5, g: 0.25, b: 1 });

    expect(value).toBeInstanceOf(Rgb);
  });

  it("rejects out-of-range channels", () => {
    expect(() => decode({ r: 1.5, g: 0.25, b: 1 })).toThrow("RGB channels must be between 0 and 1");
  });
});

describe("OklchColor", () => {
  const decode = S.decodeUnknownSync(OklchColor);

  it("accepts canonical OKLCH coordinates", () => {
    const value = decode({ l: 0.7, c: 0.2, h: 120 });

    expect(value).toBeInstanceOf(OklchColor);
  });

  it("rejects negative chroma", () => {
    expect(() => decode({ l: 0.7, c: -0.1, h: 120 })).toThrow("OKLCH chroma must be greater than or equal to 0");
  });
});

describe("HexToRgb", () => {
  const decode = S.decodeUnknownSync(HexToRgb);
  const encode = S.encodeSync(HexToRgb);

  it("decodes shorthand hex into normalized RGB", () => {
    expect(decode("#0f0")).toEqual(Rgb.makeUnsafe({ r: 0, g: 1, b: 0 }));
  });

  it("encodes RGB back to canonical hex", () => {
    expect(encode(Rgb.makeUnsafe({ r: 0, g: 1, b: 0 }))).toBe("#00ff00");
  });
});

describe("RgbToHex", () => {
  const decode = S.decodeUnknownSync(RgbToHex);

  it("clamps and rounds finite RGB input before encoding to hex", () => {
    expect(decode({ r: 1.2, g: -0.1, b: 0.5 })).toBe("#ff0080");
  });
});

describe("RgbToOklch and OklchToRgb", () => {
  const decodeRgbToOklch = S.decodeUnknownSync(RgbToOklch);
  const decodeOklchToRgb = S.decodeUnknownSync(OklchToRgb);

  it("converts RGB into canonical OKLCH", () => {
    const value = decodeRgbToOklch({ r: 1, g: 0, b: 0 });

    expect(value).toBeInstanceOf(OklchColor);
  });

  it("converts OKLCH input into finite RGB input", () => {
    const value = decodeOklchToRgb({ l: 0.7, c: 0.2, h: 30 });

    expect(value).toBeInstanceOf(RgbInput);
  });
});

describe("HexToOklch and OklchToHex", () => {
  const decodeHexToOklch = S.decodeUnknownSync(HexToOklch);
  const decodeOklchToHex = S.decodeUnknownSync(OklchToHex);

  it("converts hex into canonical OKLCH", () => {
    const value = decodeHexToOklch("#ff0000");

    expect(value).toBeInstanceOf(OklchColor);
  });

  it("encodes OKLCH input into canonical hex", () => {
    expect(
      decodeOklchToHex(OklchInput.makeUnsafe({ l: 0.6279553606145516, c: 0.2576833077361567, h: 29.2338851923426 }))
    ).toBe("#ff0000");
  });
});

describe("Scale helpers", () => {
  const decodeGenerateScale = S.decodeUnknownSync(GenerateScale);
  const decodeGenerateNeutralScale = S.decodeUnknownSync(GenerateNeutralScale);
  const decodeGenerateAlphaScale = S.decodeUnknownSync(GenerateAlphaScale);
  const decodeScale = S.decodeUnknownSync(HexColorScale12);

  it("generates a 12-step chromatic scale", () => {
    expect(decodeGenerateScale({ seed: "#0f0", isDark: false })).toHaveLength(12);
  });

  it("generates a 12-step neutral scale", () => {
    expect(decodeGenerateNeutralScale({ seed: "#0f0", isDark: true })).toHaveLength(12);
  });

  it("generates a 12-step alpha scale", () => {
    const scale = decodeScale([
      "#111111",
      "#222222",
      "#333333",
      "#444444",
      "#555555",
      "#666666",
      "#777777",
      "#888888",
      "#999999",
      "#aaaaaa",
      "#bbbbbb",
      "#cccccc",
    ]);

    expect(decodeGenerateAlphaScale({ scale, isDark: false })).toHaveLength(12);
  });

  it("rejects scales with the wrong length", () => {
    expect(() =>
      decodeGenerateAlphaScale({
        scale: ["#111111"],
        isDark: false,
      })
    ).toThrow("Hex color scales must contain exactly 12 colors");
  });
});

describe("Color helper request schemas", () => {
  const decodeMixColors = S.decodeUnknownSync(MixColors);
  const decodeLighten = S.decodeUnknownSync(Lighten);
  const decodeDarken = S.decodeUnknownSync(Darken);
  const decodeWithAlpha = S.decodeUnknownSync(WithAlpha);

  it("mixes two colors into canonical hex", () => {
    expect(decodeMixColors({ color1: "#f00", color2: "#00f", amount: 0.5 })).toMatch(/^#[0-9a-f]{6}$/);
  });

  it("lightens a color", () => {
    expect(decodeLighten({ color: "#336699", amount: 0.2 })).toMatch(/^#[0-9a-f]{6}$/);
  });

  it("darkens a color", () => {
    expect(decodeDarken({ color: "#336699", amount: 0.2 })).toMatch(/^#[0-9a-f]{6}$/);
  });

  it("renders rgba strings", () => {
    expect(decodeWithAlpha({ color: "#f00", alpha: 0.25 })).toBe("rgba(255, 0, 0, 0.25)");
  });
});

describe("Theme schemas", () => {
  const decodeDesktopTheme = S.decodeUnknownSync(DesktopTheme);
  const decodeColorValue = S.decodeUnknownSync(ColorValue);
  const decodeResolvedTheme = S.decodeUnknownSync(ResolvedTheme);

  it("decodes theme color values from css var refs or normalized hex", () => {
    expect(decodeColorValue("#AbC")).toBe("#aabbcc");
    expect(decodeColorValue("var(--surface-primary)")).toBe("var(--surface-primary)");
  });

  it("decodes a desktop theme with optional overrides", () => {
    const theme = decodeDesktopTheme({
      name: " Beep Theme ",
      id: " beep-theme ",
      light: {
        seeds: {
          neutral: "#111",
          primary: "#222222",
          success: "#00ff00",
          warning: "#ffaa00",
          error: "#ff0000",
          info: "#0000ff",
          interactive: "#6633ff",
          diffAdd: "#00aa00",
          diffDelete: "#aa0000",
        },
      },
      dark: {
        seeds: {
          neutral: "#eeeeee",
          primary: "#abcdef",
          success: "#00ff00",
          warning: "#ffaa00",
          error: "#ff0000",
          info: "#0000ff",
          interactive: "#6633ff",
          diffAdd: "#00aa00",
          diffDelete: "#aa0000",
        },
        overrides: {
          " surface.primary ": "#abc",
          "text.primary": "var(--text-primary)",
        },
      },
    });

    expect(theme.name).toBe("Beep Theme");
    expect(theme.id).toBe("beep-theme");
    expect(theme.dark.overrides?.["surface.primary"]).toBe("#aabbcc");
  });

  it("decodes resolved theme records", () => {
    const resolved = decodeResolvedTheme({
      " text.primary ": "#fff",
      "surface.primary": "var(--surface-primary)",
    });

    expect(resolved["text.primary"]).toBe("#ffffff");
  });
});
