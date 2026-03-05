import { Function } from "effect";
import * as A from "./Array.ts";

const { dual } = Function;
/**
 * Prepends `prefix` to a string.
 *
 * @since 0.0.0
 */
export const prefix: {
  <const Pre extends string>(prefix: Pre): <S extends string>(str: S) => `${Pre}${S}`;
  <const Pre extends string, const S extends string>(str: S, prefix: Pre): `${Pre}${S}`;
} = dual(
  2,
  <const Pre extends string, const S extends string>(str: S, prefix: Pre): `${Pre}${S}` => `${prefix}${str}` as const
);

/**
 * Appends `postfix` to a string.
 *
 * @since 0.0.0
 */
export const postfix: {
  <const Post extends string>(postfix: Post): <S extends string>(str: S) => `${S}${Post}`;
  <const Post extends string, const S extends string>(str: S, postfix: Post): `${S}${Post}`;
} = dual(
  2,
  <const Post extends string, const S extends string>(str: S, postfix: Post): `${S}${Post}` =>
    `${str}${postfix}` as const
);

/**
 * Maps a non-empty string array by prepending each entry with `prefix`.
 *
 * @since 0.0.0
 */
export const mapPrefix: {
  <const Pre extends string>(
    prefix: Pre
  ): <Arr extends A.NonEmptyReadonlyArray<string>>(arr: Arr) => A.NonEmptyReadonlyArray<`${Pre}${Arr[number]}`>;
  <const Pre extends string, Arr extends A.NonEmptyReadonlyArray<string>>(
    prefix: Pre,
    arr: Arr
  ): A.NonEmptyReadonlyArray<`${Pre}${Arr[number]}`>;
} = dual(
  2,
  <const Pre extends string, Arr extends A.NonEmptyReadonlyArray<string>>(
    pre: Pre,
    arr: Arr
  ): A.NonEmptyReadonlyArray<`${Pre}${Arr[number]}`> => {
    const prefixEl = prefix(pre);
    return A.mapNonEmptyReadonly(arr, prefixEl);
  }
);

/**
 * Maps a non-empty string array by appending each entry with `postfix`.
 *
 * @since 0.0.0
 */
export const mapPostfix: {
  <const Post extends string>(
    postfix: Post
  ): <Arr extends A.NonEmptyReadonlyArray<string>>(arr: Arr) => A.NonEmptyReadonlyArray<`${Arr[number]}${Post}`>;
  <const Post extends string, Arr extends A.NonEmptyReadonlyArray<string>>(
    postfix: Post,
    arr: Arr
  ): A.NonEmptyReadonlyArray<`${Arr[number]}${Post}`>;
} = dual(
  2,
  <const Post extends string, Arr extends A.NonEmptyReadonlyArray<string>>(
    post: Post,
    arr: Arr
  ): A.NonEmptyReadonlyArray<`${Arr[number]}${Post}`> => {
    const postfixEl = postfix(post);
    return A.mapNonEmptyReadonly(arr, postfixEl);
  }
);

/**
 * Re-export of `effect/String`.
 *
 * @since 0.0.0
 */
export * from "effect/String";
