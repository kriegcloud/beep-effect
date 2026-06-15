---
title: WorkItem.repo.ts
nav_order: 4
parent: "@beep/architecture-lab-server"
---

## WorkItem.repo.ts overview

WorkItem repository adapter.

Since v0.0.0

---
## Exports Grouped by Category
- [repositories](#repositories)
  - [makeDrizzleWorkItemRepository](#makedrizzleworkitemrepository)
  - [makeInMemoryWorkItemRepository](#makeinmemoryworkitemrepository)
  - [makeWorkItemRepository](#makeworkitemrepository)
---

# repositories

## makeDrizzleWorkItemRepository

Build a Drizzle-backed WorkItem repository used by live persistence tests.

**Example**

```ts
import { makeDrizzleWorkItemRepository } from "@beep/architecture-lab-server/aggregates/WorkItem"

console.log(makeDrizzleWorkItemRepository)
```

**Signature**

```ts
declare const makeDrizzleWorkItemRepository: () => Effect.Effect<WorkItemUseCaseServer.WorkItem.WorkItemRepositoryShape, never, PostgresDrizzle>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/server/src/aggregates/WorkItem/WorkItem.repo.ts#L141)

Since v0.0.0

## makeInMemoryWorkItemRepository

Build the in-memory WorkItem repository used by the fast architecture lab proof.

**Example**

```ts
import { makeInMemoryWorkItemRepository } from "@beep/architecture-lab-server/aggregates/WorkItem"

console.log(makeInMemoryWorkItemRepository)
```

**Signature**

```ts
declare const makeInMemoryWorkItemRepository: () => Effect.Effect<WorkItemUseCaseServer.WorkItem.WorkItemRepositoryShape, never, WorkItemConfig>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/server/src/aggregates/WorkItem/WorkItem.repo.ts#L52)

Since v0.0.0

## makeWorkItemRepository

Build the default WorkItem repository for normal slice tests.

**Example**

```ts
import { makeWorkItemRepository } from "@beep/architecture-lab-server/aggregates/WorkItem"

console.log(makeWorkItemRepository)
```

**Signature**

```ts
declare const makeWorkItemRepository: () => Effect.Effect<WorkItemUseCaseServer.WorkItem.WorkItemRepositoryShape, never, WorkItemConfig>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/server/src/aggregates/WorkItem/WorkItem.repo.ts#L206)

Since v0.0.0