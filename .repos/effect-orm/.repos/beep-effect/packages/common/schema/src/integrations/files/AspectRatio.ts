import * as F from "effect/Function";
import * as Match from "effect/Match";
import * as Num from "effect/Number";
import * as S from "effect/Schema";

import { destructiveTransform } from "../../core/extended";

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
 * AspectRatio schema that destructively transforms dimensions into a simplified ratio string.
 *
 * This is a one-way (destructive) transformation because:
 * - The original dimensions cannot be recovered from the simplified ratio
 * - `{ width: 1920, height: 1080 }` and `{ width: 16, height: 9 }` both decode to `"16 / 9"`
 *
 * - Decoded: `"16 / 9"` (simplified using GCD)
 * - Encoded: Not supported (throws Forbidden error)
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
 * // Encoding is not supported - this will throw a Forbidden error
 * // S.encodeSync(AspectRatio)("16 / 9") // throws!
 * ```
 */
export const AspectRatio: S.Schema<
  Readonly<AspectRatioString>,
  AspectRatioDimensions.Encoded,
  never
> = AspectRatioDimensions.pipe(
  destructiveTransform(({ width, height }) =>
    Match.value({ width, height }).pipe(
      Match.when(
        ({ width, height }) => width === 0 || height === 0,
        ({ width, height }) => `${width} / ${height}` as AspectRatioString
      ),
      Match.orElse(({ width, height }) => {
        const divisor = gcd(width, height);
        const simplifiedWidth = F.pipe(width, Num.unsafeDivide(divisor));
        const simplifiedHeight = F.pipe(height, Num.unsafeDivide(divisor));
        return `${simplifiedWidth} / ${simplifiedHeight}` as AspectRatioString;
      })
    )
  )
);

export declare namespace AspectRatio {
  export type Type = S.Schema.Type<typeof AspectRatio>;
  export type Encoded = S.Schema.Encoded<typeof AspectRatio>;
}

/**
 * Schema for an already-computed aspect ratio string.
 * Use this in class fields that store the transformed value.
 *
 * Unlike `AspectRatio` which transforms dimensions to string,
 * this schema just validates the string format without transformation.
 */
export const AspectRatioStringSchema: S.Schema<AspectRatioString, string, never> = S.String.pipe(
  S.pattern(/^\d+ \/ \d+$/),
  S.annotations({
    identifier: "AspectRatioString",
    title: "Aspect Ratio String",
    description: "A pre-computed aspect ratio string in format 'N / M'",
  })
) as S.Schema<AspectRatioString, string, never>;
