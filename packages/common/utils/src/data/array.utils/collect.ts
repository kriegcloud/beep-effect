import type { UnsafeTypes } from "@beep/types";
import { Data, HashMap, pipe, Struct, Tuple } from "effect";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as O from "effect/Option";
import type * as Types from "effect/Types";
export const toHashMap =
  <A, B, K>({
    keyGetter,
    valueInitializer,
    valueReducer,
  }: {
    keyGetter: (a: A) => K;
    valueInitializer: (a: A) => B;
    valueReducer: (b: NoInfer<B>, a: NoInfer<A>) => NoInfer<B>;
  }) =>
  (a: ReadonlyArray<A>): HashMap.HashMap<K, B> =>
    A.reduce(a, HashMap.empty<K, B>(), (acc, v) =>
      HashMap.modifyAt(
        acc,
        keyGetter(v),
        O.match({
          onSome: (mapValue) => O.some(valueReducer(mapValue, v)),
          onNone: () => O.some(valueInitializer(v)),
        })
      )
    );

export const toHashMapByKeyWith =
  <const K extends PropertyKey, A extends { [P in K]?: UnsafeTypes.UnsafeAny }, B>({
    key,
    valueInitializer,
    valueReducer,
  }: {
    key: K;
    valueInitializer: (a: A) => B;
    valueReducer: (b: NoInfer<B>, a: NoInfer<A>) => NoInfer<B>;
  }) =>
  (a: ReadonlyArray<A>): HashMap.HashMap<Types.MatchRecord<A, A[K] | undefined, A[K]>, B> =>
    toHashMap<A, B, Types.MatchRecord<A, A[K] | undefined, A[K]>>({
      keyGetter: Struct.get(key),
      valueInitializer: valueInitializer,
      valueReducer: valueReducer,
    })(a);

export const toHashMapByKey =
  <const K extends PropertyKey>(key: K) =>
  <A extends { [P in K]?: UnsafeTypes.UnsafeAny }>(
    a: ReadonlyArray<A>
  ): HashMap.HashMap<Types.MatchRecord<A, A[K] | undefined, A[K]>, A> =>
    toHashMapByKeyWith<K, A, A>({
      key,
      valueInitializer: F.identity,
      valueReducer: F.untupled(Tuple.getSecond),
    })(a);

export const toArrayHashMapByKey =
  <const K extends PropertyKey>(key: K) =>
  <A extends { [P in K]?: UnsafeTypes.UnsafeAny }>(
    a: ReadonlyArray<A>
  ): HashMap.HashMap<Types.MatchRecord<A, A[K] | undefined, A[K]>, A.NonEmptyArray<A>> =>
    toHashMapByKeyWith<K, A, A.NonEmptyArray<A>>({
      key,
      valueInitializer: A.make,
      valueReducer: A.append,
    })(a);

type MapStructKeyValues<
  Keys extends A.NonEmptyReadonlyArray<PropertyKey>,
  A extends { [P in Keys[number]]?: UnsafeTypes.UnsafeAny },
> = {
  [K in Keys[number]]: Types.MatchRecord<A, A[K] | undefined, A[K]>;
} extends infer B
  ? B
  : never;

export const toHashMapByKeysWith =
  <
    const Keys extends A.NonEmptyReadonlyArray<PropertyKey>,
    A extends { [P in Keys[number]]?: UnsafeTypes.UnsafeAny },
    B,
  >({
    keys,
    valueInitializer,
    valueReducer,
  }: {
    keys: Keys;
    valueInitializer: (a: A) => B;
    valueReducer: (b: NoInfer<B>, a: NoInfer<A>) => NoInfer<B>;
  }) =>
  (a: ReadonlyArray<A>): HashMap.HashMap<MapStructKeyValues<Keys, A>, B> =>
    toHashMap<A, B, MapStructKeyValues<Keys, A>>({
      keyGetter: (a) =>
        pipe(
          keys,
          A.map((key) => [key, pipe(a, Struct.get(key))]),
          Object.fromEntries,
          Data.struct
        ) as unknown as MapStructKeyValues<Keys, A>,
      valueInitializer: valueInitializer,
      valueReducer: valueReducer,
    })(a);

export const toHashMapByKeys =
  <const Keys extends A.NonEmptyReadonlyArray<PropertyKey>>(keys: Keys) =>
  <A extends { [P in Keys[number]]?: UnsafeTypes.UnsafeAny }>(
    a: ReadonlyArray<A>
  ): HashMap.HashMap<MapStructKeyValues<Keys, A>, A> =>
    toHashMapByKeysWith<Keys, A, A>({
      keys,
      valueInitializer: F.identity,
      valueReducer: F.untupled(Tuple.getSecond),
    })(a);

export const toArrayHashMapByKeys =
  <const Keys extends A.NonEmptyReadonlyArray<PropertyKey>>(keys: Keys) =>
  <A extends { [P in Keys[number]]?: UnsafeTypes.UnsafeAny }>(
    a: ReadonlyArray<A>
  ): HashMap.HashMap<MapStructKeyValues<Keys, A>, A.NonEmptyArray<A>> =>
    toHashMapByKeysWith<Keys, A, A.NonEmptyArray<A>>({
      keys,
      valueInitializer: A.make,
      valueReducer: A.append,
    })(a);
