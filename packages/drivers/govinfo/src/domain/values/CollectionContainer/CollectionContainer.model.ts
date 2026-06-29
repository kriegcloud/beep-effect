/**
 * The CollectionContainer value object module for the `@beep/govinfo` driver.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $GovinfoId } from "@beep/identity";
import * as S from "effect/Schema";
import {PackageInfo} from "../PackageInfo/index.ts";

const $I = $GovinfoId.create("domain/values/CollectionContainer/CollectionContainer.model");

/**
 * The CollectionContainer value object.
 *
 * @example
 * ```ts
 * import { CollectionContainer } from "@beep/govinfo/domain/values/CollectionContainer/CollectionContainer.model";
 *
 * console.log(CollectionContainer.make({}));
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class CollectionContainer extends S.Class<CollectionContainer>($I`CollectionContainer`)(
	{
		/** change me */
		count: S.Int.pipe(
			S.check(
				S.makeFilterGroup([
					S.isInt32(),
					S.isGreaterThanOrEqualTo(0),
					S.isFinite()
				])
			),
			S.annotateKey({
			description: ""
		})),

		/** change me */
		message: S.String.annotateKey({
			description: ""
		}),

		/** change me */
		nextPage: S.String.annotateKey({
			description: ""
		}),

		/** change me */
		packages: PackageInfo.pipe(S.Array, S.annotateKey({
			description: ""
		})),

		/** change me */
		previousPage: S.String.annotateKey({
			description: ""
		}),
	},
	$I.annote("CollectionContainer", {
		description: "The CollectionContainer value object.",
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
	 * The compainion encoded type for {@link CollectionContainer}.
	 *
	 * @example
	 * ```ts
	 * import type { CollectionContainer } from "@beep/govinfo/domain/values/CollectionContainer/CollectionContainer.model";
	 *
	 * const thing: CollectionContainer.Encoded = CollectionContainer.make({});
	 * ```
	 *
	 * @category models
	 * @since 0.0.0
	 */
	export type Encoded = typeof CollectionContainer.Encoded;
}