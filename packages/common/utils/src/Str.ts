import { Function, String as Str } from "effect";
import type * as TF from "type-fest";
import * as A from "./Array.ts";

const { dual, coerceUnsafe } = Function;
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
 * @since 0.0.0
 */
export const camelCase = <TStr extends string>(str: TStr): TF.CamelCase<TStr> => coerceUnsafe(Str.camelCase(str));

/**
 * @since 0.0.0
 */
export const snakeCase = <const TStr extends string>(str: TStr): TF.SnakeCase<TStr> => coerceUnsafe(Str.snakeCase(str));

/**
 * @since 0.0.0
 */
export const kebabCase = <const TStr extends string>(str: TStr): TF.KebabCase<TStr> => coerceUnsafe(Str.kebabCase(str));

/**
 * @since 0.0.0
 */
export const screamingSnake = <const TStr extends string>(str: TStr): TF.ScreamingSnakeCase<TStr> =>
  coerceUnsafe(Str.constantCase(str));

/**
 * @since 0.0.0
 */
export const pascalCase = <const TStr extends string>(str: TStr): TF.PascalCase<TStr> =>
  coerceUnsafe(Str.pascalCase(str));

/**
 * @since 0.0.0
 */
export const pascalToSnake = <const TStr extends string>(str: TF.PascalCase<TStr>): TF.SnakeCase<TStr> =>
  coerceUnsafe(Str.pascalToSnake(str));

/**
 * @since 0.0.0
 */
export const snakeToCamel = <const TStr extends string>(str: TF.SnakeCase<TStr>): TF.CamelCase<TStr> =>
  coerceUnsafe(Str.snakeToCamel(str));

/**
 * @since 0.0.0
 */
export const snakeToKebab = <const TStr extends string>(str: TF.SnakeCase<TStr>): TF.KebabCase<TStr> =>
  coerceUnsafe(Str.snakeToKebab(str));

/**
 * @since 0.0.0
 */
export const camelToSnake = <const TStr extends string>(str: TF.CamelCase<TStr>): TF.SnakeCase<TStr> =>
  coerceUnsafe(Str.camelToSnake(str));

/**
 * @since 0.0.0
 */
export const snakeToPascal = <const TStr extends string>(str: TF.SnakeCase<TStr>): TF.PascalCase<TStr> =>
  coerceUnsafe(Str.snakeToPascal(str));

/**
 * @since 0.0.0
 */
export const kebabToSnake = <const TStr extends string>(str: TF.KebabCase<TStr>): TF.SnakeCase<TStr> =>
  coerceUnsafe(Str.kebabToSnake(str));

/**
 * @since 0.0.0
 */
export const startsWith: {
  <const SearchString extends string>(
    searchString: SearchString
  ): <const TStr extends string>(str: TStr) => str is TStr & `${SearchString}${string}`;
  <const TStr extends string, const SearchString extends string>(
    str: TStr,
    searchString: SearchString
  ): str is TStr & `${SearchString}${string}`;
} = dual(
  2,
  <const TStr extends string, const SearchString extends string>(
    str: TStr,
    searchString: SearchString
  ): str is TStr & `${SearchString}${string}` => Str.startsWith(searchString)(str)
);

/**
 * @since 0.0.0
 */
export const endsWith: {
  <const SearchString extends string>(
    searchString: SearchString
  ): <const TStr extends string>(str: TStr) => str is TStr & `${string}${SearchString}`;
  <const TStr extends string, const SearchString extends string>(
    str: TStr,
    searchString: SearchString
  ): str is TStr & `${string}${SearchString}`;
} = dual(
  2,
  <const TStr extends string, const SearchString extends string>(
    str: TStr,
    searchString: SearchString
  ): str is TStr & `${string}${SearchString}` => Str.endsWith(searchString)(str)
);

/**
 * @since 0.0.0
 */
export const contains: {
  <const SearchString extends string>(
    searchString: SearchString
  ): <const TStr extends string>(str: TStr) => str is TStr & `${string}${SearchString}${string}`;
  <const TStr extends string, const SearchString extends string>(
    str: TStr,
    searchString: SearchString
  ): str is TStr & `${string}${SearchString}${string}`;
} = dual(
  2,
  <const TStr extends string, const SearchString extends string>(
    str: TStr,
    searchString: SearchString
  ): str is TStr & `${string}${SearchString}${string}` => Str.includes(searchString)(str)
);

/**
 * @since 0.0.0
 */
export const repeat: {
  <const Count extends number>(
    count: Count
  ): <const Input extends string>(self: Input) => TF.StringRepeat<Input, Count>;
  <const Input extends string, const Count extends number>(self: Input, count: Count): TF.StringRepeat<Input, Count>;
} = dual(
  2,
  <const Input extends string, const Count extends number>(self: Input, count: Count): TF.StringRepeat<Input, Count> =>
    coerceUnsafe(Str.repeat(count)(self))
);
/**
 * Re-export of `effect/String`.
 *
 * @since 0.0.0
 */
export * from "effect/String";
