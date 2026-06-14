---
title: WorkItem.errors.ts
nav_order: 4
parent: "@beep/architecture-lab-use-cases"
---

## WorkItem.errors.ts overview

WorkItem use-case errors.

Since v0.0.0

---
## Exports Grouped by Category
- [errors](#errors)
  - [WORK_ITEM_ACTION_UNAVAILABLE_REASON](#work_item_action_unavailable_reason)
  - [WorkItemActionError](#workitemactionerror)
  - [WorkItemActionError (type alias)](#workitemactionerror-type-alias)
  - [WorkItemActionFailed (class)](#workitemactionfailed-class)
  - [WorkItemActionRejected (class)](#workitemactionrejected-class)
  - [WorkItemConflict (class)](#workitemconflict-class)
  - [WorkItemNotFound (class)](#workitemnotfound-class)
---

# errors

## WORK_ITEM_ACTION_UNAVAILABLE_REASON

Generic public reason used when internal WorkItem repository details are redacted.

**Example**

```ts
import { WORK_ITEM_ACTION_UNAVAILABLE_REASON } from "@beep/architecture-lab-use-cases/aggregates/WorkItem"

console.log(WORK_ITEM_ACTION_UNAVAILABLE_REASON)
```

**Signature**

```ts
declare const WORK_ITEM_ACTION_UNAVAILABLE_REASON: "WorkItem service is unavailable."
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/use-cases/src/aggregates/WorkItem/WorkItem.errors.ts#L29)

Since v0.0.0

## WorkItemActionError

Public WorkItem use-case failure schema.

**Example**

```ts
import { WorkItemActionError } from "@beep/architecture-lab-use-cases/aggregates/WorkItem"

console.log(WorkItemActionError)
```

**Signature**

```ts
declare const WorkItemActionError: S.Union<readonly [typeof WorkItemNotFound, typeof WorkItemConflict, typeof WorkItemActionRejected, typeof WorkItemActionFailed]>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/use-cases/src/aggregates/WorkItem/WorkItem.errors.ts#L158)

Since v0.0.0

## WorkItemActionError (type alias)

Public WorkItem use-case failure.

**Example**

```ts
import type { WorkItemActionError } from "@beep/architecture-lab-use-cases/aggregates/WorkItem"

const value = {} as WorkItemActionError
console.log(value)
```

**Signature**

```ts
type WorkItemActionError = WorkItemNotFound | WorkItemConflict | WorkItemActionRejected | WorkItemActionFailed
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/use-cases/src/aggregates/WorkItem/WorkItem.errors.ts#L143)

Since v0.0.0

## WorkItemActionFailed (class)

Public failure raised when an action cannot be completed.

**Example**

```ts
import { WorkItemActionFailed } from "@beep/architecture-lab-use-cases/aggregates/WorkItem"

console.log(WorkItemActionFailed)
```

**Signature**

```ts
declare class WorkItemActionFailed
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/use-cases/src/aggregates/WorkItem/WorkItem.errors.ts#L118)

Since v0.0.0

## WorkItemActionRejected (class)

Public failure raised when the domain rejects a WorkItem action.

**Example**

```ts
import { WorkItemActionRejected } from "@beep/architecture-lab-use-cases/aggregates/WorkItem"

console.log(WorkItemActionRejected)
```

**Signature**

```ts
declare class WorkItemActionRejected
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/use-cases/src/aggregates/WorkItem/WorkItem.errors.ts#L93)

Since v0.0.0

## WorkItemConflict (class)

Public failure raised when a command conflicts with persisted state.

**Example**

```ts
import { WorkItemConflict } from "@beep/architecture-lab-use-cases/aggregates/WorkItem"

console.log(WorkItemConflict)
```

**Signature**

```ts
declare class WorkItemConflict
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/use-cases/src/aggregates/WorkItem/WorkItem.errors.ts#L68)

Since v0.0.0

## WorkItemNotFound (class)

Public failure raised when a requested WorkItem is absent.

**Example**

```ts
import { WorkItemNotFound } from "@beep/architecture-lab-use-cases/aggregates/WorkItem"

console.log(WorkItemNotFound)
```

**Signature**

```ts
declare class WorkItemNotFound
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/use-cases/src/aggregates/WorkItem/WorkItem.errors.ts#L44)

Since v0.0.0