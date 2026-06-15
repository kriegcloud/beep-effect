---
title: index.ts
nav_order: 3
parent: "@beep/architecture-lab-ui"
---

## index.ts overview

Package version for the architecture lab UI role.

**Example**

```ts
import { VERSION } from "@beep/architecture-lab-ui"

console.log(VERSION)
```

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [VERSION](#version)
  - [WorkItem (namespace export)](#workitem-namespace-export)
---

# models

## VERSION

Package version for the architecture lab UI role.

**Example**

```ts
import { VERSION } from "@beep/architecture-lab-ui"

console.log(VERSION)
```

**Signature**

```ts
declare const VERSION: "0.0.0"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/ui/src/index.ts#L22)

Since v0.0.0

## WorkItem (namespace export)

Re-exports all named exports from the "./aggregates/WorkItem/index.js" module as `WorkItem`.

**Signature**

```ts
export * as WorkItem from "./aggregates/WorkItem/index.js"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/ui/src/index.ts#L30)

Since v0.0.0