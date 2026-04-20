/**
 * Branded color domains and transformation schemas for hex, RGB, and OKLCH.
 *
 * @since 0.0.0
 * @module \@beep/schema/color/Color
 */

import { $SchemaId } from "@beep/identity/packages";
import { thunk0, thunk1 } from "@beep/utils";
import { flow, identity, Number as Num, pipe, SchemaGetter, SchemaTransformation } from "effect";
import * as A from "effect/Array";
import * as Bool from "effect/Boolean";
import * as S from "effect/Schema";
import * as Str from "effect/String";

const $I = $SchemaId.create("color/Color");

type RgbEncoded = {
  readonly r: number;
  readonly g: number;
  readonly b: number;
};

type OklchEncoded = {
  readonly l: number;
  readonly c: number;
  readonly h: number;
};

const hexColorInputPattern = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const hexColorPattern = /^#[0-9a-f]{6}$/;
const rgbaNumberPatternSource = "-?(?:0|[1-9]\\d*)(?:\\.\\d+)?(?:e[+-]?\\d+)?";
const rgbaColorPattern = new RegExp(
  `^rgba\\((?:\\d|[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5]), (?:\\d|[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5]), (?:\\d|[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5]), ${rgbaNumberPatternSource}\\)$`
);

const HexColorInputChecks = S.makeFilterGroup(
  [
    S.isPattern(hexColorInputPattern, {
      identifier: $I`HexColorInputPatternCheck`,
      title: "Hex Color Input Pattern",
      description: "A hex color string in #rgb or #rrggbb format.",
      message: "Hex colors must look like #rgb or #rrggbb",
    }),
  ],
  {
    identifier: $I`HexColorInputChecks`,
    title: "Hex Color Input",
    description: "Checks for shorthand and canonical hex color inputs.",
  }
);

const HexColorChecks = S.makeFilterGroup(
  [
    S.isPattern(hexColorPattern, {
      identifier: $I`HexColorPatternCheck`,
      title: "Canonical Hex Color Pattern",
      description: "A lowercase six-digit hex color string in #rrggbb format.",
      message: "Hex colors must be canonical lowercase #rrggbb strings",
    }),
  ],
  {
    identifier: $I`HexColorChecks`,
    title: "Hex Color",
    description: "Checks for canonical lowercase six-digit hex colors.",
  }
);

const HexColorScale12Checks = S.makeFilterGroup(
  [
    S.isLengthBetween(12, 12, {
      identifier: $I`HexColorScale12LengthCheck`,
      title: "Hex Color Scale Length",
      description: "A hex color scale containing exactly 12 entries.",
      message: "Hex color scales must contain exactly 12 colors",
    }),
  ],
  {
    identifier: $I`HexColorScale12Checks`,
    title: "Hex Color Scale",
    description: "Checks for fixed-size 12-step hex color scales.",
  }
);

const RgbChannelRangeCheck = S.isBetween(
  {
    minimum: 0,
    maximum: 1,
  },
  {
    identifier: $I`RgbChannelRangeCheck`,
    title: "RGB Channel Range",
    description: "An RGB color channel normalized to the range 0 through 1.",
    message: "RGB channels must be between 0 and 1",
  }
);

const OklchLightnessRangeCheck = S.isBetween(
  {
    minimum: 0,
    maximum: 1,
  },
  {
    identifier: $I`OklchLightnessRangeCheck`,
    title: "OKLCH Lightness Range",
    description: "OKLCH lightness normalized to the range 0 through 1.",
    message: "OKLCH lightness must be between 0 and 1",
  }
);

const OklchChromaCheck = S.makeFilter((value: number) => value >= 0, {
  identifier: $I`OklchChromaCheck`,
  title: "OKLCH Chroma Non-Negative",
  description: "OKLCH chroma expressed as a non-negative finite number.",
  message: "OKLCH chroma must be greater than or equal to 0",
});

const OklchHueRangeCheck = S.isBetween(
  {
    minimum: 0,
    maximum: 360,
  },
  {
    identifier: $I`OklchHueRangeCheck`,
    title: "OKLCH Hue Range",
    description: "OKLCH hue in degrees from 0 through 360.",
    message: "OKLCH hue must be between 0 and 360",
  }
);

