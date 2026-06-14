---
title: TString.types.ts
nav_order: 3
parent: "@beep/types"
---

## TString.types.ts overview

Matches any non-empty string at the type level.

Returns `never` when instantiated with an empty string or when an empty string
is a subtype of the instantiated type (e.g. `string`, `Uppercase<string>`).

**Example**

```ts
```typescript
import type { TString } from "@beep/types"

type Hello = TString.NonEmpty<"hello">
// "hello"

type Empty = TString.NonEmpty<"">
// never

type NonEmptyExamples = readonly [Hello, Empty]
```
```

Since v0.0.0

---
## Exports Grouped by Category
- [NonEmpty (type alias)](#nonempty-type-alias)
---

# utilities

## Chars (type alias)

Splits a string literal type into a union of its individual characters.

**Example**

```ts
```typescript
import type { TString } from "@beep/types"

type ABC = TString.Chars<"abc">
// "a" | "b" | "c"

type Digits = TString.Chars<"0123456789">
// "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"

type CharsExamples = readonly [ABC, Digits]
```
```

**Signature**

```ts
type Chars<S> = S extends `${infer C}${infer Rest}` ? C | Chars<Rest> : never
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/primitive/types/src/TString.types.ts#L51)

Since v0.0.0

## NonEmpty (type alias)

Matches any non-empty string at the type level.

Returns `never` when instantiated with an empty string or when an empty string
is a subtype of the instantiated type (e.g. `string`, `Uppercase<string>`).

**Example**

```ts
```typescript
import type { TString } from "@beep/types"

type Hello = TString.NonEmpty<"hello">
// "hello"

type Empty = TString.NonEmpty<"">
// never

type NonEmptyExamples = readonly [Hello, Empty]
```
```

**Signature**

```ts
type NonEmpty<T> = T extends "" ? never : T
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/primitive/types/src/TString.types.ts#L30)

Since v0.0.0