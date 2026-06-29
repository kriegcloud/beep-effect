/**
 * TODO
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $BoxId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $BoxId.create("experimental/domain/entities/Item/Item.model");

/**
 *
 * @example
 * ```ts
 * import { Item } from "@beep/box/experimental/domain/values/Item/Item.model";
 *
 * console.log(Item.make({
 *
 * }))
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class Item extends S.Class<Item>($I`Item`)(
	{},
	$I.annote("Item", {
		description: "TODO",
	})
) {}

/**
 * Companion namespace for {@link Item}
 *
 * @since 0.0.0
 */
export declare namespace Item {
	/**
	 * Companion encoded type for {@link Item}.
	 *
	 * @example
	 * ```ts
	 * import {Item} from "@beep/box/experimental/domain/values/Item/Item.model";
	 *
	 * const thing: Item.Encoded = S.encodeUnknownSync(Item)({});
	 * ```
	 *
	 * @category models
	 * @since 0.0.0
	 */
	export type Encoded = typeof Item.Encoded;
}

/**
 * Companion runtime type for {@link Item}.
 *
 * @example
 * ```ts
 * import {Item} from "@beep/box/experimental/domain/values/Item/Item.model";
 *
 * const thing: Item = S.encodeUnknownSync(Item)({});
 * ```
 *
 * @category models
 * @since 0.0.0
 */
// export type Item = typeof Item.Type;