const RgbaColorStringChecks = S.makeFilterGroup(
  [
    S.isPattern(rgbaColorPattern, {
      identifier: $I`RgbaColorStringPatternCheck`,
      title: "RGBA Color String Pattern",
      description: "A CSS rgba color string in the form rgba(r, g, b, a).",
      message: "RGBA colors must look like rgba(255, 255, 255, 1)",
    }),
  ],
  {
    identifier: $I`RgbaColorStringChecks`,
    title: "RGBA Color String",
    description: "Checks for CSS rgba color strings produced by with-alpha transformations.",
  }
);

const expandShortHex = (value: string): string =>
  value.length === 3 ? pipe(Str.split("")(value), A.map(Str.repeat(2)), A.join("")) : value;

const normalizeHexColorValue = flow(Str.substring(1), expandShortHex, Str.toLowerCase, (value) => `#${value}`);

const parseHexChannel = (hexBody: string, start: number): number =>
  globalThis.Number.parseInt(pipe(hexBody, Str.substring(start, start + 2)), 16) / 255;

const hexToRgbValue = (hex: string): RgbEncoded => {
  const canonical = normalizeHexColorValue(hex);
  const body = pipe(canonical, Str.substring(1));

  return {
    r: parseHexChannel(body, 0),
    g: parseHexChannel(body, 2),
    b: parseHexChannel(body, 4),
  };
};

const toHexChannel = (value: number): string =>
  pipe(
    Num.clamp(value, {
      minimum: 0,
      maximum: 1,
    }),
    (channel) => Math.round(channel * 255).toString(16),
    Str.padStart(2, "0"),
    Str.toLowerCase
  );

const rgbToHexValue = ({ r, g, b }: RgbEncoded): HexColor =>
  S.decodeUnknownSync(HexColor)(`#${toHexChannel(r)}${toHexChannel(g)}${toHexChannel(b)}`);

const linearToSrgb = (value: number): number => {
  if (value <= 0.0031308) {
    return value * 12.92;
  }

  return 1.055 * value ** (1 / 2.4) - 0.055;
};

const srgbToLinear = (value: number): number => {
  if (value <= 0.04045) {
    return value / 12.92;
  }

  return ((value + 0.055) / 1.055) ** 2.4;
};

const rgbToOklchValue = ({ r, g, b }: RgbEncoded): OklchEncoded => {
  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);

  const lInput = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
  const mInput = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
  const sInput = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;

  const l = Math.cbrt(lInput);
  const m = Math.cbrt(mInput);
  const s = Math.cbrt(sInput);

  const lightness = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const bValue = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const chroma = Math.sqrt(a * a + bValue * bValue);
  const rawHue = Math.atan2(bValue, a) * (180 / Math.PI);
  const hue = rawHue < 0 ? rawHue + 360 : rawHue;

  return {
    l: lightness,
    c: chroma,
    h: hue,
  };
};

const oklchToRgbValue = ({ l: lightness, c: chroma, h: hue }: OklchEncoded): RgbEncoded => {
  const a = chroma * Math.cos((hue * Math.PI) / 180);
  const bValue = chroma * Math.sin((hue * Math.PI) / 180);

  const l = lightness + 0.3963377774 * a + 0.2158037573 * bValue;
  const m = lightness - 0.1055613458 * a - 0.0638541728 * bValue;
  const s = lightness - 0.0894841775 * a - 1.291485548 * bValue;

  const l3 = l * l * l;
  const m3 = m * m * m;
  const s3 = s * s * s;

  const lr = 4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
  const lg = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  const lb = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3;

  return {
    r: linearToSrgb(lr),
    g: linearToSrgb(lg),
    b: linearToSrgb(lb),
  };
};

const oklchToHexValue = flow(oklchToRgbValue, rgbToHexValue);
const hexToOklchValue = flow(hexToRgbValue, rgbToOklchValue);

const darkScaleLightSteps = [0.15, 0.18, 0.22, 0.26, 0.32, 0.38, 0.46, 0.56] as const;
const darkScaleChromaMultipliers = () => [0.15, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.85, 1, 1, 0.9, 0.6] as const;
const lightScaleLightSteps = [0.99, 0.97, 0.94, 0.9, 0.85, 0.79, 0.72, 0.64] as const;
const lightScaleChromaMultipliers = () => [0.1, 0.15, 0.25, 0.35, 0.45, 0.55, 0.7, 0.85, 1, 1, 0.95, 0.85] as const;

