/**
 * Barrel module for string/enum transformations so docs emphasize the namespace
 * exports instead of deep module paths.
 *
 * @example
 * import type * as FooTypes from "@beep/types/common.types";
 * import * as Utils from "@beep/utils";
 *
 * const transformationEnum = Utils.enumFromStringArray("pending", "active");
 * const transformationValues: FooTypes.Prettify<readonly string[]> = Utils.enumValues(transformationEnum);
 * void transformationValues;
 *
 * @category Documentation/Modules
 * @since 0.1.0
 */
/**
 * Makes the transformations namespace available at the root level.
 *
 * @example
 * import * as Utils from "@beep/utils";
 *
 * const transformationsBarrelEnum = Utils.enumFromStringArray("gold", "silver");
 * void transformationsBarrelEnum;
 *
 * @category Documentation/Reexports
 * @since 0.1.0
 */
export * from "@beep/utils/transformations/index";
