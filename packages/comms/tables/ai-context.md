---
path: packages/comms/tables
summary: Drizzle ORM table schemas for email templates with multi-tenant organization scoping
tags: [comms, tables, drizzle, postgresql, multi-tenant]
---

# @beep/comms-tables

Defines Drizzle ORM table schemas for the communications slice. Uses `OrgTable.make` factory to include standard audit columns plus `organizationId` for multi-tenant isolation. Serves as the single source of truth for database migrations.

## Architecture

```
|-------------------|     |-------------------|
|  OrgTable.make()  |---->|   emailTemplate   |
|  (shared-tables)  |     |   (table def)     |
|-------------------|     |-------------------|
        |
        v
|-------------------|     |-------------------|
|   SharedDbSchema  |<----|  emailTemplate    |
|   (user, org FK)  |     |  Relations        |
|-------------------|     |-------------------|
```

## Core Modules

| Module | Purpose |
|--------|---------|
| `CommsDbSchema` | Namespace re-exporting all table and relation definitions |
| `CommsDbSchema.emailTemplate` | Email template table with to/cc/bcc, subject, body content |
| `CommsDbSchema.emailTemplateRelations` | Drizzle relations connecting templates to users and organizations |

## Usage Patterns

### Defining a New Organization-Scoped Table

```typescript
import { CommsEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { OrgTable, SharedDbSchema } from "@beep/shared-tables";
import { FK } from "@beep/shared-tables/common";
import * as pg from "drizzle-orm/pg-core";

export const notification = OrgTable.make(CommsEntityIds.NotificationId)(
  {
    userId: pg
      .integer("user_id")
      .notNull()
      .references(() => SharedDbSchema.user._rowId, {
        onDelete: FK.Enum.CASCADE,
        onUpdate: FK.Enum.CASCADE,
      })
      .$type<SharedEntityIds.UserId.RowId.Type>(),
    title: pg.text("title").notNull(),
    body: pg.text("body").notNull(),
    read: pg.boolean("read").notNull().default(false),
    type: pg.text("type").notNull(),
  },
  (t) => [
    pg.index("idx_notification_user_id").on(t.userId),
    pg.index("idx_notification_org_id").on(t.organizationId),
  ]
);
```

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| `OrgTable.make(EntityId)` factory | Consistent audit columns, typed PKs, automatic organizationId FK |
| `.$type<T>()` on columns | Match Drizzle inferred types to domain model types for JSONB fields |
| Explicit `onDelete` behavior | Prevent orphaned records; `CASCADE` for owned data, `SET_NULL` for audit trails |
| Index on `userId`, `organizationId` | Support row-level security queries and multi-tenant isolation |

## Dependencies

**Internal**: `@beep/shared-domain` (CommsEntityIds), `@beep/comms-domain`, `@beep/shared-tables`

**External**: `drizzle-orm`

## Related

- **AGENTS.md** - Detailed migration ordering, Drizzle pitfalls, and security guidelines
