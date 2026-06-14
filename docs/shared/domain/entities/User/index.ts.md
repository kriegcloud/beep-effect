---
title: index.ts
nav_order: 12
parent: "@beep/shared-domain"
---

## index.ts overview

User model schema namespace.

**Example**

```ts
import { Model } from "@beep/shared-domain/entities/User"

console.log(Model.definition.entityId.tableName)
```

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - ["./User.model.js" (namespace export)](#usermodeljs-namespace-export)
---

# models

## "./User.model.js" (namespace export)

Re-exports all named exports from the "./User.model.js" module.

**Example**

```ts
import { Model } from "@beep/shared-domain/entities/User"

console.log(Model.definition.entityId.tableName)
```

**Signature**

```ts
export * from "./User.model.js"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/entities/User/index.ts#L21)

Since v0.0.0