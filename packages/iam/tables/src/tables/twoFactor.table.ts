import { IamEntityIds, type SharedEntityIds } from "@beep/shared-domain";
import { OrgTable, userTable } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";

export const twoFactorTable = OrgTable.make(IamEntityIds.TwoFactorId)({
  secret: pg.text("secret").notNull(),
  backupCodes: pg.text("backup_codes").notNull(),
  userId: pg
    .text("user_id")
    .notNull()
    .$type<SharedEntityIds.UserId.Type>()
    .references(() => userTable.id, { onDelete: "cascade" }),
});
