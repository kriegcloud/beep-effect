/**
 * Color conversion schemas.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { flow, SchemaGetter, SchemaTransformation } from "effect";
import * as S from "effect/Schema";
import { HexColor, hexToRgbValue, NormalizeHexColor, rgbToHexValue } from "./Color.hex.ts";
import { OklchColor, OklchInput, oklchToRgbValue, rgbToOklchValue } from "./Color.oklch.ts";
import { Rgb, RgbInput } from "./Color.rgb.ts";
import { $I } from "./Color.shared.ts";

/**
 * Convert OKLCH coordinates into a canonical hex color.
 *
 * @internal
 * @category utilities
 * @since 0.0.0
 */
export const oklchToHexValue = flow(oklchToRgbValue, rgbToHexValue);
/**
 * Convert a boundary hex color into OKLCH coordinates.
 *
 * @internal
 * @category utilities
 * @since 0.0.0
 */
export const hexToOklchValue = flow(hexToRgbValue, rgbToOklchValue);

/**
 * Transformation schema for decoding boundary hex input into normalized RGB.
 *
 * @since 0.0.0
 * @category validation
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
 * @category models
 */
export type HexToRgb = typeof HexToRgb.Type;

/**
 * Transformation schema for encoding RGB input into canonical hex.
 *
 * @since 0.0.0
 * @category validation
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
 * @category models
 */
export type RgbToHex = typeof RgbToHex.Type;

/**
 * Transformation schema for decoding normalized RGB into canonical OKLCH.
 *
 * @since 0.0.0
 * @category validation
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
 * @category models
 */
export type RgbToOklch = typeof RgbToOklch.Type;

/**
 * Transformation schema for encoding OKLCH coordinates into RGB input values.
 *
 * @since 0.0.0
 * @category validation
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
 * @category models
 */
export type OklchToRgb = typeof OklchToRgb.Type;

/**
 * Transformation schema for decoding boundary hex input into canonical OKLCH.
 *
 * @since 0.0.0
 * @category validation
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
 * @category models
 */
export type HexToOklch = typeof HexToOklch.Type;

/**
 * Transformation schema for encoding OKLCH coordinates into canonical hex.
 *
 * @since 0.0.0
 * @category validation
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
 * @category models
 */
export type OklchToHex = typeof OklchToHex.Type;
