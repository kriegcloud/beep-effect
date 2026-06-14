---
title: WorkItem.table.ts
nav_order: 2
parent: "@beep/architecture-lab-tables"
---

## WorkItem.table.ts overview

WorkItem table mapping.

Since v0.0.0

---
## Exports Grouped by Category
- [tables](#tables)
  - [WORK_ITEM_TABLE_NAME](#work_item_table_name)
  - [WorkItemInsert (type alias)](#workiteminsert-type-alias)
  - [WorkItemRow (type alias)](#workitemrow-type-alias)
  - [fromWorkItemRow](#fromworkitemrow)
  - [toWorkItemInsert](#toworkiteminsert)
  - [workItemTable](#workitemtable)
---

# tables

## WORK_ITEM_TABLE_NAME

WorkItem persistence table name.

**Example**

```ts
import { WORK_ITEM_TABLE_NAME } from "@beep/architecture-lab-tables/aggregates/WorkItem"

console.log(WORK_ITEM_TABLE_NAME)
```

**Signature**

```ts
declare const WORK_ITEM_TABLE_NAME: "architecture_lab_work_item"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/tables/src/aggregates/WorkItem/WorkItem.table.ts#L29)

Since v0.0.0

## WorkItemInsert (type alias)

Insertable WorkItem row.

**Example**

```ts
import type { WorkItemInsert } from "@beep/architecture-lab-tables/aggregates/WorkItem"

const value = {} as WorkItemInsert
console.log(value)
```

**Signature**

```ts
type WorkItemInsert = typeof workItemTable.$inferInsert
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/tables/src/aggregates/WorkItem/WorkItem.table.ts#L84)

Since v0.0.0

## WorkItemRow (type alias)

Selected WorkItem row.

**Example**

```ts
import type { WorkItemRow } from "@beep/architecture-lab-tables/aggregates/WorkItem"

const value = {} as WorkItemRow
console.log(value)
```

**Signature**

```ts
type WorkItemRow = typeof workItemTable.$inferSelect
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/tables/src/aggregates/WorkItem/WorkItem.table.ts#L68)

Since v0.0.0

## fromWorkItemRow

Convert a selected persistence row into a WorkItem aggregate.

**Example**

```ts
import { fromWorkItemRow } from "@beep/architecture-lab-tables/aggregates/WorkItem"

console.log(fromWorkItemRow)
```

**Signature**

```ts
declare const fromWorkItemRow: (row: WorkItemRow) => DomainWorkItem.WorkItem
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/tables/src/aggregates/WorkItem/WorkItem.table.ts#L120)

Since v0.0.0

## toWorkItemInsert

Convert a WorkItem aggregate to its persistence row shape.

**Example**

```ts
import { toWorkItemInsert } from "@beep/architecture-lab-tables/aggregates/WorkItem"

console.log(toWorkItemInsert)
```

**Signature**

```ts
declare const toWorkItemInsert: (workItem: DomainWorkItem.WorkItem) => WorkItemInsert
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/tables/src/aggregates/WorkItem/WorkItem.table.ts#L99)

Since v0.0.0

## workItemTable

WorkItem persistence projection.

**Example**

```ts
import { workItemTable } from "@beep/architecture-lab-tables/aggregates/WorkItem"

console.log(workItemTable)
```

**Signature**

```ts
declare const workItemTable: PgTableWithColumns<{ name: "architecture_lab_work_item"; schema: undefined; columns: { id: PgBuildColumn<"architecture_lab_work_item", Set$Type<SetIsPrimaryKey<PgTextBuilder<[string, ...string[]]>>, string & Brand<"ArchitectureLabWorkItemId">>, { name: string; tableName: "architecture_lab_work_item"; dataType: "string"; data: string & Brand<"ArchitectureLabWorkItemId">; driverParam: string; notNull: true; hasDefault: false; isPrimaryKey: false; isAutoincrement: false; hasRuntimeDefault: false; enumValues: undefined; identity: undefined; generated: undefined; }>; title: PgBuildColumn<"architecture_lab_work_item", Set$Type<SetNotNull<PgTextBuilder<[string, ...string[]]>>, string>, { name: string; tableName: "architecture_lab_work_item"; dataType: "string"; data: string; driverParam: string; notNull: true; hasDefault: false; isPrimaryKey: false; isAutoincrement: false; hasRuntimeDefault: false; enumValues: undefined; identity: undefined; generated: undefined; }>; status: PgBuildColumn<"architecture_lab_work_item", Set$Type<SetNotNull<PgTextBuilder<[string, ...string[]]>>, "open" | "assigned" | "completed" | "archived">, { name: string; tableName: "architecture_lab_work_item"; dataType: "string"; data: "open" | "assigned" | "completed" | "archived"; driverParam: string; notNull: true; hasDefault: false; isPrimaryKey: false; isAutoincrement: false; hasRuntimeDefault: false; enumValues: undefined; identity: undefined; generated: undefined; }>; assigneeId: PgBuildColumn<"architecture_lab_work_item", Set$Type<PgIntegerBuilder, EntityIdValueFor<"ArchitectureLabWorkerId">>, { name: string; tableName: "architecture_lab_work_item"; dataType: "number int32"; data: EntityIdValueFor<"ArchitectureLabWorkerId">; driverParam: string | number; notNull: false; hasDefault: false; isPrimaryKey: false; isAutoincrement: false; hasRuntimeDefault: false; enumValues: undefined; identity: undefined; generated: undefined; }>; priority: PgBuildColumn<"architecture_lab_work_item", Set$Type<PgTextBuilder<[string, ...string[]]>, "low" | "normal" | "high">, { name: string; tableName: "architecture_lab_work_item"; dataType: "string"; data: "low" | "normal" | "high"; driverParam: string; notNull: false; hasDefault: false; isPrimaryKey: false; isAutoincrement: false; hasRuntimeDefault: false; enumValues: undefined; identity: undefined; generated: undefined; }>; createdAt: PgBuildColumn<"architecture_lab_work_item", SetNotNull<SetHasDefault<PgTimestampBuilder>>, { name: string; tableName: "architecture_lab_work_item"; dataType: "object date"; data: Date; driverParam: string; notNull: true; hasDefault: true; isPrimaryKey: false; isAutoincrement: false; hasRuntimeDefault: false; enumValues: undefined; identity: undefined; generated: undefined; }>; updatedAt: PgBuildColumn<"architecture_lab_work_item", SetNotNull<SetHasDefault<PgTimestampBuilder>>, { name: string; tableName: "architecture_lab_work_item"; dataType: "object date"; data: Date; driverParam: string; notNull: true; hasDefault: true; isPrimaryKey: false; isAutoincrement: false; hasRuntimeDefault: false; enumValues: undefined; identity: undefined; generated: undefined; }>; }; dialect: "pg"; }>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/tables/src/aggregates/WorkItem/WorkItem.table.ts#L44)

Since v0.0.0