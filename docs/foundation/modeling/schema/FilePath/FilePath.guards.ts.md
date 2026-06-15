---
title: FilePath.guards.ts
nav_order: 85
parent: "@beep/schema"
---

## FilePath.guards.ts overview

Internal schema module support.

Since v0.0.0

---
## Exports Grouped by Category
- [guards](#guards)
  - [HasNullByte](#hasnullbyte)
- [models](#models)
  - [EndsWithSeparator (type alias)](#endswithseparator-type-alias)
  - [HasNullByte (type alias)](#hasnullbyte-type-alias)
  - [SupportedWindowsNamespace (type alias)](#supportedwindowsnamespace-type-alias)
  - [UsesPosixSeparator (type alias)](#usesposixseparator-type-alias)
  - [UsesWindowsSeparator (type alias)](#useswindowsseparator-type-alias)
- [validation](#validation)
  - [EndsWithSeparator](#endswithseparator)
  - [SupportedWindowsNamespace](#supportedwindowsnamespace)
  - [UsesPosixSeparator](#usesposixseparator)
  - [UsesWindowsSeparator](#useswindowsseparator)
---

# guards

## HasNullByte

Branded schema for strings that contain an embedded NUL byte.

**Example**

```ts
import * as S from "effect/Schema"
import { HasNullByte } from "@beep/schema/FilePath"

const is = S.is(HasNullByte)

console.log(is("hello\x00world")) // true
console.log(is("hello")) // false
```

**Signature**

```ts
declare const HasNullByte: AnnotatedSchema<S.brand<S.String, "HasNullByte">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/FilePath/FilePath.guards.ts#L29)

Since v0.0.0

# models

## EndsWithSeparator (type alias)

Type for `EndsWithSeparator`.

**Signature**

```ts
type EndsWithSeparator = typeof EndsWithSeparator.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/FilePath/FilePath.guards.ts#L198)

Since v0.0.0

## HasNullByte (type alias)

Branded string type containing an embedded NUL byte.

**Signature**

```ts
type HasNullByte = typeof HasNullByte.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/FilePath/FilePath.guards.ts#L49)

Since v0.0.0

## SupportedWindowsNamespace (type alias)

Type for `SupportedWindowsNamespace`.

**Signature**

```ts
type SupportedWindowsNamespace = typeof SupportedWindowsNamespace.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/FilePath/FilePath.guards.ts#L87)

Since v0.0.0

## UsesPosixSeparator (type alias)

Type for `UsesPosixSeparator`.

**Signature**

```ts
type UsesPosixSeparator = typeof UsesPosixSeparator.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/FilePath/FilePath.guards.ts#L124)

Since v0.0.0

## UsesWindowsSeparator (type alias)

Type for `UsesWindowsSeparator`.

**Signature**

```ts
type UsesWindowsSeparator = typeof UsesWindowsSeparator.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/FilePath/FilePath.guards.ts#L161)

Since v0.0.0

# validation

## EndsWithSeparator

Branded schema for strings that end with a POSIX or Windows path separator.

**Example**

```ts
import { EndsWithSeparator } from "@beep/schema/FilePath"
import * as S from "effect/Schema"

const path = S.decodeUnknownSync(EndsWithSeparator)("src/")
console.log(path)
```

**Signature**

```ts
declare const EndsWithSeparator: AnnotatedSchema<S.brand<S.String, "EndsWithSeparator">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/FilePath/FilePath.guards.ts#L178)

Since v0.0.0

## SupportedWindowsNamespace

Branded schema for path strings that do not use unsupported Windows device
namespace prefixes.

**Example**

```ts
import { SupportedWindowsNamespace } from "@beep/schema/FilePath"
import * as S from "effect/Schema"

const path = S.decodeUnknownSync(SupportedWindowsNamespace)("C:\\Users\\Ada")
console.log(path)
```

**Signature**

```ts
declare const SupportedWindowsNamespace: AnnotatedSchema<S.brand<S.NonEmptyString, "SupportedWindowsNamespace">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/FilePath/FilePath.guards.ts#L67)

Since v0.0.0

## UsesPosixSeparator

Branded schema for strings that contain a POSIX separator.

**Example**

```ts
import { UsesPosixSeparator } from "@beep/schema/FilePath"
import * as S from "effect/Schema"

const path = S.decodeUnknownSync(UsesPosixSeparator)("src/index.ts")
console.log(path)
```

**Signature**

```ts
declare const UsesPosixSeparator: AnnotatedSchema<S.brand<S.String, "UsesPosixSeparator">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/FilePath/FilePath.guards.ts#L104)

Since v0.0.0

## UsesWindowsSeparator

Branded schema for strings that contain a Windows separator.

**Example**

```ts
import { UsesWindowsSeparator } from "@beep/schema/FilePath"
import * as S from "effect/Schema"

const path = S.decodeUnknownSync(UsesWindowsSeparator)("C:\\Users\\Ada")
console.log(path)
```

**Signature**

```ts
declare const UsesWindowsSeparator: AnnotatedSchema<S.brand<S.String, "UsesWindowsSeparator">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/FilePath/FilePath.guards.ts#L141)

Since v0.0.0