/**
 * Barrel module exposing structured data helpers such as `ArrayUtils`,
 * `RecordUtils`, and `StrUtils` from the `@beep/utils` namespace so docs can
 * reference a single entry point.
 *
 * @example
 * import type * as FooTypes from "@beep/types/common.types";
 * import * as Utils from "@beep/utils";
 *
 * const dataModuleCollection: FooTypes.Prettify<Array<{ name: string }>> = [
 *   { name: "b" },
 *   { name: "a" },
 * ];
 * const dataModuleSorted = Utils.ArrayUtils.orderBy(dataModuleCollection, ["name"], ["asc"]);
 * void dataModuleSorted;
 *
 * @category Documentation
 * @since 0.1.0
 */
/**
 * Makes the aggregated data utilities available from the root namespace.
 *
 * @example
 * import * as Utils from "@beep/utils";
 *
 * const dataBarrelRecord: { readonly foo: number } = { foo: 1 };
 * const dataBarrelValues = Utils.RecordUtils.recordKeys(dataBarrelRecord);
 * void dataBarrelValues;
 *
 * @category Documentation
 * @since 0.1.0
 */
export * from "@beep/utils/data/index";
