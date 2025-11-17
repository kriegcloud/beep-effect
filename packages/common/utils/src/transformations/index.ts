/**
 * Exposes enum-related factories through the namespace for doc-friendly import
 * paths.
 *
 * @example
 * import type * as FooTypes from "@beep/types/common.types";
 * import * as Utils from "@beep/utils";
 *
 * const transformationIndexEnum = Utils.enumFromStringArray("draft", "live");
 * const transformationIndexValues: FooTypes.Prettify<readonly string[]> = Utils.enumValues(transformationIndexEnum);
 * void transformationIndexValues;
 *
 * @category Documentation/Modules
 * @since 0.1.0
 */
/**
 * Re-exports the `enumFromStringArray` helper.
 *
 * @example
 * import * as Utils from "@beep/utils";
 *
 * const transformationsExportEnum = Utils.enumFromStringArray("one", "two");
 * void transformationsExportEnum;
 *
 * @category Documentation/Reexports
 * @since 0.1.0
 */
export * from "@beep/utils/transformations/enumFromStringArray";

/**
 * Re-exports the `valuesFromEnum` helper.
 *
 * @example
 * import * as Utils from "@beep/utils";
 *
 * const transformationsExportMap: { readonly foo: "foo" } = { foo: "foo" };
 * const transformationsExportValues = Utils.valuesFromEnum(transformationsExportMap);
 * void transformationsExportValues;
 *
 * @category Documentation/Reexports
 * @since 0.1.0
 */
export * from "@beep/utils/transformations/valuesFromEnum";