const darkNeutralScaleLightSteps = () =>
  [0.13, 0.16, 0.2, 0.24, 0.28, 0.33, 0.4, 0.52, 0.58, 0.66, 0.82, 0.96] as const;
const lightNeutralScaleLightSteps = () =>
  [0.995, 0.98, 0.96, 0.94, 0.91, 0.88, 0.84, 0.78, 0.62, 0.56, 0.46, 0.2] as const;

const darkAlphaSteps = () => [0.02, 0.04, 0.08, 0.12, 0.16, 0.2, 0.26, 0.36, 0.44, 0.52, 0.76, 0.96] as const;
const lightAlphaSteps = () => [0.01, 0.03, 0.06, 0.09, 0.12, 0.15, 0.2, 0.28, 0.48, 0.56, 0.64, 0.88] as const;

const generateScaleValues = ({ seed, isDark }: GenerateScaleInput): HexColorScale12 => {
  const base = hexToOklchValue(seed);
  const lightSteps = Bool.match(isDark, {
    onTrue: () => [...darkScaleLightSteps, base.l, base.l - 0.05, 0.75, 0.93],
    onFalse: () => [...lightScaleLightSteps, base.l, base.l + 0.05, 0.45, 0.25],
  });
  const chromaMultipliers = Bool.match(isDark, {
    onTrue: darkScaleChromaMultipliers,
    onFalse: lightScaleChromaMultipliers,
  });

  return S.decodeUnknownSync(HexColorScale12)(
    A.zipWith(lightSteps, chromaMultipliers, (lightness, multiplier) =>
      oklchToHexValue({
        l: lightness,
        c: base.c * multiplier,
        h: base.h,
      })
    )
  );
};

const generateNeutralScaleValues = ({ seed, isDark }: GenerateNeutralScaleInput): HexColorScale12 => {
  const base = hexToOklchValue(seed);
  const neutralChroma = Num.min(base.c, 0.02);
  const lightSteps = Bool.match(isDark, {
    onTrue: darkNeutralScaleLightSteps,
    onFalse: lightNeutralScaleLightSteps,
  });

  return S.decodeUnknownSync(HexColorScale12)(
    A.map(lightSteps, (lightness) =>
      oklchToHexValue({
        l: lightness,
        c: neutralChroma,
        h: base.h,
      })
    )
  );
};

const generateAlphaScaleValues = ({ scale, isDark }: GenerateAlphaScaleInput): HexColorScale12 => {
  const alphas = Bool.match(isDark, {
    onTrue: darkAlphaSteps,
    onFalse: lightAlphaSteps,
  });
  const background = Bool.match(isDark, {
    onTrue: thunk0,
    onFalse: thunk1,
  });

  return S.decodeUnknownSync(HexColorScale12)(
    A.zipWith(scale, alphas, (hex, alpha) => {
      const { r, g, b } = hexToRgbValue(hex);

      return rgbToHexValue({
        r: r * alpha + background * (1 - alpha),
        g: g * alpha + background * (1 - alpha),
        b: b * alpha + background * (1 - alpha),
      });
    })
  );
};

const mixColorsValue = ({ color1, color2, amount }: MixColorsInput): HexColor => {
  const start = hexToOklchValue(color1);
  const end = hexToOklchValue(color2);

  return oklchToHexValue({
    l: start.l + (end.l - start.l) * amount,
    c: start.c + (end.c - start.c) * amount,
    h: start.h + (end.h - start.h) * amount,
  });
};

const lightenValue = ({ color, amount }: LightenInput): HexColor => {
  const value = hexToOklchValue(color);

  return oklchToHexValue({
    l: Num.min(value.l + amount, 1),
    c: value.c,
    h: value.h,
  });
};

const darkenValue = ({ color, amount }: DarkenInput): HexColor => {
  const value = hexToOklchValue(color);

  return oklchToHexValue({
    l: Num.max(value.l - amount, 0),
    c: value.c,
    h: value.h,
  });
};

const withAlphaValue = ({ color, alpha }: WithAlphaInput): RgbaColorString => {
  const { r, g, b } = hexToRgbValue(color);

  return S.decodeUnknownSync(RgbaColorString)(
    `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${alpha})`
  );
};

