/**
 * Type guard for tagged objects (discriminated unions).
 * Narrows a union type to the specific variant matching the given tag.
 *
 * @example
 * const opt = O.some("beep"); // Option<string>
 * if (tagIs(opt, "Some")) {
 *   opt.value; // narrowed to Some<string>
 * }
 */
export const tagPropIs = <T extends { _tag: string }, Tag extends T["_tag"]>(
  taggedObj: T,
  tag: Tag
): taggedObj is Extract<T, { _tag: Tag }> => taggedObj._tag === tag;
