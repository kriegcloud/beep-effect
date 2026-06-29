/**
 * The GranuleContainer value object module for the `@beep/govinfo` driver.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $GovinfoId } from "@beep/identity";
import { Int64 } from "@beep/schema";
import * as S from "effect/Schema";
import { GranuleMetadata } from "../GranuleMetadata/index.ts";

const $I = $GovinfoId.create("domain/values/GranuleContainer/GranuleContainer.model");

/**
 * The GranuleContainer value object.
 *
 * @example
 * ```ts
 * import { GranuleContainer } from "@beep/govinfo/domain/values/GranuleContainer/GranuleContainer.model";
 *
 * console.log(GranuleContainer);
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class GranuleContainer extends S.Class<GranuleContainer>($I`GranuleContainer`)(
  {
    /** change me */
    count: Int64.pipe(
      S.annotateKey({
        description: "Signed 32-bit integers (commonly used integer type).",
      })
    ),

    /** change me */
    granules: GranuleMetadata.pipe(
      S.Array,
      S.annotateKey({
        description: "",
      })
    ),

    /** change me */
    message: S.String.annotateKey({
      description: "",
    }),

    /** change me */
    nextPage: S.String.annotateKey({
      description: "",
    }),

    /** change me */
    offset: S.Int.pipe(
      S.check(S.isInt32()),
      S.annotateKey({
        description: "",
      })
    ),

    /** change me */
    pageSize: S.Int.pipe(
      S.check(S.isInt32()),
      S.annotateKey({
        description: "",
      })
    ),

    /** change me */
    previousPage: S.String.annotateKey({
      description: "",
    }),
  },
  $I.annote("GranuleContainer", {
    description: "The GranuleContainer value object.",
  })
) {}

/**
 * The companion namespace for the {@link GranuleContainer} value object.
 *
 * @category namespaces
 * @since 0.0.0
 */
export declare namespace GranuleContainer {
  /**
   * The companion encoded type for {@link GranuleContainer}.
   *
   * @example
   * ```ts
   * import type { GranuleContainer } from "@beep/govinfo/domain/values/GranuleContainer/GranuleContainer.model";
   *
   * const useEncoded = (_value: GranuleContainer.Encoded) => true;
   * console.log(useEncoded);
   * ```
   *
   * @category models
   * @since 0.0.0
   */
  export type Encoded = typeof GranuleContainer.Encoded;
}
