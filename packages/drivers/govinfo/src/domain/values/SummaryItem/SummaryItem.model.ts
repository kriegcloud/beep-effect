/**
 * The SummaryItem value object module for the `@beep/govinfo` driver.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $GovinfoId } from "@beep/identity";
import * as S from "effect/Schema";
import { Int64 } from "@beep/schema";

const $I = $GovinfoId.create("domain/values/SummaryItem/SummaryItem.model");

/**
 * The SummaryItem value object.
 *
 * @example
 * ```ts
 * import { SummaryItem } from "@beep/govinfo/domain/values/SummaryItem/SummaryItem.model";
 *
 * console.log(SummaryItem.make({}));
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class SummaryItem extends S.Class<SummaryItem>($I`SummaryItem`)(
	{
		/** change me */
		collectionCode: S.String.annotateKey({
			description: ""
		}),

		/** change me */
		collectionName: S.String.annotateKey({
			description: ""
		}),

		/** change me */
		granuleCount: Int64.annotateKey({
			description: ""
		}),

		/** change me */
		packageCount: Int64.pipe(
			S.annotateKey({
			description: ""
		})),
	},
	$I.annote("SummaryItem", {
		description: "The SummaryItem value object.",
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
	 * The compainion encoded type for {@link SummaryItem}.
	 *
	 * @example
	 * ```ts
	 * import type { SummaryItem } from "@beep/govinfo/domain/values/SummaryItem/SummaryItem.model";
	 *
	 * const thing: SummaryItem.Encoded = SummaryItem.make({});
	 * ```
	 *
	 * @category models
	 * @since 0.0.0
	 */
	export type Encoded = typeof SummaryItem.Encoded;
}