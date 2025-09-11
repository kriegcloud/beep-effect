import * as d from "drizzle-orm";
import * as pg from "drizzle-orm/pg-core";
import * as DateTime from "effect/DateTime";
import * as F from "effect/Function";

export const utcNow = F.constant(DateTime.toDateUtc(DateTime.unsafeNow()));

export const auditColumns = {
  createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().$defaultFn(utcNow),
  updatedAt: pg.timestamp("updated_at", { withTimezone: true }).notNull().$onUpdateFn(utcNow),
  deletedAt: pg.timestamp("deleted_at", { withTimezone: true }),
} as const;

export const userTrackingColumns = {
  createdBy: pg.text("created_by"),
  updatedBy: pg.text("updated_by"),
  deletedBy: pg.text("deleted_by"),
} as const;

export const globalColumns = {
  ...auditColumns,
  ...userTrackingColumns,
  // Optimistic locking
  version: pg
    .integer("version")
    .notNull()
    .default(1)
    .$onUpdateFn(() => d.sql`version + 1`),
  // Optional: Enhanced traceability
  source: pg.text("source"), // 'api', 'import', 'migration', etc.
} as const;

export const defaultColumns = {
  ...globalColumns,
  // Note: Foreign key reference will be defined in the consuming table files
  // to avoid circular dependency with organization.table.ts
} as const;
