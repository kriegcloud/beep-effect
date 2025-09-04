import { Common } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";

export const organizationRole = pg.pgTable("organization_role", {
  id: pg.text("id").primaryKey(),
  role: pg.text("role").notNull(),
  permission: pg.text("permission").notNull(),
  ...Common.defaultColumns,
});
