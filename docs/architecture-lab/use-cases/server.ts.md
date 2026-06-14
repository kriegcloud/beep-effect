---
title: server.ts
nav_order: 18
parent: "@beep/architecture-lab-use-cases"
---

## server.ts overview

Server-only architecture lab use-case exports.

Since v0.0.0

---
## Exports Grouped by Category
- [repositories](#repositories)
  - [WorkItem (namespace export)](#workitem-namespace-export)
  - [Worker (namespace export)](#worker-namespace-export)
---

# repositories

## WorkItem (namespace export)

Re-exports all named exports from the "./aggregates/WorkItem/server.js" module as `WorkItem`.

**Signature**

```ts
export * as WorkItem from "./aggregates/WorkItem/server.js"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/use-cases/src/server.ts#L7)

Since v0.0.0

## Worker (namespace export)

Re-exports all named exports from the "./entities/Worker/server.js" module as `Worker`.

**Signature**

```ts
export * as Worker from "./entities/Worker/server.js"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/use-cases/src/server.ts#L14)

Since v0.0.0