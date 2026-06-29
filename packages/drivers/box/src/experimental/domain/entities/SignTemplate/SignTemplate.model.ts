/**
 * TODO
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $BoxId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $BoxId.create("experimental/domain/entities/SignTemplate/SignTemplate.model");

/**
 *
 * @example
 * ```ts
 * import { SignTemplate } from "@beep/box/experimental/domain/values/SignTemplate/SignTemplate.model";
 *
 * console.log(SignTemplate.make({
 *
 * }))
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class SignTemplate extends S.Class<SignTemplate>($I`SignTemplate`)(
	{},
	$I.annote("SignTemplate", {
		description: "TODO",
	})
) {}

/**
 * Companion namespace for {@link SignTemplate}
 *
 * @since 0.0.0
 */
export declare namespace SignTemplate {
	/**
	 * Companion encoded type for {@link SignTemplate}.
	 *
	 * @example
	 * ```ts
	 * import {SignTemplate} from "@beep/box/experimental/domain/values/SignTemplate/SignTemplate.model";
	 *
	 * const thing: SignTemplate.Encoded = S.encodeUnknownSync(SignTemplate)({});
	 * ```
	 *
	 * @category models
	 * @since 0.0.0
	 */
	export type Encoded = typeof SignTemplate.Encoded;
}

/**
 * Companion runtime type for {@link SignTemplate}.
 *
 * @example
 * ```ts
 * import {SignTemplate} from "@beep/box/experimental/domain/values/SignTemplate/SignTemplate.model";
 *
 * const thing: SignTemplate = S.encodeUnknownSync(SignTemplate)({});
 * ```
 *
 * @category models
 * @since 0.0.0
 */
// export type SignTemplate = typeof SignTemplate.Type;