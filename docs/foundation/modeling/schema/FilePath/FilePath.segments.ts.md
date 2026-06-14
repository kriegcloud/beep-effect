---
title: FilePath.segments.ts
nav_order: 88
parent: "@beep/schema"
---

## FilePath.segments.ts overview

Internal schema module support.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [ValidWindowsPathSegment (type alias)](#validwindowspathsegment-type-alias)
  - [ValidWindowsPlainPathSegment (type alias)](#validwindowsplainpathsegment-type-alias)
  - [ValidWindowsRootSegment (type alias)](#validwindowsrootsegment-type-alias)
  - [ValidWindowsUncRest (type alias)](#validwindowsuncrest-type-alias)
  - [ValidWindowsUncSegments (type alias)](#validwindowsuncsegments-type-alias)
  - [WindowsDotSegment (type alias)](#windowsdotsegment-type-alias)
  - [WindowsSegments (type alias)](#windowssegments-type-alias)
- [validation](#validation)
  - [ValidWindowsPathSegment](#validwindowspathsegment)
  - [ValidWindowsPlainPathSegment](#validwindowsplainpathsegment)
  - [ValidWindowsRootSegment](#validwindowsrootsegment)
  - [ValidWindowsUncRest](#validwindowsuncrest)
  - [ValidWindowsUncSegments](#validwindowsuncsegments)
  - [WindowsDotSegment](#windowsdotsegment)
  - [WindowsSegments](#windowssegments)
---

# models

## ValidWindowsPathSegment (type alias)

Type for `ValidWindowsPathSegment`.

**Signature**

```ts
type ValidWindowsPathSegment = typeof ValidWindowsPathSegment.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/FilePath/FilePath.segments.ts#L175)

Since v0.0.0

## ValidWindowsPlainPathSegment (type alias)

Type for `ValidWindowsPlainPathSegment`.

**Signature**

```ts
type ValidWindowsPlainPathSegment = typeof ValidWindowsPlainPathSegment.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/FilePath/FilePath.segments.ts#L105)

Since v0.0.0

## ValidWindowsRootSegment (type alias)

Type for `ValidWindowsRootSegment`.

**Signature**

```ts
type ValidWindowsRootSegment = typeof ValidWindowsRootSegment.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/FilePath/FilePath.segments.ts#L144)

Since v0.0.0

## ValidWindowsUncRest (type alias)

Type for `ValidWindowsUncRest`.

**Signature**

```ts
type ValidWindowsUncRest = typeof ValidWindowsUncRest.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/FilePath/FilePath.segments.ts#L236)

Since v0.0.0

## ValidWindowsUncSegments (type alias)

Type for `ValidWindowsUncSegments`.

**Signature**

```ts
type ValidWindowsUncSegments = typeof ValidWindowsUncSegments.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/FilePath/FilePath.segments.ts#L269)

Since v0.0.0

## WindowsDotSegment (type alias)

Type for `WindowsDotSegment`.

**Signature**

```ts
type WindowsDotSegment = typeof WindowsDotSegment.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/FilePath/FilePath.segments.ts#L46)

Since v0.0.0

## WindowsSegments (type alias)

Type for `WindowsSegments`.

**Signature**

```ts
type WindowsSegments = typeof WindowsSegments.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/FilePath/FilePath.segments.ts#L205)

Since v0.0.0

# validation

## ValidWindowsPathSegment

Branded schema for Windows path segments that may be either plain segments or
dot-segment markers.

**Example**

```ts
import { ValidWindowsPathSegment } from "@beep/schema/FilePath"
import * as S from "effect/Schema"

const segment = S.decodeUnknownSync(ValidWindowsPathSegment)(".")
console.log(segment)
```

**Signature**

```ts
declare const ValidWindowsPathSegment: AnnotatedSchema<S.brand<S.Union<readonly [AnnotatedSchema<LiteralKit<readonly [".", ".."], undefined>>, AnnotatedSchema<S.brand<S.NonEmptyString, "ValidWindowsPlainPathSegment">>]>, "ValidWindowsPathSegment">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/FilePath/FilePath.segments.ts#L162)

Since v0.0.0

## ValidWindowsPlainPathSegment

Branded schema for Windows path segments that are plain names rather than
separators or dot-segment markers.

**Example**

```ts
import { ValidWindowsPlainPathSegment } from "@beep/schema/FilePath"
import * as S from "effect/Schema"

const segment = S.decodeUnknownSync(ValidWindowsPlainPathSegment)("documents")
console.log(segment)
```

**Signature**

```ts
declare const ValidWindowsPlainPathSegment: AnnotatedSchema<S.brand<S.NonEmptyString, "ValidWindowsPlainPathSegment">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/FilePath/FilePath.segments.ts#L64)

Since v0.0.0

## ValidWindowsRootSegment

Branded schema for Windows root segments such as UNC server and share names.

**Example**

```ts
import { ValidWindowsRootSegment } from "@beep/schema/FilePath"
import * as S from "effect/Schema"

const server = S.decodeUnknownSync(ValidWindowsRootSegment)("fileserver")
console.log(server)
```

**Signature**

```ts
declare const ValidWindowsRootSegment: AnnotatedSchema<S.brand<S.brand<S.NonEmptyString, "ValidWindowsPlainPathSegment">, "ValidWindowsRootSegment">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/FilePath/FilePath.segments.ts#L124)

Since v0.0.0

## ValidWindowsUncRest

Branded schema for the tail segment list of a UNC file path after the server
and share segments.

**Example**

```ts
import { ValidWindowsUncRest } from "@beep/schema/FilePath"
import * as S from "effect/Schema"

const rest = S.decodeUnknownSync(ValidWindowsUncRest)(["folder", "file.txt"])
console.log(rest.length)
```

**Signature**

```ts
declare const ValidWindowsUncRest: AnnotatedSchema<S.brand<S.NonEmptyArray<AnnotatedSchema<S.brand<S.Union<readonly [AnnotatedSchema<LiteralKit<readonly [".", ".."], undefined>>, AnnotatedSchema<S.brand<S.NonEmptyString, "ValidWindowsPlainPathSegment">>]>, "ValidWindowsPathSegment">>>, "ValidWindowsUncRest">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/FilePath/FilePath.segments.ts#L223)

Since v0.0.0

## ValidWindowsUncSegments

Branded schema for a full UNC segment list `[server, share, ...rest]`.

**Example**

```ts
import { ValidWindowsUncSegments } from "@beep/schema/FilePath"
import * as S from "effect/Schema"

const segments = S.decodeUnknownSync(ValidWindowsUncSegments)(["server", "share", "folder"])
console.log(segments[0])
```

**Signature**

```ts
declare const ValidWindowsUncSegments: AnnotatedSchema<S.brand<S.TupleWithRest<S.Tuple<readonly [AnnotatedSchema<S.brand<S.brand<S.NonEmptyString, "ValidWindowsPlainPathSegment">, "ValidWindowsRootSegment">>, AnnotatedSchema<S.brand<S.brand<S.NonEmptyString, "ValidWindowsPlainPathSegment">, "ValidWindowsRootSegment">>, AnnotatedSchema<S.brand<S.Union<readonly [AnnotatedSchema<LiteralKit<readonly [".", ".."], undefined>>, AnnotatedSchema<S.brand<S.NonEmptyString, "ValidWindowsPlainPathSegment">>]>, "ValidWindowsPathSegment">>]>, readonly [AnnotatedSchema<S.brand<S.Union<readonly [AnnotatedSchema<LiteralKit<readonly [".", ".."], undefined>>, AnnotatedSchema<S.brand<S.NonEmptyString, "ValidWindowsPlainPathSegment">>]>, "ValidWindowsPathSegment">>]>, "ValidWindowsUncSegments">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/FilePath/FilePath.segments.ts#L253)

Since v0.0.0

## WindowsDotSegment

Literal union for Windows dot-segment markers.

**Example**

```ts
import { WindowsDotSegment } from "@beep/schema/FilePath"
import * as S from "effect/Schema"

const parent = S.decodeUnknownSync(WindowsDotSegment)("..")
console.log(parent)
```

**Signature**

```ts
declare const WindowsDotSegment: AnnotatedSchema<LiteralKit<readonly [".", ".."], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/FilePath/FilePath.segments.ts#L34)

Since v0.0.0

## WindowsSegments

Branded schema for a non-empty Windows path segment list.

**Example**

```ts
import { WindowsSegments } from "@beep/schema/FilePath"
import * as S from "effect/Schema"

const segments = S.decodeUnknownSync(WindowsSegments)(["Users", "Ada"])
console.log(segments.length)
```

**Signature**

```ts
declare const WindowsSegments: AnnotatedSchema<S.brand<S.NonEmptyArray<AnnotatedSchema<S.brand<S.Union<readonly [AnnotatedSchema<LiteralKit<readonly [".", ".."], undefined>>, AnnotatedSchema<S.brand<S.NonEmptyString, "ValidWindowsPlainPathSegment">>]>, "ValidWindowsPathSegment">>>, "WindowsSegments">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/FilePath/FilePath.segments.ts#L192)

Since v0.0.0