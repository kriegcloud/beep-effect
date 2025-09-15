import { IamEntityIds } from "@beep/shared-domain";
import { OrgTable } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";
import { userTable } from "./user.table";

export const twoFactorTable = OrgTable.make(IamEntityIds.TwoFactorId)({
  secret: pg.text("secret").notNull(),
  backupCodes: pg.text("backup_codes").notNull(),
  userId: pg
    .text("user_id")
    .notNull()
    .$type<IamEntityIds.UserId.Type>()
    .references(() => userTable.id, { onDelete: "cascade" }),
});
