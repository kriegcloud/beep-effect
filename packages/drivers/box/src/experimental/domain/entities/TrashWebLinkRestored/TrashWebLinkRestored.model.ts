/**
 * TODO
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $BoxId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $BoxId.create("experimental/domain/entities/TrashWebLinkRestored/TrashWebLinkRestored.model");

/**
 *
 * @example
 * ```ts
 * import { TrashWebLinkRestored } from "@beep/box/experimental/domain/values/TrashWebLinkRestored/TrashWebLinkRestored.model";
 *
 * console.log(TrashWebLinkRestored.make({
 *
 * }))
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class TrashWebLinkRestored extends S.Class<TrashWebLinkRestored>($I`TrashWebLinkRestored`)(
	{},
	$I.annote("TrashWebLinkRestored", {
		description: "TODO",
	})
) {}

/**
 * Companion namespace for {@link TrashWebLinkRestored}
 *
 * @since 0.0.0
 */
export declare namespace TrashWebLinkRestored {
	/**
	 * Companion encoded type for {@link TrashWebLinkRestored}.
	 *
	 * @example
	 * ```ts
	 * import {TrashWebLinkRestored} from "@beep/box/experimental/domain/values/TrashWebLinkRestored/TrashWebLinkRestored.model";
	 *
	 * const thing: TrashWebLinkRestored.Encoded = S.encodeUnknownSync(TrashWebLinkRestored)({});
	 * ```
	 *
	 * @category models
	 * @since 0.0.0
	 */
	export type Encoded = typeof TrashWebLinkRestored.Encoded;
}

/**
 * Companion runtime type for {@link TrashWebLinkRestored}.
 *
 * @example
 * ```ts
 * import {TrashWebLinkRestored} from "@beep/box/experimental/domain/values/TrashWebLinkRestored/TrashWebLinkRestored.model";
 *
 * const thing: TrashWebLinkRestored = S.encodeUnknownSync(TrashWebLinkRestored)({});
 * ```
 *
 * @category models
 * @since 0.0.0
 */
// export type TrashWebLinkRestored = typeof TrashWebLinkRestored.Type;