/**
 * Barrel module for assertion helpers so downstream packages can rely on
 * `@beep/utils` namespace exports when wiring runtime guards.
 *
 * @example
 * import type * as FooTypes from "@beep/types/common.types";
 * import * as Utils from "@beep/utils";
 * import * as S from "effect/Schema";
 *
 * const assertionsModuleSchema = S.Struct({ id: S.String });
 * const assertionsModuleFn: (value: { id: string }) => asserts value is { id: string } =
 *   Utils.makeAssertsFn(assertionsModuleSchema);
 * const assertionsModuleRecord: FooTypes.Prettify<{ id: string }> = { id: "tenant_123" };
 * assertionsModuleFn(assertionsModuleRecord);
 *
 * @category Documentation/Modules
 * @since 0.1.0
 */
export * from "@beep/utils/assertions/index";
