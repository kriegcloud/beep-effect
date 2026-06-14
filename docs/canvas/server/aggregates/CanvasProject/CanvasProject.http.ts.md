---
title: CanvasProject.http.ts
nav_order: 1
parent: "@beep/canvas-server"
---

## CanvasProject.http.ts overview

CanvasProject HTTP handlers.

Since v0.0.0

---
## Exports Grouped by Category
- [handlers](#handlers)
  - [CanvasProjectHttpResponse (class)](#canvasprojecthttpresponse-class)
  - [CanvasProjectHttpStatus](#canvasprojecthttpstatus)
  - [CanvasProjectHttpStatus (type alias)](#canvasprojecthttpstatus-type-alias)
  - [makeCanvasProjectHttpHandlers](#makecanvasprojecthttphandlers)
  - [toCanvasProjectHttpError](#tocanvasprojecthttperror)
---

# handlers

## CanvasProjectHttpResponse (class)

Minimal HTTP response envelope used by the canvas bootstrap proof.

**Example**

```ts
import { CanvasProject } from "@beep/canvas-server"

const response = CanvasProject.CanvasProjectHttpResponse.make({ status: 200, body: { ok: true } })
console.log(response.status)
```

**Signature**

```ts
declare class CanvasProjectHttpResponse
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/canvas/server/src/aggregates/CanvasProject/CanvasProject.http.ts#L69)

Since v0.0.0

## CanvasProjectHttpStatus

HTTP status values emitted by the CanvasProject bootstrap adapter.

**Example**

```ts
import { CanvasProject } from "@beep/canvas-server"
import * as S from "effect/Schema"

const decodeStatus = S.decodeUnknownEffect(CanvasProject.CanvasProjectHttpStatus)
```

**Signature**

```ts
declare const CanvasProjectHttpStatus: AnnotatedSchema<LiteralKit<readonly [200, 201, 404, 409, 422, 503], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/canvas/server/src/aggregates/CanvasProject/CanvasProject.http.ts#L32)

Since v0.0.0

## CanvasProjectHttpStatus (type alias)

Runtime type for `CanvasProjectHttpStatus`.

**Example**

```ts
import type { CanvasProject } from "@beep/canvas-server"

const status: CanvasProject.CanvasProjectHttpStatus = 200
console.log(status)
```

**Signature**

```ts
type CanvasProjectHttpStatus = typeof CanvasProjectHttpStatus.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/canvas/server/src/aggregates/CanvasProject/CanvasProject.http.ts#L53)

Since v0.0.0

## makeCanvasProjectHttpHandlers

Build HTTP-style CanvasProject handlers from the public use-case facade.

**Example**

```ts
import { CanvasProject } from "@beep/canvas-server"
import type { CanvasProject as CanvasProjectUseCases } from "@beep/canvas-use-cases/public"

declare const useCases: CanvasProjectUseCases.CanvasProjectUseCasesShape
const handlers = CanvasProject.makeCanvasProjectHttpHandlers(useCases)
console.log(Object.keys(handlers))
```

**Signature**

```ts
declare const makeCanvasProjectHttpHandlers: (useCases: CanvasProjectUseCases.CanvasProjectUseCasesShape) => { addNode: (command: CanvasProjectUseCases.AddCanvasNodeCommand) => Effect.Effect<CanvasProjectHttpResponse, never, never>; archive: (command: CanvasProjectUseCases.ArchiveCanvasProjectCommand) => Effect.Effect<CanvasProjectHttpResponse, never, never>; create: (command: CanvasProjectUseCases.CreateCanvasProjectCommand) => Effect.Effect<CanvasProjectHttpResponse, never, never>; get: (query: CanvasProjectUseCases.GetCanvasProjectQuery) => Effect.Effect<CanvasProjectHttpResponse, never, never>; list: (query: CanvasProjectUseCases.ListCanvasProjectsQuery) => Effect.Effect<CanvasProjectHttpResponse, never, never>; removeNode: (command: CanvasProjectUseCases.RemoveCanvasNodeCommand) => Effect.Effect<CanvasProjectHttpResponse, never, never>; restore: (command: CanvasProjectUseCases.RestoreCanvasProjectCommand) => Effect.Effect<CanvasProjectHttpResponse, never, never>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/canvas/server/src/aggregates/CanvasProject/CanvasProject.http.ts#L151)

Since v0.0.0

## toCanvasProjectHttpError

Convert a public CanvasProject failure to an HTTP response envelope.

**Example**

```ts
import { CanvasProject } from "@beep/canvas-server"
import { CanvasProject as CanvasProjectUseCases } from "@beep/canvas-use-cases/public"

const response = CanvasProject.toCanvasProjectHttpError(
  CanvasProjectUseCases.CanvasProjectActionFailed.make({
    reason: CanvasProjectUseCases.CANVAS_PROJECT_ACTION_UNAVAILABLE_REASON,
  })
)
console.log(response.status)
```

**Signature**

```ts
declare const toCanvasProjectHttpError: (input: CanvasProjectUseCases.CanvasProjectActionError) => CanvasProjectHttpResponse
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/canvas/server/src/aggregates/CanvasProject/CanvasProject.http.ts#L126)

Since v0.0.0