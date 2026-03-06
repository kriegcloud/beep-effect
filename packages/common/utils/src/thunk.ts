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
 * @since 0.0.0
 */
export const thunk =
  <A>(value: A): LazyArg<A> =>
  () =>
    value;

/**
 * Returns a thunk that always yields `null`.
 *
 * @since 0.0.0
 */
export const thunkNull = thunk(null);

/**
 * Returns a thunk that always yields `undefined`.
 *
 * @since 0.0.0
 */
export const thunkUndefined = thunk(undefined);

/**
 * Returns a thunk that always yields `void 0`.
 *
 * @since 0.0.0
 */
export const thunkVoid = thunk(void 0);

/**
 * Returns a thunk that always yields `true`.
 *
 * @since 0.0.0
 */
export const thunkTrue = thunk(true);

/**
 * Returns a thunk that always yields `false`.
 *
 * @since 0.0.0
 */
export const thunkFalse = thunk(false);

/**
 * Returns a thunk that always yields the empty string.
 *
 * @since 0.0.0
 */
export const thunkEmptyStr = thunk("");

/**
 * Returns a thunk that always yields `0`.
 *
 * @since 0.0.0
 */
export const thunk0 = thunk(0);

/**
 * Returns a thunk that always yields `0`.
 *
 * @since 0.0.0
 */
export const thunk1 = thunk(0);

/**
 * Returns a thunk that yields a fresh empty mutable array.
 *
 * @since 0.0.0
 */
export const thunkEmptyArray = <A = never>(): LazyArg<Array<A>> => A.empty<A>;

/**
 * Returns a thunk that yields a fresh empty readonly array.
 *
 * @since 0.0.0
 */
export const thunkEmptyReadonlyArray = <A = never>(): LazyArg<ReadonlyArray<A>> => A.empty<A>;

/**
 * Lifts an Effect value into a thunk.
 *
 * @since 0.0.0
 */
export const thunkEffect = <A, E, R>(effect: Effect.Effect<A, E, R>): LazyArg<Effect.Effect<A, E, R>> => thunk(effect);

/**
 * Returns a thunk for `Effect.void`.
 *
 * @since 0.0.0
 */
export const thunkEffectVoid = thunkEffect(Effect.void);

/**
 * Returns a thunk for `Effect.succeed(a)`.
 *
 * @since 0.0.0
 */
export const thunkEffectSucceed = <A>(a: A): (() => Effect.Effect<A>) => thunkEffect(Effect.succeed(a));

/**
 * Returns a thunk for `Effect.succeed(null)`.
 *
 * @since 0.0.0
 */
export const thunkEffectSucceedNull = thunkEffectSucceed(null);

/**
 * Returns a thunk for `Effect.succeed(O.none())`.
 *
 * @since 0.0.0
 */
export const thunkEffectSucceedNone = <A = never>() => Effect.succeed(O.none<A>());

/**
 * Returns a thunk that yields an empty record.
 *
 * @since 0.0.0
 */
export const thunkEmptyRecord = <K extends string | symbol = never, V = never>() => R.empty<K, V>();

/**
 * Returns a thunk that yields `Option.some(value)`.
 *
 * @since 0.0.0
 */
export const thunkSome =
  <A>(value: A): (() => O.Option<A>) =>
  () =>
    O.some(value);

/**
 * Returns a thunk yielding `Option.some("")`.
 *
 * @since 0.0.0
 */
export const thunkSomeEmptyStr = thunkSome("");

/**
 * Returns a thunk yielding `-1`.
 *
 * @since 0.0.0
 */
export const thunkNegative1 = thunk(-1);

/**
 * Returns a thunk yielding `Option.some(false)`.
 *
 * @since 0.0.0
 */
export const thunkSomeFalse = thunkSome(false);
/**
 * Returns a thunk yielding `Option.some(true)`.
 *
 * @since 0.0.0
 */
export const thunkSomeTrue = thunkSome(true);

/**
 * Returns a thunk yielding `Option.some([])`.
 *
 * @since 0.0.0
 */
export const thunkSomeEmptyArray = <A = never>() => O.some(A.empty<A>());
/**
 * Returns a thunk yielding `Option.some({})`.
 *
 * @since 0.0.0
 */
export const thunkSomeEmptyRecord = <K extends string | symbol = never, V = never>() => O.some(R.empty<K, V>());

/**
 * Returns a thunk yielding `Option.some(Option.none())`.
 *
 * @since 0.0.0
 */
export const thunkSomeNone = <A>(): O.Option<O.Option<A>> => O.some(O.none<A>());
