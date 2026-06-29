/**
 * The CollectionSummary value object module for the `@beep/govinfo` driver.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import {$GovinfoId} from "@beep/identity";
import * as S from "effect/Schema";
import {SummaryItem} from "../SummaryItem/index.ts";

const $I = $GovinfoId.create("domain/values/CollectionSummary/CollectionSummary.model");

/**
 * The CollectionSummary value object.
 *
 * @example
 * ```ts
 * import { CollectionSummary } from "@beep/govinfo/domain/values/CollectionSummary/CollectionSummary.model";
 *
 * console.log(CollectionSummary.make({}));
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const CollectionSummary = S.Array(SummaryItem).pipe($I.annoteSchema("CollectionSummary", {
	description: "The CollectionSummary value object.",
}))

/**
 * Companion type for {@link CollectionSummary}.
 *
 * @example
 * ```ts
 * import type { CollectionSummary } from "@beep/govinfo/domain/values/CollectionSummary/CollectionSummary.model";
 *
 * const thing: CollectionSummary = CollectionSummary.make({});
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
	 * The compainion encoded type for {@link CollectionSummary}.
	 *
	 * @example
	 * ```ts
	 * import type { CollectionSummary } from "@beep/govinfo/domain/values/CollectionSummary/CollectionSummary.model";
	 *
	 * const thing: CollectionSummary.Encoded = CollectionSummary.make({});
	 * ```
	 *
	 * @category models
	 * @since 0.0.0
	 */
	export type Encoded = typeof CollectionSummary.Encoded;
}