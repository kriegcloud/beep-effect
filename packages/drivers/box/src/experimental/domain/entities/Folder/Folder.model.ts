/**
 * TODO
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $BoxId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $BoxId.create("experimental/domain/entities/Folder/Folder.model");

/**
 *
 * @example
 * ```ts
 * import { Folder } from "@beep/box/experimental/domain/values/Folder/Folder.model";
 *
 * console.log(Folder.make({
 *
 * }))
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class Folder extends S.Class<Folder>($I`Folder`)(
	{},
	$I.annote("Folder", {
		description: "TODO",
	})
) {}

/**
 * Companion namespace for {@link Folder}
 *
 * @since 0.0.0
 */
export declare namespace Folder {
	/**
	 * Companion encoded type for {@link Folder}.
	 *
	 * @example
	 * ```ts
	 * import {Folder} from "@beep/box/experimental/domain/values/Folder/Folder.model";
	 *
	 * const thing: Folder.Encoded = S.encodeUnknownSync(Folder)({});
	 * ```
	 *
	 * @category models
	 * @since 0.0.0
	 */
	export type Encoded = typeof Folder.Encoded;
}

/**
 * Companion runtime type for {@link Folder}.
 *
 * @example
 * ```ts
 * import {Folder} from "@beep/box/experimental/domain/values/Folder/Folder.model";
 *
 * const thing: Folder = S.encodeUnknownSync(Folder)({});
 * ```
 *
 * @category models
 * @since 0.0.0
 */
// export type Folder = typeof Folder.Type;