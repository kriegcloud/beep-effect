/**
 * Struct field merge helpers for schema factories.
 *
 * Offers a consistent right-biased merge so tagged schemas compose cleanly.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { mergeFields } from "@beep/schema/core/utils/merge-fields";
 *
 * const merged = mergeFields({ id: S.String }, { name: S.String });
 *
 * @category Core/Utils
 * @since 0.1.0
 */
import * as R from "effect/Record";
import type * as S from "effect/Schema";

type Fields = S.Struct.Fields;

/**
 * Merges schema struct field records with right-bias semantics.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { mergeFields } from "@beep/schema/core/utils/merge-fields";
 *
 * const base = { id: S.String };
 * const extended = mergeFields(base)({ name: S.String });
 *
 * @category Core/Utils
 * @since 0.1.0
 */
export function mergeFields<const A extends Fields>(a: A): <const B extends Fields>(b: B) => A & B;
/**
 * Immediately merges two struct field sets without creating a curried helper.
 *
 * This overload is useful when both field dictionaries are available and you want a single merged record.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { mergeFields } from "@beep/schema/core/utils/merge-fields";
 *
 * const merged = mergeFields({ id: S.String }, { name: S.String });
 *
 * @category Core/Utils
 * @since 0.1.0
 */
export function mergeFields<const A extends Fields, const B extends Fields>(a: A, b: B): A & B;
/**
 * Internal implementation backing the mergeFields overloads.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { mergeFields } from "@beep/schema/core/utils/merge-fields";
 *
 * const result = mergeFields({ id: S.String }, { name: S.String });
 *
 * @category Core/Utils
 * @since 0.1.0
 * @internal
 */
export function mergeFields<const A extends Fields, const B extends Fields>(a: A, b?: B) {
  if (b === undefined) {
    return <const C extends Fields>(bb: C): A & C => mergeFields(a, bb);
  }

  return R.union(a, b, (_, right) => right) as A & B;
}
