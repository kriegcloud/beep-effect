import type * as A from "effect/Array";

export const removeReadonly = <T>(
  arr: Array<T> | ReadonlyArray<T> | A.NonEmptyArray<T> | A.NonEmptyReadonlyArray<T>
): Array<T> => arr as Array<T>;

export const removeReadonlyNonEmpty = <T>(arr: A.NonEmptyArray<T> | A.NonEmptyReadonlyArray<T>): A.NonEmptyArray<T> =>
  arr as A.NonEmptyArray<T>;
