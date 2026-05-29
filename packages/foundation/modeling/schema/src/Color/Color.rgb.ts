/**
 * RGB color schemas.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import * as S from "effect/Schema";
import { $I } from "./Color.shared.ts";

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

/**
 * Branded finite RGB input channel.
 *
 * @since 0.0.0
 * @category validation
 */
export const RgbInputChannel = S.Finite.pipe(
  S.brand("RgbInputChannel"),
  $I.annoteSchema("RgbInputChannel", {
    description: "A finite RGB channel value before clamping or normalization.",
  })
);

/**
 * Type for {@link RgbInputChannel}.
 *
 * @since 0.0.0
 * @category models
 */
export type RgbInputChannel = typeof RgbInputChannel.Type;

/**
 * Branded normalized RGB channel in the range 0 through 1.
 *
 * @since 0.0.0
 * @category validation
 */
export const RgbChannel = RgbInputChannel.pipe(
  S.check(RgbChannelRangeCheck),
  S.brand("RgbChannel"),
  $I.annoteSchema("RgbChannel", {
    description: "A normalized RGB channel value in the range 0 through 1.",
  })
);

/**
 * Type for {@link RgbChannel}.
 *
 * @since 0.0.0
 * @category models
 */
export type RgbChannel = typeof RgbChannel.Type;

/**
 * RGB object with finite channel inputs.
 *
 * @since 0.0.0
 * @category validation
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
 * @category validation
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