/**
 * Boundary schema for hex color input strings.
 *
 * @since 0.0.0
 * @category Validation
 */
export const HexColorInput = S.String.check(HexColorInputChecks).pipe(
  S.annotate(
    $I.annote("HexColorInput", {
      description: "A hex color string accepted at boundaries in #rgb or #rrggbb form.",
    })
  )
);

/**
 * Type for {@link HexColorInput}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type HexColorInput = typeof HexColorInput.Type;

/**
 * Canonical lowercase six-digit hex color schema.
 *
 * @since 0.0.0
 * @category Validation
 */
export const HexColor = S.String.check(HexColorChecks).pipe(
  S.brand("HexColor"),
  S.annotate(
    $I.annote("HexColor", {
      description: "A canonical lowercase six-digit hex color string.",
    })
  )
);

/**
 * Type for {@link HexColor}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type HexColor = typeof HexColor.Type;

/**
 * Canonicalization schema from boundary hex input to canonical hex output.
 *
 * @since 0.0.0
 * @category Validation
 */
export const NormalizeHexColor = HexColorInput.pipe(
  S.decodeTo(
    HexColor,
    SchemaTransformation.transform({
      decode: normalizeHexColorValue,
      encode: identity,
    })
  ),
  S.annotate(
    $I.annote("NormalizeHexColor", {
      description: "Normalizes #rgb or #rrggbb input into canonical lowercase #rrggbb hex.",
    })
  )
);

/**
 * Type for {@link NormalizeHexColor}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type NormalizeHexColor = typeof NormalizeHexColor.Type;

/**
 * Branded finite RGB input channel.
 *
 * @since 0.0.0
 * @category Validation
 */
export const RgbInputChannel = S.Finite.pipe(
  S.brand("RgbInputChannel"),
  S.annotate(
    $I.annote("RgbInputChannel", {
      description: "A finite RGB channel value before clamping or normalization.",
    })
  )
);

/**
 * Type for {@link RgbInputChannel}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type RgbInputChannel = typeof RgbInputChannel.Type;

/**
 * Branded normalized RGB channel in the range 0 through 1.
 *
 * @since 0.0.0
 * @category Validation
 */
export const RgbChannel = RgbInputChannel.pipe(
  S.check(RgbChannelRangeCheck),
  S.brand("RgbChannel"),
  S.annotate(
    $I.annote("RgbChannel", {
      description: "A normalized RGB channel value in the range 0 through 1.",
    })
  )
);

/**
 * Type for {@link RgbChannel}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type RgbChannel = typeof RgbChannel.Type;

/**
 * RGB object with finite channel inputs.
 *
 * @since 0.0.0
 * @category Validation
 */
export class RgbInput extends S.Class<RgbInput>($I`RgbInput`)(
  {
    r: RgbInputChannel.annotateKey({ description: "Red input channel." }),
    g: RgbInputChannel.annotateKey({ description: "Green input channel." }),
    b: RgbInputChannel.annotateKey({ description: "Blue input channel." }),
  },
  $I.annote("RgbInput", {
    description: "An RGB color object with finite input channels.",
  })
) {}

/**
 * RGB object with normalized channels.
 *
 * @since 0.0.0
 * @category Validation
 */
export class Rgb extends S.Class<Rgb>($I`Rgb`)(
  {
    r: RgbChannel.annotateKey({ description: "Normalized red channel." }),
    g: RgbChannel.annotateKey({ description: "Normalized green channel." }),
    b: RgbChannel.annotateKey({ description: "Normalized blue channel." }),
  },
  $I.annote("Rgb", {
    description: "A normalized RGB color object.",
  })
) {}

/**
 * Branded finite OKLCH coordinate.
 *
 * @since 0.0.0
 * @category Validation
 */
export const OklchCoordinate = S.Finite.pipe(
  S.brand("OklchCoordinate"),
  S.annotate(
    $I.annote("OklchCoordinate", {
      description: "A finite OKLCH coordinate component.",
    })
  )
);

/**
 * Type for {@link OklchCoordinate}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type OklchCoordinate = typeof OklchCoordinate.Type;

/**
 * Canonical OKLCH lightness component.
 *
 * @since 0.0.0
 * @category Validation
 */
