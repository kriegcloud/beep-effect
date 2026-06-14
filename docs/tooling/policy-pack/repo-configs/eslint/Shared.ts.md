---
title: Shared.ts
nav_order: 6
parent: "@beep/repo-configs"
---

## Shared.ts overview

Shared ESLint helper schemas and path utilities.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [PosixPath (type alias)](#posixpath-type-alias)
- [utilities](#utilities)
  - [normalizePath](#normalizepath)
- [validation](#validation)
  - [PosixPath](#posixpath)
---

# models

## PosixPath (type alias)

Type for `PosixPath`.

**Example**

```ts
import type { PosixPath } from "@beep/repo-configs/eslint/Shared"
type ExamplePath = PosixPath
```

**Signature**

```ts
type PosixPath = typeof PosixPath.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/eslint/Shared.ts#L34)

Since v0.0.0

# utilities

## normalizePath

Normalize a file-system path to POSIX separators.

**Example**

```ts
import { normalizePath } from "@beep/repo-configs/eslint/Shared"
const path = normalizePath("packages/tooling/policy-pack/repo-configs/src/index.ts")
console.log(path)
```

**Signature**

```ts
declare const normalizePath: (value: string) => PosixPath
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/eslint/Shared.ts#L50)

Since v0.0.0

# validation

## PosixPath

POSIX-normalized path string schema re-exported for tooling config consumers.

**Example**

```ts
import { PosixPath } from "@beep/repo-configs/eslint/Shared"
console.log(PosixPath)
```

**Signature**

```ts
declare const PosixPath: AnnotatedSchema<brand<String, "PosixPath">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/eslint/Shared.ts#L21)

Since v0.0.0