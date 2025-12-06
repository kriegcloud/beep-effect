/**
 * Barrel for timing helpers (debounce/throttle) so docs emphasize the namespace
 * entry `@beep/utils`.
 *
 * @example
 * import type * as FooTypes from "@beep/types/common.types";
 * import * as Utils from "@beep/utils";
 *
 * const timingIndexDebounced = Utils.debounce(() => Promise.resolve(), 1000);
 * const timingIndexResult: FooTypes.Prettify<boolean> = timingIndexDebounced.pending();
 * void timingIndexResult;
 *
 * @category Documentation
 * @since 0.1.0
 */
/**
 * Re-exports the debounce helper.
 *
 * @example
 * import * as Utils from "@beep/utils";
 *
 * const timingExportDebounce = Utils.debounce(() => {}, 150);
 * void timingExportDebounce;
 *
 * @category Documentation
 * @since 0.1.0
 */
export * from "./debounce";

/**
 * Re-exports the throttle helper.
 *
 * @example
 * import * as Utils from "@beep/utils";
 *
 * const timingExportThrottle = Utils.throttle(() => {}, 150);
 * void timingExportThrottle;
 *
 * @category Documentation
 * @since 0.1.0
 */
export * from "./throttle";
