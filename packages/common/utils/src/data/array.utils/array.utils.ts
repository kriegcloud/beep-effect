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
 * @category Data
 * @since 0.1.0
 */
export const isNonEmptyReadonlyArrayOfGuard =
  <const A, const I, const R>(self: S.Schema<A, I, R>) =>
  (array: unknown): array is A.NonEmptyReadonlyArray<S.Schema.Type<S.Schema<A, I, R>>> =>
    S.is(S.NonEmptyArray(self))(array);
