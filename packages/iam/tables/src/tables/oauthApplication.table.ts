import { IamEntityIds } from "@beep/shared-domain";
import { OrgTable } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";
import { user } from "./user.table";

export const oauthApplication = OrgTable.make(IamEntityIds.OAuthApplicationId)({
  name: pg.text("name"),
  icon: pg.text("icon"),
  metadata: pg.text("metadata"),
  clientId: pg.text("client_id").unique(),
  clientSecret: pg.text("client_secret"),
  redirectURLs: pg.text("redirect_u_r_ls"),
  type: pg.text("type"),
  disabled: pg.boolean("disabled"),
  userId: pg.text("user_id").references(() => user.id, { onDelete: "cascade" }),
});
