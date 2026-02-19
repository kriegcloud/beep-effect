/**
 * @since 0.1.0
 */

/**
 * Type that coerces undefined to true while preserving boolean values.
 *
 * @example
 * ```typescript
 * import type { CoercedTrue } from "@beep/utils"
 *
 * type Result1 = CoercedTrue<undefined>  // true
 * type Result2 = CoercedTrue<false>      // false
 * type Result3 = CoercedTrue<true>       // true
 * ```
 *
 * @category models
 * @since 0.1.0
 */
export type CoercedTrue<T extends boolean | undefined> = T extends undefined ? true : T;

/**
 * Type that coerces undefined to false while preserving boolean values.
 *
 * @example
 * ```typescript
 * import type { CoercedFalse } from "@beep/utils"
 *
 * type Result1 = CoercedFalse<undefined>  // false
 * type Result2 = CoercedFalse<false>      // false
 * type Result3 = CoercedFalse<true>       // true
 * ```
 *
 * @category models
 * @since 0.1.0
 */
export type CoercedFalse<T extends boolean | undefined> = T extends undefined ? false : T;

/**
 * Coerces undefined values to true while preserving boolean values.
 *
 * @example
 * ```typescript
 * import { coerceTrue } from "@beep/utils"
 *
 * coerceTrue(undefined)  // true
 * coerceTrue(false)      // false
 * coerceTrue(true)       // true
 * ```
 *
 * @category utilities
 * @since 0.1.0
 */
export const coerceTrue = <T extends boolean | undefined>(value: T): CoercedTrue<T> => {
  return (value ?? true) as CoercedTrue<T>;
};

/**
 * Coerces undefined values to false while preserving boolean values.
 *
 * @example
 * ```typescript
 * import { coerceFalse } from "@beep/utils"
 *
 * coerceFalse(undefined)  // false
 * coerceFalse(false)      // false
 * coerceFalse(true)       // true
 * ```
 *
 * @category utilities
 * @since 0.1.0
 */
export const coerceFalse = <T extends boolean | undefined>(value: T): CoercedFalse<T> => {
  return (value ?? false) as CoercedFalse<T>;
};
