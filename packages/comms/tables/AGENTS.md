# @beep/comms-tables — Agent Guide

## Purpose & Fit
- Defines Drizzle ORM table schemas for the communications slice, providing the database structure for notifications, messages, and email tracking.
- Uses `Table.make` factory from `@beep/shared-tables` to include standard audit columns (id, createdAt, updatedAt) automatically.
- Exports both table definitions and Drizzle relations for type-safe query building.
- Serves as the single source of truth for comms database schema that migrations are generated from.

## Surface Map
- **CommsDbSchema** — Namespace re-exporting all table and relation definitions.
- **CommsDbSchema.placeholder** — Starter Drizzle table demonstrating the Table.make pattern with `name` and `description` columns. Replace with actual comms tables as the feature matures.
- **CommsDbSchema.relations** — Drizzle relation definitions for table associations.

## Usage Snapshots
- `@beep/comms-server` imports schemas to configure Drizzle client and build queries.
- Drizzle Kit uses these schemas to generate SQL migrations via `bun run db:generate`.
- Repository implementations reference table columns for type-safe insert/update operations.
- Integration tests validate schema alignment with domain models.

## Authoring Guardrails
- Always use `Table.make(EntityId)` factory to create tables — this ensures consistent audit columns and typed primary keys.
- Reference entity ID types from `@beep/shared-domain` (e.g., `CommsEntityIds.NotificationId`) for primary key typing.
- Use `.$type<T>()` on columns when Drizzle's inferred type doesn't match the domain model type.
- Define indexes in the table factory's third argument for performance-critical columns.
- Foreign key references should specify `onDelete` behavior (cascade, set null, etc.).
- Export tables from `./tables/index.ts` and relations from `./relations/index.ts`.

## Quick Recipes
- **Add a notification table**
  ```ts
  import { CommsEntityIds, SharedEntityIds } from "@beep/shared-domain";
  import { Table, user } from "@beep/shared-tables";
  import * as pg from "drizzle-orm/pg-core";

  export const notification = Table.make(CommsEntityIds.NotificationId)(
    {
      userId: pg
        .text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" })
        .$type<SharedEntityIds.UserId.Type>(),
      title: pg.text("title").notNull(),
      body: pg.text("body").notNull(),
      read: pg.boolean("read").notNull().default(false),
      type: pg.text("type").notNull(), // "info" | "warning" | "error" | "success"
    },
    (t) => [
      pg.index("comms_notification_user_id_idx").on(t.userId),
      pg.index("comms_notification_read_idx").on(t.read),
    ]
  );
  ```

- **Add an email log table**
  ```ts
  import { CommsEntityIds, SharedEntityIds } from "@beep/shared-domain";
  import { Table, user } from "@beep/shared-tables";
  import * as pg from "drizzle-orm/pg-core";

  export const emailLog = Table.make(CommsEntityIds.EmailLogId)(
    {
      userId: pg
        .text("user_id")
        .references(() => user.id, { onDelete: "set null" })
        .$type<SharedEntityIds.UserId.Type | null>(),
      toEmail: pg.text("to_email").notNull(),
      subject: pg.text("subject").notNull(),
      templateId: pg.text("template_id"),
      status: pg.text("status").notNull(), // "sent" | "failed" | "bounced"
      sentAt: pg.timestamp("sent_at"),
    },
    (t) => [pg.index("comms_email_log_user_id_idx").on(t.userId)]
  );
  ```

## Verifications
- `bun run check --filter @beep/comms-tables`
- `bun run lint --filter @beep/comms-tables`
- `bun run db:generate` — Regenerate migrations after schema changes
- `bun run db:migrate` — Apply migrations to database

## Contributor Checklist
- [ ] Align table columns with domain entity fields from `@beep/comms-domain`.
- [ ] Use `Table.make` factory for consistent audit columns.
- [ ] Define appropriate indexes for query performance (especially on userId, status fields).
- [ ] Specify `onDelete` behavior for all foreign keys.
- [ ] Run `bun run db:generate` and commit migration files after schema changes.
- [ ] Update `@beep/comms-server` repositories if column types change.
