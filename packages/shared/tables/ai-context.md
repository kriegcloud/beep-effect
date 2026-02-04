---
path: packages/shared/tables
summary: Drizzle table factories with auto-RLS, audit columns, and multi-tenant support
tags: [tables, drizzle, postgresql, rls, shared, multi-tenant]
---

# @beep/shared-tables

Cross-slice Drizzle table factories providing standardized audit columns, EntityId integration, and automatic Row-Level Security policies. Guarantees tenant isolation and type alignment with `@beep/shared-domain` via compile-time checks.

## Architecture

```
|------------------|     |-------------------|     |-----------------|
|   Table.make     | --> |   OrgTable.make   | --> | SharedDbSchema  |
| (base factory)   |     | (+orgId + RLS)    |     | (concrete tbls) |
|------------------|     |-------------------|     |-----------------|
        |                         |
        v                         v
|------------------|     |-------------------|
|  globalColumns   |     |   Auto-RLS        |
| audit/tracking   |     |   Policies        |
|------------------|     |-------------------|
```

## Core Modules

| Module | Purpose |
|--------|---------|
| `Table.make` | Base factory with id/audit/tracking columns |
| `OrgTable.make` | Extends Table with organizationId FK + auto-RLS |
| `Common` | globalColumns, auditColumns, userTrackingColumns |
| `SharedDbSchema` | Concrete tables: organization, team, user, file, folder, session |
| `columns/` | Custom types: bytea, datetime, vector256/512/768/1024 |
| `_check.ts` | Compile-time Drizzle-to-domain type assertions |

## Usage Patterns

### Define tenant-scoped table with auto-RLS
```typescript
import * as OrgTable from "@beep/shared-tables/org-table";
import { SharedEntityIds } from "@beep/shared-domain";
import * as pg from "drizzle-orm/pg-core";

export const document = OrgTable.make(SharedEntityIds.DocumentId)(
  { title: pg.text("title").notNull() },
  (t) => [pg.index("doc_org_idx").on(t.organizationId)]
);
```

### RLS policy options
```typescript
OrgTable.make(Id)({ ... });                          // standard (default)
OrgTable.make(Id, { rlsPolicy: "nullable" })({ ... }); // allows NULL org
OrgTable.make(Id, { rlsPolicy: "none" })({ ... });     // custom policy needed
```

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| Auto-RLS in OrgTable | Eliminates manual policy boilerplate, ensures consistent tenant isolation |
| globalColumns standard | Audit trail and optimistic locking across all tables |
| _check.ts enforcement | Catches Drizzle/domain drift at compile time |
| EntityId requirement | Type-safe foreign keys, prevents ID type mixing |

## Dependencies

**Internal**: `@beep/shared-domain` (EntityIds, domain schemas), `@beep/schema`
**External**: `drizzle-orm`, `effect`, `@effect/sql`

## Related

- **AGENTS.md** - Detailed contributor guidance, gotchas, and recipes
