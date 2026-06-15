---
title: WorkItem.http.ts
nav_order: 2
parent: "@beep/architecture-lab-server"
---

## WorkItem.http.ts overview

WorkItem HTTP handlers.

Since v0.0.0

---
## Exports Grouped by Category
- [handlers](#handlers)
  - [WorkItemHttpResponse (class)](#workitemhttpresponse-class)
  - [WorkItemHttpStatus](#workitemhttpstatus)
  - [WorkItemHttpStatus (type alias)](#workitemhttpstatus-type-alias)
  - [makeWorkItemHttpHandlers](#makeworkitemhttphandlers)
  - [toWorkItemHttpError](#toworkitemhttperror)
---

# handlers

## WorkItemHttpResponse (class)

Minimal HTTP response envelope used by the architecture lab proof.

**Example**

```ts
import { WorkItemHttpResponse } from "@beep/architecture-lab-server/aggregates/WorkItem"

console.log(WorkItemHttpResponse)
```

**Signature**

```ts
declare class WorkItemHttpResponse
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/server/src/aggregates/WorkItem/WorkItem.http.ts#L65)

Since v0.0.0

## WorkItemHttpStatus

HTTP status values emitted by the WorkItem proof protocol adapter.

**Example**

```ts
import { WorkItemHttpStatus } from "@beep/architecture-lab-server/aggregates/WorkItem"

console.log(WorkItemHttpStatus)
```

**Signature**

```ts
declare const WorkItemHttpStatus: AnnotatedSchema<LiteralKit<readonly [200, 201, 404, 409, 422, 503], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/server/src/aggregates/WorkItem/WorkItem.http.ts#L37)

Since v0.0.0

## WorkItemHttpStatus (type alias)

Runtime type for `WorkItemHttpStatus`.

**Signature**

```ts
type WorkItemHttpStatus = typeof WorkItemHttpStatus.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/server/src/aggregates/WorkItem/WorkItem.http.ts#L50)

Since v0.0.0

## makeWorkItemHttpHandlers

Build HTTP-style WorkItem handlers from the public use-case facade.

**Example**

```ts
import { makeWorkItemHttpHandlers } from "@beep/architecture-lab-server/aggregates/WorkItem"

console.log(makeWorkItemHttpHandlers)
```

**Signature**

```ts
declare const makeWorkItemHttpHandlers: (useCases: WorkItemUseCases.WorkItemUseCasesShape) => { create: (command: WorkItemUseCases.CreateWorkItemCommand) => Effect.Effect<WorkItemHttpResponse>; get: (query: WorkItemUseCases.GetWorkItemQuery) => Effect.Effect<WorkItemHttpResponse>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/server/src/aggregates/WorkItem/WorkItem.http.ts#L120)

Since v0.0.0

## toWorkItemHttpError

Convert a public WorkItem failure to an HTTP response envelope.

**Example**

```ts
import { toWorkItemHttpError } from "@beep/architecture-lab-server/aggregates/WorkItem"

console.log(toWorkItemHttpError)
```

**Signature**

```ts
declare const toWorkItemHttpError: (error: WorkItemUseCases.WorkItemActionError) => WorkItemHttpResponse
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/server/src/aggregates/WorkItem/WorkItem.http.ts#L89)

Since v0.0.0