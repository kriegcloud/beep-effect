/**
 * The SummaryItem value object module for the `@beep/govinfo` driver.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $GovinfoId } from "@beep/identity";
import { Int64 } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $GovinfoId.create("domain/values/SummaryItem/SummaryItem.model");

/**
 * The SummaryItem value object.
 *
 * @example
 * ```ts
 * import { SummaryItem } from "@beep/govinfo/domain/values/SummaryItem/SummaryItem.model";
 *
 * console.log(SummaryItem);
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class SummaryItem extends S.Class<SummaryItem>($I`SummaryItem`)(
  {
    /** GovInfo collection abbreviation for this entry (for example BILLS, FR, or CREC). */
    collectionCode: S.String.annotateKey({
      description: "GovInfo collection abbreviation identifying the collection, such as BILLS, FR, or CREC.",
    }),

    /** Human-readable display name of the GovInfo collection. */
    collectionName: S.String.annotateKey({
      description: "Human-readable display name of the GovInfo collection.",
    }),

    /** Total number of granules contained in the collection. */
    granuleCount: Int64.annotateKey({
      description: "Total number of granules contained in the collection.",
    }),

    /** Total number of packages contained in the collection. */
    packageCount: Int64.pipe(
      S.annotateKey({
        description: "Total number of packages contained in the collection.",
      })
    ),
  },
  $I.annote("SummaryItem", {
    description:
      "A single collection entry in a GovInfo collections summary, pairing a collection's code and name with its package and granule counts.",
  })
) {}

/**
 * The companion namespace for the {@link SummaryItem} value object.
 *
 * @category namespaces
 * @since 0.0.0
 */
export declare namespace SummaryItem {
  /**
   * The companion encoded type for {@link SummaryItem}.
   *
   * @example
   * ```ts
   * import type { SummaryItem } from "@beep/govinfo/domain/values/SummaryItem/SummaryItem.model";
   *
   * const useEncoded = (_value: SummaryItem.Encoded) => true;
   * console.log(useEncoded);
   * ```
   *
   * @category models
   * @since 0.0.0
   */
  export type Encoded = typeof SummaryItem.Encoded;
}
