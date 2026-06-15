---
title: WorkItem.values.ts
nav_order: 5
parent: "@beep/architecture-lab-domain"
---

## WorkItem.values.ts overview

WorkItem value objects.

Since v0.0.0

---
## Exports Grouped by Category
- [value-objects](#value-objects)
  - [WorkItemId](#workitemid)
  - [WorkItemId (type alias)](#workitemid-type-alias)
  - [WorkItemStatus](#workitemstatus)
  - [WorkItemStatus (type alias)](#workitemstatus-type-alias)
  - [WorkItemTitle](#workitemtitle)
  - [WorkItemTitle (type alias)](#workitemtitle-type-alias)
---

# value-objects

## WorkItemId

Architecture lab WorkItem identity.

**Example**

```ts
import { WorkItemId } from "@beep/architecture-lab-domain/aggregates/WorkItem"

console.log(WorkItemId)
```

**Signature**

```ts
declare const WorkItemId: AnnotatedSchema<S.brand<S.String, "ArchitectureLabWorkItemId">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/domain/src/aggregates/WorkItem/WorkItem.values.ts#L28)

Since v0.0.0

## WorkItemId (type alias)

Architecture lab WorkItem identity type.

**Signature**

```ts
type WorkItemId = S.Schema.Type<typeof WorkItemId>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/domain/src/aggregates/WorkItem/WorkItem.values.ts#L43)

Since v0.0.0

## WorkItemStatus

Architecture lab WorkItem lifecycle values.

**Example**

```ts
import { WorkItemStatus } from "@beep/architecture-lab-domain/aggregates/WorkItem"

console.log(WorkItemStatus)
```

**Signature**

```ts
declare const WorkItemStatus: AnnotatedSchema<LiteralKit<readonly ["open", "assigned", "completed", "archived"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/domain/src/aggregates/WorkItem/WorkItem.values.ts#L87)

Since v0.0.0

## WorkItemStatus (type alias)

Architecture lab WorkItem lifecycle value.

**Signature**

```ts
type WorkItemStatus = typeof WorkItemStatus.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/domain/src/aggregates/WorkItem/WorkItem.values.ts#L100)

Since v0.0.0

## WorkItemTitle

Architecture lab WorkItem title.

**Example**

```ts
import { WorkItemTitle } from "@beep/architecture-lab-domain/aggregates/WorkItem"

console.log(WorkItemTitle)
```

**Signature**

```ts
declare const WorkItemTitle: AnnotatedSchema<S.String>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/domain/src/aggregates/WorkItem/WorkItem.values.ts#L58)

Since v0.0.0

## WorkItemTitle (type alias)

Architecture lab WorkItem title type.

**Signature**

```ts
type WorkItemTitle = S.Schema.Type<typeof WorkItemTitle>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/domain/src/aggregates/WorkItem/WorkItem.values.ts#L72)

Since v0.0.0