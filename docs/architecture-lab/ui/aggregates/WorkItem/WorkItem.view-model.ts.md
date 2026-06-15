---
title: WorkItem.view-model.ts
nav_order: 2
parent: "@beep/architecture-lab-ui"
---

## WorkItem.view-model.ts overview

WorkItem UI view model.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [WorkItemSummaryViewModel (class)](#workitemsummaryviewmodel-class)
  - [WorkItemVisibleAction](#workitemvisibleaction)
  - [WorkItemVisibleAction (type alias)](#workitemvisibleaction-type-alias)
  - [toWorkItemSummaryViewModel](#toworkitemsummaryviewmodel)
---

# models

## WorkItemSummaryViewModel (class)

UI-facing WorkItem summary.

**Example**

```ts
import { WorkItemSummaryViewModel } from "@beep/architecture-lab-ui/aggregates/WorkItem"

console.log(WorkItemSummaryViewModel)
```

**Signature**

```ts
declare class WorkItemSummaryViewModel
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/ui/src/aggregates/WorkItem/WorkItem.view-model.ts#L62)

Since v0.0.0

## WorkItemVisibleAction

UI action values for the WorkItem proof surface.

**Example**

```ts
import { WorkItemVisibleAction } from "@beep/architecture-lab-ui/aggregates/WorkItem"

console.log(WorkItemVisibleAction)
```

**Signature**

```ts
declare const WorkItemVisibleAction: AnnotatedSchema<LiteralKit<readonly ["assign", "complete", "reopen", "archive"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/ui/src/aggregates/WorkItem/WorkItem.view-model.ts#L34)

Since v0.0.0

## WorkItemVisibleAction (type alias)

UI action value for the WorkItem proof surface.

**Signature**

```ts
type WorkItemVisibleAction = typeof WorkItemVisibleAction.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/ui/src/aggregates/WorkItem/WorkItem.view-model.ts#L47)

Since v0.0.0

## toWorkItemSummaryViewModel

Create the UI-facing WorkItem summary view model.

**Example**

```ts
import { toWorkItemSummaryViewModel } from "@beep/architecture-lab-ui/aggregates/WorkItem"

console.log(toWorkItemSummaryViewModel)
```

**Signature**

```ts
declare const toWorkItemSummaryViewModel: { (config: WorkItemPublicConfig): (workItem: DomainWorkItem.WorkItem) => WorkItemSummaryViewModel; (workItem: DomainWorkItem.WorkItem, config: WorkItemPublicConfig): WorkItemSummaryViewModel; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/ui/src/aggregates/WorkItem/WorkItem.view-model.ts#L108)

Since v0.0.0