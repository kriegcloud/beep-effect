import * as d from "drizzle-orm";
import * as pg from "drizzle-orm/pg-core";
import * as DateTime from "effect/DateTime";
import * as F from "effect/Function";

export const utcNow = F.constant(DateTime.toDateUtc(DateTime.unsafeNow()));

export const auditColumns = {
  createdAt: pg.timestamp("createdAt", { withTimezone: true }).notNull().$defaultFn(utcNow),
  updatedAt: pg.timestamp("updatedAt", { withTimezone: true }).notNull().$onUpdateFn(utcNow),
  deletedAt: pg.timestamp("deletedAt", { withTimezone: true }),
} as const;

export const userTrackingColumns = {
  createdBy: pg.text("createdBy"),
  updatedBy: pg.text("updatedBy"),
  deletedBy: pg.text("deletedBy"),
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
  organizationId: pg.text("organization_id").notNull(),
  // Note: Foreign key reference will be defined in the consuming table files
  // to avoid circular dependency with organization.table.ts
} as const;
export { idColumn } from "./id";
