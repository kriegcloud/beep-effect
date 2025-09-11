import { IamEntityIds } from "@beep/shared-domain";
import { OrgTable } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";
import { user } from "./user.table";
export const oauthConsent = OrgTable.make(IamEntityIds.OAuthConsentId)({
  clientId: pg.text("client_id"),
  userId: pg.text("user_id").references(() => user.id),
  scopes: pg.text("scopes"),
  consentGiven: pg.boolean("consent_given"),
});
