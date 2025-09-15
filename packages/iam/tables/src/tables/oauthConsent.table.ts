import { IamEntityIds } from "@beep/shared-domain";
import { OrgTable } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";
import { userTable } from "./user.table";
export const oauthConsentTable = OrgTable.make(IamEntityIds.OAuthConsentId)({
  clientId: pg.text("client_id").notNull(),
  userId: pg
    .text("user_id")
    .$type<IamEntityIds.UserId.Type>()
    .references(() => userTable.id),
  scopes: pg.text("scopes").notNull(),
  consentGiven: pg.boolean("consent_given").notNull(),
});
