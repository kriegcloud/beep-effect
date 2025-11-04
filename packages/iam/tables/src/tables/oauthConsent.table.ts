import type { SharedEntityIds } from "@beep/shared-domain";
import { IamEntityIds } from "@beep/shared-domain";
import { OrgTable, user } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";
export const oauthConsent = OrgTable.make(IamEntityIds.OAuthConsentId)({
  clientId: pg.text("client_id").notNull(),
  userId: pg
    .text("user_id")
    .$type<SharedEntityIds.UserId.Type>()
    .references(() => user.id),
  scopes: pg.text("scopes").notNull(),
  consentGiven: pg.boolean("consent_given").notNull().default(false),
});
