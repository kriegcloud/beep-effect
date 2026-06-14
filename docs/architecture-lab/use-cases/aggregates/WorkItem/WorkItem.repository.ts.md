---
title: WorkItem.repository.ts
nav_order: 5
parent: "@beep/architecture-lab-use-cases"
---

## WorkItem.repository.ts overview

WorkItem repository port.

Since v0.0.0

---
## Exports Grouped by Category
- [repositories](#repositories)
  - [WorkItemRepository (class)](#workitemrepository-class)
  - [WorkItemRepositoryConflict (class)](#workitemrepositoryconflict-class)
  - [WorkItemRepositoryError (type alias)](#workitemrepositoryerror-type-alias)
  - [WorkItemRepositoryNotFound (class)](#workitemrepositorynotfound-class)
  - [WorkItemRepositoryShape (interface)](#workitemrepositoryshape-interface)
  - [WorkItemRepositoryUnavailable (class)](#workitemrepositoryunavailable-class)
---

# repositories

## WorkItemRepository (class)

WorkItem repository service.

**Example**

```ts
import { WorkItemRepository } from "@beep/architecture-lab-use-cases/aggregates/WorkItem/server"

console.log(WorkItemRepository)
```

**Signature**

```ts
declare class WorkItemRepository
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/use-cases/src/aggregates/WorkItem/WorkItem.repository.ts#L156)

Since v0.0.0

## WorkItemRepositoryConflict (class)

Persistence failure raised when a WorkItem write conflicts.

**Example**

```ts
import { WorkItemRepositoryConflict } from "@beep/architecture-lab-use-cases/aggregates/WorkItem/server"

console.log(WorkItemRepositoryConflict)
```

**Signature**

```ts
declare class WorkItemRepositoryConflict
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/use-cases/src/aggregates/WorkItem/WorkItem.repository.ts#L57)

Since v0.0.0

## WorkItemRepositoryError (type alias)

WorkItem repository failure.

**Example**

```ts
import type { WorkItemRepositoryError } from "@beep/architecture-lab-use-cases/aggregates/WorkItem/server"

const value = {} as WorkItemRepositoryError
console.log(value)
```

**Signature**

```ts
type WorkItemRepositoryError = | WorkItemRepositoryNotFound
  | WorkItemRepositoryConflict
  | WorkItemRepositoryUnavailable
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/use-cases/src/aggregates/WorkItem/WorkItem.repository.ts#L111)

Since v0.0.0

## WorkItemRepositoryNotFound (class)

Persistence failure raised when a WorkItem row is absent.

**Example**

```ts
import { WorkItemRepositoryNotFound } from "@beep/architecture-lab-use-cases/aggregates/WorkItem/server"

console.log(WorkItemRepositoryNotFound)
```

**Signature**

```ts
declare class WorkItemRepositoryNotFound
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/use-cases/src/aggregates/WorkItem/WorkItem.repository.ts#L31)

Since v0.0.0

## WorkItemRepositoryShape (interface)

WorkItem repository contract.

**Example**

```ts
import type { WorkItemRepositoryShape } from "@beep/architecture-lab-use-cases/aggregates/WorkItem/server"

const value = {} as WorkItemRepositoryShape
console.log(value)
```

**Signature**

```ts
export interface WorkItemRepositoryShape {
  readonly create: (
    workItem: DomainWorkItem.WorkItem
  ) => Effect.Effect<DomainWorkItem.WorkItem, WorkItemRepositoryConflict | WorkItemRepositoryUnavailable>;
  readonly get: (
    id: DomainWorkItem.WorkItemId
  ) => Effect.Effect<DomainWorkItem.WorkItem, WorkItemRepositoryNotFound | WorkItemRepositoryUnavailable>;
  readonly list: Effect.Effect<ReadonlyArray<DomainWorkItem.WorkItem>, WorkItemRepositoryUnavailable>;
  readonly save: (
    workItem: DomainWorkItem.WorkItem
  ) => Effect.Effect<DomainWorkItem.WorkItem, WorkItemRepositoryNotFound | WorkItemRepositoryUnavailable>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/use-cases/src/aggregates/WorkItem/WorkItem.repository.ts#L130)

Since v0.0.0

## WorkItemRepositoryUnavailable (class)

Persistence failure raised when the WorkItem repository is unavailable.

**Example**

```ts
import { WorkItemRepositoryUnavailable } from "@beep/architecture-lab-use-cases/aggregates/WorkItem/server"

console.log(WorkItemRepositoryUnavailable)
```

**Signature**

```ts
declare class WorkItemRepositoryUnavailable
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/use-cases/src/aggregates/WorkItem/WorkItem.repository.ts#L84)

Since v0.0.0