export const OklchLightness = OklchCoordinate.pipe(
  S.check(OklchLightnessRangeCheck),
  S.brand("OklchLightness"),
  S.annotate(
    $I.annote("OklchLightness", {
      description: "OKLCH lightness normalized to the range 0 through 1.",
    })
  )
);

/**
 * Type for {@link OklchLightness}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type OklchLightness = typeof OklchLightness.Type;

/**
 * Canonical OKLCH chroma component.
 *
 * @since 0.0.0
 * @category Validation
 */
export const OklchChroma = OklchCoordinate.pipe(
  S.check(OklchChromaCheck),
  S.brand("OklchChroma"),
  S.annotate(
    $I.annote("OklchChroma", {
      description: "A non-negative OKLCH chroma value.",
    })
  )
);

/**
 * Type for {@link OklchChroma}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type OklchChroma = typeof OklchChroma.Type;

/**
 * Canonical OKLCH hue component.
 *
 * @since 0.0.0
 * @category Validation
 */
export const OklchHue = OklchCoordinate.pipe(
  S.check(OklchHueRangeCheck),
  S.brand("OklchHue"),
  S.annotate(
    $I.annote("OklchHue", {
      description: "An OKLCH hue angle in degrees from 0 through 360.",
    })
  )
);

/**
 * Type for {@link OklchHue}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type OklchHue = typeof OklchHue.Type;

/**
 * OKLCH object with finite coordinates.
 *
 * @since 0.0.0
 * @category Validation
 */
export class OklchInput extends S.Class<OklchInput>($I`OklchInput`)(
  {
    l: OklchCoordinate.annotateKey({ description: "Input lightness coordinate." }),
    c: OklchCoordinate.annotateKey({ description: "Input chroma coordinate." }),
    h: OklchCoordinate.annotateKey({ description: "Input hue coordinate." }),
  },
  $I.annote("OklchInput", {
    description: "An OKLCH color object with finite coordinates used by transformation helpers.",
  })
) {}

/**
 * Canonical OKLCH color object.
 *
 * @since 0.0.0
 * @category Validation
 */
export class OklchColor extends S.Class<OklchColor>($I`OklchColor`)(
  {
    l: OklchLightness.annotateKey({ description: "Lightness in the range 0 through 1." }),
    c: OklchChroma.annotateKey({ description: "Non-negative chroma." }),
    h: OklchHue.annotateKey({ description: "Hue in degrees from 0 through 360." }),
  },
  $I.annote("OklchColor", {
    description: "A canonical color in OKLCH space.",
  })
) {}

/**
 * Fixed-size 12-step canonical hex color scale.
 *
 * @since 0.0.0
 * @category Validation
 */
export const HexColorScale12 = S.Array(HexColor)
  .check(HexColorScale12Checks)
  .pipe(
    S.brand("HexColorScale12"),
    S.annotate(
      $I.annote("HexColorScale12", {
        description: "A fixed-size 12-step scale of canonical hex colors.",
      })
    )
  );

/**
 * Type for {@link HexColorScale12}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type HexColorScale12 = typeof HexColorScale12.Type;

/**
 * CSS rgba color string produced by with-alpha helpers.
 *
 * @since 0.0.0
 * @category Validation
 */
export const RgbaColorString = S.String.check(RgbaColorStringChecks).pipe(
  S.brand("RgbaColorString"),
  S.annotate(
    $I.annote("RgbaColorString", {
      description: "A CSS rgba color string in the form rgba(r, g, b, a).",
    })
  )
);

/**
 * Type for {@link RgbaColorString}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type RgbaColorString = typeof RgbaColorString.Type;

/**
 * Transformation schema for decoding boundary hex input into normalized RGB.
 *
 * @since 0.0.0
 * @category Validation
 */
export const HexToRgb = NormalizeHexColor.pipe(
  S.decodeTo(
    Rgb,
    SchemaTransformation.transform({
      decode: hexToRgbValue,
      encode: rgbToHexValue,
    })
  ),
  S.annotate(
    $I.annote("HexToRgb", {
      description: "Decodes canonical or shorthand hex colors into normalized RGB values.",
    })
  )
);

