/**
 * Experimental Box placeholder value-object schema.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $BoxId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $BoxId.create("values/PLACEHOLDER/PLACEHOLDER.model");

/**
 * Experimental placeholder value-object schema retained until this generator slot is promoted to a named Box value.
 *
 * @remarks
 * This experimental domain class currently declares an empty schema shape; generated Box SDK payload schemas remain the field-level source for API data until fields are promoted here.
 *
 * @example
 * ```ts
 * import { PLACEHOLDER } from "@beep/box/experimental/domain/values/PLACEHOLDER/PLACEHOLDER.model";
 * import * as S from "effect/Schema";
 *
 * const decoded = S.decodeUnknownSync(PLACEHOLDER)({});
 * const encoded: PLACEHOLDER.Encoded = S.encodeSync(PLACEHOLDER)(decoded);
 *
 * console.log(JSON.stringify(encoded));
 * ```
 *
 * @category value-objects
 * @since 0.0.0
 */
export class PLACEHOLDER extends S.Class<PLACEHOLDER>($I`PLACEHOLDER`)(
  {},
  $I.annote("PLACEHOLDER", {
    description:
      "Experimental placeholder value-object schema retained until this generator slot is promoted to a named Box value.",
  })
) {}

/**
 * Type-level companion namespace for {@link PLACEHOLDER} encoded payloads.
 *
 * @example
 * ```ts
 * import { PLACEHOLDER } from "@beep/box/experimental/domain/values/PLACEHOLDER/PLACEHOLDER.model";
 * import * as S from "effect/Schema";
 *
 * const decoded = PLACEHOLDER.make({});
 * const encoded: PLACEHOLDER.Encoded = S.encodeSync(PLACEHOLDER)(decoded);
 *
 * console.log(JSON.stringify(encoded));
 * ```
 *
 * @category type-level
 * @since 0.0.0
 */
export declare namespace PLACEHOLDER {
  /**
   * Encoded payload accepted by the {@link PLACEHOLDER} value-object schema.
   *
   * @example
   * ```ts
   * import { PLACEHOLDER } from "@beep/box/experimental/domain/values/PLACEHOLDER/PLACEHOLDER.model";
   * import * as S from "effect/Schema";
   *
   * const encoded: PLACEHOLDER.Encoded = S.encodeSync(PLACEHOLDER)(PLACEHOLDER.make({}));
   *
   * console.log(JSON.stringify(encoded));
   * ```
   *
   * @category type-level
   * @since 0.0.0
   */
  export type Encoded = typeof PLACEHOLDER.Encoded;
}
