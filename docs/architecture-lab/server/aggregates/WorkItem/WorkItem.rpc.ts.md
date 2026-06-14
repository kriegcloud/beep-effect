---
title: WorkItem.rpc.ts
nav_order: 5
parent: "@beep/architecture-lab-server"
---

## WorkItem.rpc.ts overview

WorkItem RPC handlers.

Since v0.0.0

---
## Exports Grouped by Category
- [handlers](#handlers)
  - [makeWorkItemRpcHandlers](#makeworkitemrpchandlers)
---

# handlers

## makeWorkItemRpcHandlers

Build RPC-style WorkItem handlers from the public use-case facade.

**Example**

```ts
import { makeWorkItemRpcHandlers } from "@beep/architecture-lab-server/aggregates/WorkItem"

console.log(makeWorkItemRpcHandlers)
```

**Signature**

```ts
declare const makeWorkItemRpcHandlers: (useCases: WorkItemUseCases.WorkItemUseCasesShape) => { createWorkItem: (command: WorkItemUseCases.CreateWorkItemCommand) => Effect<WorkItem, WorkItemUseCases.WorkItemActionError>; assignWorkItem: (command: WorkItemUseCases.AssignWorkItemCommand) => Effect<WorkItem, WorkItemUseCases.WorkItemActionError>; completeWorkItem: (command: WorkItemUseCases.CompleteWorkItemCommand) => Effect<WorkItem, WorkItemUseCases.WorkItemActionError>; reopenWorkItem: (command: WorkItemUseCases.ReopenWorkItemCommand) => Effect<WorkItem, WorkItemUseCases.WorkItemActionError>; archiveWorkItem: (command: WorkItemUseCases.ArchiveWorkItemCommand) => Effect<WorkItem, WorkItemUseCases.WorkItemActionError>; getWorkItem: (query: WorkItemUseCases.GetWorkItemQuery) => Effect<WorkItem, WorkItemUseCases.WorkItemActionError>; listWorkItems: (query: WorkItemUseCases.ListWorkItemsQuery) => Effect<ReadonlyArray<WorkItem>, WorkItemUseCases.WorkItemActionError>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/server/src/aggregates/WorkItem/WorkItem.rpc.ts#L24)

Since v0.0.0