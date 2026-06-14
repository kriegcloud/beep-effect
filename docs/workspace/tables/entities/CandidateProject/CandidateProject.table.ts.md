---
title: CandidateProject.table.ts
nav_order: 3
parent: "@beep/workspace-tables"
---

## CandidateProject.table.ts overview

Workspace CandidateProject table metadata.

Since v0.0.0

---
## Exports Grouped by Category
- [tables](#tables)
  - [Table](#table)
---

# tables

## Table

PGLite/Postgres Drizzle table for the workspace CandidateProject entity.

**Example**

```ts
import { CandidateProject } from "@beep/workspace-tables/entities"

console.log(CandidateProject.Table.definition.tableName)
```

**Signature**

```ts
declare const Table: EntityTable.TableFor<typeof CandidateProject>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/workspace/tables/src/entities/CandidateProject/CandidateProject.table.ts#L24)

Since v0.0.0