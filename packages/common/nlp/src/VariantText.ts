/**
 * Ordered string-variant helpers.
 *
 * @since 0.0.0
 * @module @beep/nlp/VariantText
 */
import * as Str from "@beep/utils/Str";
import { pipe } from "effect";
import * as A from "effect/Array";
import * as Order from "effect/Order";

const stringEquals = (left: string, right: string): boolean => Order.String(left, right) === 0;

/**
 * Remove empty strings and duplicates while preserving the first occurrence of
 * each variant.
 *
 * @since 0.0.0
 * @category Variants
 */
export const orderedDedupe = (values: ReadonlyArray<string>): ReadonlyArray<string> =>
  pipe(values, A.filter(Str.isNonEmpty), A.dedupeWith(stringEquals));
