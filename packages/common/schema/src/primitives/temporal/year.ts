/**
 * Year schema helpers.
 *
 * Encodes calendar years as numeric values for temporal pipelines.
 *
 * @category Primitives/Temporal
 * @since 0.1.0
 */

import { $TemporalId } from "@beep/schema/internal";
import * as S from "effect/Schema";

const { $YearId: Id } = $TemporalId.compose("year");
/**
 * Number-encoded year schema.
 *
 * @category Primitives/Temporal
 * @since 0.1.0
 */
export class YearEncoded extends S.Number.annotations(
  Id.annotations("year/YearEncoded", {
    description: "A year encoded as a number",
  })
) {}

/**
 * Namespace describing the encoded and decoded types for {@link YearEncoded}.
 *
 * @category Primitives/Temporal
 * @since 0.1.0
 */
export declare namespace YearEncoded {
  /**
   * Runtime type for {@link YearEncoded}.
   *
   * @category Primitives/Temporal
   * @since 0.1.0
   */
  export type Type = S.Schema.Type<typeof YearEncoded>;
  /**
   * Encoded type for {@link YearEncoded}.
   *
   * @category Primitives/Temporal
   * @since 0.1.0
   */
  export type Encoded = S.Schema.Encoded<typeof YearEncoded>;
}
