---
title: ArrayOf.ts
nav_order: 4
parent: "@beep/schema"
---

## ArrayOf.ts overview

Reusable schema constructors for array-like data.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [ArrayOfInts (type alias)](#arrayofints-type-alias)
  - [ArrayOfNonEmptyStrings (type alias)](#arrayofnonemptystrings-type-alias)
  - [ArrayOfNumbers (type alias)](#arrayofnumbers-type-alias)
  - [ArrayOfStrings (type alias)](#arrayofstrings-type-alias)
  - [NonEmptyArrayOfInts (type alias)](#nonemptyarrayofints-type-alias)
  - [NonEmptyArrayOfNonEmptyStrings (type alias)](#nonemptyarrayofnonemptystrings-type-alias)
  - [NonEmptyArrayOfNumbers (type alias)](#nonemptyarrayofnumbers-type-alias)
  - [NonEmptyArrayOfStrings (type alias)](#nonemptyarrayofstrings-type-alias)
- [validation](#validation)
  - [ArrayOfInts](#arrayofints)
  - [ArrayOfNonEmptyStrings](#arrayofnonemptystrings)
  - [ArrayOfNumbers](#arrayofnumbers)
  - [ArrayOfStrings](#arrayofstrings)
  - [NonEmptyArrayOfInts](#nonemptyarrayofints)
  - [NonEmptyArrayOfNonEmptyStrings](#nonemptyarrayofnonemptystrings)
  - [NonEmptyArrayOfNumbers](#nonemptyarrayofnumbers)
  - [NonEmptyArrayOfStrings](#nonemptyarrayofstrings)
---

# models

## ArrayOfInts (type alias)

Type for `ArrayOfInts`.

**Signature**

```ts
type ArrayOfInts = S.Schema.Type<typeof ArrayOfInts>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/ArrayOf.ts#L214)

Since v0.0.0

## ArrayOfNonEmptyStrings (type alias)

Type for `ArrayOfNonEmptyStrings`.

**Signature**

```ts
type ArrayOfNonEmptyStrings = S.Schema.Type<typeof ArrayOfNonEmptyStrings>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/ArrayOf.ts#L98)

Since v0.0.0

## ArrayOfNumbers (type alias)

Type for `ArrayOfNumbers`.

**Signature**

```ts
type ArrayOfNumbers = S.Schema.Type<typeof ArrayOfNumbers>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/ArrayOf.ts#L156)

Since v0.0.0

## ArrayOfStrings (type alias)

Type for `ArrayOfStrings`.

**Signature**

```ts
type ArrayOfStrings = S.Schema.Type<typeof ArrayOfStrings>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/ArrayOf.ts#L40)

Since v0.0.0

## NonEmptyArrayOfInts (type alias)

Type for `NonEmptyArrayOfInts`.

**Signature**

```ts
type NonEmptyArrayOfInts = S.Schema.Type<typeof NonEmptyArrayOfInts>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/ArrayOf.ts#L243)

Since v0.0.0

## NonEmptyArrayOfNonEmptyStrings (type alias)

Type for `NonEmptyArrayOfNonEmptyStrings`.

**Signature**

```ts
type NonEmptyArrayOfNonEmptyStrings = S.Schema.Type<typeof NonEmptyArrayOfNonEmptyStrings>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/ArrayOf.ts#L127)

Since v0.0.0

## NonEmptyArrayOfNumbers (type alias)

Type for `NonEmptyArrayOfNumbers`.

**Signature**

```ts
type NonEmptyArrayOfNumbers = S.Schema.Type<typeof NonEmptyArrayOfNumbers>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/ArrayOf.ts#L185)

Since v0.0.0

## NonEmptyArrayOfStrings (type alias)

Type for `NonEmptyArrayOfStrings`.

**Signature**

```ts
type NonEmptyArrayOfStrings = S.Schema.Type<typeof NonEmptyArrayOfStrings>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/ArrayOf.ts#L69)

Since v0.0.0

# validation

## ArrayOfInts

Schema for arrays of integers.

**Example**

```ts
import * as S from "effect/Schema"
import { ArrayOfInts } from "@beep/schema/ArrayOf"

const decoded = S.decodeUnknownSync(ArrayOfInts)([1, 2, 3])
console.log(decoded)
```

**Signature**

```ts
declare const ArrayOfInts: AnnotatedSchema<S.$Array<S.Int>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/ArrayOf.ts#L202)

Since v0.0.0

## ArrayOfNonEmptyStrings

Schema for arrays of `NonEmptyString` values.

**Example**

```ts
import * as S from "effect/Schema"
import { ArrayOfNonEmptyStrings } from "@beep/schema/ArrayOf"

const decoded = S.decodeUnknownSync(ArrayOfNonEmptyStrings)(["hello", "world"])
console.log(decoded)
```

**Signature**

```ts
declare const ArrayOfNonEmptyStrings: AnnotatedSchema<S.$Array<S.NonEmptyString>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/ArrayOf.ts#L86)

Since v0.0.0

## ArrayOfNumbers

Schema for arrays of numbers.

**Example**

```ts
import * as S from "effect/Schema"
import { ArrayOfNumbers } from "@beep/schema/ArrayOf"

const decoded = S.decodeUnknownSync(ArrayOfNumbers)([1, 2, 3])
console.log(decoded)
```

**Signature**

```ts
declare const ArrayOfNumbers: AnnotatedSchema<S.$Array<S.Finite>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/ArrayOf.ts#L144)

Since v0.0.0

## ArrayOfStrings

Schema for `ReadonlyArray<string>`.

**Example**

```ts
import * as S from "effect/Schema"
import { ArrayOfStrings } from "@beep/schema/ArrayOf"

const decoded = S.decodeUnknownSync(ArrayOfStrings)(["a", "b", "c"])
console.log(decoded)
```

**Signature**

```ts
declare const ArrayOfStrings: AnnotatedSchema<S.$Array<S.String>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/ArrayOf.ts#L28)

Since v0.0.0

## NonEmptyArrayOfInts

Schema for non-empty arrays of integers.

**Example**

```ts
import * as S from "effect/Schema"
import { NonEmptyArrayOfInts } from "@beep/schema/ArrayOf"

const decoded = S.decodeUnknownSync(NonEmptyArrayOfInts)([1])
console.log(decoded)
```

**Signature**

```ts
declare const NonEmptyArrayOfInts: AnnotatedSchema<S.NonEmptyArray<S.Int>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/ArrayOf.ts#L231)

Since v0.0.0

## NonEmptyArrayOfNonEmptyStrings

Schema for non-empty arrays of `NonEmptyString` values.

**Example**

```ts
import * as S from "effect/Schema"
import { NonEmptyArrayOfNonEmptyStrings } from "@beep/schema/ArrayOf"

const decoded = S.decodeUnknownSync(NonEmptyArrayOfNonEmptyStrings)(["hello"])
console.log(decoded)
```

**Signature**

```ts
declare const NonEmptyArrayOfNonEmptyStrings: AnnotatedSchema<S.NonEmptyArray<S.NonEmptyString>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/ArrayOf.ts#L115)

Since v0.0.0

## NonEmptyArrayOfNumbers

Schema for non-empty arrays of numbers.

**Example**

```ts
import * as S from "effect/Schema"
import { NonEmptyArrayOfNumbers } from "@beep/schema/ArrayOf"

const decoded = S.decodeUnknownSync(NonEmptyArrayOfNumbers)([42])
console.log(decoded)
```

**Signature**

```ts
declare const NonEmptyArrayOfNumbers: AnnotatedSchema<S.NonEmptyArray<S.Finite>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/ArrayOf.ts#L173)

Since v0.0.0

## NonEmptyArrayOfStrings

Schema for non-empty arrays of strings.

**Example**

```ts
import * as S from "effect/Schema"
import { NonEmptyArrayOfStrings } from "@beep/schema/ArrayOf"

const decoded = S.decodeUnknownSync(NonEmptyArrayOfStrings)(["hello"])
console.log(decoded)
```

**Signature**

```ts
declare const NonEmptyArrayOfStrings: AnnotatedSchema<S.NonEmptyArray<S.String>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/ArrayOf.ts#L57)

Since v0.0.0