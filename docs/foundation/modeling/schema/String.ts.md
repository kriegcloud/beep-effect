---
title: String.ts
nav_order: 207
parent: "@beep/schema"
---

## String.ts overview

Shared string normalization schemas.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [NonEmptyTrimmedStr (type alias)](#nonemptytrimmedstr-type-alias)
  - [NullableStr (type alias)](#nullablestr-type-alias)
  - [OptionFromNullableStr (type alias)](#optionfromnullablestr-type-alias)
  - [UUID (type alias)](#uuid-type-alias)
- [validation](#validation)
  - [NonEmptyTrimmedStr](#nonemptytrimmedstr)
  - [NullableStr](#nullablestr)
  - [OptionFromNullableStr](#optionfromnullablestr)
  - [UUID](#uuid)
---

# models

## NonEmptyTrimmedStr (type alias)

Type for `NonEmptyTrimmedStr`.

**Example**

```ts
import type { NonEmptyTrimmedStr } from "@beep/schema/String"

const label: NonEmptyTrimmedStr = "hello" as NonEmptyTrimmedStr
```

**Signature**

```ts
type NonEmptyTrimmedStr = typeof NonEmptyTrimmedStr.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/String.ts#L49)

Since v0.0.0

## NullableStr (type alias)

Type for `NullableStr`.

**Example**

```ts
import type { NullableStr } from "@beep/schema/String"

const name: NullableStr = null
```

**Signature**

```ts
type NullableStr = typeof NullableStr.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/String.ts#L124)

Since v0.0.0

## OptionFromNullableStr (type alias)

Type for `OptionFromNullableStr`.

**Signature**

```ts
type OptionFromNullableStr = typeof OptionFromNullableStr.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/String.ts#L154)

Since v0.0.0

## UUID (type alias)

Type for `UUID`.

**Example**

```ts
import type { UUID } from "@beep/schema/String"

const userId: UUID = "550e8400-e29b-41d4-a716-446655440000" as UUID
```

**Signature**

```ts
type UUID = typeof UUID.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/String.ts#L87)

Since v0.0.0

# validation

## NonEmptyTrimmedStr

Branded non-empty trimmed string schema that strips whitespace and rejects empty results.

**Example**

```ts
import * as S from "effect/Schema"
import { NonEmptyTrimmedStr } from "@beep/schema/String"

const value = S.decodeUnknownSync(NonEmptyTrimmedStr)("  hello  ")
console.log(value) // "hello"
```

**Signature**

```ts
declare const NonEmptyTrimmedStr: AnnotatedSchema<S.brand<S.Trim, "NonEmptyTrimmedStr">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/String.ts#L28)

Since v0.0.0

## NullableStr

A nullable string schema that accepts `string | null`.

**Example**

```ts
import * as S from "effect/Schema"
import { NullableStr } from "@beep/schema/String"

S.decodeUnknownSync(NullableStr)("hello")
S.decodeUnknownSync(NullableStr)(null)
```

**Signature**

```ts
declare const NullableStr: AnnotatedSchema<S.NullOr<S.String>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/String.ts#L104)

Since v0.0.0

## OptionFromNullableStr

A nullable string that decodes to `Option<string>` using `S.OptionFromNullOr`.

**Example**

```ts
import * as S from "effect/Schema"
import { OptionFromNullableStr } from "@beep/schema/String"

const result = S.decodeUnknownSync(OptionFromNullableStr)(null)
console.log(result) // Option.none()
```

**Signature**

```ts
declare const OptionFromNullableStr: AnnotatedSchema<S.OptionFromNullOr<S.String>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/String.ts#L141)

Since v0.0.0

## UUID

Branded UUID string schema that validates RFC 4122 format.

**Example**

```ts
import * as S from "effect/Schema"
import { UUID } from "@beep/schema/String"

const id = S.decodeUnknownSync(UUID)("550e8400-e29b-41d4-a716-446655440000")
console.log(id)
```

**Signature**

```ts
declare const UUID: AnnotatedSchema<S.brand<S.brand<S.Trim, "NonEmptyTrimmedStr">, "UUID">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/String.ts#L66)

Since v0.0.0