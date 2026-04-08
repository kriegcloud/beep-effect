/**
 * @module @beep/utils/Str
 * @since 0.0.0
 */
import { Function } from "effect";
import * as Str from "effect/String";
import type * as TF from "type-fest";
import * as A from "./Array.ts";

const { dual, cast } = Function;
/**
 * Prepends `prefix` to a string, preserving template-literal types.
 *
 * Supports both data-first and data-last calling conventions.
 *
 * @example
 * ```ts
 * import { pipe } from "effect"
 * import { Str } from "@beep/utils"
 *
 * // Data-first
 * const prefixed = Str.prefix("world", "hello-")
 * // "hello-world"
 *
 * // Data-last (pipeable)
 * const piped = pipe("bar", Str.prefix("foo-"))
 * // "foo-bar"
 *
 * void prefixed
 * void piped
 * ```
 *
 * @category combinators
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
 * Prepends `prefix` to a string and returns a thunk of the result.
 *
 * Useful for deferred evaluation when building lazy configuration values.
 * Supports both data-first and data-last calling conventions.
 *
 * @example
 * ```ts
 * import { pipe } from "effect"
 * import { Str } from "@beep/utils"
 *
 * // Data-first
 * const lazy = Str.prefixThunk("world", "hello-")
 * const value = lazy()
 * // "hello-world"
 *
 * // Data-last (pipeable)
 * const piped = pipe("bar", Str.prefixThunk("foo-"))
 * const result = piped()
 * // "foo-bar"
 *
 * void value
 * void result
 * ```
 *
 * @category combinators
 * @since 0.0.0
 */
export const prefixThunk: {
  <const Pre extends string>(prefix: Pre): <S extends string>(str: S) => () => `${Pre}${S}`;
  <const Pre extends string, const S extends string>(str: S, prefix: Pre): () => `${Pre}${S}`;
} = dual(
  2,
  <const Pre extends string, const S extends string>(str: S, prefix: Pre): (() => `${Pre}${S}`) =>
    () =>
      `${prefix}${str}` as const
);

/**
 * Appends `postfix` to a string, preserving template-literal types.
 *
 * Supports both data-first and data-last calling conventions.
 *
 * @example
 * ```ts
 * import { pipe } from "effect"
 * import { Str } from "@beep/utils"
 *
 * // Data-first
 * const suffixed = Str.postfix("hello", "-world")
 * // "hello-world"
 *
 * // Data-last (pipeable)
 * const piped = pipe("foo", Str.postfix("-bar"))
 * // "foo-bar"
 *
 * void suffixed
 * void piped
 * ```
 *
 * @category combinators
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
 * Appends `postfix` to a string and returns a thunk of the result.
 *
 * Useful for deferred evaluation when building lazy configuration values.
 * Supports both data-first and data-last calling conventions.
 *
 * @example
 * ```ts
 * import { pipe } from "effect"
 * import { Str } from "@beep/utils"
 *
 * // Data-first
 * const lazy = Str.postfixThunk("hello", "-world")
 * const value = lazy()
 * // "hello-world"
 *
 * // Data-last (pipeable)
 * const piped = pipe("foo", Str.postfixThunk("-bar"))
 * const result = piped()
 * // "foo-bar"
 *
 * void value
 * void result
 * ```
 *
 * @category combinators
 * @since 0.0.0
 */
export const postfixThunk: {
  <const Post extends string>(postfix: Post): <S extends string>(str: S) => () => `${S}${Post}`;
  <const Post extends string, const S extends string>(str: S, postfix: Post): () => `${S}${Post}`;
} = dual(
  2,
  <const Post extends string, const S extends string>(str: S, postfix: Post): (() => `${S}${Post}`) =>
    () =>
      `${str}${postfix}` as const
);

