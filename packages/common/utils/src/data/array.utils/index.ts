/**
 * Collects array-specific helpers (non-empty constructors, ordering utilities)
 * into the `Utils.ArrayUtils` namespace for easier documentation discovery.
 *
 * @example
 * import type * as FooTypes from "@beep/types/common.types";
 * import * as Utils from "@beep/utils";
 *
 * const arrayUtilsIndexItems: FooTypes.Prettify<Array<{ priority: number }>> = [
 *   { priority: 2 },
 *   { priority: 1 },
 * ];
 * const arrayUtilsIndexSorted = Utils.ArrayUtils.orderBy(arrayUtilsIndexItems, ["priority"], ["asc"]);
 * void arrayUtilsIndexSorted;
 *
 * @category Documentation
 * @since 0.1.0
 */
/**
 * Provides general Array utilities under `Utils.ArrayUtils`.
 *
 * @example
 * import * as Utils from "@beep/utils";
 * import * as S from "effect/Schema";
 *
 * void arrayUtilsExportValues;
 *
 * @category Documentation
 * @since 0.1.0
 */
export * from "@beep/utils/data/array.utils/array.utils";

/**
 * Provides `Utils.ArrayUtils.NonEmptyReadonly`.
 *
 * @example
 * import * as Utils from "@beep/utils";
 *
 * const arrayUtilsExportNonEmpty = Utils.ArrayUtils.NonEmptyReadonly.make("one", "two");
 * void arrayUtilsExportNonEmpty;
 *
 * @category Documentation
 * @since 0.1.0
 */
export * as NonEmptyReadonly from "@beep/utils/data/array.utils/NonEmptyReadonly/NonEmptyreadonly";

/**
 * Provides the `Utils.ArrayUtils.orderBy` helper.
 *
 * @example
 * import * as Utils from "@beep/utils";
 *
 * const arrayUtilsExportOrder = Utils.ArrayUtils.orderBy([{ score: 2 }, { score: 1 }], ["score"], ["asc"]);
 * void arrayUtilsExportOrder;
 *
 * @category Documentation
 * @since 0.1.0
 */
export * from "@beep/utils/data/array.utils/order-by";
export * from "./collect";
export * from "./Readonly";
export * from "./with-default";
