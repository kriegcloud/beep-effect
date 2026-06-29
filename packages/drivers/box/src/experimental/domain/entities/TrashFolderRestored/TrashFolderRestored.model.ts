/**
 * TODO
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $BoxId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $BoxId.create("experimental/domain/entities/TrashFolderRestored/TrashFolderRestored.model");

/**
 *
 * @example
 * ```ts
 * import { TrashFolderRestored } from "@beep/box/experimental/domain/values/TrashFolderRestored/TrashFolderRestored.model";
 *
 * console.log(TrashFolderRestored.make({
 *
 * }))
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class TrashFolderRestored extends S.Class<TrashFolderRestored>($I`TrashFolderRestored`)(
	{},
	$I.annote("TrashFolderRestored", {
		description: "TODO",
	})
) {}

/**
 * Companion namespace for {@link TrashFolderRestored}
 *
 * @since 0.0.0
 */
export declare namespace TrashFolderRestored {
	/**
	 * Companion encoded type for {@link TrashFolderRestored}.
	 *
	 * @example
	 * ```ts
	 * import {TrashFolderRestored} from "@beep/box/experimental/domain/values/TrashFolderRestored/TrashFolderRestored.model";
	 *
	 * const thing: TrashFolderRestored.Encoded = S.encodeUnknownSync(TrashFolderRestored)({});
	 * ```
	 *
	 * @category models
	 * @since 0.0.0
	 */
	export type Encoded = typeof TrashFolderRestored.Encoded;
}

/**
 * Companion runtime type for {@link TrashFolderRestored}.
 *
 * @example
 * ```ts
 * import {TrashFolderRestored} from "@beep/box/experimental/domain/values/TrashFolderRestored/TrashFolderRestored.model";
 *
 * const thing: TrashFolderRestored = S.encodeUnknownSync(TrashFolderRestored)({});
 * ```
 *
 * @category models
 * @since 0.0.0
 */
// export type TrashFolderRestored = typeof TrashFolderRestored.Type;