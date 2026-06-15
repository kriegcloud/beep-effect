---
title: Struct.ts
nav_order: 20
parent: "@beep/utils"
---

## Struct.ts overview

Struct helpers for typed paths, entries, keys, and reverse mappings.

Since v0.0.0

---
## Exports Grouped by Category
- [combinators](#combinators)
  - [mapPath](#mappath)
  - [mapPathLazy](#mappathlazy)
  - [reverse](#reverse)
- [constructors](#constructors)
  - [fromEntries](#fromentries)
- [error-handling](#error-handling)
  - [EmptyStructError (class)](#emptystructerror-class)
- [getters](#getters)
  - [dotGet](#dotget)
  - [dotGetOption](#dotgetoption)
  - [entries](#entries)
  - [entriesNonEmpty](#entriesnonempty)
  - [getLazy](#getlazy)
  - [keys](#keys)
  - [keysNonEmpty](#keysnonempty)
  - [pathsOf](#pathsof)
- [models](#models)
  - [PathLookup (type alias)](#pathlookup-type-alias)
  - [ReverseStruct (type alias)](#reversestruct-type-alias)
  - [ReverseableStruct (type alias)](#reverseablestruct-type-alias)
  - [StringKeyEntries (type alias)](#stringkeyentries-type-alias)
  - [StringKeyEntry (type alias)](#stringkeyentry-type-alias)
- [utilities](#utilities)
  - ["effect/Struct" (namespace export)](#effectstruct-namespace-export)
---

# combinators

## mapPath

Applies a unary function to a value retrieved from a struct by path.

Uses `dotGet` under the hood, so string paths are type-validated and
tuple paths resolve via `type-fest` `Get`.

Supports a dual API:
- Data-last: `pipe(self, Struct.mapPath(renderName, { path: "profile.name" }))`
- Data-first: `Struct.mapPath(self, renderName, { path: "profile.name" })`
- Tuple paths: `Struct.mapPath(self, renderName, { path: ["profile", "name"] as const })`

If the runtime value does not actually satisfy the statically-declared path,
`undefined` is forwarded to `f`, matching `dotGet`.

**Example**

```ts
import { pipe } from "effect"
import { Struct } from "@beep/utils"

const user = { profile: { name: "alice" } }

// Data-first
const upper = Struct.mapPath(user, (s: string) => s.toUpperCase(), { path: "profile.name" })
// "ALICE"

console.log(upper)
```

**Signature**

```ts
declare const mapPath: { <A, B, const P extends string>(f: (a: A) => B, options: { readonly path: P; }): <S extends object>(self: P extends Paths<S> ? (Get<S, P> extends A ? S : never) : never) => B; <A, B, const P extends ReadonlyArray<string>>(f: (a: A) => B, options: { readonly path: P; }): <S extends object>(self: Get<S, P> extends A ? S : never) => B; <S extends object, A, B, const P extends string & Paths<S>>(self: S, f: Get<S, P> extends A ? (a: A) => B : never, options: { readonly path: P; }): B; <S extends object, A, B, const P extends ReadonlyArray<string>>(self: S, f: Get<S, P> extends A ? (a: A) => B : never, options: { readonly path: P; }): B; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Struct.ts#L223)

Since v0.0.0

## mapPathLazy

Returns a thunk that applies a unary function to a value retrieved from a
struct by path.

Mirrors `mapPath`, but delays both the path lookup and the function
application until the returned zero-argument function is invoked.

Supports a dual API:
- Data-last: `pipe(self, Struct.mapPathLazy(renderName, { path: "profile.name" }))()`
- Data-first: `Struct.mapPathLazy(self, renderName, { path: "profile.name" })()`
- Tuple paths: `Struct.mapPathLazy(self, renderName, { path: ["profile", "name"] as const })()`

If the runtime value does not actually satisfy the statically-declared path,
`undefined` is forwarded to `f`, matching `dotGet`.

**Example**

```ts
import { Struct } from "@beep/utils"

const user = { profile: { name: "alice" } }

const lazy = Struct.mapPathLazy(user, (s: string) => s.toUpperCase(), { path: "profile.name" })
const value = lazy()
// "ALICE"

console.log(value)
```

**Signature**

```ts
declare const mapPathLazy: { <A, B, const P extends string>(f: (a: A) => B, options: { readonly path: P; }): <S extends object>(self: P extends Paths<S> ? (Get<S, P> extends A ? S : never) : never) => () => B; <A, B, const P extends ReadonlyArray<string>>(f: (a: A) => B, options: { readonly path: P; }): <S extends object>(self: Get<S, P> extends A ? S : never) => () => B; <S extends object, A, B, const P extends string & Paths<S>>(self: S, f: Get<S, P> extends A ? (a: A) => B : never, options: { readonly path: P; }): () => B; <S extends object, A, B, const P extends ReadonlyArray<string>>(self: S, f: Get<S, P> extends A ? (a: A) => B : never, options: { readonly path: P; }): () => B; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Struct.ts#L298)

Since v0.0.0

## reverse

Reverses a struct mapping, producing a new struct where original values
become keys and original keys become values.

Supports a dual API:
- Data-last: `reverse()(self)`
- Data-first: `reverse(self)`

When duplicate values exist, the last encountered key wins at runtime.

**Example**

```ts
import { Struct } from "@beep/utils"

const errorCode = {
  successfulCompletion: "00000",
  warning: "01000",
} satisfies Struct.ReverseableStruct

const reversed = Struct.reverse(errorCode)

console.log(reversed)
```

**Signature**

```ts
declare const reverse: { <S extends ReverseableStruct>(): (self: S) => ReverseStruct<S>; <S extends ReverseableStruct>(self: S): ReverseStruct<S>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Struct.ts#L703)

Since v0.0.0

# constructors

## fromEntries

Type-safe `Object.fromEntries` that preserves per-key value types.

Accepts an iterable of `[key, value]` pairs and produces an object
whose type is the simplified union of all entries.

**Example**

```ts
import { Struct } from "@beep/utils"

const entries: ReadonlyArray<readonly ["host", "localhost"] | readonly ["port", 3000]> = [
  ["host", "localhost"],
  ["port", 3000],
]

const obj = Struct.fromEntries(entries)
// { host: "localhost", port: 3000 }

console.log(obj)
```

**Signature**

```ts
declare const fromEntries: <const E extends readonly [PropertyKey, unknown]>(entries: Iterable<E>) => Simplify<{ [P in E[0]]: Extract<E, readonly [P, unknown]>[1]; }>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Struct.ts#L601)

Since v0.0.0

# error-handling

## EmptyStructError (class)

Thrown when a struct expected to have at least one string key is empty.

**Example**

```ts
import { EmptyStructError } from "@beep/utils/Struct"

const error = EmptyStructError
console.log(error)
```

**Signature**

```ts
declare class EmptyStructError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Struct.ts#L41)

Since v0.0.0

# getters

## dotGet

Retrieves a value from a struct by a dot-delimited or tuple path.

Uses type-fest `Paths` for path validation and `Get` for value resolution.

Supports a dual API:
- Data-last: `dotGet("attributes.name")(self)`
- Data-first: `dotGet(self, "attributes.name")`
- Tuple paths: `dotGet(["attributes", "name"](self)`

**Example**

```ts
import { pipe } from "effect"
import { Struct } from "@beep/utils"

const user = { profile: { name: "Alice", age: 30 } }

// Data-first
const name = Struct.dotGet(user, "profile.name")

// Data-last (pipeable)
const age = pipe(user, Struct.dotGet("profile.age"))

console.log(name)
console.log(age)
```

**Signature**

```ts
declare const dotGet: { <const P extends string>(path: P): <S extends object>(self: P extends Paths<S> ? S : never) => Get<S, P>; <const P extends ReadonlyArray<string>>(path: P): <S extends object>(self: S) => Get<S, P>; <S extends object, const P extends string & Paths<S>>(self: S, path: P): Get<S, P>; <S extends object, const P extends ReadonlyArray<string>>(self: S, path: P): Get<S, P>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Struct.ts#L134)

Since v0.0.0

## dotGetOption

Retrieves a value as an `Option` by a dot-delimited or tuple path.

Missing paths return `Option.none()`. Existing paths always return
`Option.some(value)`, including when `value === undefined`.

**Example**

```ts
import { pipe } from "effect"
import { Struct } from "@beep/utils"

const user = { profile: { name: "Alice" } }

// Data-first
const name = Struct.dotGetOption(user, "profile.name")
// Option.some("Alice")

// Missing path
const missing = Struct.dotGetOption(user, ["profile", "age"])
// Option.none()

console.log(name)
console.log(missing)
```

**Signature**

```ts
declare const dotGetOption: { <const P extends string>(path: P): <S extends object>(self: P extends Paths<S> ? S : never) => O.Option<Get<S, P>>; <const P extends ReadonlyArray<string>>(path: P): <S extends object>(self: S) => O.Option<Get<S, P>>; <S extends object, const P extends string & Paths<S>>(self: S, path: P): O.Option<Get<S, P>>; <S extends object, const P extends ReadonlyArray<string>>(self: S, path: P): O.Option<Get<S, P>>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Struct.ts#L174)

Since v0.0.0

## entries

Retrieves the entries (key-value pairs) of an object, where keys are strings,
in a type-safe manner. Symbol keys are excluded from the result.

Each entry preserves per-key correlation: for `{ a: string; b: number }`,
the return type is `Array<["a", string] | ["b", number]>` rather than
`Array<["a" | "b", string | number]>`.

**Example**

```ts
```typescript
import * as Struct from "@beep/utils/Struct"

const c = Symbol("c")
const value = { a: "foo", b: 1, [c]: true }

const entries: Array<["a", string] | ["b", number]> = Struct.entries(value)
console.log(entries)
```
```

**Signature**

```ts
declare const entries: <const R extends object>(obj: R) => StringKeyEntries<R>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Struct.ts#L489)

Since v0.0.0

## entriesNonEmpty

Returns the string-key entries of a non-empty object in a type-safe manner.

Empty struct types are rejected at compile time. A runtime empty value still
fails fast with `EmptyStructError` to protect the invariant.

**Example**

```ts
import { Struct } from "@beep/utils"

const config = { host: "localhost", port: 3000 }

const result = Struct.entriesNonEmpty(config)
// [["host", "localhost"], ["port", 3000]]

console.log(result)
```

**Signature**

```ts
declare const entriesNonEmpty: <const R extends object>(obj: R & NonEmptyStringKeyStruct<R>) => A.NonEmptyReadonlyArray<readonly [keyof R & string, R[keyof R & string]]>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Struct.ts#L518)

Since v0.0.0

## getLazy

Returns a thunk that reads a value from a struct by key.

Mirrors `effect/Struct.get`, but delays the property access until the
returned zero-argument function is invoked.

Supports a dual API:
- Data-last: `pipe(self, Struct.getLazy("name"))()`
- Data-first: `Struct.getLazy(self, "name")()`

**Example**

```ts
import { pipe } from "effect"
import { Struct } from "@beep/utils"

const config = { host: "localhost", port: 3000 }

// Data-first
const getHost = Struct.getLazy(config, "host")
const host = getHost()
// "localhost"

// Data-last (pipeable)
const getPort = pipe(config, Struct.getLazy("port"))
const port = getPort()
// 3000

console.log(host)
console.log(port)
```

**Signature**

```ts
declare const getLazy: { <S extends object, const K extends keyof S>(key: K): (self: S) => () => S[K]; <S extends object, const K extends keyof S>(self: S, key: K): () => S[K]; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Struct.ts#L377)

Since v0.0.0

## keys

Returns the string keys of an object in a type-safe manner.

Symbol keys are excluded from the result.

**Example**

```ts
import { Struct } from "@beep/utils"

const config = { host: "localhost", port: 3000 }

const result = Struct.keys(config)
// ["host", "port"]

console.log(result)
```

**Signature**

```ts
declare const keys: <const R extends object>(obj: R) => Array<keyof R & string>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Struct.ts#L546)

Since v0.0.0

## keysNonEmpty

Returns the string keys of a non-empty object in a type-safe manner.

Empty struct types are rejected at compile time. A runtime empty value still
fails fast with `EmptyStructError` to protect the invariant.

**Example**

```ts
import { Struct } from "@beep/utils"

const config = { host: "localhost", port: 3000 }

const result = Struct.keysNonEmpty(config)
// ["host", "port"] narrowed to NonEmptyReadonlyArray

console.log(result)
```

**Signature**

```ts
declare const keysNonEmpty: <const R extends object>(obj: R & NonEmptyStringKeyStruct<R>) => A.NonEmptyReadonlyArray<keyof R & string>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Struct.ts#L569)

Since v0.0.0

## pathsOf

Returns all type-level `Paths` of a struct as a `NonEmptyReadonlyArray` of
literal strings.

Recursively walks the object at runtime, collecting every dot-delimited path
that `Paths<S>` would generate at the type level.

**Example**

```ts
import { Struct } from "@beep/utils"

const config = { db: { host: "localhost", port: 5432 }, debug: true }

const paths = Struct.pathsOf(config)
// ["db", "db.host", "db.port", "debug"]

console.log(paths)
```

**Signature**

```ts
declare const pathsOf: <const S extends Record<string, unknown>>(obj: S) => A.NonEmptyReadonlyArray<Extract<Paths<S>, string>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Struct.ts#L410)

Since v0.0.0

# models

## PathLookup (type alias)

Result of a runtime struct path lookup.

**Example**

```ts
import type { PathLookup } from "@beep/utils/Struct"

const isFound = (lookup: PathLookup) => lookup.found
console.log(isFound)
```

**Signature**

```ts
type PathLookup = InternalPathLookup
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Struct.ts#L102)

Since v0.0.0

## ReverseStruct (type alias)

Type-level inversion of a struct where each value becomes a key.

When multiple keys share the same value, the reversed key type is the union
of all matching original keys.

**Example**

```ts
import type { ReverseStruct } from "@beep/utils/Struct"

type Direction = ReverseStruct<{ readonly up: "north"; readonly down: "south" }>
const getNorth = (direction: Direction) => direction.north
console.log(getNorth)
```

**Signature**

```ts
type ReverseStruct<T> = {
  readonly [P in T[keyof T]]: {
    readonly [K in keyof T]: T[K] extends P ? K : never;
  }[keyof T];
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Struct.ts#L670)

Since v0.0.0

## ReverseableStruct (type alias)

Struct shape accepted by `reverse`.

**Example**

```ts
import type { ReverseableStruct } from "@beep/utils/Struct"

const mapping: ReverseableStruct = { active: "A", inactive: "I" }
console.log(mapping)
```

**Signature**

```ts
type ReverseableStruct = Readonly<{
  readonly [key: string]: PropertyKey;
  readonly [key: symbol]: PropertyKey;
}>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Struct.ts#L647)

Since v0.0.0

## StringKeyEntries (type alias)

An array of `[key, value]` pairs for all string keys of `T`, preserving per-key correlation.

Unlike type-fest's `Entries<T>`, this narrows each entry so that the value type
is correlated with its key — `["a", string] | ["b", number]` rather than
`["a" | "b", string | number]`.

**Example**

```ts
import type { StringKeyEntries } from "@beep/utils/Struct"

type Entries = StringKeyEntries<{ readonly host: string; readonly port: number }>
const entries: Entries = [["host", "localhost"], ["port", 3000]]
console.log(entries)
```

**Signature**

```ts
type StringKeyEntries<T> = Array<StringKeyEntry<T>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Struct.ts#L465)

Since v0.0.0

## StringKeyEntry (type alias)

A single `[key, value]` pair for a string key of `T`, preserving per-key correlation.

**Example**

```ts
import type { StringKeyEntry } from "@beep/utils/Struct"

type Entry = StringKeyEntry<{ readonly host: string; readonly port: number }>
const useEntry = (entry: Entry) => entry[0]
console.log(useEntry)
```

**Signature**

```ts
type StringKeyEntry<T> = { [K in keyof T & string]: [K, T[K]] }[keyof T & string]
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Struct.ts#L444)

Since v0.0.0

# utilities

## "effect/Struct" (namespace export)

Re-exports all named exports from the "effect/Struct" module.

**Example**

```ts
import * as Struct from "@beep/utils/Struct"

console.log(Struct)
```

**Signature**

```ts
export * from "effect/Struct"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Struct.ts#L631)

Since v0.0.0