/**
 * TODO
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $BoxId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $BoxId.create("experimental/domain/entities/TrashFolder/TrashFolder.model");

/**
 *
 * @example
 * ```ts
 * import { TrashFolder } from "@beep/box/experimental/domain/values/TrashFolder/TrashFolder.model";
 *
 * console.log(TrashFolder.make({
 *
 * }))
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class TrashFolder extends S.Class<TrashFolder>($I`TrashFolder`)(
	{},
	$I.annote("TrashFolder", {
		description: "TODO",
	})
) {}

/**
 * Companion namespace for {@link TrashFolder}
 *
 * @since 0.0.0
 */
export declare namespace TrashFolder {
	/**
	 * Companion encoded type for {@link TrashFolder}.
	 *
	 * @example
	 * ```ts
	 * import {TrashFolder} from "@beep/box/experimental/domain/values/TrashFolder/TrashFolder.model";
	 *
	 * const thing: TrashFolder.Encoded = S.encodeUnknownSync(TrashFolder)({});
	 * ```
	 *
	 * @category models
	 * @since 0.0.0
	 */
	export type Encoded = typeof TrashFolder.Encoded;
}

/**
 * Companion runtime type for {@link TrashFolder}.
 *
 * @example
 * ```ts
 * import {TrashFolder} from "@beep/box/experimental/domain/values/TrashFolder/TrashFolder.model";
 *
 * const thing: TrashFolder = S.encodeUnknownSync(TrashFolder)({});
 * ```
 *
 * @category models
 * @since 0.0.0
 */
// export type TrashFolder = typeof TrashFolder.Type;