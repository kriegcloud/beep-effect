/**
 * TODO
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $BoxId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $BoxId.create("experimental/domain/entities/TrashFile/TrashFile.model");

/**
 *
 * @example
 * ```ts
 * import { TrashFile } from "@beep/box/experimental/domain/values/TrashFile/TrashFile.model";
 *
 * console.log(TrashFile.make({
 *
 * }))
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class TrashFile extends S.Class<TrashFile>($I`TrashFile`)(
	{},
	$I.annote("TrashFile", {
		description: "TODO",
	})
) {}

/**
 * Companion namespace for {@link TrashFile}
 *
 * @since 0.0.0
 */
export declare namespace TrashFile {
	/**
	 * Companion encoded type for {@link TrashFile}.
	 *
	 * @example
	 * ```ts
	 * import {TrashFile} from "@beep/box/experimental/domain/values/TrashFile/TrashFile.model";
	 *
	 * const thing: TrashFile.Encoded = S.encodeUnknownSync(TrashFile)({});
	 * ```
	 *
	 * @category models
	 * @since 0.0.0
	 */
	export type Encoded = typeof TrashFile.Encoded;
}

/**
 * Companion runtime type for {@link TrashFile}.
 *
 * @example
 * ```ts
 * import {TrashFile} from "@beep/box/experimental/domain/values/TrashFile/TrashFile.model";
 *
 * const thing: TrashFile = S.encodeUnknownSync(TrashFile)({});
 * ```
 *
 * @category models
 * @since 0.0.0
 */
// export type TrashFile = typeof TrashFile.Type;