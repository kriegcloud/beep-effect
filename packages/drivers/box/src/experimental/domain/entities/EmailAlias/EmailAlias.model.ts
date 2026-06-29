/**
 * TODO
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $BoxId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $BoxId.create("experimental/domain/entities/EmailAlias/EmailAlias.model");

/**
 *
 * @example
 * ```ts
 * import { EmailAlias } from "@beep/box/experimental/domain/values/EmailAlias/EmailAlias.model";
 *
 * console.log(EmailAlias.make({
 *
 * }))
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class EmailAlias extends S.Class<EmailAlias>($I`EmailAlias`)(
	{},
	$I.annote("EmailAlias", {
		description: "TODO",
	})
) {}

/**
 * Companion namespace for {@link EmailAlias}
 *
 * @since 0.0.0
 */
export declare namespace EmailAlias {
	/**
	 * Companion encoded type for {@link EmailAlias}.
	 *
	 * @example
	 * ```ts
	 * import {EmailAlias} from "@beep/box/experimental/domain/values/EmailAlias/EmailAlias.model";
	 *
	 * const thing: EmailAlias.Encoded = S.encodeUnknownSync(EmailAlias)({});
	 * ```
	 *
	 * @category models
	 * @since 0.0.0
	 */
	export type Encoded = typeof EmailAlias.Encoded;
}

/**
 * Companion runtime type for {@link EmailAlias}.
 *
 * @example
 * ```ts
 * import {EmailAlias} from "@beep/box/experimental/domain/values/EmailAlias/EmailAlias.model";
 *
 * const thing: EmailAlias = S.encodeUnknownSync(EmailAlias)({});
 * ```
 *
 * @category models
 * @since 0.0.0
 */
// export type EmailAlias = typeof EmailAlias.Type;