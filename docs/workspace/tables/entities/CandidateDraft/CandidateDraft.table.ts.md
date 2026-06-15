---
title: CandidateDraft.table.ts
nav_order: 1
parent: "@beep/workspace-tables"
---

## CandidateDraft.table.ts overview

Workspace CandidateDraft table metadata.

Since v0.0.0

---
## Exports Grouped by Category
- [tables](#tables)
  - [Table](#table)
---

# tables

## Table

PGLite/Postgres Drizzle table for the workspace CandidateDraft entity.

**Example**

```ts
import { CandidateDraft } from "@beep/workspace-tables/entities"

console.log(CandidateDraft.Table.definition.tableName)
```

**Signature**

```ts
declare const Table: EntityTable.TableFor<typeof CandidateDraft>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/workspace/tables/src/entities/CandidateDraft/CandidateDraft.table.ts#L24)

Since v0.0.0