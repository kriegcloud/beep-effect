---
title: Worker.service.ts
nav_order: 14
parent: "@beep/architecture-lab-use-cases"
---

## Worker.service.ts overview

Worker server-side use-case implementation.

Since v0.0.0

---
## Exports Grouped by Category
- [use-cases](#use-cases)
  - [makeWorkerUseCases](#makeworkerusecases)
  - [toWorkerActionError](#toworkeractionerror)
---

# use-cases

## makeWorkerUseCases

Build Worker use-cases from the server repository port.

**Example**

```ts
import { makeWorkerUseCases } from "@beep/architecture-lab-use-cases/entities/Worker/server"

console.log(makeWorkerUseCases)
```

**Signature**

```ts
declare const makeWorkerUseCases: (repository: WorkerRepositoryShape) => WorkerUseCasesShape
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/use-cases/src/entities/Worker/Worker.service.ts#L73)

Since v0.0.0

## toWorkerActionError

Translate repository failures to public Worker action failures.

**Example**

```ts
import { toWorkerActionError } from "@beep/architecture-lab-use-cases/entities/Worker/server"

console.log(toWorkerActionError)
```

**Signature**

```ts
declare const toWorkerActionError: (error: WorkerRepositoryError) => WorkerActionError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/use-cases/src/entities/Worker/Worker.service.ts#L47)

Since v0.0.0