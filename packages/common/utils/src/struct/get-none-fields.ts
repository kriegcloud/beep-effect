/**
 * @since 0.1.0
 */

import type { UnsafeTypes } from "@beep/types";
import * as A from "effect/Array";
import * as Bool from "effect/Boolean";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as Struct from "effect/Struct";
import type * as Types from "effect/Types";

type OptionFields<A> = {
  [K in keyof A as A[K] extends O.Option<UnsafeTypes.UnsafeAny>
    ? K
    : never]: A[K] extends O.Option<UnsafeTypes.UnsafeAny> ? A[K] : never;
};

export type GetNoneFields<A, F extends keyof OptionFields<A>> = O.Option<Types.Simplify<Omit<A, F>>>;

export const getNoneFields = F.dual<
  <const A extends object, const F extends keyof OptionFields<A>>(
    fields: A.NonEmptyReadonlyArray<F>
  ) => (a: A) => GetNoneFields<A, F>,
  <const A extends object, const F extends keyof OptionFields<A>>(
    a: A,
    fields: A.NonEmptyReadonlyArray<F>
  ) => GetNoneFields<A, F>
>(2, <const A extends object, const F extends keyof OptionFields<A>>(a: A, fields: A.NonEmptyReadonlyArray<F>) =>
  F.pipe(
    fields,
    A.every((field) => F.pipe(a[field] as OptionFields<A>[F], O.isNone)),
    Bool.match({
      onFalse: () => O.none(),
      onTrue: () => O.some(Struct.omit(...fields)(a)),
    })
  )
);
