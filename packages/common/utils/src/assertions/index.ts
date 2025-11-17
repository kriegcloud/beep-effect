/**
 * Aggregates assertion helpers into the namespace-facing surface so docs can
 * highlight `Utils.makeAssertsFn` and related factories via a single module.
 *
 * @example
 * import type * as FooTypes from "@beep/types/common.types";
 * import * as Utils from "@beep/utils";
 * import * as S from "effect/Schema";
 *
 * const assertionsIndexSchema = S.Struct({ email: S.String });
 * const assertionsIndexFn: (value: { email: string }) => asserts value is { email: string } =
 *   Utils.makeAssertsFn(assertionsIndexSchema);
 * const assertionsIndexValue: FooTypes.Prettify<{ email: string }> = { email: "ops@example.com" };
 * assertionsIndexFn(assertionsIndexValue);
 *
 * @category Documentation/Modules
 * @since 0.1.0
 */
export * from "@beep/utils/assertions/common";
