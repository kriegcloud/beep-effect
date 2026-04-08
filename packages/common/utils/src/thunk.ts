/**
 * A module containing utilities which return thunks of data
 * @since 0.0.0
 * @module @beep/utils/thunk
 */

import { Effect } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as R from "effect/Record";

type LazyArg<A> = () => A;

/**
 * Creates a thunk that always returns the provided value.
 *
 * @example
 * ```ts
 * import { thunk } from "@beep/utils/thunk"
 *
 * const getFortyTwo = thunk(42)
 * const value = getFortyTwo()
 * // 42
 *
 * void value
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const thunk =
  <A>(value: A): LazyArg<A> =>
  () =>
    value;

/**
 * A thunk that always yields `null`.
 *
 * @example
 * ```ts
 * import { thunkNull } from "@beep/utils/thunk"
 *
 * const value = thunkNull()
 * // null
 *
 * void value
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const thunkNull = thunk(null);

/**
 * A thunk that always yields `undefined`.
 *
 * @example
 * ```ts
 * import { thunkUndefined } from "@beep/utils/thunk"
 *
 * const value = thunkUndefined()
 * // undefined
 *
 * void value
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const thunkUndefined = thunk(undefined);

/**
 * A thunk that always yields `void 0` (equivalent to `undefined`).
 *
 * @example
 * ```ts
 * import { thunkVoid } from "@beep/utils/thunk"
 *
 * const value = thunkVoid()
 * // undefined
 *
 * void value
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const thunkVoid = thunk(void 0);

/**
 * A thunk that always yields `true`.
 *
 * @example
 * ```ts
 * import { thunkTrue } from "@beep/utils/thunk"
 *
 * const value = thunkTrue()
 * // true
 *
 * void value
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const thunkTrue = thunk(true as const);

/**
 * A thunk that always yields `false`.
 *
 * @example
 * ```ts
 * import { thunkFalse } from "@beep/utils/thunk"
 *
 * const value = thunkFalse()
 * // false
 *
 * void value
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const thunkFalse = thunk(false);

/**
 * A thunk that always yields the empty string.
 *
 * @example
 * ```ts
 * import { thunkEmptyStr } from "@beep/utils/thunk"
 *
 * const value = thunkEmptyStr()
 * // ""
 *
 * void value
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const thunkEmptyStr = thunk("");

/**
 * A thunk that always yields `0`.
 *
 * @example
 * ```ts
 * import { thunk0 } from "@beep/utils/thunk"
 *
 * const value = thunk0()
 * // 0
 *
 * void value
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const thunk0 = thunk(0);

/**
 * A thunk that always yields `1`.
 *
 * @example
 * ```ts
 * import { thunk1 } from "@beep/utils/thunk"
 *
 * const value = thunk1()
 * // 1
 *
 * void value
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const thunk1 = thunk(1);

/**
 * Returns a thunk that yields a fresh empty mutable array on each call.
 *
 * @example
 * ```ts
 * import { thunkEmptyArray } from "@beep/utils/thunk"
 *
 * const getArr = thunkEmptyArray<number>()
 * const arr = getArr()
 * // []
 *
 * void arr
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const thunkEmptyArray = <A = never>(): LazyArg<Array<A>> => A.empty<A>;

/**
 * Returns a thunk that yields a fresh empty readonly array on each call.
 *
 * @example
 * ```ts
 * import { thunkEmptyReadonlyArray } from "@beep/utils/thunk"
 *
 * const getArr = thunkEmptyReadonlyArray<string>()
 * const arr = getArr()
 * // []
 *
 * void arr
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const thunkEmptyReadonlyArray = <A = never>(): LazyArg<ReadonlyArray<A>> => A.empty<A>;

/**
 * Lifts an Effect value into a thunk that returns it unchanged.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { thunkEffect } from "@beep/utils/thunk"
 *
 * const getEffect = thunkEffect(Effect.succeed(42))
 * const eff = getEffect()
 *
 * void eff
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const thunkEffect = <A, E, R>(effect: Effect.Effect<A, E, R>): LazyArg<Effect.Effect<A, E, R>> => thunk(effect);

/**
 * A thunk that returns `Effect.void`.
 *
 * @example
 * ```ts
 * import { thunkEffectVoid } from "@beep/utils/thunk"
 *
 * const eff = thunkEffectVoid()
 *
 * void eff
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const thunkEffectVoid = thunkEffect(Effect.void);

/**
 * Creates a thunk that returns `Effect.succeed(a)`.
 *
 * @example
 * ```ts
 * import { thunkEffectSucceed } from "@beep/utils/thunk"
 *
 * const getEffect = thunkEffectSucceed("hello")
 * const eff = getEffect()
 *
 * void eff
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const thunkEffectSucceed = <A>(a: A): (() => Effect.Effect<A>) => thunkEffect(Effect.succeed(a));

/**
 * A thunk that returns `Effect.succeed(null)`.
 *
 * @example
 * ```ts
 * import { thunkEffectSucceedNull } from "@beep/utils/thunk"
 *
 * const eff = thunkEffectSucceedNull()
 *
 * void eff
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const thunkEffectSucceedNull = thunkEffectSucceed(null);

/**
 * Returns a thunk for `Effect.succeed(Option.none())`.
 *
 * @example
 * ```ts
 * import { thunkEffectSucceedNone } from "@beep/utils/thunk"
 *
 * const eff = thunkEffectSucceedNone<string>()
 *
 * void eff
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const thunkEffectSucceedNone = <A = never>() => Effect.succeed(O.none<A>());

/**
 * Returns a thunk that yields an empty record.
 *
 * @example
 * ```ts
 * import { thunkEmptyRecord } from "@beep/utils/thunk"
 *
 * const rec = thunkEmptyRecord<string, number>()
 *
 * void rec
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const thunkEmptyRecord = <K extends string | symbol = never, V = never>() => R.empty<K, V>();

/**
 * Creates a thunk that yields `Option.some(value)`.
 *
 * @example
 * ```ts
 * import { thunkSome } from "@beep/utils/thunk"
 *
 * const getSome = thunkSome(42)
 * const opt = getSome()
 * // Option.some(42)
 *
 * void opt
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const thunkSome =
  <A>(value: A): (() => O.Option<A>) =>
  () =>
    O.some(value);

/**
 * A thunk yielding `Option.some("")`.
 *
 * @example
 * ```ts
 * import { thunkSomeEmptyStr } from "@beep/utils/thunk"
 *
 * const opt = thunkSomeEmptyStr()
 * // Option.some("")
 *
 * void opt
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const thunkSomeEmptyStr = thunkSome("");

/**
 * A thunk yielding `-1`.
 *
 * @example
 * ```ts
 * import { thunkNegative1 } from "@beep/utils/thunk"
 *
 * const value = thunkNegative1()
 * // -1
 *
 * void value
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const thunkNegative1 = thunk(-1);

/**
 * A thunk yielding `Option.some(false)`.
 *
 * @example
 * ```ts
 * import { thunkSomeFalse } from "@beep/utils/thunk"
 *
 * const opt = thunkSomeFalse()
 * // Option.some(false)
 *
 * void opt
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const thunkSomeFalse = thunkSome(false);

/**
 * A thunk yielding `Option.some(true)`.
 *
 * @example
 * ```ts
 * import { thunkSomeTrue } from "@beep/utils/thunk"
 *
 * const opt = thunkSomeTrue()
 * // Option.some(true)
 *
 * void opt
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const thunkSomeTrue = thunkSome(true as const);

/**
 * Returns a thunk yielding `Option.some([])`.
 *
 * @example
 * ```ts
 * import { thunkSomeEmptyArray } from "@beep/utils/thunk"
 *
 * const opt = thunkSomeEmptyArray<number>()
 * // Option.some([])
 *
 * void opt
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const thunkSomeEmptyArray = <A = never>() => O.some(A.empty<A>());

/**
 * Returns a thunk yielding `Option.some({})`.
 *
 * @example
 * ```ts
 * import { thunkSomeEmptyRecord } from "@beep/utils/thunk"
 *
 * const opt = thunkSomeEmptyRecord<string, number>()
 * // Option.some({})
 *
 * void opt
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const thunkSomeEmptyRecord = <K extends string | symbol = never, V = never>() => O.some(R.empty<K, V>());

/**
 * Returns a thunk yielding `Option.some(Option.none())`.
 *
 * Useful for representing an explicitly-set "empty" value inside a nested
 * `Option` structure.
 *
 * @example
 * ```ts
 * import { thunkSomeNone } from "@beep/utils/thunk"
 *
 * const opt = thunkSomeNone<string>()
 * // Option.some(Option.none())
 *
 * void opt
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const thunkSomeNone = <A>(): O.Option<O.Option<A>> => O.some(O.none<A>());