/**
 * Maps a non-empty string array by prepending each element with `prefix`.
 *
 * Preserves `NonEmptyReadonlyArray` in the return type. Supports both
 * data-first and data-last calling conventions.
 *
 * @example
 * ```ts
 * import { pipe } from "effect"
 * import { Str } from "@beep/utils"
 * import type * as A from "effect/Array"
 *
 * const routes: A.NonEmptyReadonlyArray<string> = ["users", "posts"]
 *
 * // Data-first
 * const prefixed = Str.mapPrefix("/api/", routes)
 *
 * // Data-last (pipeable)
 * const piped = pipe(routes, Str.mapPrefix("/api/"))
 *
 * void prefixed
 * void piped
 * ```
 *
 * @category combinators
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
 * Maps a non-empty string array by appending each element with `postfix`.
 *
 * Preserves `NonEmptyReadonlyArray` in the return type. Supports both
 * data-first and data-last calling conventions.
 *
 * @example
 * ```ts
 * import { pipe } from "effect"
 * import { Str } from "@beep/utils"
 * import type * as A from "effect/Array"
 *
 * const files: A.NonEmptyReadonlyArray<string> = ["index", "main"]
 *
 * // Data-first
 * const withExt = Str.mapPostfix(".ts", files)
 *
 * // Data-last (pipeable)
 * const piped = pipe(files, Str.mapPostfix(".ts"))
 *
 * void withExt
 * void piped
 * ```
 *
 * @category combinators
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
 * Converts a string to `camelCase` with a type-level `CamelCase` return.
 *
 * @example
 * ```ts
 * import { Str } from "@beep/utils"
 *
 * const value = Str.camelCase("my_cool_name")
 * // "myCoolName"
 * void value
 * ```
 *
 * @category combinators
 * @since 0.0.0
 */
export const camelCase = <TStr extends string>(str: TStr): TF.CamelCase<TStr> => cast(Str.camelCase(str));

/**
 * Converts a string to `snake_case` with a type-level `SnakeCase` return.
 *
 * @example
 * ```ts
 * import { Str } from "@beep/utils"
 *
 * const value = Str.snakeCase("myCoolName")
 * // "my_cool_name"
 * void value
 * ```
 *
 * @category combinators
 * @since 0.0.0
 */
export const snakeCase = <const TStr extends string>(str: TStr): TF.SnakeCase<TStr> => cast(Str.snakeCase(str));

/**
 * Converts a string to `kebab-case` with a type-level `KebabCase` return.
 *
 * @example
 * ```ts
 * import { Str } from "@beep/utils"
 *
 * const value = Str.kebabCase("myCoolName")
 * // "my-cool-name"
 * void value
 * ```
 *
 * @category combinators
 * @since 0.0.0
 */
export const kebabCase = <const TStr extends string>(str: TStr): TF.KebabCase<TStr> => cast(Str.kebabCase(str));

/**
 * Converts a string to `SCREAMING_SNAKE_CASE` with a type-level
 * `ScreamingSnakeCase` return.
 *
 * @example
 * ```ts
 * import { Str } from "@beep/utils"
 *
 * const value = Str.screamingSnake("myCoolName")
 * // "MY_COOL_NAME"
 * void value
 * ```
 *
 * @category combinators
 * @since 0.0.0
 */
export const screamingSnake = <const TStr extends string>(str: TStr): TF.ScreamingSnakeCase<TStr> =>
  cast(Str.constantCase(str));

/**
 * Converts a string to `PascalCase` with a type-level `PascalCase` return.
 *
 * @example
 * ```ts
 * import { Str } from "@beep/utils"
 *
 * const value = Str.pascalCase("my_cool_name")
 * // "MyCoolName"
 * void value
 * ```
 *
 * @category combinators
 * @since 0.0.0
 */
export const pascalCase = <const TStr extends string>(str: TStr): TF.PascalCase<TStr> => cast(Str.pascalCase(str));

/**
 * Converts a `PascalCase` string to `snake_case` at both type and value level.
 *
 * @example
 * ```ts
 * import { Str } from "@beep/utils"
 *
 * const value = Str.pascalToSnake("MyCoolName")
 * // "my_cool_name"
 * void value
 * ```
 *
 * @category combinators
 * @since 0.0.0
 */
export const pascalToSnake = <const TStr extends string>(str: TF.PascalCase<TStr>): TF.SnakeCase<TStr> =>
  cast(Str.pascalToSnake(str));

/**
 * Converts a `snake_case` string to `camelCase` at both type and value level.
 *
 * @example
 * ```ts
 * import { Str } from "@beep/utils"
 *
 * const value = Str.snakeToCamel("my_cool_name")
 * // "myCoolName"
 * void value
 * ```
 *
 * @category combinators
 * @since 0.0.0
 */
export const snakeToCamel = <const TStr extends string>(str: TF.SnakeCase<TStr>): TF.CamelCase<TStr> =>
  cast(Str.snakeToCamel(str));

/**
 * Converts a `snake_case` string to `kebab-case` at both type and value level.
 *
 * @example
 * ```ts
 * import { Str } from "@beep/utils"
 *
 * const value = Str.snakeToKebab("my_cool_name")
 * // "my-cool-name"
 * void value
 * ```
 *
 * @category combinators
 * @since 0.0.0
 */
export const snakeToKebab = <const TStr extends string>(str: TF.SnakeCase<TStr>): TF.KebabCase<TStr> =>
  cast(Str.snakeToKebab(str));

