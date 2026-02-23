/**
 * Prototype-pollution guards used by `Utils.ObjectUtils.deepMerge` and related
 * helpers to ensure unsafe keys never mutate shared prototypes.
 *
 * @example
 * import type * as FooTypes from "@beep/types/common.types";
 * import * as Utils from "@beep/utils";
 *
 * const unsafePropertyKey: FooTypes.Prettify<{ key: PropertyKey }> = { key: "__proto__" };
 * const isUnsafe = Utils.isUnsafeProperty(unsafePropertyKey.key);
 * void isUnsafe;
 *
 * @category Documentation
 * @since 0.1.0
 */

/**
 * Checks whether a property key is unsafe to touch, providing the shared type
 * signature used across merging helpers.
 *
 * @example
 * import type { IsUnsafeProperty } from "@beep/utils/guards/isUnsafeProperty.guard";
 *
 * const prototypeGuard: IsUnsafeProperty = (key) => key === "__proto__";
 * const guardResult = prototypeGuard("__proto__");
 * void guardResult;
 *
 * @category Guards
 * @since 0.1.0
 */
export type IsUnsafeProperty = (key: PropertyKey) => boolean;

/**
 * Namespace-exported guard that flags `__proto__` so callers can skip unsafe
 * mutations.
 *
 * @example
 * import * as Utils from "@beep/utils";
 *
 * const unsafe = Utils.isUnsafeProperty("__proto__");
 * const safe = Utils.isUnsafeProperty("name");
 * void unsafe;
 * void safe;
 *
 * @category Guards
 * @since 0.1.0
 */
export const isUnsafeProperty: IsUnsafeProperty = (key: PropertyKey) => key === "__proto__";
