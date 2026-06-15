---
title: CanvasProject.tools.ts
nav_order: 5
parent: "@beep/canvas-server"
---

## CanvasProject.tools.ts overview

CanvasProject tool handlers.

Since v0.0.0

---
## Exports Grouped by Category
- [tools](#tools)
  - [CanvasProjectToolNames](#canvasprojecttoolnames)
  - [makeCanvasProjectToolHandlers](#makecanvasprojecttoolhandlers)
---

# tools

## CanvasProjectToolNames

CanvasProject tool names exposed by the canvas bootstrap proof.

**Example**

```ts
import { CanvasProject } from "@beep/canvas-server"

console.log(CanvasProject.CanvasProjectToolNames.restore)
```

**Signature**

```ts
declare const CanvasProjectToolNames: { readonly addNode: "canvas.project.node.add"; readonly archive: "canvas.project.archive"; readonly create: "canvas.project.create"; readonly get: "canvas.project.get"; readonly list: "canvas.project.list"; readonly removeNode: "canvas.project.node.remove"; readonly restore: "canvas.project.restore"; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/canvas/server/src/aggregates/CanvasProject/CanvasProject.tools.ts#L24)

Since v0.0.0

## makeCanvasProjectToolHandlers

Build tool-style CanvasProject handlers from the public use-case facade.

**Example**

```ts
import { CanvasProject } from "@beep/canvas-server"
import type { CanvasProject as CanvasProjectUseCases } from "@beep/canvas-use-cases/public"

declare const useCases: CanvasProjectUseCases.CanvasProjectUseCasesShape
const handlers = CanvasProject.makeCanvasProjectToolHandlers(useCases)
console.log(handlers[CanvasProject.CanvasProjectToolNames.restore])
```

**Signature**

```ts
declare const makeCanvasProjectToolHandlers: (useCases: CanvasProjectUseCases.CanvasProjectUseCasesShape) => { "canvas.project.node.add": (command: CanvasProjectUseCases.AddCanvasNodeCommand) => Effect<CanvasProject, CanvasProjectUseCases.CanvasProjectActionError>; "canvas.project.archive": (command: CanvasProjectUseCases.ArchiveCanvasProjectCommand) => Effect<CanvasProject, CanvasProjectUseCases.CanvasProjectActionError>; "canvas.project.create": (command: CanvasProjectUseCases.CreateCanvasProjectCommand) => Effect<CanvasProject, CanvasProjectUseCases.CanvasProjectActionError>; "canvas.project.get": (query: CanvasProjectUseCases.GetCanvasProjectQuery) => Effect<CanvasProject, CanvasProjectUseCases.CanvasProjectActionError>; "canvas.project.list": (query: CanvasProjectUseCases.ListCanvasProjectsQuery) => Effect<ReadonlyArray<CanvasProject>, CanvasProjectUseCases.CanvasProjectActionError>; "canvas.project.node.remove": (command: CanvasProjectUseCases.RemoveCanvasNodeCommand) => Effect<CanvasProject, CanvasProjectUseCases.CanvasProjectActionError>; "canvas.project.restore": (command: CanvasProjectUseCases.RestoreCanvasProjectCommand) => Effect<CanvasProject, CanvasProjectUseCases.CanvasProjectActionError>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/canvas/server/src/aggregates/CanvasProject/CanvasProject.tools.ts#L50)

Since v0.0.0