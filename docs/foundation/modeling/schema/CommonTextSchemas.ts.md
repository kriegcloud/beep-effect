---
title: CommonTextSchemas.ts
nav_order: 21
parent: "@beep/schema"
---

## CommonTextSchemas.ts overview

Shared text-normalization schemas.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [CommaSeparatedList (type alias)](#commaseparatedlist-type-alias)
  - [NormalizedBooleanString (type alias)](#normalizedbooleanstring-type-alias)
  - [TrimmedNonEmptyText (type alias)](#trimmednonemptytext-type-alias)
- [validation](#validation)
  - [CommaSeparatedList](#commaseparatedlist)
  - [NormalizedBooleanString](#normalizedbooleanstring)
  - [TrimmedNonEmptyText](#trimmednonemptytext)
---

# models

## CommaSeparatedList (type alias)

Type for `CommaSeparatedList`.

**Example**

```ts
import type { CommaSeparatedList } from "@beep/schema/CommonTextSchemas"

const tags: CommaSeparatedList = ["a", "b"] as CommaSeparatedList
```

**Signature**

```ts
type CommaSeparatedList = typeof CommaSeparatedList.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CommonTextSchemas.ts#L105)

Since v0.0.0

## NormalizedBooleanString (type alias)

Type for `NormalizedBooleanString`.

**Example**

```ts
import type { NormalizedBooleanString } from "@beep/schema/CommonTextSchemas"

const flag: NormalizedBooleanString = true
```

**Signature**

```ts
type NormalizedBooleanString = typeof NormalizedBooleanString.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CommonTextSchemas.ts#L148)

Since v0.0.0

## TrimmedNonEmptyText (type alias)

Type for `TrimmedNonEmptyText`.

**Example**

```ts
import type { TrimmedNonEmptyText } from "@beep/schema/CommonTextSchemas"

const name: TrimmedNonEmptyText = "hello" as TrimmedNonEmptyText
```

**Signature**

```ts
type TrimmedNonEmptyText = typeof TrimmedNonEmptyText.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CommonTextSchemas.ts#L62)

Since v0.0.0

# validation

## CommaSeparatedList

Schema that decodes a comma-separated string into a trimmed non-empty string array.

**Example**

```ts
import * as S from "effect/Schema"
import { CommaSeparatedList } from "@beep/schema/CommonTextSchemas"

const items = S.decodeUnknownSync(CommaSeparatedList)("foo, bar, baz")
console.log(items) // ["foo", "bar", "baz"]
```

**Signature**

```ts
declare const CommaSeparatedList: AnnotatedSchema<S.decodeTo<S.$Array<AnnotatedSchema<S.decodeTo<S.NonEmptyString, S.String, never, never>>>, S.String, never, never>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CommonTextSchemas.ts#L79)

Since v0.0.0

## NormalizedBooleanString

Schema that normalizes common boolean string spellings (`"true"`, `"1"`, `"yes"`, `"on"`, etc.) to `boolean`.

**Example**

```ts
import * as S from "effect/Schema"
import { NormalizedBooleanString } from "@beep/schema/CommonTextSchemas"

console.log(S.decodeUnknownSync(NormalizedBooleanString)("yes")) // true
console.log(S.decodeUnknownSync(NormalizedBooleanString)("0")) // false
```

**Signature**

```ts
declare const NormalizedBooleanString: AnnotatedSchema<S.decodeTo<S.Boolean, S.String, never, never>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CommonTextSchemas.ts#L122)

Since v0.0.0

## TrimmedNonEmptyText

Trimmed and non-empty text schema that strips whitespace and rejects empty results.

**Example**

```ts
import * as S from "effect/Schema"
import { TrimmedNonEmptyText } from "@beep/schema/CommonTextSchemas"

const value = S.decodeUnknownSync(TrimmedNonEmptyText)("  hello  ")
console.log(value) // "hello"
```

**Signature**

```ts
declare const TrimmedNonEmptyText: AnnotatedSchema<S.decodeTo<S.NonEmptyString, S.String, never, never>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CommonTextSchemas.ts#L36)

Since v0.0.0