/**
 * Type for {@link HexToRgb}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type HexToRgb = typeof HexToRgb.Type;

/**
 * Transformation schema for encoding RGB input into canonical hex.
 *
 * @since 0.0.0
 * @category Validation
 */
export const RgbToHex = RgbInput.pipe(
  S.decodeTo(HexColor, {
    decode: SchemaGetter.transform(rgbToHexValue),
    encode: SchemaGetter.forbidden(() => "Encoding RgbToHex results back to RGB is not supported"),
  }),
  S.annotate(
    $I.annote("RgbToHex", {
      description: "Encodes finite RGB input channels into canonical hex by clamping and rounding.",
    })
  )
);

/**
 * Type for {@link RgbToHex}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type RgbToHex = typeof RgbToHex.Type;

/**
 * Transformation schema for decoding normalized RGB into canonical OKLCH.
 *
 * @since 0.0.0
 * @category Validation
 */
export const RgbToOklch = Rgb.pipe(
  S.decodeTo(OklchColor, {
    decode: SchemaGetter.transform(rgbToOklchValue),
    encode: SchemaGetter.forbidden(() => "Encoding RgbToOklch results back to RGB is not supported"),
  }),
  S.annotate(
    $I.annote("RgbToOklch", {
      description: "Decodes normalized RGB values into canonical OKLCH coordinates.",
    })
  )
);

/**
 * Type for {@link RgbToOklch}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type RgbToOklch = typeof RgbToOklch.Type;

/**
 * Transformation schema for encoding OKLCH coordinates into RGB input values.
 *
 * @since 0.0.0
 * @category Validation
 */
export const OklchToRgb = OklchInput.pipe(
  S.decodeTo(RgbInput, {
    decode: SchemaGetter.transform(oklchToRgbValue),
    encode: SchemaGetter.forbidden(() => "Encoding OklchToRgb results back to OKLCH is not supported"),
  }),
  S.annotate(
    $I.annote("OklchToRgb", {
      description: "Encodes finite OKLCH coordinates into finite RGB channel values.",
    })
  )
);

/**
 * Type for {@link OklchToRgb}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type OklchToRgb = typeof OklchToRgb.Type;

/**
 * Transformation schema for decoding boundary hex input into canonical OKLCH.
 *
 * @since 0.0.0
 * @category Validation
 */
export const HexToOklch = NormalizeHexColor.pipe(
  S.decodeTo(
    OklchColor,
    SchemaTransformation.transform({
      decode: hexToOklchValue,
      encode: oklchToHexValue,
    })
  ),
  S.annotate(
    $I.annote("HexToOklch", {
      description: "Decodes shorthand or canonical hex colors into canonical OKLCH coordinates.",
    })
  )
);

/**
 * Type for {@link HexToOklch}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type HexToOklch = typeof HexToOklch.Type;

/**
 * Transformation schema for encoding OKLCH coordinates into canonical hex.
 *
 * @since 0.0.0
 * @category Validation
 */
export const OklchToHex = OklchInput.pipe(
  S.decodeTo(HexColor, {
    decode: SchemaGetter.transform(oklchToHexValue),
    encode: SchemaGetter.forbidden(() => "Encoding OklchToHex results back to OKLCH is not supported"),
  }),
  S.annotate(
    $I.annote("OklchToHex", {
      description: "Encodes finite OKLCH coordinates into canonical hex colors.",
    })
  )
);

/**
 * Type for {@link OklchToHex}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type OklchToHex = typeof OklchToHex.Type;

/**
 * Shared finite amount used by color helper request schemas.
 *
 * @since 0.0.0
 * @category Validation
 */
export const ColorAmount = S.Finite.pipe(
  S.brand("ColorAmount"),
  S.annotate(
    $I.annote("ColorAmount", {
      description: "A finite numeric amount used by color transformation helpers.",
    })
  )
);

/**
 * Type for {@link ColorAmount}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type ColorAmount = typeof ColorAmount.Type;

const HexColorScale12Input = S.Array(NormalizeHexColor)
  .check(HexColorScale12Checks)
  .pipe(
    S.annotate(
      $I.annote("HexColorScale12Input", {
        description: "A 12-step hex color scale accepted at boundaries before canonical normalization.",
      })
    )
  );

/**
 * Request schema for generating a chromatic 12-step scale.
 *
 * @since 0.0.0
 * @category Validation
 */
