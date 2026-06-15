---
title: Worker.layer.ts
nav_order: 9
parent: "@beep/architecture-lab-server"
---

## Worker.layer.ts overview

Worker server layer.

Since v0.0.0

---
## Exports Grouped by Category
- [layers](#layers)
  - [WorkerServer (class)](#workerserver-class)
  - [WorkerServerLayer](#workerserverlayer)
  - [makeWorkerServer](#makeworkerserver)
---

# layers

## WorkerServer (class)

Worker server facade service.

**Example**

```ts
import { WorkerServer } from "@beep/architecture-lab-server/entities/Worker"

console.log(WorkerServer)
```

**Signature**

```ts
declare class WorkerServer
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/server/src/entities/Worker/Worker.layer.ts#L48)

Since v0.0.0

## WorkerServerLayer

Worker server layer.

**Example**

```ts
import { WorkerServerLayer } from "@beep/architecture-lab-server/entities/Worker"

console.log(WorkerServerLayer)
```

**Signature**

```ts
declare const WorkerServerLayer: Layer.Layer<WorkerServer, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/server/src/entities/Worker/Worker.layer.ts#L65)

Since v0.0.0

## makeWorkerServer

Build the Worker server facade.

**Example**

```ts
import { makeWorkerServer } from "@beep/architecture-lab-server/entities/Worker"

console.log(makeWorkerServer)
```

**Signature**

```ts
declare const makeWorkerServer: () => Effect.Effect<WorkerUseCaseServer.Worker.WorkerUseCasesShape, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/server/src/entities/Worker/Worker.layer.ts#L30)

Since v0.0.0