/**
 * Core implementations backing `Utils.ArrayUtils`, covering typed guards and
 * assertion builders that integrate with Effect schemas across the repo.
 *
 * @example
 * import type * as FooTypes from "@beep/types/common.types";
 * import * as Utils from "@beep/utils";
 * import * as S from "effect/Schema";
 *
 * const arrayUtilsArray: FooTypes.Prettify<ReadonlyArray<string>> = ["alpha", "beta"];
 * const arrayUtilsEnsure = Utils.ArrayUtils.assertReturnNonEmpty(S.String);
 * const arrayUtilsReady = arrayUtilsEnsure(arrayUtilsArray);
 * void arrayUtilsReady;
 *
 * @category Documentation
 * @since 0.1.0
 */
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as S from "effect/Schema";

/**
 * Builds a guard that checks whether an unknown value is a schema-conforming
 * non-empty readonly array.
 *
 * @example
 * import { ArrayUtils } from "@beep/utils";
 * import * as S from "effect/Schema";
 *
 * const guard = ArrayUtils.isNonEmptyReadonlyArrayOfGuard(S.String);
 * guard(["a"]); // true
 *
 * @category Data
 * @since 0.1.0
 */
export const isNonEmptyReadonlyArrayOfGuard =
  <const A, const I, const R>(self: S.Schema<A, I, R>) =>
  (array: unknown): array is A.NonEmptyReadonlyArray<S.Schema.Type<S.Schema<A, I, R>>> =>
    S.is(S.NonEmptyArray(self))(array);

/**
 * Slice an array from start (inclusive) to end (exclusive).
 *
 * Combines Effect Array's drop and take operations.
 *
 * @example
 * import { ArrayUtils } from "@beep/utils";
 * import * as F from "effect/Function";
 *
 * // Data-last (pipeable)
 * F.pipe([1, 2, 3, 4, 5], ArrayUtils.slice(1, 3)); // [2, 3]
 * F.pipe([1, 2, 3, 4, 5], ArrayUtils.slice(1));    // [2, 3, 4, 5]
 *
 * // Data-first
 * ArrayUtils.slice([1, 2, 3, 4, 5], 1, 3); // [2, 3]
 * ArrayUtils.slice([1, 2, 3, 4, 5], 1);    // [2, 3, 4, 5]
 *
 * @category Helpers
 * @since 0.1.0
 */
export const slice: {
  (start: number): <A>(self: ReadonlyArray<A>) => Array<A>;
  (start: number, end: number): <A>(self: ReadonlyArray<A>) => Array<A>;
  <A>(self: ReadonlyArray<A>, start: number): Array<A>;
  <A>(self: ReadonlyArray<A>, start: number, end: number): Array<A>;
} = F.dual(
  (args: IArguments) => A.isArray(args[0]),
  <A>(self: ReadonlyArray<A>, start: number, end?: number): Array<A> =>
    end === undefined ? A.drop(self, start) : F.pipe(self, A.drop(start), A.take(end - start))
);

export const spliceRemove =
  (start: number, deleteCount: number) =>
  <A>(arr: ReadonlyArray<A>): Array<A> =>
    F.pipe(arr, A.take(start), A.appendAll(F.pipe(arr, A.drop(start + deleteCount))));
