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
- ALWAYS use `Table.make(EntityId)` factory to create tables — this ensures consistent audit columns and typed primary keys.
- Reference entity ID types from `@beep/shared-domain` (e.g., `CommsEntityIds.NotificationId`) for primary key typing.
- Use `.$type<T>()` on columns when Drizzle's inferred type doesn't match the domain model type.
- Define indexes in the table factory's third argument for performance-critical columns.
- Foreign key references MUST specify `onDelete` behavior (cascade, set null, etc.).
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

## Testing

- Run tests: `bun run test --filter=@beep/comms-tables`
- Test file location: Adjacent to source files as `*.test.ts`
- Use `@beep/testkit` for Effect testing utilities
- ALWAYS test schema encode/decode roundtrips

## Security

### Data Encryption
- ALWAYS consider column-level encryption for sensitive notification content — use PostgreSQL pgcrypto or application-level encryption.
- Email log tables MUST NOT store full email bodies — store template references and variable hashes only.
- NEVER store raw email addresses without considering hashing for lookup columns.

### Access Control
- Foreign key references to user tables MUST specify appropriate `onDelete` behavior — use `cascade` for user-owned data, `set null` for audit trails.
- ALWAYS create indexes on userId columns to support row-level security queries efficiently.
- Consider PostgreSQL row-level security (RLS) policies for multi-tenant notification isolation.

### Data Retention
- Email log tables SHOULD include TTL mechanisms — consider partitioning by date for efficient purging.
- NEVER store communication content indefinitely without a retention policy — define cleanup schedules.
- Soft-delete patterns MUST preserve audit trail while supporting GDPR right-to-erasure requirements.

### Migration Security
- NEVER include sensitive data in migration seed files — use separate, secured seed scripts.
- Migration files MUST NOT contain hardcoded credentials or API keys.
- ALWAYS review generated migrations for unintended data exposure before committing.

## Gotchas

### Drizzle ORM Pitfalls
- **Timestamp with timezone**: Notification `sentAt` and `readAt` columns should use `timestamp('col', { withTimezone: true })` to preserve timezone information. Omitting this causes UTC conversion issues in multi-timezone deployments.
- **JSONB partial updates**: Drizzle does not support partial JSONB updates natively. To update a single key in `templateVariables`, read the full object, modify, and write back—or use raw SQL with `jsonb_set()`.
- **Boolean index selectivity**: Indexes on `read: boolean` columns have low selectivity. For high-volume notification tables, consider partial indexes (`WHERE read = false`) for unread notification queries.

### Migration Ordering
- **User table dependency**: All comms tables reference the shared `user` table. Ensure `@beep/shared-tables` migrations run before comms migrations—this is handled by `db-admin` aggregation, but manual migration edits may break ordering.
- **Notification type enums**: Adding new notification types requires an enum migration. PostgreSQL enum additions are non-transactional—test in a staging database first.
- **Email log archival**: Large email log tables may need partitioning by date. Plan partition migrations before the table grows—retrofitting partitions on existing data is complex.

### Relation Definition Gotchas
- **Nullable user references**: Email logs may have `userId: null` for system-generated emails. Ensure the Drizzle relation uses `one()` with optional configuration, and queries handle the null case.
- **Cascade delete for notifications**: Deleting a user should cascade to their notifications. Use `onDelete: 'cascade'` on the `userId` foreign key, but consider soft-delete patterns for audit requirements.
- **No polymorphic notifications**: Notifications cannot reference multiple entity types (e.g., both documents and tasks) via a single column. Use separate nullable foreign keys or a discriminator pattern.

### Integration with Domain Entities
- **Email template references**: The `templateId` column stores template identifiers, but the template content lives elsewhere (e.g., in code or external service). Domain validation should verify template existence before inserting rows.
- **Notification status enums**: Status values (`sent`, `failed`, `bounced`) must match domain enum definitions exactly. Mismatches cause runtime decoding errors in Effect Schema.
- **Message content size limits**: PostgreSQL `text` columns have no practical limit, but large notification bodies impact query performance. Consider a domain-level size constraint and truncation strategy.

### Comms-Specific Pitfalls
- **Rate limiting state**: Do not store rate limit counters in PostgreSQL—use Redis via `@beep/shared-server`. Database writes for each notification check create performance bottlenecks.
- **Email delivery status webhooks**: External email providers send delivery status asynchronously. Design tables to handle idempotent status updates—the same webhook may arrive multiple times.
- **Timezone in email scheduling**: Scheduled notification `sendAt` times should be stored in UTC. Convert to user timezone only at display time—storing local times causes daylight saving issues.

## Contributor Checklist
- [ ] Align table columns with domain entity fields from `@beep/comms-domain`.
- [ ] Use `Table.make` factory for consistent audit columns.
- [ ] Define appropriate indexes for query performance (especially on userId, status fields).
- [ ] Specify `onDelete` behavior for all foreign keys.
- [ ] Run `bun run db:generate` and commit migration files after schema changes.
- [ ] Update `@beep/comms-server` repositories if column types change.
- [ ] Review generated migrations for security implications before committing.
