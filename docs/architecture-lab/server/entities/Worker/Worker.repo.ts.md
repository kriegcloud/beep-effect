---
title: Worker.repo.ts
nav_order: 10
parent: "@beep/architecture-lab-server"
---

## Worker.repo.ts overview

Worker repository adapter.

Since v0.0.0

---
## Exports Grouped by Category
- [repositories](#repositories)
  - [makeDrizzleWorkerRepository](#makedrizzleworkerrepository)
  - [makeInMemoryWorkerRepository](#makeinmemoryworkerrepository)
  - [makeWorkerRepository](#makeworkerrepository)
---

# repositories

## makeDrizzleWorkerRepository

Build a Drizzle-backed Worker repository used by live persistence tests.

**Example**

```ts
import { makeDrizzleWorkerRepository } from "@beep/architecture-lab-server/entities/Worker"

console.log(makeDrizzleWorkerRepository)
```

**Signature**

```ts
declare const makeDrizzleWorkerRepository: () => Effect.Effect<WorkerUseCaseServer.Worker.WorkerRepositoryShape, never, PostgresDrizzle>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/server/src/entities/Worker/Worker.repo.ts#L132)

Since v0.0.0

## makeInMemoryWorkerRepository

Build the in-memory Worker repository used by the fast architecture lab proof.

**Example**

```ts
import { makeInMemoryWorkerRepository } from "@beep/architecture-lab-server/entities/Worker"

console.log(makeInMemoryWorkerRepository)
```

**Signature**

```ts
declare const makeInMemoryWorkerRepository: () => Effect.Effect<WorkerUseCaseServer.Worker.WorkerRepositoryShape, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/server/src/entities/Worker/Worker.repo.ts#L51)

Since v0.0.0

## makeWorkerRepository

Build the default Worker repository for normal slice tests.

**Example**

```ts
import { makeWorkerRepository } from "@beep/architecture-lab-server/entities/Worker"

console.log(makeWorkerRepository)
```

**Signature**

```ts
declare const makeWorkerRepository: () => Effect.Effect<WorkerUseCaseServer.Worker.WorkerRepositoryShape, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/server/src/entities/Worker/Worker.repo.ts#L181)

Since v0.0.0