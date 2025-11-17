/**
 * Provides the namespace-friendly surface for object helpers like
 * `Utils.ObjectUtils.deepMerge` so docgen resolves a single entry path.
 *
 * @example
 * import type * as FooTypes from "@beep/types/common.types";
 * import * as Utils from "@beep/utils";
 *
 * const objectUtilsIndexLeft: FooTypes.Prettify<{ settings: { theme: string } }> = { settings: { theme: "light" } };
 * const objectUtilsIndexMerged = Utils.ObjectUtils.deepMerge(objectUtilsIndexLeft, {
 *   settings: { theme: "dark" },
 * });
 * void objectUtilsIndexMerged;
 *
 * @category Documentation/Modules
 * @since 0.1.0
 */
export * from "@beep/utils/data/object.utils/deep-merge";
