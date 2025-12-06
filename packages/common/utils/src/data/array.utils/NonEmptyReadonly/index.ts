/**
 * Re-exports the `NonEmptyReadonly` helpers for `Utils.ArrayUtils` so docs
 * reference the namespace path instead of a nested directory.
 *
 * @example
 * import type * as FooTypes from "@beep/types/common.types";
 * import * as Utils from "@beep/utils";
 *
 * const nonEmptyIndexTuple: FooTypes.Prettify<["alpha", "beta"]> = ["alpha", "beta"];
 * const nonEmptyIndexResult = Utils.ArrayUtils.NonEmptyReadonly.mapWith((value: string) => value.toUpperCase())(
 *   nonEmptyIndexTuple
 * );
 * void nonEmptyIndexResult;
 *
 * @category Documentation
 * @since 0.1.0
 */
export * as NonEmptyReadonly from "@beep/utils/data/array.utils/NonEmptyReadonly/NonEmptyreadonly";
