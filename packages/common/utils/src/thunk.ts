/**
 * @since 0.1.0
 */

import * as A from "effect/Array";
import { constant, constFalse, constNull, constTrue, constUndefined, constVoid, flow } from "effect/Function";
import * as R from "effect/Record";
import * as Str from "effect/String";

/**
 * Thunk that returns an empty record.
 *
 * @example
 * ```typescript
 * import { thunkEmtpyRecord } from "@beep/utils"
 *
 * const getEmptyRecord = thunkEmtpyRecord()
 * console.log(getEmptyRecord)
 * // => {}
 * ```
 *
 * @category constructors
 * @since 0.1.0
 */
export const thunkEmtpyRecord = flow(R.empty);

/**
 * Thunk that returns an empty array.
 *
 * @example
 * ```typescript
 * import { thunkEmptyArray } from "@beep/utils"
 *
 * const getEmptyArray = thunkEmptyArray()
 * console.log(getEmptyArray)
 * // => []
 * ```
 *
 * @category constructors
 * @since 0.1.0
 */
export const thunkEmptyArray = flow(A.empty);

/**
 * Thunk that returns an empty string.
 *
 * @example
 * ```typescript
 * import { thunkEmptyStr } from "@beep/utils"
 *
 * const getEmptyStr = thunkEmptyStr()
 * console.log(getEmptyStr)
 * // => ""
 * ```
 *
 * @category constructors
 * @since 0.1.0
 */
export const thunkEmptyStr = constant(Str.empty);

/**
 * Thunk that returns zero.
 *
 * @example
 * ```typescript
 * import { thunkZero } from "@beep/utils"
 *
 * const getZero = thunkZero()
 * console.log(getZero)
 * // => 0
 * ```
 *
 * @category constructors
 * @since 0.1.0
 */
export const thunkZero = constant(0);

/**
 * Thunk that returns true.
 *
 * @example
 * ```typescript
 * import { thunkTrue } from "@beep/utils"
 *
 * const getTrue = thunkTrue()
 * console.log(getTrue)
 * // => true
 * ```
 *
 * @category constructors
 * @since 0.1.0
 */
export const thunkTrue = constTrue;

/**
 * Thunk that returns false.
 *
 * @example
 * ```typescript
 * import { thunkFalse } from "@beep/utils"
 *
 * const getFalse = thunkFalse()
 * console.log(getFalse)
 * // => false
 * ```
 *
 * @category constructors
 * @since 0.1.0
 */
export const thunkFalse = constFalse;

/**
 * Thunk that returns null.
 *
 * @example
 * ```typescript
 * import { thunkNull } from "@beep/utils"
 *
 * const getNull = thunkNull()
 * console.log(getNull)
 * // => null
 * ```
 *
 * @category constructors
 * @since 0.1.0
 */
export const thunkNull = constNull;

/**
 * Thunk that returns undefined.
 *
 * @example
 * ```typescript
 * import { thunkUndefined } from "@beep/utils"
 *
 * const getUndefined = thunkUndefined()
 * console.log(getUndefined)
 * // => undefined
 * ```
 *
 * @category constructors
 * @since 0.1.0
 */
export const thunkUndefined = constUndefined;

/**
 * Thunk that returns void.
 *
 * @example
 * ```typescript
 * import { thunkVoid } from "@beep/utils"
 *
 * const getVoid = thunkVoid()
 * console.log(getVoid)
 * // => undefined
 * ```
 *
 * @category constructors
 * @since 0.1.0
 */
export const thunkVoid = constVoid;

/**
 * Creates a thunk that returns the given value.
 *
 * @example
 * ```typescript
 * import { thunk } from "@beep/utils"
 *
 * const getValue = thunk(42)
 * console.log(getValue())
 * // => 42
 * ```
 *
 * @category constructors
 * @since 0.1.0
 */
export const thunk = flow(constant);
