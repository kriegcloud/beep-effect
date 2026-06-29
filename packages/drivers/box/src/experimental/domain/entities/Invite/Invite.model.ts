/**
 * TODO
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $BoxId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $BoxId.create("experimental/domain/entities/Invite/Invite.model");

/**
 *
 * @example
 * ```ts
 * import { Invite } from "@beep/box/experimental/domain/values/Invite/Invite.model";
 *
 * console.log(Invite.make({
 *
 * }))
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class Invite extends S.Class<Invite>($I`Invite`)(
	{},
	$I.annote("Invite", {
		description: "TODO",
	})
) {}

/**
 * Companion namespace for {@link Invite}
 *
 * @since 0.0.0
 */
export declare namespace Invite {
	/**
	 * Companion encoded type for {@link Invite}.
	 *
	 * @example
	 * ```ts
	 * import {Invite} from "@beep/box/experimental/domain/values/Invite/Invite.model";
	 *
	 * const thing: Invite.Encoded = S.encodeUnknownSync(Invite)({});
	 * ```
	 *
	 * @category models
	 * @since 0.0.0
	 */
	export type Encoded = typeof Invite.Encoded;
}

/**
 * Companion runtime type for {@link Invite}.
 *
 * @example
 * ```ts
 * import {Invite} from "@beep/box/experimental/domain/values/Invite/Invite.model";
 *
 * const thing: Invite = S.encodeUnknownSync(Invite)({});
 * ```
 *
 * @category models
 * @since 0.0.0
 */
// export type Invite = typeof Invite.Type;