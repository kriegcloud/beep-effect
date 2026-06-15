---
title: Str.ts
nav_order: 18
parent: "@beep/utils"
---

## Str.ts overview

String helpers for type-preserving prefixes, suffixes, case conversion, and
predicates.

Since v0.0.0

---
## Exports Grouped by Category
- [combinators](#combinators)
  - [camelCase](#camelcase)
  - [camelToSnake](#cameltosnake)
  - [kebabCase](#kebabcase)
  - [kebabToSnake](#kebabtosnake)
  - [mapPostfix](#mappostfix)
  - [mapPrefix](#mapprefix)
  - [orEmpty](#orempty)
  - [pascalCase](#pascalcase)
  - [pascalToSnake](#pascaltosnake)
  - [postfix](#postfix)
  - [postfixThunk](#postfixthunk)
  - [prefix](#prefix)
  - [prefixThunk](#prefixthunk)
  - [repeat](#repeat)
  - [replaceAllWith](#replaceallwith)
  - [replaceWith](#replacewith)
  - [screamingSnake](#screamingsnake)
  - [snakeCase](#snakecase)
  - [snakeToCamel](#snaketocamel)
  - [snakeToKebab](#snaketokebab)
  - [snakeToPascal](#snaketopascal)
  - [trimThunk](#trimthunk)
  - [truncate](#truncate)
- [predicates](#predicates)
  - [contains](#contains)
  - [endsWith](#endswith)
  - [equivalence](#equivalence)
  - [startsWith](#startswith)
- [utilities](#utilities)
  - ["effect/String" (namespace export)](#effectstring-namespace-export)
  - [fromNumber](#fromnumber)
  - [orderAsc](#orderasc)
  - [toSlug](#toslug)
---

# combinators

## camelCase

Converts a string to `camelCase` with a type-level `CamelCase` return.

**Example**

```ts
import { Str } from "@beep/utils"

const value = Str.camelCase("my_cool_name")
// "myCoolName"
console.log(value)
```

**Signature**

```ts
declare const camelCase: <TStr extends string>(str: TStr) => TF.CamelCase<TStr>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Str.ts#L307)

Since v0.0.0

## camelToSnake

Converts a `camelCase` string to `snake_case` at both type and value level.

**Example**

```ts
import { Str } from "@beep/utils"

const value = Str.camelToSnake("myCoolName")
// "my_cool_name"
console.log(value)
```

**Signature**

```ts
declare const camelToSnake: <const TStr extends string>(str: TF.CamelCase<TStr>) => TF.SnakeCase<TStr>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Str.ts#L448)

Since v0.0.0

## kebabCase

Converts a string to `kebab-case` with a type-level `KebabCase` return.

**Example**

```ts
import { Str } from "@beep/utils"

const value = Str.kebabCase("myCoolName")
// "my-cool-name"
console.log(value)
```

**Signature**

```ts
declare const kebabCase: <const TStr extends string>(str: TStr) => TF.KebabCase<TStr>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Str.ts#L341)

Since v0.0.0

## kebabToSnake

Converts a `kebab-case` string to `snake_case` at both type and value level.

**Example**

```ts
import { Str } from "@beep/utils"

const value = Str.kebabToSnake("my-cool-name")
// "my_cool_name"
console.log(value)
```

**Signature**

```ts
declare const kebabToSnake: <const TStr extends string>(str: TF.KebabCase<TStr>) => TF.SnakeCase<TStr>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Str.ts#L484)

Since v0.0.0

## mapPostfix

Maps a non-empty string array by appending each element with `postfix`.

Preserves `NonEmptyReadonlyArray` in the return type. Supports both
data-first and data-last calling conventions.

**Example**

```ts
import { pipe } from "effect"
import { Str } from "@beep/utils"
import * as A from "effect/Array"

const files: A.NonEmptyReadonlyArray<string> = ["index", "main"]

// Data-first
const withExt = Str.mapPostfix(".ts", files)

// Data-last (pipeable)
const piped = pipe(files, Str.mapPostfix(".ts"))

console.log(withExt)
console.log(piped)
```

**Signature**

```ts
declare const mapPostfix: { <const Post extends string>(postfix: Post): <Arr extends A.NonEmptyReadonlyArray<string>>(arr: Arr) => A.NonEmptyReadonlyArray<`${Arr[number]}${Post}`>; <const Post extends string, Arr extends A.NonEmptyReadonlyArray<string>>(postfix: Post, arr: Arr): A.NonEmptyReadonlyArray<`${Arr[number]}${Post}`>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Str.ts#L273)

Since v0.0.0

## mapPrefix

Maps a non-empty string array by prepending each element with `prefix`.

Preserves `NonEmptyReadonlyArray` in the return type. Supports both
data-first and data-last calling conventions.

**Example**

```ts
import { pipe } from "effect"
import { Str } from "@beep/utils"
import * as A from "effect/Array"

const routes: A.NonEmptyReadonlyArray<string> = ["users", "posts"]

// Data-first
const prefixed = Str.mapPrefix("/api/", routes)

// Data-last (pipeable)
const piped = pipe(routes, Str.mapPrefix("/api/"))

console.log(prefixed)
console.log(piped)
```

**Signature**

```ts
declare const mapPrefix: { <const Pre extends string>(prefix: Pre): <Arr extends A.NonEmptyReadonlyArray<string>>(arr: Arr) => A.NonEmptyReadonlyArray<`${Pre}${Arr[number]}`>; <const Pre extends string, Arr extends A.NonEmptyReadonlyArray<string>>(prefix: Pre, arr: Arr): A.NonEmptyReadonlyArray<`${Pre}${Arr[number]}`>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Str.ts#L227)

Since v0.0.0

## orEmpty

Returns an empty string if the provided input is null or undefined

**Example**

```ts
import { Str } from "@beep/utils";

const fn = (someStr: string | null | undefined) => console.log(Str.orEmpty(someStr)) // "" if null or undefined
```

**Signature**

```ts
declare const orEmpty: (str: string | null | undefined) => string
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Str.ts#L848)

Since v0.0.0

## pascalCase

Converts a string to `PascalCase` with a type-level `PascalCase` return.

**Example**

```ts
import { Str } from "@beep/utils"

const value = Str.pascalCase("my_cool_name")
// "MyCoolName"
console.log(value)
```

**Signature**

```ts
declare const pascalCase: <const TStr extends string>(str: TStr) => TF.PascalCase<TStr>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Str.ts#L377)

Since v0.0.0

## pascalToSnake

Converts a `PascalCase` string to `snake_case` at both type and value level.

**Example**

```ts
import { Str } from "@beep/utils"

const value = Str.pascalToSnake("MyCoolName")
// "my_cool_name"
console.log(value)
```

**Signature**

```ts
declare const pascalToSnake: <const TStr extends string>(str: TF.PascalCase<TStr>) => TF.SnakeCase<TStr>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Str.ts#L394)

Since v0.0.0

## postfix

Appends `postfix` to a string, preserving template-literal types.

Supports both data-first and data-last calling conventions.

**Example**

```ts
import { pipe } from "effect"
import { Str } from "@beep/utils"

// Data-first
const suffixed = Str.postfix("hello", "-world")
// "hello-world"

// Data-last (pipeable)
const piped = pipe("foo", Str.postfix("-bar"))
// "foo-bar"

console.log(suffixed)
console.log(piped)
```

**Signature**

```ts
declare const postfix: { <const Post extends string>(postfix: Post): <S extends string>(str: S) => `${S}${Post}`; <const Post extends string, const S extends string>(str: S, postfix: Post): `${S}${Post}`; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Str.ts#L153)

Since v0.0.0

## postfixThunk

Appends `postfix` to a string and returns a thunk of the result.

Useful for deferred evaluation when building lazy configuration values.
Supports both data-first and data-last calling conventions.

**Example**

```ts
import { pipe } from "effect"
import { Str } from "@beep/utils"

// Data-first
const lazy = Str.postfixThunk("hello", "-world")
const value = lazy()
// "hello-world"

// Data-last (pipeable)
const piped = pipe("foo", Str.postfixThunk("-bar"))
const result = piped()
// "foo-bar"

console.log(value)
console.log(result)
```

**Signature**

```ts
declare const postfixThunk: { <const Post extends string>(postfix: Post): <S extends string>(str: S) => () => `${S}${Post}`; <const Post extends string, const S extends string>(str: S, postfix: Post): () => `${S}${Post}`; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Str.ts#L190)

Since v0.0.0

## prefix

Prepends `prefix` to a string, preserving template-literal types.

Supports both data-first and data-last calling conventions.

**Example**

```ts
import { pipe } from "effect"
import { Str } from "@beep/utils"

// Data-first
const prefixed = Str.prefix("world", "hello-")
// "hello-world"

// Data-last (pipeable)
const piped = pipe("bar", Str.prefix("foo-"))
// "foo-bar"

console.log(prefixed)
console.log(piped)
```

**Signature**

```ts
declare const prefix: { <const Pre extends string>(prefix: Pre): <S extends string>(str: S) => `${Pre}${S}`; <const Pre extends string, const S extends string>(str: S, prefix: Pre): `${Pre}${S}`; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Str.ts#L82)

Since v0.0.0

## prefixThunk

Prepends `prefix` to a string and returns a thunk of the result.

Useful for deferred evaluation when building lazy configuration values.
Supports both data-first and data-last calling conventions.

**Example**

```ts
import { pipe } from "effect"
import { Str } from "@beep/utils"

// Data-first
const lazy = Str.prefixThunk("world", "hello-")
const value = lazy()
// "hello-world"

// Data-last (pipeable)
const piped = pipe("bar", Str.prefixThunk("foo-"))
const result = piped()
// "foo-bar"

console.log(value)
console.log(result)
```

**Signature**

```ts
declare const prefixThunk: { <const Pre extends string>(prefix: Pre): <S extends string>(str: S) => () => `${Pre}${S}`; <const Pre extends string, const S extends string>(str: S, prefix: Pre): () => `${Pre}${S}`; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Str.ts#L118)

Since v0.0.0

## repeat

Repeats a string `count` times with a type-level `StringRepeat` return.

Supports both data-first and data-last calling conventions.

**Example**

```ts
import { pipe } from "effect"
import { Str } from "@beep/utils"

// Data-first
const result = Str.repeat("ha", 3)
// "hahaha"

// Data-last (pipeable)
const piped = pipe("na", Str.repeat(2))
// "nana"

console.log(result)
console.log(piped)
```

**Signature**

```ts
declare const repeat: { <const Count extends number>(count: Count): <const Input extends string>(self: Input) => TF.StringRepeat<Input, Count>; <const Input extends string, const Count extends number>(self: Input, count: Count): TF.StringRepeat<Input, Count>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Str.ts#L628)

Since v0.0.0

## replaceAllWith

Replaces every occurrence of `searchValue` using a callback replacer.

Supports both data-first and data-last calling conventions. Use this helper
for native `replaceAll` callback sites that cannot be expressed with
`Str.replaceAll(searchValue, replacement)`.

**Example**

```ts
import { Str } from "@beep/utils"
import { pipe } from "effect"

const replaced = Str.replaceAllWith(/beep/g, (match) => Str.toUpperCase(match))("beep beep")
const piped = pipe("beep beep", Str.replaceAllWith(/beep/g, (match) => Str.toUpperCase(match)))

console.log(replaced)
console.log(piped)
```

**Signature**

```ts
declare const replaceAllWith: { (searchValue: string | RegExp, replacer: (substring: string, ...args: ReadonlyArray<unknown>) => string): (self: string) => string; (self: string, searchValue: string | RegExp, replacer: (substring: string, ...args: ReadonlyArray<unknown>) => string): string; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Str.ts#L702)

Since v0.0.0

## replaceWith

Replaces the first occurrence of `searchValue` using a callback replacer.

Supports both data-first and data-last calling conventions. Use this helper
for native `replace` callback sites that cannot be expressed with
`Str.replace(searchValue, replacement)`.

**Example**

```ts
import { Str } from "@beep/utils"
import { pipe } from "effect"

const replaced = Str.replaceWith("beep", (match) => Str.toUpperCase(match))("hello beep")
const piped = pipe("hello beep", Str.replaceWith("beep", (match) => Str.toUpperCase(match)))

console.log(replaced)
console.log(piped)
```

**Signature**

```ts
declare const replaceWith: { (searchValue: string | RegExp, replacer: (substring: string, ...args: ReadonlyArray<unknown>) => string): (self: string) => string; (self: string, searchValue: string | RegExp, replacer: (substring: string, ...args: ReadonlyArray<unknown>) => string): string; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Str.ts#L661)

Since v0.0.0

## screamingSnake

Converts a string to `SCREAMING_SNAKE_CASE` with a type-level
`ScreamingSnakeCase` return.

**Example**

```ts
import { Str } from "@beep/utils"

const value = Str.screamingSnake("myCoolName")
// "MY_COOL_NAME"
console.log(value)
```

**Signature**

```ts
declare const screamingSnake: <const TStr extends string>(str: TStr) => TF.ScreamingSnakeCase<TStr>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Str.ts#L359)

Since v0.0.0

## snakeCase

Converts a string to `snake_case` with a type-level `SnakeCase` return.

**Example**

```ts
import { Str } from "@beep/utils"

const value = Str.snakeCase("myCoolName")
// "my_cool_name"
console.log(value)
```

**Signature**

```ts
declare const snakeCase: <const TStr extends string>(str: TStr) => TF.SnakeCase<TStr>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Str.ts#L324)

Since v0.0.0

## snakeToCamel

Converts a `snake_case` string to `camelCase` at both type and value level.

**Example**

```ts
import { Str } from "@beep/utils"

const value = Str.snakeToCamel("my_cool_name")
// "myCoolName"
console.log(value)
```

**Signature**

```ts
declare const snakeToCamel: <const TStr extends string>(str: TF.SnakeCase<TStr>) => TF.CamelCase<TStr>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Str.ts#L412)

Since v0.0.0

## snakeToKebab

Converts a `snake_case` string to `kebab-case` at both type and value level.

**Example**

```ts
import { Str } from "@beep/utils"

const value = Str.snakeToKebab("my_cool_name")
// "my-cool-name"
console.log(value)
```

**Signature**

```ts
declare const snakeToKebab: <const TStr extends string>(str: TF.SnakeCase<TStr>) => TF.KebabCase<TStr>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Str.ts#L430)

Since v0.0.0

## snakeToPascal

Converts a `snake_case` string to `PascalCase` at both type and value level.

**Example**

```ts
import { Str } from "@beep/utils"

const value = Str.snakeToPascal("my_cool_name")
// "MyCoolName"
console.log(value)
```

**Signature**

```ts
declare const snakeToPascal: <const TStr extends string>(str: TF.SnakeCase<TStr>) => TF.PascalCase<TStr>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Str.ts#L466)

Since v0.0.0

## trimThunk

Returns a thunk that lazily trims whitespace from both ends of a string.

**Example**

```ts
import { Str } from "@beep/utils"

const lazy = Str.trimThunk("  hello  ")
const value = lazy()
// "hello"

console.log(value)
```

**Signature**

```ts
declare const trimThunk: (s: string) => () => string
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Str.ts#L753)

Since v0.0.0

## truncate

Trim text and truncate it to the requested visible character count.

When the trimmed text is longer than `maxLength`, the result keeps the first
`maxLength` characters and appends `...`.

**Example**

```ts
import { pipe } from "effect"
import { Str } from "@beep/utils"

const direct = Str.truncate("  hello world  ", 5)
// "hello..."

const piped = pipe("  beep effect  ", Str.truncate(4))
// "beep..."

console.log(direct)
console.log(piped)
```

**Signature**

```ts
declare const truncate: { (text: string, maxLength: number): string; (maxLength: number): (text: string) => string; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Str.ts#L823)

Since v0.0.0

# predicates

## contains

Type-narrowing predicate that checks whether a string contains `searchString`.

Narrows the type to a string that contains the searched substring on
success. Supports both data-first and data-last calling conventions.

**Example**

```ts
import { pipe } from "effect"
import { Str } from "@beep/utils"

// Data-first
const result = Str.contains("hello world", "lo wo")
// true

// Data-last (pipeable)
const piped = pipe("hello world", Str.contains("xyz"))
// false

console.log(result)
console.log(piped)
```

**Signature**

```ts
declare const contains: { <const SearchString extends string>(searchString: SearchString): <const TStr extends string>(str: TStr) => str is TStr & `${string}${SearchString}${string}`; <const TStr extends string, const SearchString extends string>(str: TStr, searchString: SearchString): str is TStr & `${string}${SearchString}${string}`; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Str.ts#L587)

Since v0.0.0

## endsWith

Type-narrowing predicate that checks whether a string ends with `searchString`.

Narrows the type to a string with the requested suffix on success. Supports
both data-first and data-last calling conventions.

**Example**

```ts
import { pipe } from "effect"
import { Str } from "@beep/utils"

const direct = Str.endsWith("hello-world", "world")
const piped = pipe("hello-world", Str.endsWith("world"))

console.log(direct)
console.log(piped)
```

**Signature**

```ts
declare const endsWith: { <const SearchString extends string>(searchString: SearchString): <const TStr extends string>(str: TStr) => str is TStr & `${string}${SearchString}`; <const TStr extends string, const SearchString extends string>(str: TStr, searchString: SearchString): str is TStr & `${string}${SearchString}`; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Str.ts#L545)

Since v0.0.0

## equivalence

Compare two strings for equality with data-first and data-last call forms.

This is the canonical string-specific equivalence helper for reusable code.
Use `SchemaUtils.toEquivalence(schema)` when comparing values whose equality
should be derived from a named schema.

**Example**

```ts
import { pipe } from "effect"
import { Str } from "@beep/utils"

const same = Str.equivalence("docs", "docs")
const piped = pipe("docs", Str.equivalence("tests"))

console.log(same)
console.log(piped)
```

**Signature**

```ts
declare const equivalence: { (self: string, that: string): boolean; (that: string): (self: string) => boolean; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Str.ts#L36)

Since v0.0.0

## startsWith

Type-narrowing predicate that checks whether a string starts with `searchString`.

Narrows the type to a string with the requested prefix on success. Supports
both data-first and data-last calling conventions.

**Example**

```ts
import { pipe } from "effect"
import { Str } from "@beep/utils"

const direct = Str.startsWith("hello-world", "hello")
const piped = pipe("hello-world", Str.startsWith("hello"))

console.log(direct)
console.log(piped)
```

**Signature**

```ts
declare const startsWith: { <const SearchString extends string>(searchString: SearchString): <const TStr extends string>(str: TStr) => str is TStr & `${SearchString}${string}`; <const TStr extends string, const SearchString extends string>(str: TStr, searchString: SearchString): str is TStr & `${SearchString}${string}`; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Str.ts#L508)

Since v0.0.0

# utilities

## "effect/String" (namespace export)

Re-exports all named exports from the "effect/String" module.

**Example**

```ts
import { Str } from "@beep/utils"

const lower = Str.toLowerCase("BEEP")
console.log(lower)
```

**Signature**

```ts
export * from "effect/String"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Str.ts#L734)

Since v0.0.0

## fromNumber

Convert a numeric literal into its string-literal representation.

**Example**

```ts
import { Str } from "@beep/utils"

const value = Str.fromNumber(42)
console.log(value)
```

**Signature**

```ts
declare const fromNumber: <const T extends number>(num: T) => `${T}`
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Str.ts#L772)

Since v0.0.0

## orderAsc

Ascending lexicographic order for strings.

**Example**

```ts
import { A, Str } from "@beep/utils"

const sorted = A.sort(["b", "a"], Str.orderAsc)
console.log(sorted)
```

**Signature**

```ts
declare const orderAsc: Order.Order<string>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Str.ts#L55)

Since v0.0.0

## toSlug

Converts arbitrary text into a lowercase kebab-case slug.

**Example**

```ts
import { Str } from "@beep/utils"

const value = Str.toSlug("Hello, Beep Effect!")
console.log(value)
```

**Signature**

```ts
declare const toSlug: (self: string) => string
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Str.ts#L788)

Since v0.0.0