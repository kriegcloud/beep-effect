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
 * @category Documentation/Modules
 * @since 0.1.0
 */
import type { AssertsFn } from "@beep/utils/assertions";
import { makeAssertsFn, makeAssertsReturn } from "@beep/utils/assertions";
import type * as A from "effect/Array";
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
 * @category Data/Array
 * @since 0.1.0
 */
export const isNonEmptyReadonlyArrayOfGuard =
  <const A, const I, const R>(self: S.Schema<A, I, R>) =>
  (array: unknown): array is A.NonEmptyReadonlyArray<S.Schema.Type<S.Schema<A, I, R>>> =>
    S.is(S.NonEmptyArray(self))(array);

type AssertIsNonEmptyArrayOf = <const A, const I, const R>(
  elementSchema: S.Schema<A, I, R>
) => AssertsFn<S.Schema.Type<S.Schema<A, I, R>>>;

/**
 * Creates an assertion function that throws when an input fails to satisfy a
 * non-empty array schema.
 *
 * @example
 * import { ArrayUtils } from "@beep/utils";
 * import * as S from "effect/Schema";
 *
 * const assertEmails: (value: unknown) => asserts value is ReadonlyArray<string> =
 *   ArrayUtils.assertIsNonEmptyArrayOf(S.String);
 * assertEmails(["ops@example.com"]);
 *
 * @category Data/Array
 * @since 0.1.0
 */
export const assertIsNonEmptyArrayOf: AssertIsNonEmptyArrayOf = <const A, const I, const R>(
  elementSchema: S.Schema<A, I, R>
) => makeAssertsFn(S.NonEmptyArray(elementSchema));

type AssertReturnNonEmpty = <const A, const I, const R>(
  elementSchema: S.Schema<A, I, R>
) => AssertsFn<S.Schema.Type<S.Schema<A, I, R>>>;

/**
 * Like `assertIsNonEmptyArrayOf` but returns the typed value so it can be
 * composed in expressions instead of mutating via `asserts`.
 *
 * @example
 * import { ArrayUtils } from "@beep/utils";
 * import * as S from "effect/Schema";
 *
 * const ensureTags = ArrayUtils.assertReturnNonEmpty(S.String);
 * const tags = ensureTags(["default"]);
 *
 * @category Data/Array
 * @since 0.1.0
 */
export const assertReturnNonEmpty: AssertReturnNonEmpty = <const A, const I, const R>(
  elementSchema: S.Schema<A, I, R>
) => makeAssertsReturn(S.NonEmptyArray(elementSchema));
