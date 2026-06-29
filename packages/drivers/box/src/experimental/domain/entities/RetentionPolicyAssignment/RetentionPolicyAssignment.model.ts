/**
 * TODO
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $BoxId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $BoxId.create("experimental/domain/entities/RetentionPolicyAssignment/RetentionPolicyAssignment.model");

/**
 *
 * @example
 * ```ts
 * import { RetentionPolicyAssignment } from "@beep/box/experimental/domain/values/RetentionPolicyAssignment/RetentionPolicyAssignment.model";
 *
 * console.log(RetentionPolicyAssignment.make({
 *
 * }))
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class RetentionPolicyAssignment extends S.Class<RetentionPolicyAssignment>($I`RetentionPolicyAssignment`)(
	{},
	$I.annote("RetentionPolicyAssignment", {
		description: "TODO",
	})
) {}

/**
 * Companion namespace for {@link RetentionPolicyAssignment}
 *
 * @since 0.0.0
 */
export declare namespace RetentionPolicyAssignment {
	/**
	 * Companion encoded type for {@link RetentionPolicyAssignment}.
	 *
	 * @example
	 * ```ts
	 * import {RetentionPolicyAssignment} from "@beep/box/experimental/domain/values/RetentionPolicyAssignment/RetentionPolicyAssignment.model";
	 *
	 * const thing: RetentionPolicyAssignment.Encoded = S.encodeUnknownSync(RetentionPolicyAssignment)({});
	 * ```
	 *
	 * @category models
	 * @since 0.0.0
	 */
	export type Encoded = typeof RetentionPolicyAssignment.Encoded;
}

/**
 * Companion runtime type for {@link RetentionPolicyAssignment}.
 *
 * @example
 * ```ts
 * import {RetentionPolicyAssignment} from "@beep/box/experimental/domain/values/RetentionPolicyAssignment/RetentionPolicyAssignment.model";
 *
 * const thing: RetentionPolicyAssignment = S.encodeUnknownSync(RetentionPolicyAssignment)({});
 * ```
 *
 * @category models
 * @since 0.0.0
 */
// export type RetentionPolicyAssignment = typeof RetentionPolicyAssignment.Type;