import type { UnsafeTypes } from "@beep/types";
import type * as A from "effect/Array";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as Struct from "effect/Struct";
import type * as Types from "effect/Types";

type OptionFields<A> = {
  [K in keyof A as A[K] extends O.Option<UnsafeTypes.UnsafeAny>
    ? K
    : never]: A[K] extends O.Option<UnsafeTypes.UnsafeAny> ? A[K] : never;
};

type OptionFieldValues<A> = {
  [K in keyof A as A[K] extends O.Option<UnsafeTypes.UnsafeAny>
    ? K
    : never]: A[K] extends O.Option<UnsafeTypes.UnsafeAny> ? O.Option.Value<A[K]> : never;
};

export type GetSomeFields<A, F extends keyof OptionFields<A>> = O.Option<
  Types.Simplify<Omit<A, F> & Pick<OptionFieldValues<A>, F>>
>;

export const getSomeFields = F.dual<
  <const A extends object, const F extends keyof OptionFields<A>>(
    fields: A.NonEmptyReadonlyArray<F>
  ) => (a: A) => GetSomeFields<A, F>,
  <const A extends object, const F extends keyof OptionFields<A>>(
    a: A,
    fields: A.NonEmptyReadonlyArray<F>
  ) => GetSomeFields<A, F>
>(
  2,
  <A extends object, const F extends keyof OptionFields<A>>(a: A, fields: A.NonEmptyReadonlyArray<F>) =>
    F.pipe(
      O.all(Struct.pick(a, ...fields) as Pick<OptionFields<A>, F>) as O.Option<Pick<OptionFieldValues<A>, F>>,
      O.map((v) => ({ ...a, ...v }))
    ) as GetSomeFields<A, F>
);
