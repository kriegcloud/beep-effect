---
title: Membership.table.ts
nav_order: 3
parent: "@beep/shared-tables"
---

## Membership.table.ts overview

Shared-kernel Membership table metadata.

Since v0.0.0

---
## Exports Grouped by Category
- [tables](#tables)
  - [Table](#table)
---

# tables

## Table

PGLite/Postgres Drizzle table for the shared Membership entity.

**Example**

```ts
import { Membership } from "@beep/shared-tables/entities"

console.log(Membership.Table.definition.tableName) //
```

**Signature**

```ts
declare const Table: EntityTable.TableFor<typeof Membership.Model>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/tables/src/entities/Membership/Membership.table.ts#L24)

Since v0.0.0