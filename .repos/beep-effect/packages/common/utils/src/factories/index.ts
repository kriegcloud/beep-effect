/**
 * Hosts concrete factory implementations (currently enum builders) for the
 * namespace surface so docgen references a stable import path.
 *
 * @example
 * import type * as FooTypes from "@beep/types/common.types";
 * import * as Utils from "@beep/utils";
 *
 * const factoriesIndexEnum = Utils.deriveKeyEnum({ draft: {}, live: {} });
 * const factoriesIndexRecord: FooTypes.Prettify<typeof factoriesIndexEnum> = factoriesIndexEnum;
 * void factoriesIndexRecord;
 *
 * @category Documentation
 * @since 0.1.0
 */
export * from "@beep/utils/factories/enum.factory";
