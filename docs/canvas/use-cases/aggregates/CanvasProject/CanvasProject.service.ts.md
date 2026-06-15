---
title: CanvasProject.service.ts
nav_order: 4
parent: "@beep/canvas-use-cases"
---

## CanvasProject.service.ts overview

CanvasProject server-side use-case implementation.

Since v0.0.0

---
## Exports Grouped by Category
- [use-cases](#use-cases)
  - [makeCanvasProjectUseCases](#makecanvasprojectusecases)
  - [toCanvasProjectActionError](#tocanvasprojectactionerror)
---

# use-cases

## makeCanvasProjectUseCases

Build CanvasProject use-cases from the server repository port.

**Example**

```ts
import { CanvasProject as CanvasProjectServer } from "@beep/canvas-use-cases/server"

declare const repository: CanvasProjectServer.CanvasProjectRepositoryShape
const useCases = CanvasProjectServer.makeCanvasProjectUseCases(repository)
console.log(Object.keys(useCases))
```

**Signature**

```ts
declare const makeCanvasProjectUseCases: (repository: CanvasProjectRepositoryShape) => CanvasProjectUseCasesShape
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/canvas/use-cases/src/aggregates/CanvasProject/CanvasProject.service.ts#L107)

Since v0.0.0

## toCanvasProjectActionError

Translate server and aggregate failures to public action failures.

**Example**

```ts
import { CanvasProject as CanvasProjectServer } from "@beep/canvas-use-cases/server"

const error = CanvasProjectServer.toCanvasProjectActionError(
  CanvasProjectServer.CanvasProjectRepositoryUnavailable.make({ reason: "offline" })
)
console.log(error._tag)
```

**Signature**

```ts
declare const toCanvasProjectActionError: (error: CanvasProjectRepositoryError | DomainCanvasProject.CanvasProjectDomainError) => CanvasProjectActionError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/canvas/use-cases/src/aggregates/CanvasProject/CanvasProject.service.ts#L59)

Since v0.0.0