---
title: public.ts
nav_order: 17
parent: "@beep/architecture-lab-use-cases"
---

## public.ts overview

Public architecture lab use-case exports.

Since v0.0.0

---
## Exports Grouped by Category
- [use-cases](#use-cases)
  - [WorkItem (namespace export)](#workitem-namespace-export)
  - [Worker (namespace export)](#worker-namespace-export)
---

# use-cases

## WorkItem (namespace export)

Re-exports all named exports from the "./aggregates/WorkItem/index.js" module as `WorkItem`.

**Signature**

```ts
export * as WorkItem from "./aggregates/WorkItem/index.js"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/use-cases/src/public.ts#L7)

Since v0.0.0

## Worker (namespace export)

Re-exports all named exports from the "./entities/Worker/index.js" module as `Worker`.

**Signature**

```ts
export * as Worker from "./entities/Worker/index.js"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/use-cases/src/public.ts#L14)

Since v0.0.0