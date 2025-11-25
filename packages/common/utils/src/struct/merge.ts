import { pipe } from "effect";
import * as A from "effect/Array";

type Merge<S extends A.NonEmptyReadonlyArray<object>> = S extends readonly [
  infer A extends object,
  ...infer Rest extends A.NonEmptyReadonlyArray<object>,
]
  ? A & Merge<Rest>
  : S extends readonly [infer A extends object]
    ? A
    : never;

export const merge = <const S extends A.NonEmptyReadonlyArray<object>>(objects: S) =>
  pipe(
    A.tailNonEmpty(objects),
    A.match({
      onEmpty: () => A.headNonEmpty(objects),
      onNonEmpty: (tail): object => ({
        ...A.headNonEmpty(objects),
        ...(merge(tail) as object),
      }),
    })
  ) as Merge<S>;
