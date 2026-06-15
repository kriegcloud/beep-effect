---
title: PascalStr.ts
nav_order: 168
parent: "@beep/schema"
---

## PascalStr.ts overview

A module containing effect schemas for PascalCase strings.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [PascalCaseStr (type alias)](#pascalcasestr-type-alias)
- [validation](#validation)
  - [PascalCaseStr](#pascalcasestr)
---

# models

## PascalCaseStr (type alias)

Type for `PascalCaseStr`.

**Example**

```ts
import type { PascalCaseStr } from "@beep/schema"

const name = "WorkflowStatus" as PascalCaseStr
console.log(name)
```

**Signature**

```ts
type PascalCaseStr = typeof PascalCaseStr.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/PascalStr.ts#L60)

Since v0.0.0

# validation

## PascalCaseStr

Branded PascalCase string schema.

**Example**

```ts
import * as S from "effect/Schema"
import { PascalCaseStr } from "@beep/schema"

const value = S.decodeUnknownSync(PascalCaseStr)("WorkflowStatus")
console.log(value) // "WorkflowStatus"
```

**Signature**

```ts
declare const PascalCaseStr: AnnotatedSchema<S.brand<S.brand<S.Trim, "NonEmptyTrimmedStr">, "PascalCaseStr">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/PascalStr.ts#L28)

Since v0.0.0