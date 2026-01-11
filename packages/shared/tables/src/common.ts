import { $SharedTablesId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as d from "drizzle-orm";
import * as pg from "drizzle-orm/pg-core";
import * as DateTime from "effect/DateTime";
import * as F from "effect/Function";
import { datetime, sqlNow } from "./columns";

const $I = $SharedTablesId.create("common");

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

export interface ReferenceConfig {
  readonly ref: () => pg.PgColumn;
  readonly actions: {
    readonly onUpdate?: pg.UpdateDeleteAction;
    readonly onDelete?: pg.UpdateDeleteAction;
  };
}
export class FK extends BS.StringLiteralKit("cascade", "restrict", "no action", "set null", "set default", {
  enumMapping: [
    ["cascade", "CASCADE"],
    ["restrict", "RESTRICT"],
    ["no action", "NO_ACTION"],
    ["set null", "SET_NULL"],
    ["set default", "SET_DEFAULT"],
  ],
}).annotations(
  $I.annotations("FK", {
    description: "A foreign key constraints hook option.",
  })
) {}

export declare namespace FK {
  export type Type = typeof FK.Type;
}
