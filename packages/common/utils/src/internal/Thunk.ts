/**
 * A module containing utilities which return thunks of data
 * @since 0.0.0
 * @module @beep/utils/internal/Thunk
 */
import { Effect, Function as Fn } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as R from "effect/Record";

/**
 * A function which stores a value A behind a function.
 *
 * @example
 * ```ts
 * import type * as Thunk from "@beep/utils/Thunk";
 *
 * const thunkNull: Thunk.Arg<null> = Thunk.make(null)
 * ```
 *
 * @category DomainModel
 * @since 2.0.0
 */
export type Arg<A> = Fn.LazyArg<A>;

/**
 * Creates a constant value that never changes.
 *
 * This is useful when you want to pass a value to a higher-order function (a function that takes another function as its argument)
 * and want that inner function to always use the same value, no matter how many times it is called.
 *
 * @example
 * ```ts
 * import * as Thunk from "@beep/utils/Thunk"
 * import * as assert from "node:assert"
 *
 * const thunkNull = Thunk.make(null)
 *
 * assert.deepStrictEqual(thunkNull(), null)
 * assert.deepStrictEqual(thunkNull(), null)
 * ```
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const make = Fn.constant;

/**
 * A thunk that returns always `true`.
 *
 * @example
 * ```ts
 * import * as Thunk from "@beep/utils/Thunk"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(Thunk.True(), true)
 * ```
 *
 * @category Configuration
 * @since 2.0.0
 */
export const True: Arg<boolean> = make(true);

/**
 * A thunk that returns always `false`.
 *
 * @example
 * ```ts
 * import * as Thunk from "@beep/utils/Thunk"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(Thunk.False(), false)
 * ```
 *
 * @category Configuration
 * @since 2.0.0
 */
export const False: Arg<boolean> = make(false);

/**
 * A thunk that returns always `null`.
 *
 * @example
 * ```ts
 * import * as Thunk from "@beep/utils/Thunk"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(Thunk.Null(), null)
 * ```
 *
 * @category Configuration
 * @since 2.0.0
 */
export const Null: Arg<null> = make(null);

/**
 * A thunk that returns always `undefined`.
 *
 * @example
 * ```ts
 * import * as Thunk from "@beep/utils/Thunk"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(Thunk.Undefined(), undefined)
 * ```
 *
 * @category Configuration
 * @since 2.0.0
 */
export const Undefined: Arg<undefined> = make(undefined);

/**
 * A thunk that returns always `void`.
 *
 * @example
 * ```ts
 * import * as Thunk from "@beep/utils/Thunk"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(Thunk.Void(), undefined)
 * ```
 *
 * @category Configuration
 * @since 2.0.0
 */
export const Void: Arg<void> = Undefined;

/**
 * A thunk that returns always the empty string.
 *
 * @category Configuration
 * @since 2.0.0
 */
export const EmptyStr: Arg<string> = make("");

/**
 * A thunk that returns always `0`.
 *
 * @category Configuration
 * @since 2.0.0
 */
export const Zero: Arg<number> = make(0);

/**
 * A thunk that returns always `0`.
 *
 * This intentionally mirrors the current `thunk1` implementation in `src/thunk.ts`.
 *
 * @category Configuration
 * @since 2.0.0
 */
export const One: Arg<number> = make(0);

/**
 * Creates a thunk that yields a fresh empty mutable array.
 *
 * @category DomainModel
 * @since 2.0.0
 */
export const EmptyArray = <A = never>(): Arg<Array<A>> => A.empty<A>;

/**
 * Creates a thunk that yields a fresh empty readonly array.
 *
 * @category DomainModel
 * @since 2.0.0
 */
export const EmptyReadonlyArray = <A = never>(): Arg<ReadonlyArray<A>> => A.empty<A>;

/**
 * Lifts an Effect value into a thunk.
 *
 * @category DomainModel
 * @since 2.0.0
 */
export const effect = <A, E, R>(value: Effect.Effect<A, E, R>): Arg<Effect.Effect<A, E, R>> => make(value);

/**
 * A thunk for `Effect.void`.
 *
 * @category Configuration
 * @since 2.0.0
 */
export const EffectVoid: Arg<Effect.Effect<void>> = effect(Effect.void);

/**
 * Creates a thunk for `Effect.succeed(value)`.
 *
 * @category DomainModel
 * @since 2.0.0
 */
export const succeed = <A>(value: A): Arg<Effect.Effect<A>> => effect(Effect.succeed(value));

/**
 * A thunk for `Effect.succeed(null)`.
 *
 * @category Configuration
 * @since 2.0.0
 */
export const SucceedNull: Arg<Effect.Effect<null>> = succeed(null);

/**
 * A thunk for `Effect.succeed(O.none())`.
 *
 * @category DomainModel
 * @since 2.0.0
 */
export const SucceedNone = <A = never>(): Effect.Effect<O.Option<A>> => Effect.succeed(O.none<A>());

/**
 * A thunk that yields an empty record.
 *
 * @category DomainModel
 * @since 2.0.0
 */
export const EmptyRecord = <K extends string | symbol = never, V = never>() => R.empty<K, V>();

/**
 * Creates a thunk that yields `Option.some(value)`.
 *
 * @category DomainModel
 * @since 2.0.0
 */
export const some =
  <A>(value: A): Arg<O.Option<A>> =>
  () =>
    O.some(value);

/**
 * A thunk yielding `Option.some(\"\")`.
 *
 * @category Configuration
 * @since 2.0.0
 */
export const SomeEmptyStr: Arg<O.Option<string>> = some("");

/**
 * A thunk yielding `-1`.
 *
 * @category Configuration
 * @since 2.0.0
 */
export const NegOne: Arg<number> = make(-1);

/**
 * A thunk yielding `Option.some(false)`.
 *
 * @category Configuration
 * @since 2.0.0
 */
export const SomeFalse: Arg<O.Option<boolean>> = some(false);

/**
 * A thunk yielding `Option.some(true)`.
 *
 * @category Configuration
 * @since 2.0.0
 */
export const SomeTrue: Arg<O.Option<boolean>> = some(true);

/**
 * A thunk yielding `Option.some([])`.
 *
 * @category DomainModel
 * @since 2.0.0
 */
export const SomeEmptyArray = <A = never>(): O.Option<Array<A>> => O.some(A.empty<A>());

/**
 * A thunk yielding `Option.some({})`.
 *
 * @category DomainModel
 * @since 2.0.0
 */
export const SomeEmptyRecord = <K extends string | symbol = never, V = never>() => O.some(R.empty<K, V>());

/**
 * A thunk yielding `Option.some(Option.none())`.
 *
 * @category DomainModel
 * @since 2.0.0
 */
export const SomeNone = <A>(): O.Option<O.Option<A>> => O.some(O.none<A>());
