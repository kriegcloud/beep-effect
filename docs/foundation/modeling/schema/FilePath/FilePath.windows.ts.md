---
title: FilePath.windows.ts
nav_order: 90
parent: "@beep/schema"
---

## FilePath.windows.ts overview

Internal schema module support.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [WindowsDrivePath (type alias)](#windowsdrivepath-type-alias)
  - [WindowsRelativePath (type alias)](#windowsrelativepath-type-alias)
  - [WindowsUncPath (type alias)](#windowsuncpath-type-alias)
- [validation](#validation)
  - [WindowsDrivePath](#windowsdrivepath)
  - [WindowsRelativePath](#windowsrelativepath)
  - [WindowsUncPath](#windowsuncpath)
---

# models

## WindowsDrivePath (type alias)

Type for `WindowsDrivePath`.

**Signature**

```ts
type WindowsDrivePath = typeof WindowsDrivePath.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/FilePath/FilePath.windows.ts#L91)

Since v0.0.0

## WindowsRelativePath (type alias)

Type for `WindowsRelativePath`.

**Signature**

```ts
type WindowsRelativePath = typeof WindowsRelativePath.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/FilePath/FilePath.windows.ts#L245)

Since v0.0.0

## WindowsUncPath (type alias)

Type for `WindowsUncPath`.

**Signature**

```ts
type WindowsUncPath = typeof WindowsUncPath.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/FilePath/FilePath.windows.ts#L162)

Since v0.0.0

# validation

## WindowsDrivePath

Branded schema for Windows drive paths with a leaf segment.

**Example**

```ts
import { WindowsDrivePath } from "@beep/schema/FilePath"
import * as S from "effect/Schema"

const path = S.decodeUnknownSync(WindowsDrivePath)("C:\\Users\\Ada")
console.log(path)
```

**Signature**

```ts
declare const WindowsDrivePath: AnnotatedSchema<S.brand<S.NonEmptyString, "WindowsDrivePath">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/FilePath/FilePath.windows.ts#L44)

Since v0.0.0

## WindowsRelativePath

Branded schema for Windows relative paths that use backslash separators and
include a leaf segment.

**Example**

```ts
import { WindowsRelativePath } from "@beep/schema/FilePath"
import * as S from "effect/Schema"

const path = S.decodeUnknownSync(WindowsRelativePath)("Users\\Ada")
console.log(path)
```

**Signature**

```ts
declare const WindowsRelativePath: AnnotatedSchema<S.brand<S.NonEmptyString, "WindowsRelativePath">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/FilePath/FilePath.windows.ts#L180)

Since v0.0.0

## WindowsUncPath

Branded schema for Windows UNC file paths with server, share, and leaf
segments.

**Example**

```ts
import { WindowsUncPath } from "@beep/schema/FilePath"
import * as S from "effect/Schema"

const path = S.decodeUnknownSync(WindowsUncPath)("\\\\server\\share\\folder")
console.log(path)
```

**Signature**

```ts
declare const WindowsUncPath: AnnotatedSchema<S.brand<S.NonEmptyString, "WindowsUncPath">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/FilePath/FilePath.windows.ts#L109)

Since v0.0.0