export class GenerateScaleInput extends S.Class<GenerateScaleInput>($I`GenerateScaleInput`)(
  {
    seed: NormalizeHexColor.annotateKey({ description: "Seed color for the generated scale." }),
    isDark: S.Boolean.annotateKey({ description: "Whether to generate the dark variant scale." }),
  },
  $I.annote("GenerateScaleInput", {
    description: "Input payload for generating a 12-step chromatic color scale.",
  })
) {}

/**
 * One-way schema for generating a chromatic 12-step scale.
 *
 * @since 0.0.0
 * @category Validation
 */
export const GenerateScale = GenerateScaleInput.pipe(
  S.decodeTo(HexColorScale12, {
    decode: SchemaGetter.transform(generateScaleValues),
    encode: SchemaGetter.forbidden(
      () => "Encoding GenerateScale results back to the original request is not supported"
    ),
  }),
  S.annotate(
    $I.annote("GenerateScale", {
      description: "Generates a 12-step chromatic scale from a seed hex color.",
    })
  )
);

/**
 * Type for {@link GenerateScale}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type GenerateScale = typeof GenerateScale.Type;

/**
 * Request schema for generating a neutral 12-step scale.
 *
 * @since 0.0.0
 * @category Validation
 */
export class GenerateNeutralScaleInput extends S.Class<GenerateNeutralScaleInput>($I`GenerateNeutralScaleInput`)(
  {
    seed: NormalizeHexColor.annotateKey({ description: "Seed color for the neutral scale." }),
    isDark: S.Boolean.annotateKey({ description: "Whether to generate the dark neutral variant." }),
  },
  $I.annote("GenerateNeutralScaleInput", {
    description: "Input payload for generating a 12-step neutral color scale.",
  })
) {}

/**
 * One-way schema for generating a neutral 12-step scale.
 *
 * @since 0.0.0
 * @category Validation
 */
export const GenerateNeutralScale = GenerateNeutralScaleInput.pipe(
  S.decodeTo(HexColorScale12, {
    decode: SchemaGetter.transform(generateNeutralScaleValues),
    encode: SchemaGetter.forbidden(
      () => "Encoding GenerateNeutralScale results back to the original request is not supported"
    ),
  }),
  S.annotate(
    $I.annote("GenerateNeutralScale", {
      description: "Generates a 12-step neutral scale from a seed hex color.",
    })
  )
);

/**
 * Type for {@link GenerateNeutralScale}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type GenerateNeutralScale = typeof GenerateNeutralScale.Type;

/**
 * Request schema for generating an alpha-blended 12-step scale.
 *
 * @since 0.0.0
 * @category Validation
 */
export class GenerateAlphaScaleInput extends S.Class<GenerateAlphaScaleInput>($I`GenerateAlphaScaleInput`)(
  {
    scale: HexColorScale12Input.annotateKey({ description: "Base 12-step scale used for alpha blending." }),
    isDark: S.Boolean.annotateKey({ description: "Whether to blend against a dark background." }),
  },
  $I.annote("GenerateAlphaScaleInput", {
    description: "Input payload for generating a 12-step alpha-blended color scale.",
  })
) {}

/**
 * One-way schema for generating an alpha-blended 12-step scale.
 *
 * @since 0.0.0
 * @category Validation
 */
export const GenerateAlphaScale = GenerateAlphaScaleInput.pipe(
  S.decodeTo(HexColorScale12, {
    decode: SchemaGetter.transform(generateAlphaScaleValues),
    encode: SchemaGetter.forbidden(
      () => "Encoding GenerateAlphaScale results back to the original request is not supported"
    ),
  }),
  S.annotate(
    $I.annote("GenerateAlphaScale", {
      description: "Generates a 12-step alpha-blended scale from a canonical 12-step base scale.",
    })
  )
);

/**
 * Type for {@link GenerateAlphaScale}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type GenerateAlphaScale = typeof GenerateAlphaScale.Type;

/**
 * Request schema for mixing two colors.
 *
 * @since 0.0.0
 * @category Validation
 */
