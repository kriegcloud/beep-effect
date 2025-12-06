/**
 * Entry point for factory helpers (enum builders) to keep documentation aligned
 * with the `@beep/utils` namespace exports.
 *
 * @example
 * import type * as FooTypes from "@beep/types/common.types";
 * import * as Utils from "@beep/utils";
 *
 * const factoriesModuleEnum = Utils.deriveKeyEnum({ pending: {}, active: {} });
 * const factoriesModuleActive = factoriesModuleEnum.active;
 * void factoriesModuleActive;
 *
 * @category Documentation
 * @since 0.1.0
 */
export * from "@beep/utils/factories/index";
