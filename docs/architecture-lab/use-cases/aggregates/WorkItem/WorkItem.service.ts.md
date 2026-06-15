---
title: WorkItem.service.ts
nav_order: 6
parent: "@beep/architecture-lab-use-cases"
---

## WorkItem.service.ts overview

WorkItem server-side use-case implementation.

Since v0.0.0

---
## Exports Grouped by Category
- [use-cases](#use-cases)
  - [makeWorkItemUseCases](#makeworkitemusecases)
  - [toWorkItemActionError](#toworkitemactionerror)
---

# use-cases

## makeWorkItemUseCases

Build WorkItem use-cases from the server repository port.

**Example**

```ts
import { makeWorkItemUseCases } from "@beep/architecture-lab-use-cases/aggregates/WorkItem/server"

console.log(makeWorkItemUseCases)
```

**Signature**

```ts
declare const makeWorkItemUseCases: (repository: WorkItemRepositoryShape) => WorkItemUseCasesShape
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/use-cases/src/aggregates/WorkItem/WorkItem.service.ts#L101)

Since v0.0.0

## toWorkItemActionError

Translate server and aggregate failures to public action failures.

**Example**

```ts
import { toWorkItemActionError } from "@beep/architecture-lab-use-cases/aggregates/WorkItem/server"

console.log(toWorkItemActionError)
```

**Signature**

```ts
declare const toWorkItemActionError: (error: WorkItemRepositoryError | DomainWorkItem.WorkItemDomainError) => WorkItemActionError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/use-cases/src/aggregates/WorkItem/WorkItem.service.ts#L56)

Since v0.0.0