export class MixColorsInput extends S.Class<MixColorsInput>($I`MixColorsInput`)(
  {
    color1: NormalizeHexColor.annotateKey({ description: "Start color." }),
    color2: NormalizeHexColor.annotateKey({ description: "End color." }),
    amount: ColorAmount.annotateKey({ description: "Interpolation amount." }),
  },
  $I.annote("MixColorsInput", {
    description: "Input payload for mixing two colors in OKLCH space.",
  })
) {}

/**
 * One-way schema for mixing two colors.
 *
 * @since 0.0.0
 * @category Validation
 */
export const MixColors = MixColorsInput.pipe(
  S.decodeTo(HexColor, {
    decode: SchemaGetter.transform(mixColorsValue),
    encode: SchemaGetter.forbidden(() => "Encoding MixColors results back to the original request is not supported"),
  }),
  S.annotate(
    $I.annote("MixColors", {
      description: "Mixes two hex colors in OKLCH space and returns a canonical hex color.",
    })
  )
);

/**
 * Type for {@link MixColors}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type MixColors = typeof MixColors.Type;

/**
 * Request schema for lightening a color.
 *
 * @since 0.0.0
 * @category Validation
 */
export class LightenInput extends S.Class<LightenInput>($I`LightenInput`)(
  {
    color: NormalizeHexColor.annotateKey({ description: "Source color." }),
    amount: ColorAmount.annotateKey({ description: "Lightness adjustment amount." }),
  },
  $I.annote("LightenInput", {
    description: "Input payload for lightening a color in OKLCH space.",
  })
) {}

/**
 * One-way schema for lightening a color.
 *
 * @since 0.0.0
 * @category Validation
 */
export const Lighten = LightenInput.pipe(
  S.decodeTo(HexColor, {
    decode: SchemaGetter.transform(lightenValue),
    encode: SchemaGetter.forbidden(() => "Encoding Lighten results back to the original request is not supported"),
  }),
  S.annotate(
    $I.annote("Lighten", {
      description: "Lightens a hex color in OKLCH space and returns a canonical hex color.",
    })
  )
);

/**
 * Type for {@link Lighten}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type Lighten = typeof Lighten.Type;

/**
 * Request schema for darkening a color.
 *
 * @since 0.0.0
 * @category Validation
 */
export class DarkenInput extends S.Class<DarkenInput>($I`DarkenInput`)(
  {
    color: NormalizeHexColor.annotateKey({ description: "Source color." }),
    amount: ColorAmount.annotateKey({ description: "Lightness reduction amount." }),
  },
  $I.annote("DarkenInput", {
    description: "Input payload for darkening a color in OKLCH space.",
  })
) {}

/**
 * One-way schema for darkening a color.
 *
 * @since 0.0.0
 * @category Validation
 */
export const Darken = DarkenInput.pipe(
  S.decodeTo(HexColor, {
    decode: SchemaGetter.transform(darkenValue),
    encode: SchemaGetter.forbidden(() => "Encoding Darken results back to the original request is not supported"),
  }),
  S.annotate(
    $I.annote("Darken", {
      description: "Darkens a hex color in OKLCH space and returns a canonical hex color.",
    })
  )
);

/**
 * Type for {@link Darken}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type Darken = typeof Darken.Type;

/**
 * Request schema for converting a color plus alpha to an rgba string.
 *
 * @since 0.0.0
 * @category Validation
 */
export class WithAlphaInput extends S.Class<WithAlphaInput>($I`WithAlphaInput`)(
  {
    color: NormalizeHexColor.annotateKey({ description: "Source color." }),
    alpha: ColorAmount.annotateKey({ description: "Finite alpha value rendered into the rgba string." }),
  },
  $I.annote("WithAlphaInput", {
    description: "Input payload for rendering a hex color plus alpha as a CSS rgba string.",
  })
) {}

/**
 * One-way schema for rendering an rgba string.
 *
 * @since 0.0.0
 * @category Validation
 */
export const WithAlpha = WithAlphaInput.pipe(
  S.decodeTo(RgbaColorString, {
    decode: SchemaGetter.transform(withAlphaValue),
    encode: SchemaGetter.forbidden(() => "Encoding WithAlpha results back to the original request is not supported"),
  }),
  S.annotate(
    $I.annote("WithAlpha", {
      description: "Renders a canonical hex color plus alpha as a CSS rgba string.",
    })
  )
);

/**
 * Type for {@link WithAlpha}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type WithAlpha = typeof WithAlpha.Type;
