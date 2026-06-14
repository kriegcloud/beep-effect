---
title: SnakeStr.ts
nav_order: 203
parent: "@beep/schema"
---

## SnakeStr.ts overview

A module containing effect schemas for snake_case strings.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [SnakeCaseStr (type alias)](#snakecasestr-type-alias)
- [validation](#validation)
  - [SnakeCaseStr](#snakecasestr)
---

# models

## SnakeCaseStr (type alias)

Type for `SnakeCaseStr`.

**Example**

```ts
import type { SnakeCaseStr } from "@beep/schema"

const key = "workflow_status" as SnakeCaseStr
console.log(key)
```

**Signature**

```ts
type SnakeCaseStr = typeof SnakeCaseStr.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/SnakeStr.ts#L60)

Since v0.0.0

# validation

## SnakeCaseStr

Branded snake_case string schema.

**Example**

```ts
import * as S from "effect/Schema"
import { SnakeCaseStr } from "@beep/schema"

const value = S.decodeUnknownSync(SnakeCaseStr)("workflow_status_2")
console.log(value) // "workflow_status_2"
```

**Signature**

```ts
declare const SnakeCaseStr: AnnotatedSchema<S.brand<S.brand<S.Trim, "NonEmptyTrimmedStr">, "SnakeCaseStr">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/SnakeStr.ts#L28)

Since v0.0.0