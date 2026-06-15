---
title: WorkItem.model.ts
nav_order: 4
parent: "@beep/architecture-lab-domain"
---

## WorkItem.model.ts overview

WorkItem aggregate model.

Since v0.0.0

---
## Exports Grouped by Category
- [aggregates](#aggregates)
  - [CreateWorkItemInput (class)](#createworkiteminput-class)
  - [WorkItem (class)](#workitem-class)
  - [archive](#archive)
  - [assign](#assign)
  - [complete](#complete)
  - [create](#create)
  - [reopen](#reopen)
---

# aggregates

## CreateWorkItemInput (class)

WorkItem creation input.

**Example**

```ts
import { CreateWorkItemInput } from "@beep/architecture-lab-domain/aggregates/WorkItem"

console.log(CreateWorkItemInput)
```

**Signature**

```ts
declare class CreateWorkItemInput
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/domain/src/aggregates/WorkItem/WorkItem.model.ts#L60)

Since v0.0.0

## WorkItem (class)

Architecture lab WorkItem aggregate.

**Example**

```ts
import { WorkItem } from "@beep/architecture-lab-domain/aggregates/WorkItem"

console.log(WorkItem)
```

**Signature**

```ts
declare class WorkItem
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/domain/src/aggregates/WorkItem/WorkItem.model.ts#L33)

Since v0.0.0

## archive

Archive any non-archived WorkItem.

**Example**

```ts
import { archive } from "@beep/architecture-lab-domain/aggregates/WorkItem"

console.log(archive)
```

**Signature**

```ts
declare const archive: (workItem: WorkItem) => Effect.Effect<WorkItem, WorkItemAlreadyArchived, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/domain/src/aggregates/WorkItem/WorkItem.model.ts#L200)

Since v0.0.0

## assign

Assign an open WorkItem to a concrete assignee.

**Example**

```ts
import { assign } from "@beep/architecture-lab-domain/aggregates/WorkItem"

console.log(assign)
```

**Signature**

```ts
declare const assign: (workItem: WorkItem, assignee: EntityIdValueFor<"ArchitectureLabWorkerId">) => Effect.Effect<WorkItem, WorkItemAlreadyArchived | WorkItemInvalidTransition | WorkItemAssigneeRequired, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/domain/src/aggregates/WorkItem/WorkItem.model.ts#L112)

Since v0.0.0

## complete

Complete an open or assigned WorkItem.

**Example**

```ts
import { complete } from "@beep/architecture-lab-domain/aggregates/WorkItem"

console.log(complete)
```

**Signature**

```ts
declare const complete: (workItem: WorkItem) => Effect.Effect<WorkItem, WorkItemAlreadyArchived | WorkItemInvalidTransition, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/domain/src/aggregates/WorkItem/WorkItem.model.ts#L144)

Since v0.0.0

## create

Create a new open WorkItem aggregate.

**Example**

```ts
import { create } from "@beep/architecture-lab-domain/aggregates/WorkItem"

console.log(create)
```

**Signature**

```ts
declare const create: (input: CreateWorkItemInput) => WorkItem
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/domain/src/aggregates/WorkItem/WorkItem.model.ts#L87)

Since v0.0.0

## reopen

Reopen a completed WorkItem.

**Example**

```ts
import { reopen } from "@beep/architecture-lab-domain/aggregates/WorkItem"

console.log(reopen)
```

**Signature**

```ts
declare const reopen: (workItem: WorkItem) => Effect.Effect<WorkItem, WorkItemAlreadyArchived | WorkItemInvalidTransition, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/domain/src/aggregates/WorkItem/WorkItem.model.ts#L175)

Since v0.0.0