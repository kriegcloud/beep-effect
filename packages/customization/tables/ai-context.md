---
path: packages/customization/tables
summary: Drizzle ORM table schemas for customization slice - user hotkeys with typed foreign keys
tags: [customization, tables, drizzle, postgresql, database, schema]
---

# @beep/customization-tables

Drizzle ORM table definitions for the customization slice. Provides database schema for user preferences and personalization features, using `Table.make` factory for consistent audit columns and typed primary keys.

## Architecture

```
|----------------------|     |---------------------|
| @beep/shared-tables  | --> |    Table.make       |
|----------------------|     |---------------------|
           |                          |
           v                          v
|----------------------|     |---------------------|
|  user (shared table) | <-- |    userHotkey       |
|----------------------|     |---------------------|
           ^                          |
           |                          v
|----------------------|     |---------------------|
| SharedEntityIds      |     |   CustomizationDb   |
|----------------------|     |   Schema namespace  |
                             |---------------------|
```

## Core Modules

| Module | Purpose |
|--------|---------|
| `CustomizationDbSchema` | Namespace re-exporting all tables and relations |
| `CustomizationDbSchema.userHotkey` | User keyboard shortcuts table with `userId` FK and `shortcuts` JSONB |
| `CustomizationDbSchema.relations` | Drizzle relation definitions for query building |

## Usage Patterns

### Define New Preference Table

```typescript
import * as pg from "drizzle-orm/pg-core";
import { Table, user } from "@beep/shared-tables";
import { CustomizationEntityIds, SharedEntityIds } from "@beep/shared-domain";

export const userTheme = Table.make(CustomizationEntityIds.UserThemeId)(
  {
    userId: pg
      .text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" })
      .$type<SharedEntityIds.UserId.Type>(),
    themeName: pg.text("theme_name").notNull(),
    customColors: pg.jsonb("custom_colors"),
  },
  (t) => [pg.uniqueIndex("user_theme_user_id_idx").on(t.userId)]
);
```

### Import Schema in Server

```typescript
import * as DbSchema from "@beep/customization-tables/schema";
import { DbClient } from "@beep/shared-server";

const client = DbClient.make({ schema: DbSchema });
```

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| `Table.make` factory | Automatic audit columns (id, createdAt, updatedAt) with typed EntityId primary keys |
| `.$type<T>()` on FKs | TypeScript knows foreign key types for safe joins |
| `onDelete: "cascade"` | User preference rows deleted when user is deleted |
| JSONB without DB default | Domain-level defaults via Effect Schema; DB defaults evaluate once at migration |
| Index on shortcuts | Performance for JSONB queries on hotkey lookups |

## Dependencies

**Internal**: `@beep/shared-domain` (EntityIds), `@beep/shared-tables` (Table.make, user), `@beep/customization-domain` (type references)

**External**: `drizzle-orm`

## Related

- **AGENTS.md** - Migration ordering, JSONB gotchas, relation definitions
- **@beep/customization-domain** - Domain entities these tables persist
- **@beep/customization-server** - Repositories querying these tables
