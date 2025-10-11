import type { AssertsFn } from "@beep/utils/assertions";
import { makeAssertsFn, makeAssertsReturn } from "@beep/utils/assertions";
import type * as A from "effect/Array";
import * as S from "effect/Schema";

export const isNonEmptyReadonlyArrayOfGuard =
  <const A, const I, const R>(self: S.Schema<A, I, R>) =>
  (array: unknown): array is A.NonEmptyReadonlyArray<S.Schema.Type<S.Schema<A, I, R>>> =>
    S.is(S.NonEmptyArray(self))(array);

type AssertIsNonEmptyArrayOf = <const A, const I, const R>(
  elementSchema: S.Schema<A, I, R>
) => AssertsFn<S.Schema.Type<S.Schema<A, I, R>>>;

export const assertIsNonEmptyArrayOf: AssertIsNonEmptyArrayOf = <const A, const I, const R>(
  elementSchema: S.Schema<A, I, R>
) => makeAssertsFn(S.NonEmptyArray(elementSchema));

type AssertReturnNonEmpty = <const A, const I, const R>(
  elementSchema: S.Schema<A, I, R>
) => AssertsFn<S.Schema.Type<S.Schema<A, I, R>>>;

export const assertReturnNonEmpty: AssertReturnNonEmpty = <const A, const I, const R>(
  elementSchema: S.Schema<A, I, R>
) => makeAssertsReturn(S.NonEmptyArray(elementSchema));
