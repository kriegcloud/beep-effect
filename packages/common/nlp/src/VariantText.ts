/**
 * Ordered string-variant helpers.
 *
 * @since 0.0.0
 * @module \@beep/nlp/VariantText
 */
import * as Str from "@beep/utils/Str";
import { Order, pipe } from "effect";
import * as A from "effect/Array";
import { dual } from "effect/Function";

const stringEquals: {
  (left: string, right: string): boolean;
  (right: string): (left: string) => boolean;
} = dual(2, (left: string, right: string): boolean => Order.String(left, right) === 0);

/**
 * Remove empty strings and duplicates while preserving the first occurrence of
 * each variant.
 *
 * @example
 * ```typescript
 * import * as VariantText from "@beep/nlp/VariantText"
 *
 * const deduped = VariantText.orderedDedupe(["foo", "bar", "foo", "", "baz"])
 * console.log(deduped) // ["foo", "bar", "baz"]
 * ```
 *
 * @since 0.0.0
 * @category variants
 */
export const orderedDedupe = (values: ReadonlyArray<string>): ReadonlyArray<string> =>
  pipe(values, A.filter(Str.isNonEmpty), A.dedupeWith(stringEquals));
