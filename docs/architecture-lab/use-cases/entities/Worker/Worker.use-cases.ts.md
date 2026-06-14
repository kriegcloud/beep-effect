---
title: Worker.use-cases.ts
nav_order: 15
parent: "@beep/architecture-lab-use-cases"
---

## Worker.use-cases.ts overview

Worker use-case service.

Since v0.0.0

---
## Exports Grouped by Category
- [use-cases](#use-cases)
  - [WorkerUseCases (class)](#workerusecases-class)
  - [WorkerUseCasesShape (interface)](#workerusecasesshape-interface)
---

# use-cases

## WorkerUseCases (class)

Public Worker use-case service.

**Example**

```ts
import { WorkerUseCases } from "@beep/architecture-lab-use-cases/entities/Worker"

console.log(WorkerUseCases)
```

**Signature**

```ts
declare class WorkerUseCases
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/use-cases/src/entities/Worker/Worker.use-cases.ts#L51)

Since v0.0.0

## WorkerUseCasesShape (interface)

Public Worker use-case contract.

**Example**

```ts
import type { WorkerUseCasesShape } from "@beep/architecture-lab-use-cases/entities/Worker"

const value = {} as WorkerUseCasesShape
console.log(value)
```

**Signature**

```ts
export interface WorkerUseCasesShape {
  readonly create: (command: CreateWorkerCommand) => Effect.Effect<DomainWorker.Worker, WorkerActionError>;
  readonly get: (query: GetWorkerQuery) => Effect.Effect<DomainWorker.Worker, WorkerActionError>;
  readonly list: (query: ListWorkersQuery) => Effect.Effect<ReadonlyArray<DomainWorker.Worker>, WorkerActionError>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/use-cases/src/entities/Worker/Worker.use-cases.ts#L32)

Since v0.0.0