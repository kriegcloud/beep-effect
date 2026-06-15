---
title: CanvasProject.rpc.ts
nav_order: 4
parent: "@beep/canvas-server"
---

## CanvasProject.rpc.ts overview

CanvasProject RPC handlers.

Since v0.0.0

---
## Exports Grouped by Category
- [handlers](#handlers)
  - [makeCanvasProjectRpcHandlers](#makecanvasprojectrpchandlers)
---

# handlers

## makeCanvasProjectRpcHandlers

Build RPC-style CanvasProject handlers from the public use-case facade.

**Example**

```ts
import { CanvasProject } from "@beep/canvas-server"
import type { CanvasProject as CanvasProjectUseCases } from "@beep/canvas-use-cases/public"

declare const useCases: CanvasProjectUseCases.CanvasProjectUseCasesShape
const handlers = CanvasProject.makeCanvasProjectRpcHandlers(useCases)
console.log(handlers.restoreCanvasProject)
```

**Signature**

```ts
declare const makeCanvasProjectRpcHandlers: (useCases: CanvasProjectUseCases.CanvasProjectUseCasesShape) => { addCanvasNode: (command: CanvasProjectUseCases.AddCanvasNodeCommand) => Effect<CanvasProject, CanvasProjectUseCases.CanvasProjectActionError>; archiveCanvasProject: (command: CanvasProjectUseCases.ArchiveCanvasProjectCommand) => Effect<CanvasProject, CanvasProjectUseCases.CanvasProjectActionError>; createCanvasProject: (command: CanvasProjectUseCases.CreateCanvasProjectCommand) => Effect<CanvasProject, CanvasProjectUseCases.CanvasProjectActionError>; getCanvasProject: (query: CanvasProjectUseCases.GetCanvasProjectQuery) => Effect<CanvasProject, CanvasProjectUseCases.CanvasProjectActionError>; listCanvasProjects: (query: CanvasProjectUseCases.ListCanvasProjectsQuery) => Effect<ReadonlyArray<CanvasProject>, CanvasProjectUseCases.CanvasProjectActionError>; removeCanvasNode: (command: CanvasProjectUseCases.RemoveCanvasNodeCommand) => Effect<CanvasProject, CanvasProjectUseCases.CanvasProjectActionError>; restoreCanvasProject: (command: CanvasProjectUseCases.RestoreCanvasProjectCommand) => Effect<CanvasProject, CanvasProjectUseCases.CanvasProjectActionError>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/canvas/server/src/aggregates/CanvasProject/CanvasProject.rpc.ts#L27)

Since v0.0.0