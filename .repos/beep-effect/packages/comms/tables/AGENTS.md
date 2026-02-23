# @beep/comms-tables — Agent Guide

## Purpose & Fit
- Defines Drizzle ORM table schemas for the communications slice, providing the database structure for email templates and communication tracking.
- Uses `OrgTable.make` factory from `@beep/shared-tables` to include standard audit columns (id, createdAt, updatedAt) plus `organizationId` for multi-tenant isolation.
- Exports both table definitions and Drizzle relations for type-safe query building.
- Serves as the single source of truth for comms database schema that migrations are generated from.

## Surface Map
- **CommsDbSchema** — Namespace re-exporting all table and relation definitions.
- **CommsDbSchema.emailTemplate** — Email template table for storing reusable communication templates with support for recipients (to/cc/bcc), subject, and body content. Uses `OrgTable.make` for organization-scoped multi-tenancy.
- **CommsDbSchema.emailTemplateRelations** — Drizzle relation definitions connecting email templates to users and organizations.

## Usage Snapshots
- `@beep/comms-server` imports schemas to configure Drizzle client and build queries.
- Drizzle Kit uses these schemas to generate SQL migrations via `bun run db:generate`.
- Repository implementations reference table columns for type-safe insert/update operations.
- Integration tests validate schema alignment with domain models.

## Authoring Guardrails
- ALWAYS use `OrgTable.make(EntityId)` factory for comms tables — this ensures consistent audit columns, typed primary keys, and automatic `organizationId` foreign key for multi-tenant isolation.
- Use `Table.make(EntityId)` only for non-organization-scoped tables (rare in comms slice).
- Reference entity ID types from `@beep/shared-domain` (e.g., `CommsEntityIds.EmailTemplateId`) for primary key typing.
- Use `.$type<T>()` on columns when Drizzle's inferred type doesn't match the domain model type (e.g., JSONB fields matching Effect Schema encoded types).
- Define indexes in the table factory's third argument for performance-critical columns.
- Foreign key references MUST specify `onDelete` behavior using `FK.Enum.CASCADE`, `FK.Enum.SET_NULL`, etc. from `@beep/shared-tables/common`.
- Export tables from `./tables/index.ts` and relations from `./relations.ts`.

## Quick Recipes
- **Add a notification table (organization-scoped)**
  ```ts
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
      type: pg.text("type").notNull(), // "info" | "warning" | "error" | "success"
    },
    (t) => [
      pg.index("idx_notification_user_id").on(t.userId),
      pg.index("idx_notification_org_id").on(t.organizationId),
      pg.index("idx_notification_read").on(t.read),
    ]
  );
  ```

- **Add an email log table with JSONB metadata**
  ```ts
  import type * as S from "effect/Schema";
  import { CommsEntityIds, SharedEntityIds } from "@beep/shared-domain";
  import { OrgTable, SharedDbSchema } from "@beep/shared-tables";
  import { FK } from "@beep/shared-tables/common";
  import * as pg from "drizzle-orm/pg-core";

  export const emailLog = OrgTable.make(CommsEntityIds.EmailLogId)(
    {
      userId: pg
        .integer("user_id")
        .references(() => SharedDbSchema.user._rowId, {
          onDelete: FK.Enum.SET_NULL,
          onUpdate: FK.Enum.CASCADE,
        })
        .$type<SharedEntityIds.UserId.RowId.Type | null>(),
      toEmail: pg.text("to_email").notNull(),
      subject: pg.text("subject").notNull(),
      templateId: pg.text("template_id"),
      status: pg.text("status").notNull(), // "sent" | "failed" | "bounced"
      metadata: pg.jsonb("metadata").$type<S.Schema.Encoded<typeof YourMetadataSchema>>(),
      sentAt: pg.timestamp("sent_at", { withTimezone: true }),
    },
    (t) => [
      pg.index("idx_email_log_user_id").on(t.userId),
      pg.index("idx_email_log_org_id").on(t.organizationId),
      pg.index("idx_email_log_status").on(t.status),
    ]
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
- Use Effect's native testing utilities (`Effect.runPromise`, `Effect.runSync`) with Bun's test runner
- ALWAYS test schema encode/decode roundtrips for JSONB columns
- Validate foreign key constraints and cascade behavior in integration tests

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
