/**
 * The CollectionSummary value object module for the `@beep/govinfo` driver.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $GovinfoId } from "@beep/identity";
import * as S from "effect/Schema";
import { SummaryItem } from "../SummaryItem/index.ts";

const $I = $GovinfoId.create("domain/values/CollectionSummary/CollectionSummary.model");

/**
 * Ordered list of GovInfo collection summaries returned by the GovInfo `/collections` endpoint, one {@link SummaryItem} entry per available collection with its package and granule counts.
 *
 * @example
 * ```ts
 * import { CollectionSummary } from "@beep/govinfo/domain/values/CollectionSummary/CollectionSummary.model";
 *
 * console.log(CollectionSummary);
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const CollectionSummary = S.Array(SummaryItem).pipe(
  $I.annoteSchema("CollectionSummary", {
    description:
      "Ordered list of GovInfo collection summaries returned by the GovInfo /collections endpoint; each entry describes one available collection and its package and granule counts.",
  })
);

/**
 * Companion type for {@link CollectionSummary}.
 *
 * @example
 * ```ts
 * import type { CollectionSummary } from "@beep/govinfo/domain/values/CollectionSummary/CollectionSummary.model";
 *
 * const useValue = (_value: CollectionSummary) => true;
 * console.log(useValue);
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type CollectionSummary = typeof CollectionSummary.Type;

/**
 * The companion namespace for the {@link CollectionSummary} value object.
 *
 * @category namespaces
 * @since 0.0.0
 */
export declare namespace CollectionSummary {
  /**
   * The companion encoded type for {@link CollectionSummary}.
   *
   * @example
   * ```ts
   * import type { CollectionSummary } from "@beep/govinfo/domain/values/CollectionSummary/CollectionSummary.model";
   *
   * const useEncoded = (_value: CollectionSummary.Encoded) => true;
   * console.log(useEncoded);
   * ```
   *
   * @category models
   * @since 0.0.0
   */
  export type Encoded = typeof CollectionSummary.Encoded;
}
