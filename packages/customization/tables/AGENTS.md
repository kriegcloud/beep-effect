# @beep/customization-tables — Agent Guide

## Purpose & Fit
- Defines Drizzle ORM table schemas for the customization slice, providing the database structure for user preferences and personalization features.
- Uses `Table.make` factory from `@beep/shared-tables` to include standard audit columns (id, createdAt, updatedAt) automatically.
- Exports both table definitions and Drizzle relations for type-safe query building.
- Serves as the single source of truth for customization database schema that migrations are generated from.

## Surface Map
- **CustomizationDbSchema** — Namespace re-exporting all table and relation definitions.
- **CustomizationDbSchema.userHotkey** — Drizzle table definition for user keyboard shortcut configurations, with `userId` foreign key to users table and `shortcuts` JSONB column.
- **CustomizationDbSchema.relations** — Drizzle relation definitions for table associations.
- **Re-exports from @beep/shared-tables** — `organization`, `team`, `user` tables for cross-table references.

## Usage Snapshots
- `@beep/customization-server` imports schemas to configure Drizzle client and build queries.
- Drizzle Kit uses these schemas to generate SQL migrations via `bun run db:generate`.
- Repository implementations reference table columns for type-safe insert/update operations.
- Integration tests validate schema alignment with domain models.

## Authoring Guardrails
- Always use `Table.make(EntityId)` factory to create tables — this ensures consistent audit columns and typed primary keys.
- Reference entity ID types from `@beep/shared-domain` (e.g., `CustomizationEntityIds.UserHotkeyId`) for primary key typing.
- Use `.$type<T>()` on columns when Drizzle's inferred type doesn't match the domain model type.
- Define indexes in the table factory's third argument for performance-critical columns.
- Foreign key references should specify `onDelete` behavior (cascade, set null, etc.).
- Export tables from `./tables/index.ts` and relations from `./relations/index.ts`.

## Quick Recipes
- **Add a new table for user theme preferences**
  ```ts
  import { CustomizationEntityIds, SharedEntityIds } from "@beep/shared-domain";
  import { Table, user } from "@beep/shared-tables";
  import * as pg from "drizzle-orm/pg-core";

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

## Verifications
- `bun run check --filter @beep/customization-tables`
- `bun run lint --filter @beep/customization-tables`
- `bun run db:generate` — Regenerate migrations after schema changes
- `bun run db:migrate` — Apply migrations to database

## Contributor Checklist
- [ ] Align table columns with domain entity fields from `@beep/customization-domain`.
- [ ] Use `Table.make` factory for consistent audit columns.
- [ ] Define appropriate indexes for query performance.
- [ ] Specify `onDelete` behavior for all foreign keys.
- [ ] Run `bun run db:generate` and commit migration files after schema changes.
- [ ] Update `@beep/customization-server` repositories if column types change.
