---
title: WorkItem.layer.ts
nav_order: 3
parent: "@beep/architecture-lab-server"
---

## WorkItem.layer.ts overview

WorkItem server layer.

Since v0.0.0

---
## Exports Grouped by Category
- [layers](#layers)
  - [WorkItemServer (class)](#workitemserver-class)
  - [WorkItemServerLayer](#workitemserverlayer)
  - [makeWorkItemServer](#makeworkitemserver)
---

# layers

## WorkItemServer (class)

WorkItem server facade service.

**Example**

```ts
import { WorkItemServer } from "@beep/architecture-lab-server/aggregates/WorkItem"

console.log(WorkItemServer)
```

**Signature**

```ts
declare class WorkItemServer
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/server/src/aggregates/WorkItem/WorkItem.layer.ts#L48)

Since v0.0.0

## WorkItemServerLayer

Config-dependent WorkItem server layer.

**Example**

```ts
import { WorkItemServerLayer } from "@beep/architecture-lab-server/aggregates/WorkItem"

console.log(WorkItemServerLayer)
```

**Signature**

```ts
declare const WorkItemServerLayer: Layer.Layer<WorkItemServer, never, WorkItemConfig>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/server/src/aggregates/WorkItem/WorkItem.layer.ts#L65)

Since v0.0.0

## makeWorkItemServer

Build the WorkItem server facade.

**Example**

```ts
import { makeWorkItemServer } from "@beep/architecture-lab-server/aggregates/WorkItem"

console.log(makeWorkItemServer)
```

**Signature**

```ts
declare const makeWorkItemServer: () => Effect.Effect<WorkItemUseCaseServer.WorkItem.WorkItemUseCasesShape, never, WorkItemConfig>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/server/src/aggregates/WorkItem/WorkItem.layer.ts#L30)

Since v0.0.0