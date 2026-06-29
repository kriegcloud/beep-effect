/**
 * TODO
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $BoxId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $BoxId.create("experimental/domain/entities/FolderReference/FolderReference.model");

/**
 *
 * @example
 * ```ts
 * import { FolderReference } from "@beep/box/experimental/domain/values/FolderReference/FolderReference.model";
 *
 * console.log(FolderReference.make({
 *
 * }))
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FolderReference extends S.Class<FolderReference>($I`FolderReference`)(
	{},
	$I.annote("FolderReference", {
		description: "TODO",
	})
) {}

/**
 * Companion namespace for {@link FolderReference}
 *
 * @since 0.0.0
 */
export declare namespace FolderReference {
	/**
	 * Companion encoded type for {@link FolderReference}.
	 *
	 * @example
	 * ```ts
	 * import {FolderReference} from "@beep/box/experimental/domain/values/FolderReference/FolderReference.model";
	 *
	 * const thing: FolderReference.Encoded = S.encodeUnknownSync(FolderReference)({});
	 * ```
	 *
	 * @category models
	 * @since 0.0.0
	 */
	export type Encoded = typeof FolderReference.Encoded;
}

/**
 * Companion runtime type for {@link FolderReference}.
 *
 * @example
 * ```ts
 * import {FolderReference} from "@beep/box/experimental/domain/values/FolderReference/FolderReference.model";
 *
 * const thing: FolderReference = S.encodeUnknownSync(FolderReference)({});
 * ```
 *
 * @category models
 * @since 0.0.0
 */
// export type FolderReference = typeof FolderReference.Type;