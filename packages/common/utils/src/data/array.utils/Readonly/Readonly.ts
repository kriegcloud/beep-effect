import type { UnsafeTypes } from "@beep/types";
import * as A from "effect/Array";
import * as F from "effect/Function";

export namespace ReadonlyArray {
  export type With<S extends Iterable<UnsafeTypes.UnsafeAny>, A> = S extends ReadonlyArray<UnsafeTypes.UnsafeAny>
    ? ReadonlyArray<A>
    : never;
}

type MapReadonly = {
  <const S extends ReadonlyArray<UnsafeTypes.UnsafeAny>, const B>(
    f: (a: A.ReadonlyArray.Infer<S>, i: number) => B
  ): (self: S) => ReadonlyArray.With<S, B>;
  <const S extends ReadonlyArray<UnsafeTypes.UnsafeAny>, const B>(
    self: S,
    f: (a: A.ReadonlyArray.Infer<S>, i: number) => B
  ): ReadonlyArray.With<S, B>;
};
export const mapReadonly: MapReadonly = F.dual(
  2,
  <A, B>(self: ReadonlyArray<A>, f: (a: A, i: number) => B): ReadonlyArray<B> => A.map(self, f) as ReadonlyArray<B>
);

export const isReadonlyArray = <I, T>(value: ReadonlyArray<I> | T): value is ReadonlyArray<I> => A.isArray(value);
