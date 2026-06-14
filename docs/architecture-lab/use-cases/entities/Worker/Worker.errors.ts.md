---
title: Worker.errors.ts
nav_order: 12
parent: "@beep/architecture-lab-use-cases"
---

## Worker.errors.ts overview

Worker use-case errors.

Since v0.0.0

---
## Exports Grouped by Category
- [errors](#errors)
  - [WORKER_ACTION_UNAVAILABLE_REASON](#worker_action_unavailable_reason)
  - [WorkerActionError](#workeractionerror)
  - [WorkerActionError (type alias)](#workeractionerror-type-alias)
  - [WorkerActionFailed (class)](#workeractionfailed-class)
  - [WorkerConflict (class)](#workerconflict-class)
  - [WorkerNotFound (class)](#workernotfound-class)
---

# errors

## WORKER_ACTION_UNAVAILABLE_REASON

Generic public reason used when internal Worker repository details are redacted.

**Example**

```ts
import { WORKER_ACTION_UNAVAILABLE_REASON } from "@beep/architecture-lab-use-cases/entities/Worker"

console.log(WORKER_ACTION_UNAVAILABLE_REASON)
```

**Signature**

```ts
declare const WORKER_ACTION_UNAVAILABLE_REASON: "Worker service is unavailable."
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/use-cases/src/entities/Worker/Worker.errors.ts#L29)

Since v0.0.0

## WorkerActionError

Public Worker use-case failure schema.

**Example**

```ts
import { WorkerActionError } from "@beep/architecture-lab-use-cases/entities/Worker"

console.log(WorkerActionError)
```

**Signature**

```ts
declare const WorkerActionError: S.Union<readonly [typeof WorkerNotFound, typeof WorkerConflict, typeof WorkerActionFailed]>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/use-cases/src/entities/Worker/Worker.errors.ts#L133)

Since v0.0.0

## WorkerActionError (type alias)

Public Worker use-case failure.

**Example**

```ts
import type { WorkerActionError } from "@beep/architecture-lab-use-cases/entities/Worker"

const value = {} as WorkerActionError
console.log(value)
```

**Signature**

```ts
type WorkerActionError = WorkerNotFound | WorkerConflict | WorkerActionFailed
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/use-cases/src/entities/Worker/Worker.errors.ts#L118)

Since v0.0.0

## WorkerActionFailed (class)

Public failure raised when a Worker action cannot be completed.

**Example**

```ts
import { WorkerActionFailed } from "@beep/architecture-lab-use-cases/entities/Worker"

console.log(WorkerActionFailed)
```

**Signature**

```ts
declare class WorkerActionFailed
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/use-cases/src/entities/Worker/Worker.errors.ts#L93)

Since v0.0.0

## WorkerConflict (class)

Public failure raised when a Worker command conflicts with persisted state.

**Example**

```ts
import { WorkerConflict } from "@beep/architecture-lab-use-cases/entities/Worker"

console.log(WorkerConflict)
```

**Signature**

```ts
declare class WorkerConflict
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/use-cases/src/entities/Worker/Worker.errors.ts#L68)

Since v0.0.0

## WorkerNotFound (class)

Public failure raised when a requested Worker is absent.

**Example**

```ts
import { WorkerNotFound } from "@beep/architecture-lab-use-cases/entities/Worker"

console.log(WorkerNotFound)
```

**Signature**

```ts
declare class WorkerNotFound
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/use-cases/src/entities/Worker/Worker.errors.ts#L44)

Since v0.0.0