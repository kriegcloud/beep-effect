/**
 * Reusable schemas for decoding Effect `BigDecimal` values.
 *
 * @see {@link https://github.com/Effect-TS/effect-smol/blob/main/packages/effect/src/BigDecimal.ts | effect/BigDecimal}
 * @module @beep/schema/BigDecimal
 * @since 0.0.0
 */
import { $SchemaId } from "@beep/identity";
import { BigDecimal, SchemaGetter } from "effect";
import * as S from "effect/Schema";

const $I = $SchemaId.create("BigDecimal");

/**
 * Schema that decodes a number into an Effect `BigDecimal` and encodes a
 * `BigDecimal` back to a number.
 *
 * Useful at boundaries where decimal values are transported as plain JSON
 * numbers but consumed internally as `BigDecimal`.
 *
 * @category Validation
 * @since 0.0.0
 * @example
 * ```typescript
 * import * as S from "effect/Schema"
 * import { BigDecimalFromNumber } from "@beep/schema/BigDecimal"
 *
 * const decode = S.decodeUnknownSync(BigDecimalFromNumber)
 * const value = decode(12.34)
 * void value
 * ```
 */
export const BigDecimalFromNumber: S.decodeTo<S.BigDecimal, S.Number> = S.Number.pipe(
  S.decodeTo(S.BigDecimal, {
    decode: SchemaGetter.transform(BigDecimal.fromNumberUnsafe),
    encode: SchemaGetter.transform(BigDecimal.toNumberUnsafe),
  }),
  $I.annoteSchema("BigDecimalFromNumber", {
    description: "A BigDecimal from a number",
  })
);
