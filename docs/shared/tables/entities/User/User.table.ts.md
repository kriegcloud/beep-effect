---
title: User.table.ts
nav_order: 7
parent: "@beep/shared-tables"
---

## User.table.ts overview

Shared-kernel User table metadata.

Since v0.0.0

---
## Exports Grouped by Category
- [tables](#tables)
  - [Table](#table)
---

# tables

## Table

PGLite/Postgres Drizzle table for the shared User entity.

**Example**

```ts
import { User } from "@beep/shared-tables/entities"

console.log(User.Table.definition.tableName)
```

**Signature**

```ts
declare const Table: EntityTable.TableFor<typeof User.Model>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/tables/src/entities/User/User.table.ts#L24)

Since v0.0.0