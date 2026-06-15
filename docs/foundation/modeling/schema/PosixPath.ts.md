---
title: PosixPath.ts
nav_order: 174
parent: "@beep/schema"
---

## PosixPath.ts overview

Shared schema helpers for POSIX-normalized path strings.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [PosixPath (type alias)](#posixpath-type-alias)
- [utilities](#utilities)
  - [normalizePath](#normalizepath)
- [validation](#validation)
  - [NativePathToPosixPath](#nativepathtoposixpath)
  - [PosixPath](#posixpath)
---

# models

## PosixPath (type alias)

Type for `PosixPath`.

**Example**

```ts
import type { PosixPath } from "@beep/schema/PosixPath"

const dir: PosixPath = "/home/user" as PosixPath
```

**Signature**

```ts
type PosixPath = typeof PosixPath.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/PosixPath.ts#L51)

Since v0.0.0

# utilities

## normalizePath

Normalize a file-system path string to POSIX separators.

**Example**

```ts
import { normalizePath } from "@beep/schema/PosixPath"

const p = normalizePath("src\\lib\\index.ts")
console.log(p) // "src/lib/index.ts"
```

**Signature**

```ts
declare const normalizePath: (value: string) => PosixPath
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/PosixPath.ts#L101)

Since v0.0.0

# validation

## NativePathToPosixPath

Schema transformation that converts native file-system paths (with backslashes) to POSIX separators.

**Example**

```ts
import * as S from "effect/Schema"
import { NativePathToPosixPath } from "@beep/schema/PosixPath"

const p = S.decodeUnknownSync(NativePathToPosixPath)("C:\\Users\\docs")
console.log(p) // "C:/Users/docs"
```

**Signature**

```ts
declare const NativePathToPosixPath: AnnotatedSchema<S.decodeTo<AnnotatedSchema<S.brand<S.String, "PosixPath">>, S.String, never, never>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/PosixPath.ts#L68)

Since v0.0.0

## PosixPath

Branded schema for path strings using only POSIX `/` separators.

**Example**

```ts
import * as S from "effect/Schema"
import { PosixPath } from "@beep/schema/PosixPath"

const p = S.decodeUnknownSync(PosixPath)("/usr/local/bin")
console.log(p) // "/usr/local/bin"
```

**Signature**

```ts
declare const PosixPath: AnnotatedSchema<S.brand<S.String, "PosixPath">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/PosixPath.ts#L31)

Since v0.0.0