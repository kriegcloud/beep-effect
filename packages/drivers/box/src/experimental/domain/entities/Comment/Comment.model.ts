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
 * import { Comment } from "@beep/box/experimental/domain/entities/Comment/Comment.model";
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
   * import type { Comment } from "@beep/box/experimental/domain/entities/Comment/Comment.model";
   *
   * const useEncoded = (_value: Comment.Encoded) => true;
   * console.log(useEncoded);
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
 * import type { Comment } from "@beep/box/experimental/domain/entities/Comment/Comment.model";
 *
 * const useValue = (_value: Comment) => true;
 * console.log(useValue);
 * ```
 *
 * @category models
 * @since 0.0.0
 */
// export type Comment = typeof Comment.Type;
