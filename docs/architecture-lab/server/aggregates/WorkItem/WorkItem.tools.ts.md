---
title: WorkItem.tools.ts
nav_order: 6
parent: "@beep/architecture-lab-server"
---

## WorkItem.tools.ts overview

WorkItem tool handlers.

Since v0.0.0

---
## Exports Grouped by Category
- [tools](#tools)
  - [WorkItemToolNames](#workitemtoolnames)
  - [makeWorkItemToolHandlers](#makeworkitemtoolhandlers)
---

# tools

## WorkItemToolNames

WorkItem tool names exposed by the architecture lab proof.

**Example**

```ts
import { WorkItemToolNames } from "@beep/architecture-lab-server/aggregates/WorkItem"

console.log(WorkItemToolNames)
```

**Signature**

```ts
declare const WorkItemToolNames: { readonly create: "architecture_lab.work_item.create"; readonly assign: "architecture_lab.work_item.assign"; readonly complete: "architecture_lab.work_item.complete"; readonly reopen: "architecture_lab.work_item.reopen"; readonly archive: "architecture_lab.work_item.archive"; readonly get: "architecture_lab.work_item.get"; readonly list: "architecture_lab.work_item.list"; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/server/src/aggregates/WorkItem/WorkItem.tools.ts#L24)

Since v0.0.0

## makeWorkItemToolHandlers

Build tool-style WorkItem handlers from the public use-case facade.

**Example**

```ts
import { makeWorkItemToolHandlers } from "@beep/architecture-lab-server/aggregates/WorkItem"

console.log(makeWorkItemToolHandlers)
```

**Signature**

```ts
declare const makeWorkItemToolHandlers: (useCases: WorkItemUseCases.WorkItemUseCasesShape) => { "architecture_lab.work_item.create": (command: WorkItemUseCases.CreateWorkItemCommand) => Effect<WorkItem, WorkItemUseCases.WorkItemActionError>; "architecture_lab.work_item.assign": (command: WorkItemUseCases.AssignWorkItemCommand) => Effect<WorkItem, WorkItemUseCases.WorkItemActionError>; "architecture_lab.work_item.complete": (command: WorkItemUseCases.CompleteWorkItemCommand) => Effect<WorkItem, WorkItemUseCases.WorkItemActionError>; "architecture_lab.work_item.reopen": (command: WorkItemUseCases.ReopenWorkItemCommand) => Effect<WorkItem, WorkItemUseCases.WorkItemActionError>; "architecture_lab.work_item.archive": (command: WorkItemUseCases.ArchiveWorkItemCommand) => Effect<WorkItem, WorkItemUseCases.WorkItemActionError>; "architecture_lab.work_item.get": (query: WorkItemUseCases.GetWorkItemQuery) => Effect<WorkItem, WorkItemUseCases.WorkItemActionError>; "architecture_lab.work_item.list": (query: WorkItemUseCases.ListWorkItemsQuery) => Effect<ReadonlyArray<WorkItem>, WorkItemUseCases.WorkItemActionError>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/server/src/aggregates/WorkItem/WorkItem.tools.ts#L47)

Since v0.0.0