import { IamEntityIds, type SharedEntityIds } from "@beep/shared-domain";
import { OrgTable, userTable } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";

export const oauthApplicationTable = OrgTable.make(IamEntityIds.OAuthApplicationId)({
  name: pg.text("name"),
  icon: pg.text("icon"),
  metadata: pg.text("metadata"),
  clientId: pg.text("client_id").unique(),
  clientSecret: pg.text("client_secret"),
  redirectURLs: pg.text("redirect_u_r_ls"),
  type: pg.text("type"),
  disabled: pg.boolean("disabled").notNull().default(false),
  userId: pg
    .text("user_id")
    .$type<SharedEntityIds.UserId.Type>()
    .references(() => userTable.id, { onDelete: "cascade" }),
});
