/**
 * Barrel exposing runtime guards from `@beep/utils` so documentation links can
 * reference the namespace entry instead of deep paths.
 *
 * @example
 * import type * as FooTypes from "@beep/types/common.types";
 * import * as Utils from "@beep/utils";
 *
 * const guardsModuleRecord: FooTypes.Prettify<{ id: number }> = { id: 1 };
 * const guardsModuleResult = Utils.isNonEmptyRecordWithNonEmptyStringKeys({ foo: "bar" });
 * void guardsModuleResult;
 *
 * @category Documentation
 * @since 0.1.0
 */
/**
 * Makes the guard namespace accessible at the root.
 *
 * @example
 * import * as Utils from "@beep/utils";
 *
 * const guardsExport = Utils.isUnsafeProperty("__proto__");
 * void guardsExport;
 *
 * @category Documentation
 * @since 0.1.0
 */
export * from "@beep/utils/guards/index";