/**
 * Converts a `camelCase` string to `snake_case` at both type and value level.
 *
 * @example
 * ```ts
 * import { Str } from "@beep/utils"
 *
 * const value = Str.camelToSnake("myCoolName")
 * // "my_cool_name"
 * void value
 * ```
 *
 * @category combinators
 * @since 0.0.0
 */
export const camelToSnake = <const TStr extends string>(str: TF.CamelCase<TStr>): TF.SnakeCase<TStr> =>
  cast(Str.camelToSnake(str));

/**
 * Converts a `snake_case` string to `PascalCase` at both type and value level.
 *
 * @example
 * ```ts
 * import { Str } from "@beep/utils"
 *
 * const value = Str.snakeToPascal("my_cool_name")
 * // "MyCoolName"
 * void value
 * ```
 *
 * @category combinators
 * @since 0.0.0
 */
export const snakeToPascal = <const TStr extends string>(str: TF.SnakeCase<TStr>): TF.PascalCase<TStr> =>
  cast(Str.snakeToPascal(str));

/**
 * Converts a `kebab-case` string to `snake_case` at both type and value level.
 *
 * @example
 * ```ts
 * import { Str } from "@beep/utils"
 *
 * const value = Str.kebabToSnake("my-cool-name")
 * // "my_cool_name"
 * void value
 * ```
 *
 * @category combinators
 * @since 0.0.0
 */
export const kebabToSnake = <const TStr extends string>(str: TF.KebabCase<TStr>): TF.SnakeCase<TStr> =>
  cast(Str.kebabToSnake(str));

/**
 * Type-narrowing predicate that checks whether a string starts with `searchString`.
 *
 * Narrows the type to `TStr & \`${SearchString}${string}\`` on success.
 * Supports both data-first and data-last calling conventions.
 *
 * @example
 * ```ts
 * import { pipe } from "effect"
 * import { Str } from "@beep/utils"
 *
 * // Data-first
 * const result = Str.startsWith("hello world", "hello")
 * // true
 *
 * // Data-last (pipeable)
 * const piped = pipe("hello world", Str.startsWith("hello"))
 * // true
 *
 * void result
 * void piped
 * ```
 *
 * @category predicates
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
 * Type-narrowing predicate that checks whether a string ends with `searchString`.
 *
 * Narrows the type to `TStr & \`${string}${SearchString}\`` on success.
 * Supports both data-first and data-last calling conventions.
 *
 * @example
 * ```ts
 * import { pipe } from "effect"
 * import { Str } from "@beep/utils"
 *
 * // Data-first
 * const result = Str.endsWith("main.ts", ".ts")
 * // true
 *
 * // Data-last (pipeable)
 * const piped = pipe("main.ts", Str.endsWith(".ts"))
 * // true
 *
 * void result
 * void piped
 * ```
 *
 * @category predicates
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
 * Type-narrowing predicate that checks whether a string contains `searchString`.
 *
 * Narrows the type to `TStr & \`${string}${SearchString}${string}\`` on
 * success. Supports both data-first and data-last calling conventions.
 *
 * @example
 * ```ts
 * import { pipe } from "effect"
 * import { Str } from "@beep/utils"
 *
 * // Data-first
 * const result = Str.contains("hello world", "lo wo")
 * // true
 *
 * // Data-last (pipeable)
 * const piped = pipe("hello world", Str.contains("xyz"))
 * // false
 *
 * void result
 * void piped
 * ```
 *
 * @category predicates
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
 * Repeats a string `count` times with a type-level `StringRepeat` return.
 *
 * Supports both data-first and data-last calling conventions.
 *
 * @example
 * ```ts
 * import { pipe } from "effect"
 * import { Str } from "@beep/utils"
 *
 * // Data-first
 * const result = Str.repeat("ha", 3)
 * // "hahaha"
 *
 * // Data-last (pipeable)
 * const piped = pipe("na", Str.repeat(2))
 * // "nana"
 *
 * void result
 * void piped
 * ```
 *
 * @category combinators
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
    cast(Str.repeat(count)(self))
);
/**
 * Re-export of all helpers from `effect/String`.
 *
 * @category utilities
 * @since 0.0.0
 */
export * from "effect/String";

/**
 * Returns a thunk that lazily trims whitespace from both ends of a string.
 *
 * @example
 * ```ts
 * import { Str } from "@beep/utils"
 *
 * const lazy = Str.trimThunk("  hello  ")
 * const value = lazy()
 * // "hello"
 *
 * void value
 * ```
 *
 * @category combinators
 * @since 0.0.0
 */
export const trimThunk = (s: string) => () => Str.trim(s);
