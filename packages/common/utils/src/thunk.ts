/**
 * A module containing utilities which return thunks of data
 * @since 0.0.0
 * @module @beep/utils/thunk
 */

import { Effect, type LazyArg } from "effect";
import * as A from "effect/Array";
import * as R from "effect/Record";

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
export const thunkEffectSucceed = <A>(a: A): LazyArg<Effect.Effect<unknown, never, A>> =>
  thunkEffect(Effect.succeed(a));

/**
 * Returns a thunk that yields an empty record.
 *
 * @since 0.0.0
 */
export const thunkEmptyRecord = <K extends string | symbol = never, V = never>() => R.empty<K, V>();
