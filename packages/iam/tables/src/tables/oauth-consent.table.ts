import { Common } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";
import { user } from "./user.table";
export const oauthConsent = pg.pgTable("oauth_consent", {
  id: pg.text("id").primaryKey(),
  clientId: pg.text("client_id"),
  userId: pg.text("user_id").references(() => user.id),
  scopes: pg.text("scopes"),
  consentGiven: pg.boolean("consent_given"),
  ...Common.defaultColumns,
});