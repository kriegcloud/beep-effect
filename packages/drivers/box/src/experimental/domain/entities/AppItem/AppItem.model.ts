/**
 * TODO
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $BoxId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $BoxId.create("experimental/domain/entities/AppItem/AppItem.model");

/**
 *
 * @example
 * ```ts
 * import { AppItem } from "@beep/box/experimental/domain/values/AppItem/AppItem.model";
 *
 * console.log(AppItem.make({
 *
 * }))
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class AppItem extends S.Class<AppItem>($I`AppItem`)(
	{},
	$I.annote("AppItem", {
		description: "TODO",
	})
) {}

/**
 * Companion namespace for {@link AppItem}
 *
 * @since 0.0.0
 */
export declare namespace AppItem {
	/**
	 * Companion encoded type for {@link AppItem}.
	 *
	 * @example
	 * ```ts
	 * import {AppItem} from "@beep/box/experimental/domain/values/AppItem/AppItem.model";
	 *
	 * const thing: AppItem.Encoded = S.encodeUnknownSync(AppItem)({});
	 * ```
	 *
	 * @category models
	 * @since 0.0.0
	 */
	export type Encoded = typeof AppItem.Encoded;
}

/**
 * Companion runtime type for {@link AppItem}.
 *
 * @example
 * ```ts
 * import {AppItem} from "@beep/box/experimental/domain/values/AppItem/AppItem.model";
 *
 * const thing: AppItem = S.encodeUnknownSync(AppItem)({});
 * ```
 *
 * @category models
 * @since 0.0.0
 */
// export type AppItem = typeof AppItem.Type;