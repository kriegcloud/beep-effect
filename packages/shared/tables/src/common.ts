import * as d from "drizzle-orm";
import * as pg from "drizzle-orm/pg-core";
import * as DateTime from "effect/DateTime";
import * as F from "effect/Function";

export const utcNow = F.constant(DateTime.toDateUtc(DateTime.unsafeNow()));

export const auditColumns = {
  createdAt: pg.timestamp("created_at", { withTimezone: true }).defaultNow().notNull().$defaultFn(utcNow),
  updatedAt: pg.timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdateFn(utcNow),
  deletedAt: pg.timestamp("deleted_at", { withTimezone: true }),
} as const;

export const userTrackingColumns = {
  createdBy: pg.text("created_by").default("app"),
  updatedBy: pg.text("updated_by").default("app"),
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
