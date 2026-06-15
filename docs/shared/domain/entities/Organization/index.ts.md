---
title: index.ts
nav_order: 8
parent: "@beep/shared-domain"
---

## index.ts overview

Organization pure behavior helpers.

**Example**

```ts
import { hasParentOrganization } from "@beep/shared-domain/entities/Organization"
import * as O from "effect/Option"

console.log(hasParentOrganization({ parentOrgId: O.none() }))
```

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - ["./Organization.model.js" (namespace export)](#organizationmodeljs-namespace-export)
- [predicates](#predicates)
  - ["./Organization.behavior.js" (namespace export)](#organizationbehaviorjs-namespace-export)
- [schemas](#schemas)
  - ["./Organization.values.js" (namespace export)](#organizationvaluesjs-namespace-export)
---

# models

## "./Organization.model.js" (namespace export)

Re-exports all named exports from the "./Organization.model.js" module.

**Example**

```ts
import { Model } from "@beep/shared-domain/entities/Organization"

console.log(Model.definition.entityId.tableName)
```

**Signature**

```ts
export * from "./Organization.model.js"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/entities/Organization/index.ts#L29)

Since v0.0.0

# predicates

## "./Organization.behavior.js" (namespace export)

Re-exports all named exports from the "./Organization.behavior.js" module.

**Example**

```ts
import { hasParentOrganization } from "@beep/shared-domain/entities/Organization"
import * as O from "effect/Option"

console.log(hasParentOrganization({ parentOrgId: O.none() }))
```

**Signature**

```ts
export * from "./Organization.behavior.js"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/entities/Organization/index.ts#L15)

Since v0.0.0

# schemas

## "./Organization.values.js" (namespace export)

Re-exports all named exports from the "./Organization.values.js" module.

**Example**

```ts
import { LicenseTier } from "@beep/shared-domain/entities/Organization"

console.log(LicenseTier.is.team("team"))
```

**Signature**

```ts
export * from "./Organization.values.js"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/entities/Organization/index.ts#L43)

Since v0.0.0