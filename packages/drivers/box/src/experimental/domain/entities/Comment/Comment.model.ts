/**
 * TODO
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $BoxId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $BoxId.create("experimental/domain/entities/Comment/Comment.model");

/**
 *
 * @example
 * ```ts
 * import { Comment } from "@beep/box/experimental/domain/values/Comment/Comment.model";
 *
 * console.log(Comment.make({
 *
 * }))
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class Comment extends S.Class<Comment>($I`Comment`)(
	{},
	$I.annote("Comment", {
		description: "TODO",
	})
) {}

/**
 * Companion namespace for {@link Comment}
 *
 * @since 0.0.0
 */
export declare namespace Comment {
	/**
	 * Companion encoded type for {@link Comment}.
	 *
	 * @example
	 * ```ts
	 * import {Comment} from "@beep/box/experimental/domain/values/Comment/Comment.model";
	 *
	 * const thing: Comment.Encoded = S.encodeUnknownSync(Comment)({});
	 * ```
	 *
	 * @category models
	 * @since 0.0.0
	 */
	export type Encoded = typeof Comment.Encoded;
}

/**
 * Companion runtime type for {@link Comment}.
 *
 * @example
 * ```ts
 * import {Comment} from "@beep/box/experimental/domain/values/Comment/Comment.model";
 *
 * const thing: Comment = S.encodeUnknownSync(Comment)({});
 * ```
 *
 * @category models
 * @since 0.0.0
 */
// export type Comment = typeof Comment.Type;