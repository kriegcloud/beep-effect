---
title: CanvasProject.use-cases.ts
nav_order: 5
parent: "@beep/canvas-use-cases"
---

## CanvasProject.use-cases.ts overview

CanvasProject use-case service.

Since v0.0.0

---
## Exports Grouped by Category
- [use-cases](#use-cases)
  - [CanvasProjectUseCases (class)](#canvasprojectusecases-class)
  - [CanvasProjectUseCasesShape (interface)](#canvasprojectusecasesshape-interface)
---

# use-cases

## CanvasProjectUseCases (class)

Public CanvasProject use-case service.

**Example**

```ts
import { CanvasProject } from "@beep/canvas-use-cases/public"

console.log(CanvasProject.CanvasProjectUseCases)
```

**Signature**

```ts
declare class CanvasProjectUseCases
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/canvas/use-cases/src/aggregates/CanvasProject/CanvasProject.use-cases.ts#L78)

Since v0.0.0

## CanvasProjectUseCasesShape (interface)

Public CanvasProject use-case contract.

**Example**

```ts
import type { CanvasProject as CanvasProjectUseCases } from "@beep/canvas-use-cases/public"

declare const useCases: CanvasProjectUseCases.CanvasProjectUseCasesShape
const restore = useCases.restore
console.log(typeof restore)
```

**Signature**

```ts
export interface CanvasProjectUseCasesShape {
  readonly addNode: (
    command: AddCanvasNodeCommand
  ) => Effect.Effect<DomainCanvasProject.CanvasProject, CanvasProjectActionError>;
  readonly archive: (
    command: ArchiveCanvasProjectCommand
  ) => Effect.Effect<DomainCanvasProject.CanvasProject, CanvasProjectActionError>;
  readonly create: (
    command: CreateCanvasProjectCommand
  ) => Effect.Effect<DomainCanvasProject.CanvasProject, CanvasProjectActionError>;
  readonly get: (
    query: GetCanvasProjectQuery
  ) => Effect.Effect<DomainCanvasProject.CanvasProject, CanvasProjectActionError>;
  readonly list: (
    query: ListCanvasProjectsQuery
  ) => Effect.Effect<ReadonlyArray<DomainCanvasProject.CanvasProject>, CanvasProjectActionError>;
  readonly removeNode: (
    command: RemoveCanvasNodeCommand
  ) => Effect.Effect<DomainCanvasProject.CanvasProject, CanvasProjectActionError>;
  readonly restore: (
    command: RestoreCanvasProjectCommand
  ) => Effect.Effect<DomainCanvasProject.CanvasProject, CanvasProjectActionError>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/canvas/use-cases/src/aggregates/CanvasProject/CanvasProject.use-cases.ts#L41)

Since v0.0.0