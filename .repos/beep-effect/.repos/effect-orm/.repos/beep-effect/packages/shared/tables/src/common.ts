import * as d from "drizzle-orm";
import * as pg from "drizzle-orm/pg-core";
import * as DateTime from "effect/DateTime";
import * as F from "effect/Function";

import { datetime, sqlNow } from "./columns";

export const utcNow = F.constant(F.pipe(DateTime.unsafeNow(), DateTime.toDateUtc).toISOString());

export const auditColumns = {
  createdAt: datetime("created_at").default(sqlNow).notNull().$defaultFn(utcNow),
  updatedAt: datetime("updated_at").notNull().default(sqlNow).$onUpdateFn(utcNow),
  deletedAt: datetime("deleted_at"),
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
