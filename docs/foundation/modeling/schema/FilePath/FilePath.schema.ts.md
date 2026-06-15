---
title: FilePath.schema.ts
nav_order: 87
parent: "@beep/schema"
---

## FilePath.schema.ts overview

Internal schema module support.

Since v0.0.0

---
## Exports Grouped by Category
- [constructors](#constructors)
  - [FilePath](#filepath)
- [models](#models)
  - [FilePath (type alias)](#filepath-type-alias)
  - [SupportedPathFamily (type alias)](#supportedpathfamily-type-alias)
- [validation](#validation)
  - [SupportedPathFamily](#supportedpathfamily)
---

# constructors

## FilePath

Branded schema for file path strings that are valid on at least one major OS.

Validates POSIX absolute, POSIX relative, Windows drive, Windows UNC, and
Windows relative path families. Rejects empty strings, embedded NUL bytes,
bare root paths, and unsupported Windows namespace prefixes.

**Example**

```ts
import * as S from "effect/Schema"
import { FilePath } from "@beep/schema/FilePath"

const decode = S.decodeUnknownSync(FilePath)

const posix = decode("/usr/local/bin/node")
const relative = decode("src/index.ts")
```

**Example**

```ts
import * as S from "effect/Schema"
import { FilePath } from "@beep/schema/FilePath"

const is = S.is(FilePath)

console.log(is("/")) // false -- bare root
console.log(is("src/index.ts")) // true
```

**Signature**

```ts
declare const FilePath: AnnotatedSchema<S.brand<S.String, "FilePath">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/FilePath/FilePath.schema.ts#L146)

Since v0.0.0

# models

## FilePath (type alias)

Branded file path string type extracted from `FilePath`.

**Signature**

```ts
type FilePath = typeof FilePath.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/FilePath/FilePath.schema.ts#L159)

Since v0.0.0

## SupportedPathFamily (type alias)

Type for `SupportedPathFamily`.

**Signature**

```ts
type SupportedPathFamily = typeof SupportedPathFamily.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/FilePath/FilePath.schema.ts#L50)

Since v0.0.0

# validation

## SupportedPathFamily

Literal union of file-path families recognized by `FilePath`.

**Example**

```ts
import { SupportedPathFamily } from "@beep/schema/FilePath"

console.log(SupportedPathFamily.Options)
```

**Signature**

```ts
declare const SupportedPathFamily: AnnotatedSchema<LiteralKit<readonly ["posixAbsolute", "posixRelative", "windowsDrive", "windowsUnc", "windowsRelative"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/FilePath/FilePath.schema.ts#L38)

Since v0.0.0