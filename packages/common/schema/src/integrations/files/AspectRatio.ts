import * as S from "effect/Schema";

/**
 * Computes the greatest common divisor of two numbers using Euclidean algorithm
 */
const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

/**
 * Encoded representation of an aspect ratio
 */
export class AspectRatioDimensions extends S.Class<AspectRatioDimensions>(
  "@beep/schema/integrations/files/AspectRatioDimensions"
)({
  width: S.NonNegativeInt,
  height: S.NonNegativeInt,
}) {}

export declare namespace AspectRatioDimensions {
  export type Type = S.Schema.Type<typeof AspectRatioDimensions>;
  export type Encoded = S.Schema.Encoded<typeof AspectRatioDimensions>;
}

/**
 * Template literal type for aspect ratio string
 */
export type AspectRatioString = `${number} / ${number}`;

/**
 * Schema for the decoded aspect ratio string format
 */
export const AspectRatioStringSchema: S.Schema<AspectRatioString, string> = S.TemplateLiteral(
  S.Number,
  S.Literal(" / "),
  S.Number
) as S.Schema<AspectRatioString, string>;

/**
 * AspectRatio schema that transforms between dimensions and a simplified ratio string.
 *
 * - Decoded: `"16 / 9"` (simplified using GCD)
 * - Encoded: `{ width: 1920, height: 1080 }`
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema";
 * import { AspectRatio } from "@beep/schema/integrations";
 *
 * // Decode dimensions to aspect ratio string
 * S.decodeSync(AspectRatio)({ width: 1920, height: 1080 }) // "16 / 9"
 * S.decodeSync(AspectRatio)({ width: 800, height: 600 })   // "4 / 3"
 * S.decodeSync(AspectRatio)({ width: 100, height: 100 })   // "1 / 1"
 *
 * // Encode aspect ratio string back to dimensions
 * S.encodeSync(AspectRatio)("16 / 9") // { width: 16, height: 9 }
 * ```
 */
export class AspectRatio extends S.transform(AspectRatioDimensions, AspectRatioStringSchema, {
  strict: true,
  decode: ({ width, height }) => {
    // Handle edge case where either dimension is 0
    if (width === 0 || height === 0) {
      return `${width} / ${height}` as const;
    }
    const divisor = gcd(width, height);
    const simplifiedWidth = width / divisor;
    const simplifiedHeight = height / divisor;
    return `${simplifiedWidth} / ${simplifiedHeight}` as const;
  },
  encode: (aspectRatioString) => {
    const [widthStr, heightStr] = aspectRatioString.split(" / ");
    return new AspectRatioDimensions({
      width: Number.parseInt(widthStr!, 10) as S.Schema.Type<typeof S.NonNegativeInt>,
      height: Number.parseInt(heightStr!, 10) as S.Schema.Type<typeof S.NonNegativeInt>,
    });
  },
}) {}

export declare namespace AspectRatio {
  export type Type = S.Schema.Type<typeof AspectRatio>;
  export type Encoded = S.Schema.Encoded<typeof AspectRatio>;
}
