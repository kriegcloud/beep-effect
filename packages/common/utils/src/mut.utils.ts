/**
 * Mutable helpers exported via `@beep/utils` for controlled readonly escapes,
 * letting doc consumers understand `Utils.removeReadonly` semantics.
 *
 * @example
 * import type * as FooTypes from "@beep/types/common.types";
 * import * as Utils from "@beep/utils";
 *
 * const mutUtilsTuple: FooTypes.Prettify<readonly [number, number]> = [1, 2];
 * const mutUtilsArray = Utils.removeReadonly(mutUtilsTuple);
 * const mutUtilsFirst = mutUtilsArray[0];
 * void mutUtilsFirst;
 *
 * @category Documentation/Modules
 * @since 0.1.0
 */
import type * as A from "effect/Array";

/**
 * Unsafely removes readonly-ness from an array when mutation is required.
 *
 * @example
 * import { removeReadonly } from "@beep/utils/mut.utils";
 *
 * const list = removeReadonly([1, 2] as const);
 * const firstItem = list[0];
 * void firstItem;
 *
 * @category Core/Mutation
 * @since 0.1.0
 */
export const removeReadonly = <T>(
  arr: Array<T> | ReadonlyArray<T> | A.NonEmptyArray<T> | A.NonEmptyReadonlyArray<T>
): Array<T> => arr as Array<T>;

/**
 * Removes readonly from a non-empty array while preserving the non-empty type.
 *
 * @example
 * import { removeReadonlyNonEmpty } from "@beep/utils/mut.utils";
 *
 * const arr = removeReadonlyNonEmpty([1, 2] as const);
 *
 * @category Core/Mutation
 * @since 0.1.0
 */
export const removeReadonlyNonEmpty = <T>(arr: A.NonEmptyArray<T> | A.NonEmptyReadonlyArray<T>): A.NonEmptyArray<T> =>
  arr as A.NonEmptyArray<T>;
