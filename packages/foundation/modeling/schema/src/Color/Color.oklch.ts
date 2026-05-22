/**
 * OKLCH color schemas and helpers.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import * as S from "effect/Schema";
import { $I, type OklchEncoded, type RgbEncoded } from "./Color.shared.ts";

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

/**
 * Convert normalized RGB channel values into OKLCH coordinates.
 *
 * @internal
 * @category utilities
 * @since 0.0.0
 */
export const rgbToOklchValue = ({ r, g, b }: RgbEncoded): OklchEncoded => {
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

/**
 * Convert OKLCH coordinates into RGB channel values.
 *
 * @internal
 * @category utilities
 * @since 0.0.0
 */
export const oklchToRgbValue = ({ l: lightness, c: chroma, h: hue }: OklchEncoded): RgbEncoded => {
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

/**
 * Branded finite OKLCH coordinate.
 *
 * @since 0.0.0
 * @category validation
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
 * @category models
 */
export type OklchCoordinate = typeof OklchCoordinate.Type;

/**
 * Canonical OKLCH lightness component.
 *
 * @since 0.0.0
 * @category validation
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
 * @category models
 */
export type OklchLightness = typeof OklchLightness.Type;

/**
 * Canonical OKLCH chroma component.
 *
 * @since 0.0.0
 * @category validation
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
 * @category models
 */
export type OklchChroma = typeof OklchChroma.Type;

/**
 * Canonical OKLCH hue component.
 *
 * @since 0.0.0
 * @category validation
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
 * @category models
 */
export type OklchHue = typeof OklchHue.Type;

/**
 * OKLCH object with finite coordinates.
 *
 * @since 0.0.0
 * @category validation
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
 * @category validation
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
