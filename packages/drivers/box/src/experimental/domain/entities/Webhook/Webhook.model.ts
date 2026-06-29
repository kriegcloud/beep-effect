/**
 * TODO
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $BoxId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $BoxId.create("experimental/domain/entities/Webhook/Webhook.model");

/**
 *
 * @example
 * ```ts
 * import { Webhook } from "@beep/box/experimental/domain/values/Webhook/Webhook.model";
 *
 * console.log(Webhook.make({
 *
 * }))
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class Webhook extends S.Class<Webhook>($I`Webhook`)(
	{},
	$I.annote("Webhook", {
		description: "TODO",
	})
) {}

/**
 * Companion namespace for {@link Webhook}
 *
 * @since 0.0.0
 */
export declare namespace Webhook {
	/**
	 * Companion encoded type for {@link Webhook}.
	 *
	 * @example
	 * ```ts
	 * import {Webhook} from "@beep/box/experimental/domain/values/Webhook/Webhook.model";
	 *
	 * const thing: Webhook.Encoded = S.encodeUnknownSync(Webhook)({});
	 * ```
	 *
	 * @category models
	 * @since 0.0.0
	 */
	export type Encoded = typeof Webhook.Encoded;
}

/**
 * Companion runtime type for {@link Webhook}.
 *
 * @example
 * ```ts
 * import {Webhook} from "@beep/box/experimental/domain/values/Webhook/Webhook.model";
 *
 * const thing: Webhook = S.encodeUnknownSync(Webhook)({});
 * ```
 *
 * @category models
 * @since 0.0.0
 */
// export type Webhook = typeof Webhook.Type;