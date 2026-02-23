# @beep/calendar-tables — Agent Guide

## Purpose & Fit
- Drizzle ORM table definitions for the calendar vertical slice.
- Provides database schema for calendar events, recurrence rules, and attendees.
- Defines relations and indexes optimized for temporal queries.
- Bridges domain models from `@beep/calendar-domain` to PostgreSQL persistence.

## Surface Map
- **Tables (`src/tables/`)** — Drizzle table definitions for calendar entities.
- **Relations (`src/relations.ts`)** — Drizzle relation definitions for event queries.
- **Schema (`src/schema.ts`)** — Unified schema export for migrations.
- **Check (`src/_check.ts`)** — Type verification ensuring table-domain alignment.

## Usage Snapshots
- `packages/calendar/server/src/db.ts` — Imports schema for database client.
- `packages/_internal/db-admin/` — Migration generation references these tables.

## Authoring Guardrails
- ALWAYS use `@beep/shared-tables` column helpers for common patterns.
- Datetime columns MUST use `timestamp` with timezone for UTC storage.
- NEVER duplicate column definitions—inherit from shared column factories.
- Indexes MUST be added for `organizationId` and frequently queried date ranges.

## Quick Recipes
```ts
import { pgTable, text, timestamp, index } from "drizzle-orm/pg-core";
import { columns } from "@beep/shared-tables";

export const calendarEventTable = pgTable(
  "calendar_event",
  {
    ...columns.withRowAndVersion(),
    ...columns.withAuditFields(),
    id: columns.primaryId("evt"),
    organizationId: columns.organizationId(),
    title: text("title").notNull(),
    startTime: timestamp("start_time", { withTimezone: true }).notNull(),
    endTime: timestamp("end_time", { withTimezone: true }).notNull(),
  },
  (table) => [
    index("calendar_event_org_idx").on(table.organizationId),
    index("calendar_event_time_idx").on(table.startTime, table.endTime),
  ]
);
```

## Verifications
- `bun run check --filter @beep/calendar-tables`
- `bun run lint --filter @beep/calendar-tables`
- `bun run db:generate` — Verify migration generation.

## Contributor Checklist
- [ ] Table changes regenerated via `bun run db:generate`.
- [ ] Temporal indexes added for date range queries.
- [ ] Domain model alignment verified via `_check.ts`.
