---
title: index.ts
nav_order: 5
parent: "@beep/shared-domain"
---

## index.ts overview

Membership model schema namespace.

**Example**

```ts
import { Model } from "@beep/shared-domain/entities/Membership"

console.log(Model.definition.entityId.tableName)
```

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - ["./Membership.model.js" (namespace export)](#membershipmodeljs-namespace-export)
- [schemas](#schemas)
  - ["./Membership.values.js" (namespace export)](#membershipvaluesjs-namespace-export)
---

# models

## "./Membership.model.js" (namespace export)

Re-exports all named exports from the "./Membership.model.js" module.

**Example**

```ts
import { Model } from "@beep/shared-domain/entities/Membership"

console.log(Model.definition.entityId.tableName)
```

**Signature**

```ts
export * from "./Membership.model.js"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/entities/Membership/index.ts#L21)

Since v0.0.0

# schemas

## "./Membership.values.js" (namespace export)

Re-exports all named exports from the "./Membership.values.js" module.

**Example**

```ts
import { Role } from "@beep/shared-domain/entities/Membership"

console.log(Role.is.member("member"))
```

**Signature**

```ts
export * from "./Membership.values.js"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/entities/Membership/index.ts#L35)

Since v0.0.0