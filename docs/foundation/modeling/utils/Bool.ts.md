---
title: Bool.ts
nav_order: 2
parent: "@beep/utils"
---

## Bool.ts overview

Re-export of all helpers from `effect/Boolean`.

**Example**

```ts
import { Bool } from "@beep/utils"

const toggled = Bool.not(true)
// false

console.log(toggled)
```

Since v0.0.0

---
## Exports Grouped by Category
- [utilities](#utilities)
  - ["effect/Boolean" (namespace export)](#effectboolean-namespace-export)
---

# utilities

## "effect/Boolean" (namespace export)

Re-exports all named exports from the "effect/Boolean" module.

**Example**

```ts
import { Bool } from "@beep/utils"

const toggled = Bool.not(true)
// false

console.log(toggled)
```

**Signature**

```ts
export * from "effect/Boolean"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Bool.ts#L17)

Since v0.0.0