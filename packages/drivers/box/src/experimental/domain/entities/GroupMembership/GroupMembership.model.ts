/**
 * TODO
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $BoxId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $BoxId.create("experimental/domain/entities/GroupMembership/GroupMembership.model");

/**
 *
 * @example
 * ```ts
 * import { GroupMembership } from "@beep/box/experimental/domain/values/GroupMembership/GroupMembership.model";
 *
 * console.log(GroupMembership.make({
 *
 * }))
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class GroupMembership extends S.Class<GroupMembership>($I`GroupMembership`)(
	{},
	$I.annote("GroupMembership", {
		description: "TODO",
	})
) {}

/**
 * Companion namespace for {@link GroupMembership}
 *
 * @since 0.0.0
 */
export declare namespace GroupMembership {
	/**
	 * Companion encoded type for {@link GroupMembership}.
	 *
	 * @example
	 * ```ts
	 * import {GroupMembership} from "@beep/box/experimental/domain/values/GroupMembership/GroupMembership.model";
	 *
	 * const thing: GroupMembership.Encoded = S.encodeUnknownSync(GroupMembership)({});
	 * ```
	 *
	 * @category models
	 * @since 0.0.0
	 */
	export type Encoded = typeof GroupMembership.Encoded;
}

/**
 * Companion runtime type for {@link GroupMembership}.
 *
 * @example
 * ```ts
 * import {GroupMembership} from "@beep/box/experimental/domain/values/GroupMembership/GroupMembership.model";
 *
 * const thing: GroupMembership = S.encodeUnknownSync(GroupMembership)({});
 * ```
 *
 * @category models
 * @since 0.0.0
 */
// export type GroupMembership = typeof GroupMembership.Type;