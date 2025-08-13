import {Common} from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";
import {user} from "./user.table";

export const twoFactor = pg.pgTable("two_factor", {
  id: pg.text("id").primaryKey(),
  secret: pg.text("secret").notNull(),
  backupCodes: pg.text("backup_codes").notNull(),
  userId: pg
    .text("user_id")
    .notNull()
    .references(() => user.id, {onDelete: "cascade"}),
  ...Common.defaultColumns,
});