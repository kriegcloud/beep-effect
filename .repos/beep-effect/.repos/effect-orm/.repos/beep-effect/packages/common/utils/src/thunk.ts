/**
 * @since 0.1.0
 */

import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import { constant, constFalse, constNull, constTrue, constUndefined, constVoid, flow, pipe } from "effect/Function";
import * as O from "effect/Option";
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

export const thunkNone = flow(O.none, thunk);

export const thunkEffect = <A, E, R>(effect: Effect.Effect<A, E, R>) => pipe(effect, thunk);

export const thunkLogInfoEffect = flow(Effect.logInfo, thunk);

export const thunkLogErrorEffect = flow(Effect.logError, thunk);

export const thunkLogWarningEffect = flow(Effect.logWarning, thunk);

export const thunkLogDebugEffect = flow(Effect.logDebug, thunk);

export const thunkLogTraceEffect = flow(Effect.logTrace, thunk);

export const thunkLogFatalEffect = flow(Effect.logFatal, thunk);

export const thunkLogWithLevel = flow(Effect.logWithLevel, thunk);

export const thunkTapEffect = flow(Effect.tap, thunk);

export const thunkDie = flow(Effect.die, thunk);

export const thunkDieMessage = flow(Effect.dieMessage, thunk);

export const thunkEffectVoid = thunk(Effect.void);

export const thunkEmptyReadonlyArray = <T>() => [] as ReadonlyArray<T>;

export const thunkThrow =
  <E>(error: E) =>
  () => {
    throw error;
  };
