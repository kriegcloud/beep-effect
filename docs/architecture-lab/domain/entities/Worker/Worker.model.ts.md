---
title: Worker.model.ts
nav_order: 8
parent: "@beep/architecture-lab-domain"
---

## Worker.model.ts overview

Worker entity model.

Since v0.0.0

---
## Exports Grouped by Category
- [entities](#entities)
  - [CreateWorkerInput (class)](#createworkerinput-class)
  - [Worker (class)](#worker-class)
  - [WorkerId](#workerid)
  - [WorkerId (type alias)](#workerid-type-alias)
  - [WorkerOrganizationId](#workerorganizationid)
  - [WorkerOrganizationId (type alias)](#workerorganizationid-type-alias)
  - [WorkerStatus](#workerstatus)
  - [WorkerStatus (type alias)](#workerstatus-type-alias)
  - [create](#create)
---

# entities

## CreateWorkerInput (class)

Worker creation input.

**Example**

```ts
import { CreateWorkerInput } from "@beep/architecture-lab-domain/entities/Worker"

console.log(CreateWorkerInput)
```

**Signature**

```ts
declare class CreateWorkerInput
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/domain/src/entities/Worker/Worker.model.ts#L142)

Since v0.0.0

## Worker (class)

Architecture lab Worker entity.

**Example**

```ts
import { Worker } from "@beep/architecture-lab-domain/entities/Worker"

console.log(Worker)
```

**Signature**

```ts
declare class Worker
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/domain/src/entities/Worker/Worker.model.ts#L107)

Since v0.0.0

## WorkerId

Architecture lab Worker identifier.

**Example**

```ts
import { WorkerId } from "@beep/architecture-lab-domain/entities/Worker"

console.log(WorkerId)
```

**Signature**

```ts
declare const WorkerId: EntityId<"architecture_lab", "worker", "architecture_lab_worker", "architecture_lab.worker", "ArchitectureLabWorker", "ArchitectureLabWorkerId">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/domain/src/entities/Worker/Worker.model.ts#L33)

Since v0.0.0

## WorkerId (type alias)

Runtime type for `WorkerId`.

**Signature**

```ts
type WorkerId = typeof WorkerId.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/domain/src/entities/Worker/Worker.model.ts#L41)

Since v0.0.0

## WorkerOrganizationId

Organization identity used by the Worker proof entity.

**Example**

```ts
import { WorkerOrganizationId } from "@beep/architecture-lab-domain/entities/Worker"

console.log(WorkerOrganizationId)
```

**Signature**

```ts
declare const WorkerOrganizationId: EntityId<"shared", "organization", "shared_organization", "shared.organization", "SharedOrganization", "SharedOrganizationId">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/domain/src/entities/Worker/Worker.model.ts#L56)

Since v0.0.0

## WorkerOrganizationId (type alias)

Runtime type for `WorkerOrganizationId`.

**Signature**

```ts
type WorkerOrganizationId = typeof WorkerOrganizationId.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/domain/src/entities/Worker/Worker.model.ts#L64)

Since v0.0.0

## WorkerStatus

Worker lifecycle status.

**Example**

```ts
import { WorkerStatus } from "@beep/architecture-lab-domain/entities/Worker"

console.log(WorkerStatus)
```

**Signature**

```ts
declare const WorkerStatus: AnnotatedSchema<LiteralKit<readonly ["active", "inactive"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/domain/src/entities/Worker/Worker.model.ts#L79)

Since v0.0.0

## WorkerStatus (type alias)

Runtime type for `WorkerStatus`.

**Signature**

```ts
type WorkerStatus = typeof WorkerStatus.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/domain/src/entities/Worker/Worker.model.ts#L92)

Since v0.0.0

## create

Create a new active Worker entity.

**Example**

```ts
import { create } from "@beep/architecture-lab-domain/entities/Worker"

console.log(create)
```

**Signature**

```ts
declare const create: (input: CreateWorkerInput) => Worker
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/domain/src/entities/Worker/Worker.model.ts#L174)

Since v0.0.0