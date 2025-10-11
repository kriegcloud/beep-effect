import * as F from "effect/Function";
import * as S from "effect/Schema";

export type AssertsFn<T> = (u: unknown) => asserts u is T;

export type MakeAssertsFn = <const A, const I, const R>(
  schema: S.Schema<A, I, R>
) => AssertsFn<S.Schema.Type<S.Schema<A, I, R>>>;

export const makeAssertsFn: MakeAssertsFn = <const A, const I, const R>(
  schema: S.Schema<A, I, R>
): AssertsFn<S.Schema.Type<S.Schema<A, I, R>>> => S.asserts(schema);

export type MakeAssertsReturn = <const A, const I, const R>(
  schema: S.Schema<A, I, R>
) => (input: unknown) => S.Schema.Type<S.Schema<A, I, R>>;

export const makeAssertsReturn: MakeAssertsReturn = F.dual<
  <const A, const I, const R>(schema: S.Schema<A, I, R>) => (input: unknown) => S.Schema.Type<S.Schema<A, I, R>>,
  <const A, const I, const R>(input: unknown, schema: S.Schema<A, I, R>) => S.Schema.Type<S.Schema<A, I, R>>
>(2, <const A, const I, const R>(input: unknown, schema: S.Schema<A, I, R>): S.Schema.Type<S.Schema<A, I, R>> => {
  const assertType: AssertsFn<S.Schema.Type<S.Schema<A, I, R>>> = makeAssertsFn(schema);
  assertType(input);
  return input as S.Schema.Type<S.Schema<A, I, R>>;
});
