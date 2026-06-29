/**
 * TODO
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $BoxId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $BoxId.create("experimental/domain/entities/WebLink/WebLink.model");

/**
 *
 * @example
 * ```ts
 * import { WebLink } from "@beep/box/experimental/domain/values/WebLink/WebLink.model";
 *
 * console.log(WebLink.make({
 *
 * }))
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class WebLink extends S.Class<WebLink>($I`WebLink`)(
	{},
	$I.annote("WebLink", {
		description: "TODO",
	})
) {}

/**
 * Companion namespace for {@link WebLink}
 *
 * @since 0.0.0
 */
export declare namespace WebLink {
	/**
	 * Companion encoded type for {@link WebLink}.
	 *
	 * @example
	 * ```ts
	 * import {WebLink} from "@beep/box/experimental/domain/values/WebLink/WebLink.model";
	 *
	 * const thing: WebLink.Encoded = S.encodeUnknownSync(WebLink)({});
	 * ```
	 *
	 * @category models
	 * @since 0.0.0
	 */
	export type Encoded = typeof WebLink.Encoded;
}

/**
 * Companion runtime type for {@link WebLink}.
 *
 * @example
 * ```ts
 * import {WebLink} from "@beep/box/experimental/domain/values/WebLink/WebLink.model";
 *
 * const thing: WebLink = S.encodeUnknownSync(WebLink)({});
 * ```
 *
 * @category models
 * @since 0.0.0
 */
// export type WebLink = typeof WebLink.Type;