---
title: WorkItem.use-cases.ts
nav_order: 7
parent: "@beep/architecture-lab-use-cases"
---

## WorkItem.use-cases.ts overview

WorkItem use-case service.

Since v0.0.0

---
## Exports Grouped by Category
- [use-cases](#use-cases)
  - [WorkItemUseCases (class)](#workitemusecases-class)
  - [WorkItemUseCasesShape (interface)](#workitemusecasesshape-interface)
---

# use-cases

## WorkItemUseCases (class)

Public WorkItem use-case service.

**Example**

```ts
import { WorkItemUseCases } from "@beep/architecture-lab-use-cases/aggregates/WorkItem"

console.log(WorkItemUseCases)
```

**Signature**

```ts
declare class WorkItemUseCases
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/use-cases/src/aggregates/WorkItem/WorkItem.use-cases.ts#L65)

Since v0.0.0

## WorkItemUseCasesShape (interface)

Public WorkItem use-case contract.

**Example**

```ts
import type { WorkItemUseCasesShape } from "@beep/architecture-lab-use-cases/aggregates/WorkItem"

const value = {} as WorkItemUseCasesShape
console.log(value)
```

**Signature**

```ts
export interface WorkItemUseCasesShape {
  readonly archive: (command: ArchiveWorkItemCommand) => Effect.Effect<DomainWorkItem.WorkItem, WorkItemActionError>;
  readonly assign: (command: AssignWorkItemCommand) => Effect.Effect<DomainWorkItem.WorkItem, WorkItemActionError>;
  readonly complete: (command: CompleteWorkItemCommand) => Effect.Effect<DomainWorkItem.WorkItem, WorkItemActionError>;
  readonly create: (command: CreateWorkItemCommand) => Effect.Effect<DomainWorkItem.WorkItem, WorkItemActionError>;
  readonly get: (query: GetWorkItemQuery) => Effect.Effect<DomainWorkItem.WorkItem, WorkItemActionError>;
  readonly list: (
    query: ListWorkItemsQuery
  ) => Effect.Effect<ReadonlyArray<DomainWorkItem.WorkItem>, WorkItemActionError>;
  readonly reopen: (command: ReopenWorkItemCommand) => Effect.Effect<DomainWorkItem.WorkItem, WorkItemActionError>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/use-cases/src/aggregates/WorkItem/WorkItem.use-cases.ts#L40)

Since v0.0.0