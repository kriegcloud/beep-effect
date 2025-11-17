/**
 * Entry for equality helpers so docs capture how to import `Utils.deepEqual`
 * without referencing deep file paths.
 *
 * @example
 * import type * as FooTypes from "@beep/types/common.types";
 * import * as Utils from "@beep/utils";
 *
 * const equalityIndexLeft: FooTypes.Prettify<{ id: number }> = { id: 1 };
 * const equalityIndexRight: FooTypes.Prettify<{ id: number }> = { id: 1 };
 * const equalityIndexMatch = Utils.deepEqual(equalityIndexLeft, equalityIndexRight);
 * void equalityIndexMatch;
 *
 * @category Documentation/Modules
 * @since 0.1.0
 */
export * from "./deepEqual";
