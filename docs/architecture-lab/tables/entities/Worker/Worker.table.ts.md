---
title: Worker.table.ts
nav_order: 5
parent: "@beep/architecture-lab-tables"
---

## Worker.table.ts overview

Worker table mapping.

Since v0.0.0

---
## Exports Grouped by Category
- [tables](#tables)
  - [WORKER_TABLE_NAME](#worker_table_name)
  - [WorkerInsert (type alias)](#workerinsert-type-alias)
  - [WorkerRow (type alias)](#workerrow-type-alias)
  - [fromWorkerRow](#fromworkerrow)
  - [toWorkerInsert](#toworkerinsert)
  - [workerTable](#workertable)
---

# tables

## WORKER_TABLE_NAME

Worker persistence table name.

**Example**

```ts
import { WORKER_TABLE_NAME } from "@beep/architecture-lab-tables/entities/Worker"

console.log(WORKER_TABLE_NAME)
```

**Signature**

```ts
declare const WORKER_TABLE_NAME: "architecture_lab_worker"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/tables/src/entities/Worker/Worker.table.ts#L42)

Since v0.0.0

## WorkerInsert (type alias)

Insertable Worker row.

**Example**

```ts
import type { WorkerInsert } from "@beep/architecture-lab-tables/entities/Worker"

const value = {} as WorkerInsert
console.log(value)
```

**Signature**

```ts
type WorkerInsert = typeof workerTable.$inferInsert
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/tables/src/entities/Worker/Worker.table.ts#L74)

Since v0.0.0

## WorkerRow (type alias)

Selected Worker row.

**Example**

```ts
import type { WorkerRow } from "@beep/architecture-lab-tables/entities/Worker"

const value = {} as WorkerRow
console.log(value)
```

**Signature**

```ts
type WorkerRow = typeof workerTable.$inferSelect
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/tables/src/entities/Worker/Worker.table.ts#L58)

Since v0.0.0

## fromWorkerRow

Convert a selected persistence row into a Worker entity.

**Example**

```ts
import { fromWorkerRow } from "@beep/architecture-lab-tables/entities/Worker"

console.log(fromWorkerRow)
```

**Signature**

```ts
declare const fromWorkerRow: (row: WorkerRow) => DomainWorker.Worker
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/tables/src/entities/Worker/Worker.table.ts#L107)

Since v0.0.0

## toWorkerInsert

Convert a Worker entity to its persistence row shape.

**Example**

```ts
import { toWorkerInsert } from "@beep/architecture-lab-tables/entities/Worker"

console.log(toWorkerInsert)
```

**Signature**

```ts
declare const toWorkerInsert: (worker: DomainWorker.Worker) => WorkerInsert
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/tables/src/entities/Worker/Worker.table.ts#L92)

Since v0.0.0

## workerTable

Worker persistence projection.

**Example**

```ts
import { workerTable } from "@beep/architecture-lab-tables/entities/Worker"

console.log(workerTable)
```

**Signature**

```ts
declare const workerTable: EntityTable.TableFor<typeof DomainWorker.Worker>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/tables/src/entities/Worker/Worker.table.ts#L27)

Since v0.0.0