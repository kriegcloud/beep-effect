---
title: index.ts
nav_order: 6
parent: "@beep/architecture-lab-tables"
---

## index.ts overview

Package version for the architecture lab tables role.

**Example**

```ts
import { VERSION } from "@beep/architecture-lab-tables"

console.log(VERSION)
```

Since v0.0.0

---
## Exports Grouped by Category
- [tables](#tables)
  - ["./tables.js" (namespace export)](#tablesjs-namespace-export)
  - [VERSION](#version)
  - [WorkItem (namespace export)](#workitem-namespace-export)
  - [Worker (namespace export)](#worker-namespace-export)
---

# tables

## "./tables.js" (namespace export)

Re-exports all named exports from the "./tables.js" module.

**Signature**

```ts
export * from "./tables.js"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/tables/src/index.ts#L44)

Since v0.0.0

## VERSION

Package version for the architecture lab tables role.

**Example**

```ts
import { VERSION } from "@beep/architecture-lab-tables"

console.log(VERSION)
```

**Signature**

```ts
declare const VERSION: "0.0.0"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/tables/src/index.ts#L22)

Since v0.0.0

## WorkItem (namespace export)

Re-exports all named exports from the "./aggregates/WorkItem/index.js" module as `WorkItem`.

**Signature**

```ts
export * as WorkItem from "./aggregates/WorkItem/index.js"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/tables/src/index.ts#L30)

Since v0.0.0

## Worker (namespace export)

Re-exports all named exports from the "./entities/Worker/index.js" module as `Worker`.

**Signature**

```ts
export * as Worker from "./entities/Worker/index.js"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/tables/src/index.ts#L37)

Since v0.0.0