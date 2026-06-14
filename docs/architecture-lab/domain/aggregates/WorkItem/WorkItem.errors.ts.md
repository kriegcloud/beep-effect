---
title: WorkItem.errors.ts
nav_order: 3
parent: "@beep/architecture-lab-domain"
---

## WorkItem.errors.ts overview

WorkItem domain errors.

Since v0.0.0

---
## Exports Grouped by Category
- [errors](#errors)
  - [WorkItemAlreadyArchived (class)](#workitemalreadyarchived-class)
  - [WorkItemAssigneeRequired (class)](#workitemassigneerequired-class)
  - [WorkItemDomainError](#workitemdomainerror)
  - [WorkItemDomainError (type alias)](#workitemdomainerror-type-alias)
  - [WorkItemInvalidTransition (class)](#workiteminvalidtransition-class)
    - [fromStatus (static method)](#fromstatus-static-method)
---

# errors

## WorkItemAlreadyArchived (class)

Failure raised when a command attempts to mutate an archived WorkItem.

**Example**

```ts
import { WorkItemAlreadyArchived } from "@beep/architecture-lab-domain/aggregates/WorkItem"

console.log(WorkItemAlreadyArchived)
```

**Signature**

```ts
declare class WorkItemAlreadyArchived
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/domain/src/aggregates/WorkItem/WorkItem.errors.ts#L29)

Since v0.0.0

## WorkItemAssigneeRequired (class)

Failure raised when an assignment command omits a valid assignee.

**Example**

```ts
import { WorkItemAssigneeRequired } from "@beep/architecture-lab-domain/aggregates/WorkItem"

console.log(WorkItemAssigneeRequired)
```

**Signature**

```ts
declare class WorkItemAssigneeRequired
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/domain/src/aggregates/WorkItem/WorkItem.errors.ts#L99)

Since v0.0.0

## WorkItemDomainError

WorkItem aggregate domain failure schema.

**Example**

```ts
import { WorkItemDomainError } from "@beep/architecture-lab-domain/aggregates/WorkItem"

console.log(WorkItemDomainError)
```

**Signature**

```ts
declare const WorkItemDomainError: S.Union<readonly [typeof WorkItemAlreadyArchived, typeof WorkItemInvalidTransition, typeof WorkItemAssigneeRequired]>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/domain/src/aggregates/WorkItem/WorkItem.errors.ts#L139)

Since v0.0.0

## WorkItemDomainError (type alias)

WorkItem aggregate domain failure.

**Example**

```ts
import type { WorkItemDomainError } from "@beep/architecture-lab-domain/aggregates/WorkItem"

const value = {} as WorkItemDomainError
console.log(value)
```

**Signature**

```ts
type WorkItemDomainError = WorkItemAlreadyArchived | WorkItemInvalidTransition | WorkItemAssigneeRequired
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/domain/src/aggregates/WorkItem/WorkItem.errors.ts#L124)

Since v0.0.0

## WorkItemInvalidTransition (class)

Failure raised when a command attempts an unsupported lifecycle transition.

**Example**

```ts
import { WorkItemInvalidTransition } from "@beep/architecture-lab-domain/aggregates/WorkItem"

console.log(WorkItemInvalidTransition)
```

**Signature**

```ts
declare class WorkItemInvalidTransition
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/domain/src/aggregates/WorkItem/WorkItem.errors.ts#L53)

Since v0.0.0

### fromStatus (static method)

Create a typed WorkItem transition failure from lifecycle values.

**Signature**

```ts
declare const fromStatus: (input: { readonly workItemId: WorkItemId; readonly from: WorkItemStatus; readonly to: WorkItemStatus; }) => WorkItemInvalidTransition
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/domain/src/aggregates/WorkItem/WorkItem.errors.ts#L73)

Since v0.0.0