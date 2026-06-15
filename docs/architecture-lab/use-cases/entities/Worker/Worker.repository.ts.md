---
title: Worker.repository.ts
nav_order: 13
parent: "@beep/architecture-lab-use-cases"
---

## Worker.repository.ts overview

Worker repository port.

Since v0.0.0

---
## Exports Grouped by Category
- [repositories](#repositories)
  - [WorkerRepository (class)](#workerrepository-class)
  - [WorkerRepositoryConflict (class)](#workerrepositoryconflict-class)
  - [WorkerRepositoryError (type alias)](#workerrepositoryerror-type-alias)
  - [WorkerRepositoryNotFound (class)](#workerrepositorynotfound-class)
  - [WorkerRepositoryShape (interface)](#workerrepositoryshape-interface)
  - [WorkerRepositoryUnavailable (class)](#workerrepositoryunavailable-class)
---

# repositories

## WorkerRepository (class)

Worker repository service.

**Example**

```ts
import { WorkerRepository } from "@beep/architecture-lab-use-cases/entities/Worker/server"

console.log(WorkerRepository)
```

**Signature**

```ts
declare class WorkerRepository
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/use-cases/src/entities/Worker/Worker.repository.ts#L146)

Since v0.0.0

## WorkerRepositoryConflict (class)

Persistence failure raised when a Worker write conflicts.

**Example**

```ts
import { WorkerRepositoryConflict } from "@beep/architecture-lab-use-cases/entities/Worker/server"

console.log(WorkerRepositoryConflict)
```

**Signature**

```ts
declare class WorkerRepositoryConflict
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/use-cases/src/entities/Worker/Worker.repository.ts#L55)

Since v0.0.0

## WorkerRepositoryError (type alias)

Worker repository failure.

**Example**

```ts
import type { WorkerRepositoryError } from "@beep/architecture-lab-use-cases/entities/Worker/server"

const value = {} as WorkerRepositoryError
console.log(value)
```

**Signature**

```ts
type WorkerRepositoryError = WorkerRepositoryNotFound | WorkerRepositoryConflict | WorkerRepositoryUnavailable
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/use-cases/src/entities/Worker/Worker.repository.ts#L107)

Since v0.0.0

## WorkerRepositoryNotFound (class)

Persistence failure raised when a Worker row is absent.

**Example**

```ts
import { WorkerRepositoryNotFound } from "@beep/architecture-lab-use-cases/entities/Worker/server"

console.log(WorkerRepositoryNotFound)
```

**Signature**

```ts
declare class WorkerRepositoryNotFound
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/use-cases/src/entities/Worker/Worker.repository.ts#L31)

Since v0.0.0

## WorkerRepositoryShape (interface)

Worker repository contract.

**Example**

```ts
import type { WorkerRepositoryShape } from "@beep/architecture-lab-use-cases/entities/Worker/server"

const value = {} as WorkerRepositoryShape
console.log(value)
```

**Signature**

```ts
export interface WorkerRepositoryShape {
  readonly create: (
    worker: DomainWorker.Worker
  ) => Effect.Effect<DomainWorker.Worker, WorkerRepositoryConflict | WorkerRepositoryUnavailable>;
  readonly get: (
    id: DomainWorker.WorkerId
  ) => Effect.Effect<DomainWorker.Worker, WorkerRepositoryNotFound | WorkerRepositoryUnavailable>;
  readonly list: Effect.Effect<ReadonlyArray<DomainWorker.Worker>, WorkerRepositoryUnavailable>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/use-cases/src/entities/Worker/Worker.repository.ts#L123)

Since v0.0.0

## WorkerRepositoryUnavailable (class)

Persistence failure raised when the Worker repository is unavailable.

**Example**

```ts
import { WorkerRepositoryUnavailable } from "@beep/architecture-lab-use-cases/entities/Worker/server"

console.log(WorkerRepositoryUnavailable)
```

**Signature**

```ts
declare class WorkerRepositoryUnavailable
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/use-cases/src/entities/Worker/Worker.repository.ts#L80)

Since v0.0.0