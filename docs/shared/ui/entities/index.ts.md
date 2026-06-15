---
title: index.ts
nav_order: 1
parent: "@beep/shared-ui"
---

## index.ts overview

Shared Organization UI contract namespace.

**Example**

```ts
import { Organization } from "@beep/shared-ui/entities"

console.log(Organization.primaryLabel({ name: "Acme" }))
```

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [Organization (namespace export)](#organization-namespace-export)
---

# models

## Organization (namespace export)

Re-exports all named exports from the "./Organization/index.js" module as `Organization`.

**Example**

```ts
import { Organization } from "@beep/shared-ui/entities"

console.log(Organization.primaryLabel({ name: "Acme" }))
```

**Signature**

```ts
export * as Organization from "./Organization/index.js"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/ui/src/entities/index.ts#L14)

Since v0.0.0