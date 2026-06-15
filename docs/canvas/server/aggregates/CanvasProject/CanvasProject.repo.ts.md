---
title: CanvasProject.repo.ts
nav_order: 3
parent: "@beep/canvas-server"
---

## CanvasProject.repo.ts overview

CanvasProject repository adapter.

Since v0.0.0

---
## Exports Grouped by Category
- [repositories](#repositories)
  - [makeCanvasProjectRepository](#makecanvasprojectrepository)
  - [makeInMemoryCanvasProjectRepository](#makeinmemorycanvasprojectrepository)
---

# repositories

## makeCanvasProjectRepository

Build the default CanvasProject repository for normal slice tests.

**Example**

```ts
import { makeCanvasProjectRepository } from "@beep/canvas-server/aggregates/CanvasProject"

console.log(makeCanvasProjectRepository)
```

**Signature**

```ts
declare const makeCanvasProjectRepository: () => Effect.Effect<CanvasProjectUseCaseServer.CanvasProject.CanvasProjectRepositoryShape, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/canvas/server/src/aggregates/CanvasProject/CanvasProject.repo.ts#L97)

Since v0.0.0

## makeInMemoryCanvasProjectRepository

Build the in-memory CanvasProject repository used by the fast canvas proof.

**Example**

```ts
import { makeInMemoryCanvasProjectRepository } from "@beep/canvas-server/aggregates/CanvasProject"

console.log(makeInMemoryCanvasProjectRepository)
```

**Signature**

```ts
declare const makeInMemoryCanvasProjectRepository: () => Effect.Effect<CanvasProjectUseCaseServer.CanvasProject.CanvasProjectRepositoryShape, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/canvas/server/src/aggregates/CanvasProject/CanvasProject.repo.ts#L46)

Since v0.0.0