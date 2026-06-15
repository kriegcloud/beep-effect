---
title: Organization.table.ts
nav_order: 5
parent: "@beep/shared-tables"
---

## Organization.table.ts overview

Shared-kernel Organization table metadata.

Since v0.0.0

---
## Exports Grouped by Category
- [tables](#tables)
  - [Table](#table)
---

# tables

## Table

PGLite/Postgres Drizzle table for the shared Organization entity.

**Example**

```ts
import { Organization } from "@beep/shared-tables/entities"

console.log(Organization.Table.definition.tableName)
```

**Signature**

```ts
declare const Table: EntityTable.TableFor<typeof Organization.Model>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/tables/src/entities/Organization/Organization.table.ts#L24)

Since v0.0.0