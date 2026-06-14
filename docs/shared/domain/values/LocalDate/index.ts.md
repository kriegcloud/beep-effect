---
title: index.ts
nav_order: 33
parent: "@beep/shared-domain"
---

## index.ts overview

LocalDate behavior helpers and constructors.

**Example**

```ts
import { today } from "@beep/shared-domain/values/LocalDate"

console.log(today().toISOString())
```

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - ["./LocalDate.model.ts" (namespace export)](#localdatemodelts-namespace-export)
- [utilities](#utilities)
  - ["./LocalDate.behavior.ts" (namespace export)](#localdatebehaviorts-namespace-export)
---

# models

## "./LocalDate.model.ts" (namespace export)

Re-exports all named exports from the "./LocalDate.model.ts" module.

**Example**

```ts
import { Model } from "@beep/shared-domain/values/LocalDate"

console.log(Model)
```

**Signature**

```ts
export * from "./LocalDate.model.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/values/LocalDate/index.ts#L35)

Since v0.0.0

# utilities

## "./LocalDate.behavior.ts" (namespace export)

Re-exports all named exports from the "./LocalDate.behavior.ts" module.

**Example**

```ts
import { today } from "@beep/shared-domain/values/LocalDate"

console.log(today().toISOString())
```

**Signature**

```ts
export * from "./LocalDate.behavior.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/values/LocalDate/index.ts#L21)

Since v0.0.0