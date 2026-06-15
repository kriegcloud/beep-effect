---
title: KebabStr.ts
nav_order: 140
parent: "@beep/schema"
---

## KebabStr.ts overview

A module containing effect schemas for kebab-case strings.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [KebabCaseStr (type alias)](#kebabcasestr-type-alias)
- [validation](#validation)
  - [KebabCaseStr](#kebabcasestr)
---

# models

## KebabCaseStr (type alias)

Type for `KebabCaseStr`.

**Example**

```ts
import type { KebabCaseStr } from "@beep/schema"

const role = "command-handler" as KebabCaseStr
console.log(role)
```

**Signature**

```ts
type KebabCaseStr = typeof KebabCaseStr.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/KebabStr.ts#L60)

Since v0.0.0

# validation

## KebabCaseStr

Branded kebab-case string schema with a lowercase leading letter.

**Example**

```ts
import * as S from "effect/Schema"
import { KebabCaseStr } from "@beep/schema"

const value = S.decodeUnknownSync(KebabCaseStr)("my-role-2")
console.log(value) // "my-role-2"
```

**Signature**

```ts
declare const KebabCaseStr: AnnotatedSchema<S.brand<S.brand<S.Trim, "NonEmptyTrimmedStr">, "KebabCaseStr">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/KebabStr.ts#L28)

Since v0.0.0