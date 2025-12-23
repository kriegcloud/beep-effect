import * as F from "effect/Function";

/**
 * A dual refinement that checks if a tagged object has a specific `_tag` value.
 * Narrows a union type to the specific variant matching the given tag.
 * Supports both data-first and data-last (point-free) usage.
 *
 * @example
 * // Data-first style
 * const opt = O.some("beep"); // Option<string>
 * if (tagPropIs(opt, "Some")) {
 *   opt.value; // narrowed to Some<string>
 * }
 *
 * @example
 * // Data-last (point-free) style - ideal for pipes
 * const ka = source.pipe(
 *   Stream.filter(tagPropIs("Ka")),
 *   Stream.timeout("5 seconds")
 * );
 */
export const tagPropIs: {
  /**
   * Data-last (point-free) signature - returns a type guard function
   */
  <T extends { _tag: string }, Tag extends T["_tag"]>(
    tag: Tag
  ): (taggedObj: T) => taggedObj is Extract<T, { _tag: Tag }>;

  /**
   * Data-first signature - directly checks the object
   */
  <T extends { _tag: string }, Tag extends T["_tag"]>(taggedObj: T, tag: Tag): taggedObj is Extract<T, { _tag: Tag }>;
} = F.dual(
  2,
  <T extends { _tag: string }, Tag extends T["_tag"]>(taggedObj: T, tag: Tag): taggedObj is Extract<T, { _tag: Tag }> =>
    taggedObj._tag === tag
);
