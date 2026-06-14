---
title: WorkItem.client.ts
nav_order: 2
parent: "@beep/architecture-lab-client"
---

## WorkItem.client.ts overview

WorkItem client facade.

Since v0.0.0

---
## Exports Grouped by Category
- [clients](#clients)
  - [WorkItemClient (class)](#workitemclient-class)
  - [WorkItemClientShape (interface)](#workitemclientshape-interface)
  - [WorkItemClientTransport (interface)](#workitemclienttransport-interface)
  - [makeWorkItemClient](#makeworkitemclient)
---

# clients

## WorkItemClient (class)

WorkItem client service.

**Example**

```ts
import { WorkItemClient } from "@beep/architecture-lab-client/aggregates/WorkItem"

console.log(WorkItemClient)
```

**Signature**

```ts
declare class WorkItemClient
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/client/src/aggregates/WorkItem/WorkItem.client.ts#L84)

Since v0.0.0

## WorkItemClientShape (interface)

WorkItem client facade.

**Example**

```ts
import type { WorkItemClientShape } from "@beep/architecture-lab-client/aggregates/WorkItem"

const value = {} as WorkItemClientShape
console.log(value)
```

**Signature**

```ts
export interface WorkItemClientShape extends WorkItemClientTransport {}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/client/src/aggregates/WorkItem/WorkItem.client.ts#L69)

Since v0.0.0

## WorkItemClientTransport (interface)

Client transport contract for WorkItem commands and queries.

**Example**

```ts
import type { WorkItemClientTransport } from "@beep/architecture-lab-client/aggregates/WorkItem"

const value = {} as WorkItemClientTransport
console.log(value)
```

**Signature**

```ts
export interface WorkItemClientTransport {
  readonly archive: (
    command: WorkItemUseCases.ArchiveWorkItemCommand
  ) => Effect.Effect<DomainWorkItem.WorkItem, WorkItemUseCases.WorkItemActionError>;
  readonly assign: (
    command: WorkItemUseCases.AssignWorkItemCommand
  ) => Effect.Effect<DomainWorkItem.WorkItem, WorkItemUseCases.WorkItemActionError>;
  readonly complete: (
    command: WorkItemUseCases.CompleteWorkItemCommand
  ) => Effect.Effect<DomainWorkItem.WorkItem, WorkItemUseCases.WorkItemActionError>;
  readonly create: (
    command: WorkItemUseCases.CreateWorkItemCommand
  ) => Effect.Effect<DomainWorkItem.WorkItem, WorkItemUseCases.WorkItemActionError>;
  readonly get: (
    query: WorkItemUseCases.GetWorkItemQuery
  ) => Effect.Effect<DomainWorkItem.WorkItem, WorkItemUseCases.WorkItemActionError>;
  readonly list: (
    query: WorkItemUseCases.ListWorkItemsQuery
  ) => Effect.Effect<ReadonlyArray<DomainWorkItem.WorkItem>, WorkItemUseCases.WorkItemActionError>;
  readonly reopen: (
    command: WorkItemUseCases.ReopenWorkItemCommand
  ) => Effect.Effect<DomainWorkItem.WorkItem, WorkItemUseCases.WorkItemActionError>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/client/src/aggregates/WorkItem/WorkItem.client.ts#L31)

Since v0.0.0

## makeWorkItemClient

Build a client facade over a WorkItem transport.

**Example**

```ts
import { makeWorkItemClient } from "@beep/architecture-lab-client/aggregates/WorkItem"

console.log(makeWorkItemClient)
```

**Signature**

```ts
declare const makeWorkItemClient: (transport: WorkItemClientTransport) => WorkItemClientShape
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/client/src/aggregates/WorkItem/WorkItem.client.ts#L99)

Since v0.0.0