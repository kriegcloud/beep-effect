/**
 * Core assertion factories that bind Effect schema helpers to namespace exports
 * so every consumer can derive typed guards without digging into internals.
 *
 * @example
 * import type * as FooTypes from "@beep/types/common.types";
 * import * as Utils from "@beep/utils";
 * import * as S from "effect/Schema";
 *
 * const assertionsCommonSchema = S.Struct({ email: S.String });
 * const assertionsCommonEnsure = Utils.makeAssertsReturn(assertionsCommonSchema);
 * const assertionsCommonValue: FooTypes.Prettify<{ email: string }> = { email: "ops@example.com" };
 * assertionsCommonEnsure(assertionsCommonValue);
 *
 * @category Documentation/Modules
 * @since 0.1.0
 */
import * as F from "effect/Function";
import * as S from "effect/Schema";

/**
 * Typed assertion signature used by schema helpers.
 *
 * @example
 * import type { AssertsFn } from "@beep/utils/assertions/common";
 *
 * const assertString: AssertsFn<string> = (value) => {
 *   if (typeof value !== "string") throw new Error("not string");
 * };
 *
 * @category Assertions/Core
 * @since 0.1.0
 */
export type AssertsFn<T> = (u: unknown) => asserts u is T;

/**
 * Factory type for creating assertion functions from Effect schemas.
 *
 * @example
 * import type { MakeAssertsFn } from "@beep/utils/assertions/common";
 *
 * const make: MakeAssertsFn = (schema) => schema as any;
 *
 * @category Assertions/Core
 * @since 0.1.0
 */
export type MakeAssertsFn = <const A, const I, const R>(
  schema: S.Schema<A, I, R>
) => AssertsFn<S.Schema.Type<S.Schema<A, I, R>>>;

/**
 * Builds an assertion function from a schema by reusing `S.asserts`.
 *
 * @example
 * import { makeAssertsFn } from "@beep/utils/assertions/common";
 * import * as S from "effect/Schema";
 *
 * const assertEmail = makeAssertsFn(S.String);
 *
 * @category Assertions/Core
 * @since 0.1.0
 */
export const makeAssertsFn: MakeAssertsFn = <const A, const I, const R>(
  schema: S.Schema<A, I, R>
): AssertsFn<S.Schema.Type<S.Schema<A, I, R>>> => S.asserts(schema);

/**
 * Factory type for creating assertion functions that return the validated
 * value, making them composable inside expressions.
 *
 * @example
 * import type { MakeAssertsReturn } from "@beep/utils/assertions/common";
 *
 * const fn: MakeAssertsReturn = (schema) => (value) => value as any;
 *
 * @category Assertions/Core
 * @since 0.1.0
 */
export type MakeAssertsReturn = <const A, const I, const R>(
  schema: S.Schema<A, I, R>
) => (input: unknown) => S.Schema.Type<S.Schema<A, I, R>>;

/**
 * Creates a function that asserts an input via a schema and returns the typed
 * result.
 *
 * @example
 * import { makeAssertsReturn } from "@beep/utils/assertions/common";
 * import * as S from "effect/Schema";
 *
 * const ensureString = makeAssertsReturn(S.String);
 *
 * @category Assertions/Core
 * @since 0.1.0
 */
export const makeAssertsReturn: MakeAssertsReturn = F.dual<
  <const A, const I, const R>(schema: S.Schema<A, I, R>) => (input: unknown) => S.Schema.Type<S.Schema<A, I, R>>,
  <const A, const I, const R>(input: unknown, schema: S.Schema<A, I, R>) => S.Schema.Type<S.Schema<A, I, R>>
>(2, <const A, const I, const R>(input: unknown, schema: S.Schema<A, I, R>): S.Schema.Type<S.Schema<A, I, R>> => {
  const assertType: AssertsFn<S.Schema.Type<S.Schema<A, I, R>>> = makeAssertsFn(schema);
  assertType(input);
  return input as S.Schema.Type<S.Schema<A, I, R>>;
});
