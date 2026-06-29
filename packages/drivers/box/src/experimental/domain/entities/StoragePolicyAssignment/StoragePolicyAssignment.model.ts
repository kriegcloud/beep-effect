/**
 * TODO
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $BoxId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $BoxId.create("experimental/domain/entities/StoragePolicyAssignment/StoragePolicyAssignment.model");

/**
 *
 * @example
 * ```ts
 * import { StoragePolicyAssignment } from "@beep/box/experimental/domain/values/StoragePolicyAssignment/StoragePolicyAssignment.model";
 *
 * console.log(StoragePolicyAssignment.make({
 *
 * }))
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class StoragePolicyAssignment extends S.Class<StoragePolicyAssignment>($I`StoragePolicyAssignment`)(
	{},
	$I.annote("StoragePolicyAssignment", {
		description: "TODO",
	})
) {}

/**
 * Companion namespace for {@link StoragePolicyAssignment}
 *
 * @since 0.0.0
 */
export declare namespace StoragePolicyAssignment {
	/**
	 * Companion encoded type for {@link StoragePolicyAssignment}.
	 *
	 * @example
	 * ```ts
	 * import {StoragePolicyAssignment} from "@beep/box/experimental/domain/values/StoragePolicyAssignment/StoragePolicyAssignment.model";
	 *
	 * const thing: StoragePolicyAssignment.Encoded = S.encodeUnknownSync(StoragePolicyAssignment)({});
	 * ```
	 *
	 * @category models
	 * @since 0.0.0
	 */
	export type Encoded = typeof StoragePolicyAssignment.Encoded;
}

/**
 * Companion runtime type for {@link StoragePolicyAssignment}.
 *
 * @example
 * ```ts
 * import {StoragePolicyAssignment} from "@beep/box/experimental/domain/values/StoragePolicyAssignment/StoragePolicyAssignment.model";
 *
 * const thing: StoragePolicyAssignment = S.encodeUnknownSync(StoragePolicyAssignment)({});
 * ```
 *
 * @category models
 * @since 0.0.0
 */
// export type StoragePolicyAssignment = typeof StoragePolicyAssignment.Type;