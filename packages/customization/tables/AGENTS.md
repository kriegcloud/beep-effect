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
- ALWAYS use `Table.make(EntityId)` factory to create tables — this ensures consistent audit columns and typed primary keys.
- Reference entity ID types from `@beep/shared-domain` (e.g., `CustomizationEntityIds.UserHotkeyId`) for primary key typing.
- Use `.$type<T>()` on columns when Drizzle's inferred type doesn't match the domain model type.
- Define indexes in the table factory's third argument for performance-critical columns.
- Foreign key references MUST specify `onDelete` behavior (cascade, set null, etc.).
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

## Gotchas

### Drizzle ORM Pitfalls
- **JSONB column default handling**: The `shortcuts` JSONB column in `userHotkey` should not have a database-level default. Use domain-level defaults in Effect Schema—Drizzle JSONB defaults are evaluated once at migration time, not per-insert.
- **Unique constraint on userId**: If a user should have only one hotkey configuration, add a `uniqueIndex` on `userId`. Without this, multiple rows per user cause unexpected behavior in upsert operations.
- **Type coercion in JSONB queries**: PostgreSQL JSONB operators (`->`, `->>`) return different types. Use `.$type<T>()` to ensure TypeScript understands the extracted value type, but validate at runtime with Effect Schema.

### Migration Ordering
- **User table dependency**: `userHotkey.userId` references the shared `user` table. Ensure shared table migrations run first—this is automatic via `db-admin`, but custom migration scripts may break ordering.
- **Adding new preference tables**: New customization tables should follow the `userHotkey` pattern with a `userId` foreign key. Coordinate migration numbering with `db-admin` to avoid sequence gaps.
- **Nullable vs required columns**: Changing a column from nullable to required requires a data migration to populate existing rows. Plan the migration in two phases: add default, then add constraint.

### Relation Definition Gotchas
- **One-to-one user preferences**: Most customization tables have a one-to-one relationship with `user`. Use `uniqueIndex` on the `userId` column to enforce this at the database level—Drizzle `one()` relations do not enforce uniqueness.
- **Cascade delete behavior**: User preference data should cascade when the user is deleted. Always use `onDelete: 'cascade'` for `userId` foreign keys to prevent orphaned customization rows.
- **No cross-organization preferences**: Customization tables should not reference `organizationId` unless preferences are organization-scoped. The `userHotkey` table correctly uses `Table.make`, not `OrgTable.make`.

### Integration with Domain Entities
- **Schema validation for JSONB**: The `shortcuts` column stores structured data, but PostgreSQL does not validate the JSON structure. Use Effect Schema in the domain layer to validate and decode JSONB content on read.
- **Default preference generation**: When a user has no customization row, the domain layer should return defaults—do not insert empty rows on user creation. This pattern keeps the table sparse.
- **Preference versioning**: Consider adding a `schemaVersion` column if the JSONB structure may evolve. This allows domain code to migrate old preference formats without database migrations.

## Contributor Checklist
- [ ] Align table columns with domain entity fields from `@beep/customization-domain`.
- [ ] Use `Table.make` factory for consistent audit columns.
- [ ] Define appropriate indexes for query performance.
- [ ] Specify `onDelete` behavior for all foreign keys.
- [ ] Run `bun run db:generate` and commit migration files after schema changes.
- [ ] Update `@beep/customization-server` repositories if column types change.
