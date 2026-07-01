/**
 * The CollectionContainer value object module for the `@beep/govinfo` driver.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $GovinfoId } from "@beep/identity";
import * as S from "effect/Schema";
import { PackageInfo } from "../PackageInfo/index.ts";

const $I = $GovinfoId.create("domain/values/CollectionContainer/CollectionContainer.model");

/**
 * The CollectionContainer value object.
 *
 * @example
 * ```ts
 * import { CollectionContainer } from "@beep/govinfo/domain/values/CollectionContainer/CollectionContainer.model";
 *
 * console.log(CollectionContainer);
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class CollectionContainer extends S.Class<CollectionContainer>($I`CollectionContainer`)(
  {
    /** Total number of packages available for the requested collection across all pages. */
    count: S.Int.pipe(
      S.check(S.makeFilterGroup([S.isInt32(), S.isGreaterThanOrEqualTo(0), S.isFinite()])),
      S.annotateKey({
        description: "Total number of packages available for the requested GovInfo collection across all pages.",
      })
    ),

    /** Optional informational or status message returned by the GovInfo collections endpoint. */
    message: S.String.annotateKey({
      description: "Optional informational or status message returned by the GovInfo collections endpoint.",
    }),

    /** API link to the next page of collection package results for continued pagination. */
    nextPage: S.String.annotateKey({
      description: "API link to the next page of collection package results, used to continue pagination.",
    }),

    /** The current page of GovInfo package metadata entries for the requested collection. */
    packages: PackageInfo.pipe(
      S.Array,
      S.annotateKey({
        description: "The current page of GovInfo package metadata entries for the requested collection.",
      })
    ),

    /** API link to the previous page of collection package results for backward pagination. */
    previousPage: S.String.annotateKey({
      description: "API link to the previous page of collection package results, used to page backward.",
    }),
  },
  $I.annote("CollectionContainer", {
    description:
      "A single page of a GovInfo collection response: the total package count, forward and backward pagination links, an optional API message, and the current page of package metadata.",
  })
) {}

/**
 * The companion namespace for the {@link CollectionContainer} value object.
 *
 * @category namespaces
 * @since 0.0.0
 */
export declare namespace CollectionContainer {
  /**
   * The companion encoded type for {@link CollectionContainer}.
   *
   * @example
   * ```ts
   * import type { CollectionContainer } from "@beep/govinfo/domain/values/CollectionContainer/CollectionContainer.model";
   *
   * const useEncoded = (_value: CollectionContainer.Encoded) => true;
   * console.log(useEncoded);
   * ```
   *
   * @category models
   * @since 0.0.0
   */
  export type Encoded = typeof CollectionContainer.Encoded;
}
